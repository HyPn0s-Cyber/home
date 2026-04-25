---
title : Curse of the Pharaoh 3 Write Up [United CTF 2025]
date : 2025-09-27 16:00:00 -0500
categories : [WriteUps]
tags : [UnitedCTF 2025]
---


---

## Curse of the Pharaoh 3 


<p style="text-align: left;">
  <img src="{{ '/assets/img/Curse-Pharaoh-3.png' | relative_url }}" alt="Picture of the challenge's rules">
</p>


The rules are simple, pass the guard. Actually, this is the third step of this serie of challenges on the little Unity game they gave us. 
But it was the first ~~(and only)~~ flag I was able to get from Curse of the Pharaoh. 

When lauching the game, you arrive in front of a pyramid, a guard is there asking for 100 00$ but unfortunately, you have just 5 bucks. Harsh.

<p style="text-align: left;">
  <img src="{{ '/assets/img/guard.png' | relative_url }}" alt="Picture of the guard asking for a 10000$ bribe">
</p>

It reminded me of the good old times when I wanted to speed things up on some games and find a way of having some money quickly. I quicly recall using a tool called [Cheat Engine](https://www.cheatengine.org/) at the time.
Well, looks like I still have it on my computer...

After lauching the tool, you have to select the process you want to modify the variables. I selected the Unity game and went for a first scan. The goal is to find the variable responsible for storing the amount of money you hold. 
Since we have 5 at first, you scan for 5. A lot of variables appears. You bribe the guard for 1$ on the game, now the in-game variable is set to 4. So you launch a new scan with the value 4. Fewer variables, repeat the process for 3, then 2 and 1 if you want to be really precise.

<p style="text-align: left;">
  <img src="{{ '/assets/img/Cheat-Engine.png' | relative_url }}" alt="Picture of the Cheat Engine Tool with only one variable left">
</p>

In the end, only one variable will pop up. Pick It with the red arrow and then easily change the stored value to whatever you like. 

Easy right? I remember feeling like a hacker when I did this ten years back on some video games. 

Anyway, this enables us to bribe the guard and enter the pyramid where the flag is waiting for us. 


<p style="text-align: left;">
  <img src="{{ '/assets/img/flag_Curse_Pharaoh3.png' | relative_url }}" alt="Picture of the flag written inside the pyramid">
</p>


### FLAG : flag-8r1b3M4S73r
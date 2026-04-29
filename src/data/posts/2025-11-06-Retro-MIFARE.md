---
title: Reverse Engineering a MIFARE Classic Laundry Card
date: 2025-11-06
author: HyPn0s
categories: [project, hardware]
tags: [rfid, nfc, reverse-engineering]
cover: /home/assets/img/Hypnos_Reverse.jpg
readingTime: 8
summary: How I reverse-engineered a MIFARE Classic 1k laundry card to understand its balance encoding.
---

> **⚠️ DISCLAIMER:** This article is for **educational and research purposes only**. All tests described here were performed on my own equipment and cards. Tampering with payment systems, laundry machines, or access control systems that do not belong to you is illegal. The goal of this project was to understand the underlying data structure, not to defraud a service.

To make it simple, it all started with a simple observation in my building's laundry room. I noticed that the washing machines were completely offline—no network cables, no WiFi antennas. Yet, they knew exactly how much credit was left on my prepaid card.

This implied that the balance wasn't stored on a cloud server, but physically on the card itself—which was right there in my possession. So, why not try to tamper with it? :)

Driven by pure curiosity, I wanted to understand how this system worked. How does a piece of plastic keep track of my money? I decided to reverse-engineer the storage format of the **MIFARE Classic 1k** card to see if I could make sense of the raw hex data.

---

## The Hardware

The card is a standard **MIFARE Classic 1k**. I was able to identify it easily by scanning the card with my phone and *RFID Tools*. This type of card is the "floppy disk" of the RFID world. It’s an older technology, known to have some security flaws, but it is still widely used in legacy systems—and as a matter of fact, by a famous laundry company in Canada (whose name I won't mention).

To interact with it, I didn't need any fancy hardware like a Proxmark3 or a Flipper Zero (though I'd love to have one). I simply used:
* My NFC-enabled Android phone.
* **Mifare Classic Tool (MCT)**: An amazing open-source app that allows you to read, write, and analyze memory dumps of these cards. A wonderful world of hex data.

## Step 1: Data Gathering

The first step in any reverse engineering project is to gather data points. If you look at a single encrypted or encoded file, it looks like noise. But if you have *multiple* files where only one variable changes, patterns emerge. 
The first dump I made was unreadable on its own; it was impossible to see a pattern emerging. So, by changing the value I wanted to identify, I could then easily try to see how it was stored.

I created several "dumps" (backups) of the card at different balance levels:
1.  **Dump A:** Card balance at **$1.00**
2.  **Dump B:** Card balance at **$2.50**
3.  **Dump C:** Card balance at **$4.00**

To change the remaining amount of money on the card, I just had to do my laundry (for the first time in my life, I was actually excited to do chores).

---

## Step 2: Finding the Needle in the Haystack

I opened these files in a hex editor to compare them. The MIFARE Classic 1k memory is divided into **16 Sectors**, and each sector has **4 Blocks**.
I started by comparing the memory dumps of the card at different balance levels. A MIFARE card is essentially a grid of storage blocks. Most of them were static (containing the card ID or manufacturer data) or empty.

However, by "diffing" the files (comparing them side-by-side), I noticed that specific blocks in the memory were changing every time the balance changed.

| Balance | Memory Data (Sanitized) |
| :--- | :--- |
| **Low Balance** | `XX 00 XX 00 YY FF YY FF ...` |
| **High Balance** | `ZZ 01 ZZ 00 WW FE WW FF ...` |

At first glance, it looked like random hex data. But in reverse engineering, you look for patterns, not randomness.

I noticed a correlation: as the money on the card went down, the hex values in the first few bytes decreased. This confirmed that the balance wasn't encrypted (which would look like complete noise), but simply **encoded**. (A really questionable design choice by the company on this one).

---

## Step 3: Decoding the Logic

I spent some time analyzing the relationship between the decimal balance (e.g., $1.00) and the hexadecimal values I was seeing.

Without giving away the exact encoding recipe, I realized the system uses a standard method to store integers. It doesn't just store the number "100"; it stores the number along with mathematical safeguards.

It turns out this is a standard feature of the chip architecture, designed to prevent data corruption. The structure works like this:

1.  **The Value:** The actual balance is stored in a standard integer format.
2.  **The Checksum (Inverse):** To ensure a bit hasn't flipped by accident, the card stores the *inverse* of the value right next to it.
3.  **Redundancy:** The data is repeated to allow recovery if a sector is damaged.

Once I understood this "Value + Checksum" structure, I realized I didn't need to guess the data. I could mathematically calculate what a valid memory block *should* look like for any amount of money. Wonderful, isn't it? Being able to add your desired amount of money to your laundry card. 

#Freelaundry4life

![Meme hacker](/assets/img/hacker_meme_CARD.jpg)

---

## Step 4: The "Error 51" and Replay Attacks

Feeling confident, I decided to test my understanding with a practical experiment.

I took an old backup file where the card had **$5.00**, and I wrote it back to the card *after* spending the money (bringing the physical card balance to $0). In cybersecurity terms, this is called a **Replay Attack**, which is basically cloning a valid past state onto the current card.

I went to my personal test reader (offline), scanned the card, and... it worked! The display happily showed **$5.00**.

However, when I tested this on a real machine in the building, the result was very different. It started beeping and threw a cryptic message: **"Error 51"**.

### What went wrong?
The system has a secondary security mechanism. It's not just checking *how much* money is on the card; it's checking the **state** of the card.

By comparing my dumps again, I noticed another memory block (in a different sector) that I had initially ignored because it looked insignificant. However, looking closer, I saw it was incrementing by **1** every time the card was used.

**It was a Transaction Counter.**

* **The Mismatch:** When I restored the old $5.00 dump, I also restored the *old* transaction counter.
* **The Detection:** The machine's internal database knew that my card ID had already performed that transaction number. When my card claimed to be in the past, the system flagged it as a clone.

---

## Step 5: The Final Proof

To prove I actually understood the system (and wasn't just relying on old backups), I decided to construct a **new, valid data block** for an arbitrary amount that had never existed on the card before.

Instead of copying old data, I sat down with a piece of paper and calculated the hex sequence manually:
1.  I chose a target amount (being reasonable, I settled for $100—I initially calculated for $600, but figured that might be too suspicious).
2.  I converted it to the card's specific integer format.
3.  I manually calculated the checksums (inverses) required by the protocol.
4.  I assembled the final hex string.

I wrote this "hand-crafted" data to the card on the specific block and sector to avoid touching or tampering with the transaction counter.

## Conclusion

When I scanned the modified card on my test reader, it successfully read the exact amount I had calculated.

This project was a fascinating dive into how simple storage systems work. It highlights a classic security trade-off:

* **Offline Convenience:** The card holds the money, so the machines don't need expensive, always-on networking.
* **Security Risk:** If the data is on the card, and the keys are known (or default), the data can be manipulated.

The "Error 51" I encountered shows that vendors are aware of this vulnerability. By implementing transaction counters and server-side verification logic, they can detect crude cloning attempts, even if the data on the card itself is manipulated.

![Final card](/assets/img/card_final.jpg)
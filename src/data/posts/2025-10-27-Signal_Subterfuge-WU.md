---
title : Signal Subterfuge Write Up [DeadFace 2025]
date : 2025-10-27 21:00:00 -0500
categories : [WriteUps]
tags : [DeadFace 2025, osint]
---

---

## Signal Subterfuge



This challenge was a fantastic hybrid task. The goal was to identify a compromised cell tower from a single photograph and report its specific metadata.


<p style="text-align: left;">
  <img src="{{ '/assets/img/Signal_sub_rules.png' | relative_url }}" alt="Signal Subterfuge Challenge Card">
</p>

**The Evidence:**
<p style="text-align: left;">
  <img src="{{ '/assets/img/Target_Aquired.png' | relative_url }}" alt="Photo of the compromised cell tower">
</p>

### Initial Reconnaissance (Geolocation)

The first step was to find the geographical location of this photo. The initial image contained several key clues:

* A large **"SE RENTA"** (For Rent) sign.
* Two phone numbers: `55-6036-3833` and `55-4347-2977`. The **`55`** prefix is the area code for **Mexico City**.
* Storefront signs for "Electrolux" and a "Centro de Servicio".

A zoomed-in image provided the final piece of the puzzle:

<p style="text-align: left;">
  <img src="{{ '/assets/img/Signal_zoom_in.png' | relative_url }}" alt="Zoomed-in photo showing the address">
</p>

Tucked away on a small white sign is the street address: **"Av Moliere"** and what looks like **"Nº 436"**.


After looking for this address on Google Maps, it confirmed our location: **Avenida Moliere 436, Polanco, Mexico City, Mexico**. 

### Tower Identification (Signal Analysis)

With the location confirmed, the next step was to use a cellular tower database. I used [CellMapper.net](https://www.cellmapper.net/).
It wasn't easy to use that tool, there are so many parameters to set up.
Initially, the map was empty. I realized the filters about the provider were to be selected.

<p style="text-align: left;">
  <img src="{{ '/assets/img/cellmaper-1.png' | relative_url }}" alt="CellMapper with incorrect provider settings">
</p>


I corrected the filters:
* **Country:** Mexico
* **Provider:** Telcel (334 020)

`Telcel` was the most likely service_provider and the first component of our flag. When I tried all of the available providers ofr Mexico, Telcel was the only one with antennas in our area of search.

After setting the correct provider, I first filtered for **3G (UMTS)** towers to confirm the physical site. This gave me a perfect match: tower **`NB.ID 4621`** was located *exactly* on top of the correct building.


<p style="text-align: left;">
  <img src="{{ '/assets/img/cellmaper-2.png' | relative_url }}" alt="CellMapper confirming the 3G tower on the correct building">
</p>

### Exploitation (Finding the Cell)

Since the challenge likely involved modern 4G/LTE, I switched my CellMapper filter from "UMTS" to **"LTE"**.

This is where the main difficulty lay. The 4G pins were not as perfectly placed as the 3G pin. The closest LTE tower was **`eNB ID 94620`**, which was located slightly off-target (on an adjacent building). This is a common inaccuracy in crowdsourced data.

<p style="text-align: left;">
  <img src="{{ '/assets/img/cellmaper-3.png' | relative_url }}" alt="CellMapper showing the nearby 4G LTE tower 94620">
</p>


The prompt example (`deadface{887654...}`) was a red herring; the ID `887654` was just part of the example text. The *true* identifier needed was the `cell identifier` (a specific sector), not the `eNB ID` (the whole tower).

The tower `eNB ID 94620` had over a dozen different cells (sectors), each with a unique `Cell Identifier` and `Uplink Frequency`. The only way forward was to manually test them.

I began iterating through the list of cells for this tower. After a few attempts, I inspected **Cell 5**.

<p style="text-align: left;">
  <img src="{{ '/assets/img/cellmaper-4.png' | relative_url }}" alt="The correct cell's metadata">
</p>

This cell's data provided the final two components for the flag.

### Flag

Assembling the three components gave the final solution:
* **Cell Identifier:** `24222725`
* **Service Provider:** `telcel`
* **Uplink Frequency:** `1770`

So our flag was : 

**`deadface{24222725_telcel_1770}`**


It was a fun challenge, I really enjoyed it. Thanks to the creator for this fun adventure in the streets of Mexico :)
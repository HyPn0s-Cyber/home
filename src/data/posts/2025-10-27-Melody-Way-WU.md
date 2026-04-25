---
title : Melody Way Write Up [DeadFace 2025]
date : 2025-10-27 22:00:00 -0500
categories : [WriteUps]
tags : [DeadFace 2025, osint]
---

---

## Melody Way

This was a classic geolocation challenge that required moving from a single, rainy photograph to a specific building name in a major metropolis.

**The Challenge:**
> Tilon is a mysterious figure who enjoys his poetic life. Mirveal has discovered an image from one of Tilon’s trips. Apparently he goes often there. Now all that’s left is to get the name of the building.
> 
> **Flag format:** DEADFACE{building_name_across_the_road}

**The Evidence:**
We were provided with this image of a rainy courtyard:

<p style="text-align: left;">
  <img src="{{ '/assets/img/Melody_Way.jpg' | relative_url }}" alt="Rainy street view provided in the challenge">
</p>


### Initial Analysis & Language Identification

My first instinct was to perform a reverse image search on the original photo, but it returned generic results for "rainy city streets" or "covered walkways." I needed to find specific text or landmarks.

I zoomed in on the shop signs. Two stood out. First, a small orange sign on the rigth side, reading "OROT".

<p style="text-align: left;">
  <img src="{{ '/assets/img/orot.png' | relative_url }}" alt="Zoom on OROT sign">
</p>

Searching for "OROT" alone wasn't very helpful. However, the vertical neon sign on the left was more promising.

<p style="text-align: left;">
  <img src="{{ '/assets/img/melody_way_sign.png' | relative_url }}" alt="Vertical neon sign in Korean">
</p>

Translating the text on the vertical sign (**파리바게뜨**) revealed it says **"Paris Baguette"**. Same as on the store next to it :/

While "Paris Baguette" sounds French (even if it makes no sense to my French Heart to call a store like this) it is actually a massive bakery chain based in **South Korea**. 
Next, looking at the architecture—the high-rise buildings and the density—it was highly probable that we were in **Seoul**.

### Narrowing the Search

Knowing we were in Seoul was a start, but there are thousands of Paris Baguette locations there. I couldn't just search for the chain. I needed to find this specific courtyard configuration.

I went back to reverse image searching, this time focusing on crop-outs of the specific architectural features and the combination of the shops.

This led to a breakthrough. I found a Korean blog post (on Naver) that featured a very similar location.

<p style="text-align: left;">
  <img src="{{ '/assets/img/Melody_way_blog.png' | relative_url }}" alt="Korean blog post discussing the location">
</p>

The blog wasn't about the bakery, but a restaurant called **Sindorim Chamjokbal (신도림 참족발)**—a place famous for braised pork trotters.

Translating the blog text using a wonderful AI provided a specific address:
**Seoul, Guro-gu, Gyeongin-ro 661, Sindorim 1-cha Prugio**

### Pinpointing the Target

I plugged that address into Google Maps to verify the location. The layout matched perfectly. I could see the walkway where the original photo was taken.

<p style="text-align: left;">
  <img src="{{ '/assets/img/Melody_way_Maps.png' | relative_url }}" alt="Google Maps view of the location">
</p>

The challenge text asked for the **"name of the building across the road."**

Standing at the location of the there is a massive, distinctive glass complex which seems to hold a theater and a mall.

<p style="text-align: left;">
  <img src="{{ '/assets/img/D-cube_city.png' | relative_url }}" alt="The D-Cube City building across the street">
</p>

Checking the map and the building facade, the name of this complex is **D-Cube City**.

### Flag

The format required the building name across the road.

**`DEADFACE{D-Cube_City}`**

Really nice chall, I loved it, took some time at first, but the satisfaction to find this place was amazing. 
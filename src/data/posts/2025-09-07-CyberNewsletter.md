---
title : Create your Own Personalized Cyber Newsletter for Free
date : 2025-09-07 15:29:00 -0500
categories : [project,learn]
tags : [project]
---

This project is about building my own **cybersecurity newsletter**, automatically pulling content from RSS feeds, summarizing it with AI, and sending it to my email inbox every morning.  

I wanted something **simple, free, and customizable**. Actually, it was one of my friend from University who told me to look at this project. And I'm glad I did!

---

## The Idea


If you want to bes serious about your cybersecurity career or just like to keep yourself informed, you probably also consume a lot of tech content. The idea was to **aggregate all of these into a single daily email**, with short summaries and direct links.  

Initially, I didn’t even know what an RSS feed was to be honest.  
After looking it up, RSS feeds are XML-based streams where blogs and news sites publish updates. Nothing more.

So, at that moment the plan looked like this:
- Parse RSS feeds from different sources (blogs, CERTs, advisories).  
- Fetch the articles, clean the text, and summarize automatically.  
- Get new CVEs for the day from the NVD (National Vulnerability Database).  
- Send everything in a nicely formatted email.  
- Automate the execution every morning at 10 AM.  

---

## First Steps: Parsing RSS Feeds

The first technical building block was **RSS parsing**. Python has a great module for this:  

```python 
import feedparser

feed = feedparser.parse("https://krebsonsecurity.com/feed/")
for entry in feed.entries[:3]:
    print(entry.title, entry.link)
```

Here it's just an exemple with the great Krebs On Security Blog. 
That gave me access to the title, link, and sometimes a description.

## Summarization With AI (For Free)

The thing is, I"m often in a rush or lazy to check on every article, let's be honest, sometimes it's just to much.
So, I searched (with the help of my genuis friend Chatty) and found a library in Python able to make automatic summarizations with simple NLP algorithms. 

```python 
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

def summarize_text(text, sentences_count=2):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentences_count)
    return " ".join(str(sentence) for sentence in summary)
```

The goal here is to reduce every article to just two sentences so I can have an idea of what it talks before cliking on the link. 

## Adding CVEs from NVD

I tested it, and it worked perfectly. However, I realized I just forgot the most important part, the CVEs!
I found a RSS feed on the official website of NVD, but it wasn't sorted chronologically and my python script was just doing that.
So, after looking for another solution, I stept on their API. 
Just with some python code, I was able to connect to the API and get the information I needed about the CVEs updated today. 

## Sending the email

I had no idea how simple it is with python and Gmail to send an email from your own address to yourself. The only tricky part is to create an app password on your Google account under Security to be able to use this method. 

Then with *smtplib* I just had to write the HTML code in oder to make everything pretty. Again, my little friend Chat GPT, gave me the help I needed. 

## Automation with the Task Scheduler

Once the script worked, I wanted it to run automatically.
On Windows, the way to do this is via Task Scheduler.

I created a task:

- Runs every day at 10:00 AM.

- If it fails, retry every 5 minutes up to 3 times.

- If my computer is not powered on at 10, tries again when I start it.

The first times, I ran into some errors because I forgot to quote correctly the paths ensuring the path of my python script was accessible. 


**That's all, now you have your own Cyber Newsletter for free running locally on your computer!**

## Futur Improvments 

It's not a real project if you don't already have some improvments for the future :) 

- Go Serverless: Right now, the script runs only if my PC is on. A better solution is to deploy it as a Lambda function on AWS. Since this is a lightweight job, it could fit within the free tier.

- Add filtering: Only include articles with certain keywords (e.g., ransomware, critical CVEs).

- Track duplicates: Store already-sent links in a SQLite DB to avoid repetition.


## Full Code 

If you want to check what I've done, here is my code: (hope your French is good)

```python

import feedparser
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import date, datetime, timezone
import requests
from bs4 import BeautifulSoup

# ---- Résumé automatique avec SUMY ----
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

import nltk
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)

def summarize_text(text, sentences_count=2):
    """Résumé en quelques phrases avec Sumy (LSA)."""
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentences_count)
    return " ".join(str(sentence) for sentence in summary)

def fetch_article_content(url):
    """Récupère le contenu principal d’un article (texte brut)."""
    try:
        r = requests.get(url, timeout=5)
        soup = BeautifulSoup(r.text, "html.parser")
        paragraphs = [p.get_text() for p in soup.find_all("p")]
        return " ".join(paragraphs[:20])  # limite à 20 paragraphes
    except Exception:
        return ""

def get_cves_today():
    """Récupère les CVE publiées aujourd’hui via l’API NVD avec un résumé et lien cliquable."""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    url = (
        f"https://services.nvd.nist.gov/rest/json/cves/2.0"
        f"?pubStartDate={today}T00:00:00.000&pubEndDate={today}T23:59:59.000"
    )
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        cves = []
        for item in data.get("vulnerabilities", []):
            cve_id = item["cve"]["id"]
            desc = item["cve"]["descriptions"][0]["value"]
            link = f"https://nvd.nist.gov/vuln/detail/{cve_id}"
            cves.append((cve_id, desc, link))

        return cves
    except Exception as e:
        print(f"Erreur récupération CVE : {e}")
        return []

# ---- Liste des flux RSS ----
rss_feeds = [
    #A LIST OF YOUR DESIRED FEEDS
]

# ---- Collecte des articles ----
articles = []
today = datetime.now(timezone.utc).date()

for url in rss_feeds:
    feed = feedparser.parse(url)
    for entry in feed.entries[:5]:  # max 5 articles par site
        # Vérifier la date
        if hasattr(entry, "published_parsed"):
            published = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).date()
            if published != today:
                continue  # ignorer si pas publié aujourd’hui

        title = entry.title
        link = entry.link
        description = getattr(entry, "summary", "")

        # Récupérer texte complet et résumer
        content = fetch_article_content(link)
        if content:
            summary = summarize_text(content, 2)
        else:
            summary = description[:200]  # fallback

        articles.append((title, link, summary))

# ---- Récupérer les CVE du jour ----
cves = get_cves_today()

# ---- Création du mail HTML ----
html_items = ""
for title, link, summary in articles:
    html_items += f"""
    <li>
        <a href="{link}"><b>{title}</b></a><br>
        <p>{summary}</p>
    </li>
    """

html_cves = ""
for cve in cves:
    if len(cve) == 3:
        cve_id, desc, link = cve
        html_cves += f"""
        <li>
            <b><a href="{link}">{cve_id}</a></b>: {desc}
        </li>
        """
    else:  # fallback si jamais pas de lien
        cve_id, desc = cve
        html_cves += f"""
        <li>
            <b>{cve_id}</b>: {desc}
        </li>
        """

html_content = f"""
<html>
  <body>
    <h2>Résumé cybersécurité du {date.today()}</h2>
    <h3>📰 Articles du jour</h3>
    <ul>
      {html_items if html_items else "<li>Aucun article publié aujourd'hui.</li>"}
    </ul>
    <h3>⚠️ CVE du jour</h3>
    <ul>
      {html_cves if html_cves else "<li>Aucune nouvelle CVE aujourd'hui.</li>"}
    </ul>
    <hr>
    <p><i>Infolettre générée automatiquement. Crédits Ги́пн0с 2025</i></p>
  </body>
</html>
"""


# ---- Envoi du mail ----
msg = MIMEMultipart("alternative")
msg["Subject"] = f"Résumé cybersécurité du {date.today()}"
msg["From"] = "toto@gmail.com"
msg["To"] = "toto@gmail.com"
msg.attach(MIMEText(html_content, "html"))

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login("YOUR EMAIL HERE", "YOU WONT HAVE MY PASSWORD")
    server.send_message(msg)

print("Courriel envoyé avec succès !")

```
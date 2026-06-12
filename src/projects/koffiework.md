---
title: "Building Koffiework: Where Coffee Snobs Meet Digital Nomads"
date: 2025-09-25T10:56:03.530Z
summary: "Koffiework started from a personal frustration of finding great coffee spots abroad that also welcome laptops—and turned into a crowd-sourced platform connecting coffee lovers and digital nomads."
metaDescription: "Discover how Koffiework was built: a crowd-powered guide for coffee enthusiasts and remote workers to find cafés that serve great coffee and welcome laptops. Learn more at https://koffie.work"
previewImage: "/assets/img/koffiework/koffiework_preview.jpg"
previewImageAlt: "Man in café booth with pixel-art Koffiework logo overlaid on laptop and table."
tags:
  - Product Management
  - Entrepreneurship
ogImage: "/assets/img/koffiework/koffiework_og.jpg"
---

<picture>
  <source srcset="/assets/img/koffiework/koffiework-scroll.webp" type="image/webp">
  <img class="project-video" src="/assets/img/koffiework/koffiework-scroll.gif" alt="Screen recording of the Koffiework homepage slowly scrolling through laptop-friendly cafe listings." width="700" height="394">
</picture>

Ever searched for a café on Google Maps that looked perfect in the photos, only to get there and discover burnt dark roast beans, barely two or three seats, and no chance of opening your laptop without being in the way? That was unfortunately my experience during my holiday this year in **Türkiye**, and that became the spark to start **Koffiework**.  

![Man with glasses and beard sitting in cozy café booth with laptop and coffee.](/src/assets/img/koffiework/koffiework_2.jpg)

Koffiework is a crowd-sourced platform that helps solve the dual challenge faced by coffee lovers and remote workers: finding cafés that serve genuinely great coffee and welcome people who want to get work done.  

---

## The problem: more than just bad coffee  
Every time I travel abroad and arrive at my hotel, the first thing I usually want is a good coffee. So I start by searching for “specialty coffee” on Google Maps. This is also what I did during my last trip to the Black Sea region of Türkiye. The results often look promising at first glance, but they rarely tell me what I actually need to know. Is the coffee truly specialty or just “special” in name? Is there enough space to sit with a laptop without being in the way?  

![Google Maps search results showing specialty coffee shops in Trabzon with ratings and locations.](/src/assets/img/koffiework/koffiework_3.jpg)

Sometimes I turn to simple Google searches, or blogs like [Coffeevine](https://thecoffeevine.com/) and [European Coffee Trip](https://europeancoffeetrip.com/). While these can be useful, coverage is inconsistent and often outdated.  

The gap seems quite clear. Coffee enthusiasts and digital nomads both struggle, just in slightly different ways:  
- **Coffee enthusiasts** want to know if a café serves different brew methods like filter coffee, whether they use single origin beans, and if they rotate guest roasters.  
- **Digital nomads** (or anyone just wanting to get a bit of work done) want to know if the café is large enough to sit comfortably with a laptop, without feeling like they’re taking up space that should go to paying customers.  

![Venn diagram showing overlap of digital nomads and coffee enthusiasts with Koffiework logo.](/src/assets/img/koffiework/koffiework_4.jpg)

---

## Validation: reddit as my focus group  
Before starting design and code, I went to Reddit. I asked in r/Coffee, r/digitalnomad, and city-specific subreddits if there was a platform to find cafés that combine good coffee with good workspace vibes.  

The answer was simple: no. Dozens of people confirmed the same frustration. Some even suggested including local roaster information. That idea shaped the roadmap and added a new dimension to the platform: not just cafés, but also supporting local roasters.  

---

## Starting building  
I kicked things off by setting up the basics: **Next.js** for the frontend, **Supabase** for the backend, a lightweight hosting setup, Google Auth through Supabase, and Supabase Storage for images. It was a lean stack that allowed me to move fast without overcomplicating things (just kidding; this was already as complex as it can get for someone like me).  

To speed up development and learn as I went, I experimented with different AI coding assistants. I started in VS Code with Roo integration (using Requesty.ai), moved on to get a monthly subscription to Cursor, then switched to Claude Code, and nowadays I even test out Codex for some use cases. Each tool helped me code faster, debug smarter, and understand why certain changes were needed. But also each tool and model taught me about the differences between them; which is worth another separate blogpost later.  

The goal for version 1 was straightforward:  
- Let users search for a city and see in one overview:  
  - cafés that serve really good coffee  
  - cafés that allow laptops and have fast internet  
  - and of course, cafés that offer both
- Include a “nearby me” page for quick discovery  
- Allow users to set filters (coffee quality, work-friendliness, WiFi, outlets, accessibility)  

At first, everything was going smoothly. Then I had the idea to enrich the platform with café photos by fetching them directly through the Google Photos API. It worked great during testing, it looked visually stunning… until I checked my billing dashboard. Within a week, I had racked up **€50,-** in costs from my own usage (!).  

That was an expensive but valuable lesson. Pulling in data from external APIs wasn’t sustainable, both in terms of cost and authenticity. It pushed me to make a key product decision: Koffiework should be entirely crowd-sourced, with users contributing cafés, reviews, and photos themselves. That pivot didn’t just solve the cost issue, it also made the platform (in my opinion) feel more real.  

The image below shows a screenshot of how the page with cafés looked like, showing the distinction between cafés rated by the Koffiework community and others pulled from Google:  

![Café listings on Koffiework site showing ratings, reviews, and laptop policy details.](/src/assets/img/koffiework/koffiework_5.jpg)

---

## Launch: start local, think global  
I seeded the platform with cafés in **The Hague** and cities I had recently visited. This gave me quality control, ensured the features worked, and provided authentic content to start with.  

![Koffiework website page displaying community-rated cafés in The Hague with reviews and ratings.](/src/assets/img/koffiework/koffiework_6.jpg)

Koffiework is now live with early users adding cafés, reviews and up or downvoting roasters.  

---

## What’s next  
With the MVP live, I can now validate assumptions with real usage. My immediate priorities:  
- **User research:** more interviews and surveys to understand what should be added, changed or is redundant.  
- **Future-proof:** making sure that no issues will exist once the user base grows, fixing any kind of bugs.  
- **Metrics:** retention, review quality, geographic spread  

---

## Lessons learned as a PM  
1. **Constraints drive innovation**  
   The Google Photos API costs forced me to rethink the model and build something more sustainable.  

2. **Solve your own problem**  
   Personal frustration made the problem clear and relatable.  

3. **Community validation is gold**  
   Reddit feedback shaped the platform more effectively than any survey could.  

4. **Ship and learn, don’t overbuild**  
   Although in a way I still 'overbuild' a bit. I know the platform is not perfect yet, and that's fine... because it's more than enough as an MVP for now.

5. **Technical understanding sharpens decisions**  
   Not accepting every input from the coding agent and thinking “ah, should be okay I guess?”, helped me to really understand certain concepts and make smarter trade-offs. The amount of times I wrote: "Before implementing this, can you explain to me like I'm 16, what we're going to change and why?"

6. **“Simple” features are rarely simple**  
   Even a small feature like listing roasters by city required deeper logic than expected. I empathize even more with devs than ever before. :-)

7. **Learn by doing**  
   By actually creating a platform and trying to build each block that makes this possible, I was able to learn so many more aspects than just (passively) learning how to use each tool separately.

---

## The journey continues  
![Homepage of Koffiework showing search bar and community-rated cafés from multiple cities.](/src/assets/img/koffiework/koffiework_7.jpg)

Koffiework sits for me at the crossroads of personal passion and product thinking and solving. It solves a real problem I’ve lived through, and it’s already helping others discover cafés that combine great coffee with a good workspace.  

Whether it grows into a global platform or stays niche, it has already transformed how I think and work as a product manager. It’s a reminder that frustration can be the start of opportunity.  

👉 If you’re a coffee enthusiast, digital nomad, or just tired of bad “koffie”, check out **[Koffiework](https://koffie.work)** and add your favorite café.  

Built with lots of love and… you guessed it: coffee.

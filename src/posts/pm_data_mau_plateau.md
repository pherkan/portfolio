---
title: "Our MAU was flat for three months, and the roadmap wanted more AI"
date: 2026-11-03T10:00:00.000Z
summary: "When usage stopped growing at Envision, the easy answer was to ship more AI. The data pointed somewhere less exciting: a core feature people used every day, but couldn't use offline."
metaDescription: "A product management story from Envision: how usage, repeat usage and user interviews showed that bringing a heavily used core feature offline mattered more than adding new AI features."
series: finding-the-bottleneck
tags:
  - Product
  - Data
  - AI
---

For about three months, our monthly active users barely moved. Not down, not up. Just flat.

At Envision we built AI-powered tools for people who are blind or have low vision: an app and smartglasses that turn the visual world into speech. AI was moving fast, and so were we. So when growth stalled, the instinct in the room was clear: ship the next AI feature. Something new to talk about, something new to try.

I wasn't sure that was the problem. So before we agreed on the next big thing, I went looking for where people were actually getting stuck.

---

## Data isn't always there. When it is, use it.

I'm a user-centered product manager. Most of my decisions start with talking to people, and in a startup that is often all you have. But we did have usage data, and a flat line is a question worth asking it: *are fewer people coming in, or are the people who come in not finding enough reason to stay?*

For the numbers I used Mixpanel and PostHog. I built funnels in both to see how people actually moved through the app: where they started, which features they opened, and where they dropped off. With that, I looked at three things side by side:

1. **Usage per feature.** Which features do people open, and how often?
2. **Repeat usage.** Of the people who tried a feature, how many came back to it the week after, and the month after?
3. **What users and developers told us.** Conversations with users, and with the engineers who saw the support issues and edge cases up close.

None of these on its own tells the full story. Together, they did.

---

## Two patterns that didn't match the roadmap

**A core feature was used constantly, and asked about constantly.** Scan Text let you take a photo of a document. We ran it through OCR and opened the text in a reader, so you could listen to a letter, a menu or a form. It was one of the most used parts of the product, and it was very accurate, because it ran on a powerful model online. But that also meant it only worked with an internet connection. And in conversations, the same request kept coming back: *can I use Scan Text offline?* High usage hid the problem. People used it because they needed to, not because it fit every moment they needed it.

**The newer AI features got a first try, and then not much more.** People were curious. They tried them once or twice. But repeat usage was low compared to the core features.

Put those two on one picture and the roadmap looks different:

<figure style="margin:2rem 0">
<svg viewBox="0 0 520 360" role="img" aria-labelledby="quadrant-title quadrant-desc" style="width:100%;max-width:520px;height:auto;font-family:inherit">
  <title id="quadrant-title">Usage versus satisfaction, illustrative</title>
  <desc id="quadrant-desc">A two by two chart. The horizontal axis is how often a feature is used, the vertical axis is how satisfied users are. Scan Text sits in the high usage, low satisfaction corner. The new AI features sit in the low usage area.</desc>
  <rect x="60" y="20" width="440" height="280" fill="none" stroke="currentColor" stroke-opacity="0.3"/>
  <line x1="280" y1="20" x2="280" y2="300" stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="4 4"/>
  <line x1="60" y1="160" x2="500" y2="160" stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="4 4"/>
  <text x="280" y="335" text-anchor="middle" font-size="14" fill="currentColor">how often it's used →</text>
  <text x="22" y="160" text-anchor="middle" font-size="14" fill="currentColor" transform="rotate(-90 22 160)">how much people like it →</text>
  <text x="390" y="45" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.6">keep it healthy</text>
  <text x="390" y="290" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.6">fix this first</text>
  <text x="170" y="45" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.6">nice, but niche</text>
  <text x="170" y="290" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.6">rethink or wait</text>
  <circle cx="420" cy="235" r="14" fill="#e4572e"/>
  <text x="420" y="210" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Scan Text</text>
  <circle cx="130" cy="130" r="9" fill="#5b8def"/>
  <circle cx="165" cy="190" r="9" fill="#5b8def"/>
  <circle cx="205" cy="150" r="9" fill="#5b8def"/>
  <text x="170" y="225" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">new AI features</text>
</svg>
<figcaption>Illustrative, not real data: how the two patterns looked next to each other.</figcaption>
</figure>

The thing most people depend on was the thing we were least likely to touch, because it wasn't new.

---

## Saying "not yet" to more AI

Some of the team wanted to keep pushing new AI capabilities. I understand why. AI was what made Envision special, it was moving quickly, and honestly, I love AI too. But a new capability doesn't help much if people keep running into the same wall with the one they already rely on.

So I didn't argue against AI. I argued about order. I brought the usage and repeat-usage patterns together with what we heard from users, and made a simple case:

- the people we already have are telling us what's in the way, in data and in their own words
- a new feature that gets tried once doesn't fix a flat line
- a core feature that works in more places, every day, for the people who rely on it might

It took a few conversations. In the end we agreed to put improving the core experience ahead of the next round of AI features.

---

## The easiest feature on the roadmap

Here's the funny part. We already had an offline text feature. Instant Text read text out loud in real time, straight from the camera, without an internet connection. Scan Text and Instant Text used similar technology. So my question was simple: if we can do it offline for Instant Text, why can't we do it for Scan Text?

<figure style="margin:2rem 0">
<img src="/assets/img/pm_data_mau_plateau/scan_text_vs_instant_text.webp" alt="Two Envision app screens side by side. Left, on pink: Scan Text, with the headline 'Read complex documents and letters', a photo of an open book being read out loud. Right, on yellow: Instant Text, with the headline 'Turn any text into speech, instantly', the camera pointed at a 'Neighbourhood watch area' sign that is read out loud." loading="lazy" width="1600" height="1054">
<figcaption>Scan Text (left) read full documents with an online model. Instant Text (right) read short text live from the camera, offline.</figcaption>
</figure>


We had never built an offline Scan Text for a reason. The on-device recognition wasn't as accurate as the online model, and we assumed people wouldn't accept a less accurate version. But nobody had actually asked for perfect accuracy offline. They asked for Scan Text that works when there's no connection.

So I pushed for a "fake" offline Scan Text. When you're offline, you get the same Scan Text flow: take a photo, get the text in the reader. Under the hood it uses the on-device technology we already had. It was literally a capability we already owned, repackaged in a slightly different UI. Not a big build at all.

From the very first iteration, people were stoked. Not because it was technically impressive, but because they felt heard. They had asked for this again and again.

We tracked satisfaction in two ways: thumbs up and thumbs down in the app, and a survey we sent before and after the release.

- **Thumbs up versus thumbs down** went from 80/20 to 85/15.
- **Customer satisfaction** in the survey went from 4.3 to 4.6 out of 5, between September 2022 and December 2022.

<figure style="margin:2rem 0">
<div style="display:flex;flex-wrap:wrap;gap:1.5rem 2.5rem">
<svg viewBox="0 0 320 150" role="img" aria-labelledby="thumbs-title thumbs-desc" style="flex:1 1 280px;max-width:360px;height:auto;font-family:inherit;overflow:visible">
  <title id="thumbs-title">In-app thumbs up versus thumbs down</title>
  <desc id="thumbs-desc">Before offline Scan Text, 80 percent of ratings were thumbs up and 20 percent thumbs down. After, 85 percent up and 15 percent down.</desc>
  <text x="0" y="16" font-size="15" font-weight="600" fill="currentColor">In-app thumbs up vs. down</text>
  <text x="0" y="59" font-size="13" fill="currentColor">Before</text>
  <rect x="70" y="40" width="184" height="28" rx="4" fill="currentColor" fill-opacity="0.35"><title>Before: 80% thumbs up</title></rect>
  <rect x="256" y="40" width="44" height="28" rx="4" fill="currentColor" fill-opacity="0.1"><title>Before: 20% thumbs down</title></rect>
  <text x="80" y="59" font-size="13" font-weight="600" fill="currentColor">80% up</text>
  <text x="264" y="59" font-size="13" fill="currentColor">20%</text>
  <text x="0" y="103" font-size="13" fill="currentColor">After</text>
  <rect x="70" y="84" width="196" height="28" rx="4" fill="#3b6fd4"><title>After: 85% thumbs up</title></rect>
  <rect x="268" y="84" width="32" height="28" rx="4" fill="currentColor" fill-opacity="0.1"><title>After: 15% thumbs down</title></rect>
  <text x="80" y="103" font-size="13" font-weight="600" fill="#fff">85% up</text>
  <text x="276" y="103" font-size="13" fill="currentColor">15%</text>
  <text x="70" y="140" font-size="12" fill="currentColor" fill-opacity="0.6">share of all ratings</text>
</svg>
<svg viewBox="0 0 320 150" role="img" aria-labelledby="csat-title csat-desc" style="flex:1 1 280px;max-width:360px;height:auto;font-family:inherit;overflow:visible">
  <title id="csat-title">Customer satisfaction survey, out of 5</title>
  <desc id="csat-desc">Average satisfaction was 4.3 out of 5 in the September 2022 survey and 4.6 out of 5 in the December 2022 survey.</desc>
  <text x="0" y="16" font-size="15" font-weight="600" fill="currentColor">Satisfaction survey (out of 5)</text>
  <line x1="300" y1="34" x2="300" y2="118" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="3 3"/>
  <text x="0" y="59" font-size="13" fill="currentColor">Sep 2022</text>
  <rect x="70" y="40" width="198" height="28" rx="4" fill="currentColor" fill-opacity="0.35"><title>Sep 2022: 4.3 out of 5</title></rect>
  <text x="258" text-anchor="end" y="59" font-size="13" font-weight="600" fill="currentColor">4.3</text>
  <text x="0" y="103" font-size="13" fill="currentColor">Dec 2022</text>
  <rect x="70" y="84" width="212" height="28" rx="4" fill="#3b6fd4"><title>Dec 2022: 4.6 out of 5</title></rect>
  <text x="272" text-anchor="end" y="103" font-size="13" font-weight="600" fill="#fff">4.6</text>
  <text x="70" y="140" font-size="12" fill="currentColor" fill-opacity="0.6">0</text>
  <text x="300" y="140" text-anchor="middle" font-size="12" fill="currentColor" fill-opacity="0.6">5</text>
</svg>
</div>
<figcaption>Before and after offline Scan Text. The survey ran in September 2022 and December 2022.</figcaption>
</figure>


---

## Perfect world, real world

In a perfect world, it works like a textbook. You have clean data, you find the insight in it, you ship an improvement, and then you isolate exactly that one change and measure how much it moved the needle.

In the real world, especially in startups and scale-ups, that's almost impossible. There's rarely enough traffic, time or tooling to isolate one change from everything else going on. The numbers above are real, but they're not a lab result. Other things changed in the same period too.

So you look at different things and see if they point the same way. Sometimes that's a survey or a thumbs up button. But most of the time it's simply talking to people: users, colleagues inside the company who know the product and its problems inside out, and people at other companies or stakeholders who've seen similar problems. None of it is perfect proof. Together, it's usually enough to make a good decision.

---

## What I took from it

- **High usage isn't the same as satisfaction.** People use things they need even when they're frustrated by them. Usage tells you where it matters; conversations tell you whether it's working.
- **Repeat usage is a more honest metric than launches.** A feature that gets tried once is interest. A feature that gets used again is value.
- **Data is a way to disagree well.** It moved the conversation from "I think" versus "I think" to a shared picture of where users were stuck.
- **Data doesn't replace talking to people.** The numbers showed where to look. The users explained why.
- **Don't assume what users won't accept.** We never built offline Scan Text because we thought lower accuracy would disappoint people. They just wanted it to work when they were offline.
- **The easiest features can have the most impact.** This was one of the smallest things we shipped, and one of the most appreciated.

In startups, scale-ups and bigger companies alike, data isn't always available, clean, or complete. But wherever you have some, it's worth using it to find the bottleneck before deciding what to build next. Sometimes the most impactful thing on the roadmap is the boring one.

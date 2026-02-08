---
title: "This could’ve been a Google Form, but what’s the fun in that?"
permalink: "/posts/iftar-vibecoding-arcade-invite/"
date: 2026-02-08T18:45:00.000Z
summary: Instead of sending a boring invite, I vibecoded a small arcade-style game for our Ramadan iftars. Not because it was necessary, but because building fun things is not a burden.
metaDescription: This year I turned a simple iftar invitation into a playful arcade-style game. A small vibecoding side project that shows how fun, clear prompting, and lightweight automation can make building more enjoyable.
previewImage: "/assets/img/pm_vibecoding_3/pm_vibecoding_3_preview.jpg"
previewImageAlt: "Retro arcade-style iftar signup game screen showing “iftar at ferkan & suzan’s,” a pixel art Istanbul skyline at sunset, and a large “press start” button."
tags:
  - Vibecoding
  - Side Projects
  - Automation
ogImage: "/assets/img/pm_vibecoding_3/pm_vibecoding_3_og.jpg"
---

![Full retro arcade game start screen labeled “iftar edition 2k26,” featuring pixel art boats, mosque silhouettes, sound toggle, and a prominent “press start” call to action.](/src/assets/img/pm_vibecoding_3/pm_vibecoding_3_0.jpg)

Every year during Ramadan, I host a few iftars.  
The food matters. The people matter.  
The invite itself usually does not.

This year I wanted to try something else.  
Not because it needed to be more efficient, but because it could be more fun.

So I vibecoded a small arcade-style iftar invitation.  
People pick a date, claim a table, see who else signed up.  
That’s it.

Technically unnecessary.  
Creatively very satisfying.

---

## BUILDING FUN THINGS IS NOT A BURDEN

One thing I keep noticing is this.

When something is fun to build, it does not feel heavy.  
It does not drain energy.  
It does not feel like work you need to push through.

Fun removes friction.

This project did not need to become a product.  
It just needed to work and feel right.

---

## PROMPTING THAT ACTUALLY HELPS YOU BUILD

What helped a lot in this project was being very explicit in how I prompted the AI code editor.

The prompts that worked best were practical and grounded in reality.

I used prompts like:
- Do a web search on how people usually implement this
- Check what people recommend on Reddit
- List pros and cons of each approach
- Given my final goal, suggest the simplest viable option

Two things made the biggest difference.

First, explicitly asking for web research instead of guesses.  
Second, clearly stating the final goal so suggestions stayed relevant.

That combination helped me move forward instead of getting stuck debating options.

---

## THE STACK AND A SMALL LEARNING DETOUR

For the database, this project went through a small evolution.

I first used Sheetio, then SheetyDB.  
Both worked fine at the start.

But I was a bit afraid I would hit free tier limits.  
And I realised I did not fully understand what was happening under the hood.

So I ended up switching to using the Google Sheets API directly.

That meant setting up a Google Cloud project, creating a service account, and using the API from there.

Was it the fastest option? Probably not.  
Was it more fun and educational? Definitely.

Who knew learning could be fun? Ha.

---

![Game interface step where a user enters their name and takes a selfie, with camera preview, “take photo” and “retake” buttons, set against an 8-bit Istanbul background.](/src/assets/img/pm_vibecoding_3/pm_vibecoding_3_1.jpg)

---

## SMALL AUTOMATION, REAL LIFE IMPROVEMENT

Once the game was built, I noticed something slightly annoying.

I still had to check manually if someone signed up.  
Open the table.  
See who claimed which date.

And then I realised the question I would definitely get.

“So who’s coming tomorrow?”

I had already used Resend before for <a href="https://koffie.work" target="_blank" rel="noopener noreferrer">Koffiework</a> and really liked their platform, so I integrated it here as well.

Now, whenever someone signs up:
- my wife and I get an email
- it tells us who signed up
- and for which date

No checking tables.  
No mental tracking.  
No guessing.

These are the kind of small automations that quietly improve quality of life, even if it is just a little.

---

## FINAL THOUGHT

This could have been a Google Form.  
And that would have worked perfectly fine.

But building something playful made the whole process lighter.  
More enjoyable to build.  
More fun to use.  
Easier to finish.

Fun things are not a distraction.  
They are often the reason things get built at all.

If you want to see it in action, the arcade-style invite is here:  
https://pherkan.com/iftar2026

Even if you are not invited, the vibes are public.

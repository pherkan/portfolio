---
title: "Building things I do not fully understand yet"
permalink: "/posts/building-things-i-do-not-fully-understand-yet/"
date: 2026-06-14T10:00:00.000Z
summary: "What building Koffiework and moving from Netlify to a Hetzner VPS taught me about product management, infrastructure, prompting, and learning by building before everything fully makes sense."
metaDescription: "A product manager's reflection on learning backend and infrastructure concepts through building, prompting, and moving Koffiework from Netlify to Hetzner and Coolify."
previewImage: "/assets/img/pm_backend_before_understanding/pm_backend_before_understanding_hero.png"
previewImageAlt: "Ferkan sitting at a desk with a laptop, shrugging with a confused expression."
tags:
  - Product Management
  - Vibecoding
  - Webdevelopment
ogImage: "/assets/img/pm_backend_before_understanding/pm_backend_before_understanding_hero.png"
---

![Ferkan sitting at a desk with a laptop, shrugging with a confused expression.](/src/assets/img/pm_backend_before_understanding/pm_backend_before_understanding_hero.png)

It would be an understatement to say that I have been into the so-called 'vibecoding' for more than a year now.

Less than two years ago, building something on the web usually meant opening a tool I already understood: WordPress, Framer, Figma, Carrd, to name a few. Maybe a plugin here, a template there, a few settings, some styling, publish, done.

There is nothing wrong with that. Those tools are great. They help you get something online fast. They are especially useful when the idea is still small, when the goal is mostly visual, or when you just want to validate something without turning it into a whole technical adventure. (And also the only feasible solution before LLMs where such a thing)

But lately, especially with Koffiework as my main side project, I noticed that I am finally doing things differently: building things that I do not fully even understand yet.

Not in a reckless way, hopefully. More in the sense that I start with a little bit of understanding, just enough to know the direction, and then I use the project itself to learn the rest.

Because I kind of knew what a backend was, what a VPS and DNS did and that a database (like Firebase or Supabase) is needed.

But "kind of knowing" something is very different from having to make it work and that gap is where most of the learning happens.

---

## Knowing a little bit about everything

As a product manager, you often know a little bit about everything. And that's also our 'superpower'.

Not enough to be the expert in every room, but enough to follow what is going on. You understand the vocabulary. You know the rough shape of the tradeoffs. You can ask decent questions. You can connect design, business, users, engineering, support, marketing, and whatever else happens to be part of the product that week.

That is also the fun part of product management. You are always moving between worlds.

But there is a danger in knowing a little bit about everything. Sometimes it can feel like understanding, when it is actually just familiarity.

For example, I knew what a VPS was. In my head it was: a server somewhere that you rent, probably cheaper than platform hosting if you know what you are doing, more control, more technical, maybe something I would need eventually.
That was not wrong. It was just very incomplete. Because once you actually use one, the questions become much more practical.

How do you log in? Where do SSH keys live? Everything public, some things private? Getting your code onto the server? Environment variables and much more...  

That is not vocabulary anymore. That is operating a thing.

---

## koffiework made the abstraction break

koffiework started from a very simple frustration: I love good coffee, and when I travel I often want to find a cafe where I can also open my laptop without feeling like I am taking up space in the wrong place.

Google Maps can show me cafes. Coffee blogs can show me specialty coffee spots. But neither really answers the combined question:
Can I get good coffee here and also work for a bit? - In one central area.

So I started building koffiework. At first, it felt manageable. Next.js for the frontend. Supabase for the backend. Google login. Cafe pages. Reviews. Photos. Search. A map. Later, a mobile app.

Sounds like a normal modern web project, right? And it is.
But the funny thing with normal modern web projects is (I learned ha) that they contain a lot of hidden complexity.

A review is not just a review. It is a user, a permission model, maybe moderation, maybe editing, maybe deleting, maybe abuse prevention.
A photo is not just a photo. It is upload limits, compression, storage, file types, cleanup jobs, bandwidth, and privacy.

Search is not just a search box. It is external APIs, caching, cost control, rate limits, and weird edge cases where people type things you did not expect. A mobile app is not just a second interface. It is a contract. Once the app uses your API, those routes need to keep working.
And hosting is not just "where the website lives."

At least not anymore.

---

## The netlify to VPS move was not just about hosting

For a long time, Netlify was exactly what I needed.

It helped me ship. It connected to GitHub. It built the app. It hosted the site. It handled scheduled functions. It gave me a lot of useful platform behavior without asking me to think too much about servers. So this is not a "Netlify is bad" story. It is more that Koffiework grew into a shape where I wanted to understand and control more of the system. Part of that came from cost.

Looking at Netlify observability was a bit of a wake-up call. A week showed roughly 22GB bandwidth from Crawlers and Browsers.
That is when I realised the issue was not simply "users are using the product, so hosting costs money."
It was also automated traffic. Cache misses. Dynamic pages being more expensive than I expected. API routes that needed protection. Crawlers turning into a product and infrastructure concern.

![A person studying a dashboard with a downward graph on a large monitor.](/src/assets/img/pm_backend_before_understanding/pm_backend_before_understanding_graph.png)

As a PM, that is fascinating...

Because suddenly caching is not just an engineering detail. It affects cost. It affects performance. It affects whether the product can grow without doing something silly in the background. That is when moving to Hetzner and Coolify became less of a nerdy hosting experiment and more of a real product decision.

---

## Choosing what to understand next

Moving away from Netlify was not just a technical migration. For me, it became a crash course in what hosting actually means. Until then, hosting was mostly an abstract box in my head. Code goes in, website comes out. With Coolify and Hetzner, that box suddenly had more visible parts.

There was a server. There was a dashboard. There were SSH keys, DNS records, environment variables, health checks, scheduled jobs, backups, and rollback plans. And honestly, that was exactly why it became useful. Not because I suddenly wanted to become a system administrator, but because I wanted to understand the product better. Koffiework was becoming serious enough that I could no longer treat infrastructure as something completely separate from product decisions.

At the same time, I also learned that understanding more does not mean owning everything. I kept Supabase managed. The database, authentication, user accounts, sessions, and photo storage stayed there. Moving those at the same time would have been a completely different level of risk.

That might sound like a technical choice, but to me it felt like a product choice. What do I need to control, and where should I keep things boring and reliable? Where is the learning useful, and where would learning by breaking things be stupid? That was the real lesson.

---

## The mental model I needed

This is the simplified mental model I needed to understand what was happening. It is not meant to be a perfect architecture diagram, but more a way to explain the moving parts to myself.

<figure class="article-diagram">
  <img src="/assets/img/pm_backend_before_understanding/koffiework-mental-model.svg" alt="Flow diagram showing a user reaching koffie.work through Cloudflare, Hetzner, Coolify, and the Koffiework app, which connects to Supabase and external services.">
</figure>

In less diagrammy words: Cloudflare controls where `koffie.work` points and adds protection in front of the site. Hetzner is the rented server. Coolify runs on that server and handles deployments. The Koffiework app runs there as a Docker container. Supabase still handles the database, authentication, and storage. External services handle things like Google Places, emails, payments, app subscriptions, and notifications.

I do not think every product manager needs to know every detail of this. But having a rough mental model helps a lot. It helps you understand why a DNS change can break a product, why an API route matters for the mobile app, why moving the database is a bigger decision than moving the frontend, and why backups are not just a nice extra.

This diagram looks simple now, but each arrow represents something I had to understand better. None of it was impossible to learn. It was just not obvious before I had to do it.

---

## Prompting as a way to learn

The reason I could do this is not because I secretly became a backend engineer overnight.

I did not. The reason is that AI coding tools gave me a way to build while learning.

But I think there is an important difference between "letting AI build it" and "using AI to learn while building."

If I just ask an AI tool to implement something and accept everything, I might end up with code that works for a while. But I do not build a mental model. And without a mental model, every bug becomes scary.

So I started asking different questions.

Things like:

- Before implementing this, explain what we are changing and why.
- Explain it to me like I am 16.
- What could break if we do this?
- What would a senior engineer check before deploying this?
- Is this the simplest option or just the most complete one?
- What should stay managed?
- What is the rollback path?
- What is the boring but safe version?

That helped a lot. Not because every answer was perfect. It was not. But because it turned the work into a conversation. I could ask follow-up questions exactly at the moment where I was confused. Instead of learning backend concepts in the abstract, I was learning them because the thing in front of me needed a decision. That is a very different kind of motivation.

---

## Building before fully understanding

There is something slightly uncomfortable about building things you do not fully understand yet. Part of me thinks: should I even be touching this? But then again, how else do you learn?

Of course there is a line. You do not want to be careless with user data, payments, authentication, or production systems. Some things need proper review, backups, testing, and sometimes someone more experienced involved.

But I also think waiting until you fully understand everything is a trap. Because full understanding often comes after building, not before.

That has been the pattern for me with Koffiework. I did not fully understand Supabase until I had to deal with users, auth, storage, permissions, and migrations. I did not fully understand hosting until I had to compare Netlify, Coolify, Docker, health checks, scheduled jobs, and DNS. I did not fully understand API cost control until Google Places usage and crawler traffic made it very real.
I did not fully understand why engineers care so much about rollback until I had something live that I did not want to break.
The understanding came from the work, slowly ...and sometimes after breaking my brain a bit.

---

## What this changed in me as a PM

I do not think every product manager should become a developer. I also do not think vibecoding means engineering does not matter anymore. Honestly, the more I build, the more respect I have for good engineers. What did change is the quality of my questions and prompting. When someone says "this small feature touches auth," I understand that better now. When someone says "we need rate limits," I do not hear it as overengineering. When someone says "we should not move the database at the same time as the app," that feels less like caution and more like wisdom.

When someone asks "what is the rollback plan?", I no longer see it as negative thinking.
And when I ask for something as a PM, I can better imagine the hidden parts behind it.

That is valuable. Not because I can replace an engineer (at all).
But because I can collaborate with more context.

---

## The good and the annoying parts

The good part of owning more of the stack is control.

I understand more of where things live. I can run multiple projects on the same VPS. I can see how deployments work. I can decide more intentionally what gets cached, what gets protected, and what stays managed.

The annoying part is also control. Because now there is more to care about.

Backups. Monitoring. SSH. Firewall rules. Coolify access. Cloudflare settings. Scheduled jobs. Health checks. Disk space. What happens if the server disappears.

That is not as glamorous as "I moved to a VPS." But it is the real story.

Cheaper hosting is not automatically simpler hosting. Sometimes it is cheaper because you are taking on more responsibility yourself.
For Koffiework, that tradeoff started to make sense. For a simple portfolio website, I probably would not recommend making it this complicated just for the sake of it. The infrastructure should match the product.

That sentence sounds obvious. But I understand it much better now.

---

## Should other Product Managers do this?

Maybe. Not everyone needs to run a VPS. Not everyone needs to learn Docker. Not every side project needs a backend, a database, scheduled jobs, and a whole deployment setup.

But I do think there is something valuable in building something slightly beyond your current understanding. Especially as a product manager.

Because product management is full of abstractions. We talk about users, systems, metrics, features, APIs, funnels, costs, and tradeoffs all the time. Building makes those abstractions less abstract.

You start with: "I kind of know what this means."

And after enough prompting, debugging, deploying, breaking, fixing, and asking "wait, why does this work like this?", it slowly becomes:
"I understand why this thing is shaped this way." That is the shift I care about.
koffiework is still far from perfect. I am still learning. There are still many things I only partly understand.
But that is also the point.
I am building things that I do not fully understand yet.
And each time, I understand a little more.

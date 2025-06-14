---
title: Building ally, conversational AI assistant
emoji: 🦿
metaDescription: How we built ally, the accessibility-first conversational assistant at Envision, from public development to cross-platform launch.
date: 2025-06-13T00:00:00.000Z
summary: A behind-the-scenes look at how we launched ally, the world's first accessibility-first conversational assistant on smartglasses, and how we used public development, inclusive testing, and function calling to shape it.
tags:
- Product anagement
- Accessibility
- Envision
---

![Illustration showing 'ally', accessibility first AI assistant.](/src/assets/img/ally.jpg)

## Bringing ally to Life: Launching an accessibility-first conversational assistant at Envision

In March 2024, we at Envision began developing **ally**, a conversational AI assistant designed to be personal, accessible, and platform-agnostic. One year later, in March 2025, ally launched publicly across **iOS, Android, web, and Envision Glasses**, making it one of the first accessibility-first conversational assistants available on smartglasses.

### Building ally in Public

From the beginning, ally was developed in public. We created a dedicated Slack space where early users, beta testers, and distributors could share feedback directly with the product team. This community has since grown to **585+ members**, becoming an essential part of our product development loop. We conducted surveys, ran bi-monthly product calls, and prioritized based on what users needed ally to actually do in their daily lives.

This transparent approach enabled us to consistently ship features that had real impact, and helped us ensure platform stability before our production release.

### What Makes ally Different

Unlike typical AI chatbots, ally supports **function calling** to complete real-world tasks:
- Take photos and describe the scene
- Fetch weather data using the user's GPS
- Retrieve calendar entries
- Search the internet when needed
- Read documents using OCR, reducing hallucinations common in vision-language models

This last feature — OCR integration — was especially important. In working with blind users, we learned that hallucinated or inaccurate readings of text can have serious consequences. So we built ally to call a dedicated OCR model instead of relying solely on general-purpose vision models.

ally is also **deeply personalizable**. Users can create different allies, add personal context, and fine-tune how their assistant interacts with them. It’s designed to be both personal and ubiquitous — available wherever it’s needed.

### Defining success

For us, success meant:
- Every core feature working reliably across all four platforms
- Positive qualitative feedback from testers on Slack
- Clear growth metrics: clicks, downloads, usage time

By May 2025, ally had surpassed **1 million minutes of active use**, validating both user demand and product-market fit.

### My Role as a Product Manager

As PM for ally, I led product development across platforms and functions. My responsibilities included:

- **Platform coordination:** Maintaining feature parity across iOS, Android, browser, and Envision Glasses  
- **User research:** Gathering insights from our Slack testers and distributors to inform product direction  
- **Accessibility testing:** Regularly testing with VoiceOver, Dynamic Type, and blind users on desktop  
- **UX experimentation:** Collaborating with design (and marketing team) on copy, interaction patterns, and sound design, including A/B tests  
- **Prioritization:** Applying a mix of **RICE** and **MoSCoW** frameworks to balance user value and development effort  
- **Scope control:** Making decisions to postpone features like smart OCR guidance to avoid delaying the launch and align with our monetization roadmap  
- **Issue triage:** Differentiating between backend and frontend blockers and assigning P1–P3 status accordingly  

### Responsible and inclusive AI

Throughout development, we made intentional choices to support responsible AI. From building and implementing our own OCR to reduce hallucinations, to designing a clear onboarding experience that works better than most mainstream AI tools, ally reflects a commitment to inclusive, practical, and ethical technology.

### Looking ahead

We’re continuing to evolve ally based on real-world usage and community input. But with this public release, we’re proud to have launched a truly **accessible, personal, and multi-platform AI assistant** — built transparently, and shaped directly by its users.
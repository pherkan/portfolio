---
title: suzkan's summer BBQ 2025
layout: page.njk
permalink: /bbq/index.html
metaDescription: start of summer BBQ party hosted by ferkan & suzan — with great food, friends, and a side of birthday.
ogImage: "/assets/img/bbq.png"
---
**📆 date:**
saturday, may 17th – 16:00 to 23:00

**📍 location:**
herengracht 50B<br>
2511 EJ den haag

---

it’s time to light the grill, crack open something cold, and officially welcome summer with a backyard-style BBQ.

<img src="/assets/img/bbq.png" alt="BBQ party banner" style="width: 100%; max-height: 400px; object-fit: contain; border-radius: 12px;" />

---

## 🥳 join us!
suzan and i are hosting a cozy get-together with good food, chill vibes, and great company.

there’ll be plenty of meat, veggie options, snacks, music, and that *slightly chaotic* energy that every good BBQ needs.

oh — and i’m also turning 31 😅🥳.

---

## 🍗 RSVP below to save your spot

<form id="rsvpForm">
  <label>your name:<br>
    <input type="text" name="name" id="name" required>
  </label><br><br>

  <label>are you bringing a +1?<br>
    <select name="plusOne" id="plusOne" required>
      <option value="no">no, it's just me ugh.</option>
      <option value="yes">si, oui, yes. i'm bringing one extra human.</option>
    </select>
  </label><br><br>

  <button type="submit">count me in 🎉</button>
</form>

<p id="submitMessage" style="margin-top: 1rem;"></p>

<script>
  document.getElementById("rsvpForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const plusOne = document.getElementById("plusOne").value;

    if (!name) {
      alert("please enter your name.");
      return;
    }

    const payload = {
      sheet1: {
        name,
        plusOne
      }
    };

    fetch("https://api.sheety.co/2381c287b05641ab8df16dfd5eaf25ec/bbqAttendanceList/sheet1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        console.log("Submitted:", data);
        window.location.href = "/bbq/thanks/";
      })
      .catch(error => {
        console.error("Error submitting RSVP:", error);
        document.getElementById("submitMessage").innerText = "something went wrong. please try again!";
      });
  });
</script>

<a href="/bbq/thanks/" style="display:none;">link</a>

---

looking forward to seeing you there!<br>
**– ferkan & suzan**

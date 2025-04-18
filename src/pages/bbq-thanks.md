---
title: Suzan & Ferkan's Summer BBQ – RSVP Confirmed!
layout: page.njk
permalink: /bbq/thanks/index.html
metaDescription: Thank you for RSVPing to Suzan & Ferkan's summer BBQ in The Hague!
---

# 🎉 You're all set for the Summer BBQ!

Thanks for signing up — we're excited to see you at **Suzan & Ferkan’s Summer BBQ**!

📍 **Location:** Herengracht 50B, 2511 EJ, The Hague  
🗓️ **Date:** Saturday, May 17th  
🕓 **Time:** 16:00 – 23:00  
🍽️ BBQ, drinks, music, summer vibes... and a cheeky 31st birthday in the background.

---

## 👥 These lovely people RSVP’d before you:

<ul id="rsvp-list">Loading guest list…</ul>

<p id="your-number" style="margin-top: 2rem; font-weight: bold;"></p>

<button onclick="window.location.reload()" style="margin-top: 1rem; font-size: 1rem;">
  🔄 Refresh guest list
</button>

<script>
  fetch('https://api.sheety.co/2381c287b05641ab8df16dfd5eaf25ec/bbqAttendanceList/sheet1')
    .then(response => response.json())
    .then(data => {
      const guests = data.sheet1;
      const list = document.getElementById('rsvp-list');

      if (!guests || guests.length === 0) {
        list.innerHTML = "<li>No one yet — you're the first!</li>";
        return;
      }

      list.innerHTML = guests.map((person, index) => {
        const name = person.name || 'Unnamed legend';
        const isPlusOne = person.plusOne === 'yes';
        return `<li><strong>#${index + 1}:</strong> ${name}${isPlusOne ? ' +1' : ''}</li>`;
      }).join('');

      // ✅ Show user's number at the bottom
      document.getElementById("your-number").innerText =
        `You're guest number #${guests.length}! 🎉`;
    })
    .catch(error => {
      console.error('Error fetching guest list:', error);
      document.getElementById('rsvp-list').innerHTML = "<li>Couldn’t load guest list. Try refreshing?</li>";
    });
</script>

<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
<script>
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 }
  });
</script>

---

Can’t wait to see you! Bring your summer mood ☀️  
**– Suzan & Ferkan**
---
title: suzan & ferkan's summer BBQ – RSVP confirmed!
layout: page.njk
permalink: /bbq/thanks/index.html
metaDescription: thank you for RSVPing to suzan & ferkan's summer BBQ in the hague!
---

# 🎉 you're all set for the summer BBQ!

thanks for signing up — we're excited to see you at **suzan & ferkan’s summer BBQ**!

📍 **location:** herengracht 50B, 2511 EJ, the hague<br>
🗓️ **date:** saturday, may 17th<br>
🕓 **time:** 16:00 – 23:00<br>
🍽️ BBQ, drinks, music, summer vibes... and a cheeky 31st birthday in the background.

---

## 👥 these lovely people RSVP’d before you:

<ul id="rsvp-list">loading guest list…</ul>

<p id="your-number" style="margin-top: 2rem; font-weight: bold;"></p>

<button onclick="window.location.reload()" style="margin-top: 1rem; font-size: 1rem;">
  🔄 refresh guest list
</button>

<script>
  fetch('https://api.sheety.co/2381c287b05641ab8df16dfd5eaf25ec/bbqAttendanceList/sheet1')
    .then(response => response.json())
    .then(data => {
      const guests = data.sheet1;
      const list = document.getElementById('rsvp-list');

      if (!guests || guests.length === 0) {
        list.innerHTML = "<li>no one yet — you're the first!</li>";
        return;
      }

      list.innerHTML = guests.map((person, index) => {
        const name = person.name || 'unnamed legend';
        const isPlusOne = person.plusOne === 'yes';
        return `<li><strong>#${index + 1}:</strong> ${name}${isPlusOne ? ' +1' : ''}</li>`;
      }).join('');

      document.getElementById("your-number").innerText =
        `you're guest number #${guests.length}! 🎉`;
    })
    .catch(error => {
      console.error('Error fetching guest list:', error);
      document.getElementById('rsvp-list').innerHTML = "<li>couldn’t load guest list. try refreshing?</li>";
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

can’t wait to see you! bring your summer mood ☀️<br>
**– suzan & ferkan**

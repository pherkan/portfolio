const Turbolinks = require('turbolinks');
const drawer = require('./drawer');
const darkMode = require('./dark-mode');

// Initialize Turbolinks
Turbolinks.start();

// Initialize mobile nav drawer
drawer();

// Initialize dark mode toggle
const { enableThemeSwitch } = document.documentElement.dataset;

if (enableThemeSwitch) {
  darkMode();
}

// Handle Netlify Identity Login
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', (user) => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        document.location.href = '/admin/';
      });
    }
  });
}

document.addEventListener("turbolinks:load", () => {
  // reapply or trigger any dynamic styles or fonts
  document.documentElement.classList.remove("turbolinks-transition-bug");
});
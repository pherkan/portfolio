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

document.addEventListener("turbolinks:load", () => {
  // 👇 Re-run theme logic or re-trigger any DOM-based styling
  const themeConfig = document.documentElement.dataset;
  const theme = localStorage.getItem('theme');

  if (theme) {
    themeConfig.theme = theme;
  } else {
    const defaultTheme = themeConfig.defaultTheme;
    const useSystemTheme = themeConfig.useSystemTheme === 'true';
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    themeConfig.theme = (useSystemTheme && prefersDark) ? 'dark' : defaultTheme;
  }

  // 👇 Force font recalculation (helpful for Google Fonts)
  document.body.style.display = 'none';
  void document.body.offsetHeight; // trigger reflow
  document.body.style.display = '';
});

document.addEventListener("turbolinks:load", () => {
  console.log("🔄 Turbolinks: page loaded");
});

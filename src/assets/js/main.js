const Turbolinks = require('turbolinks');
const drawer = require('./drawer');
const darkMode = require('./dark-mode');
const thumbVideos = require('./thumb-videos');
const reveal = require('./reveal');
const avatarTooltip = require('./avatar-tooltip');

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

  thumbVideos();
  reveal();
  avatarTooltip();

  const contactCta = document.querySelector('.site-header__link--cta');

  if (contactCta && !contactCta.dataset.cursorGlowReady) {
    contactCta.dataset.cursorGlowReady = 'true';

    const updateCursorGlow = ({ clientX, clientY }) => {
      const { left, top } = contactCta.getBoundingClientRect();

      contactCta.style.setProperty('--cta-glow-x', `${clientX - left}px`);
      contactCta.style.setProperty('--cta-glow-y', `${clientY - top}px`);
    };

    contactCta.addEventListener('pointerenter', updateCursorGlow);
    contactCta.addEventListener('pointermove', updateCursorGlow);
  }
});

document.addEventListener("turbolinks:load", () => {
  console.log("🔄 Turbolinks: page loaded");
});

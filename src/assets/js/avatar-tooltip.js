// Keeps the "that's me and katmer" label inside the hero. It sits centered above
// the photo, but slides sideways when the photo is close to an edge.
const EDGE_GAP = 8;

const avatarTooltip = () => {
  const avatar = document.querySelector('.home-hero__avatar');
  const tooltip = avatar && avatar.querySelector('.hero__avatar-tooltip');
  const hero = avatar && avatar.closest('.home-hero');

  if (!tooltip || !hero || avatar.dataset.tooltipReady) return;
  avatar.dataset.tooltipReady = 'true';

  const fit = () => {
    const bounds = hero.getBoundingClientRect();
    const photo = avatar.getBoundingClientRect();
    const center = photo.left + photo.width / 2;
    const half = tooltip.offsetWidth / 2;
    const overLeft = Math.max(0, bounds.left + EDGE_GAP - (center - half));
    const overRight = Math.max(0, center + half - (bounds.right - EDGE_GAP));

    tooltip.style.setProperty('--tooltip-shift', `${overLeft - overRight}px`);
  };

  avatar.addEventListener('pointerenter', fit);
  avatar.addEventListener('focusin', fit);
};

module.exports = avatarTooltip;

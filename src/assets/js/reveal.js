// Fades homepage sections in as they scroll into view, one after another.
// Anything already on screen when the page loads is shown right away, and
// visitors who prefer reduced motion see everything without animation.
const TARGETS = [
  '.home-page > .list-header',
  '.home-page > .home-statement',
  '.home-page .home-building__card',
  '.home-page .home-series__item',
  '.home-page .home-project-card',
  '.home-page .article-card',
].join(',');
const STAGGER_MS = 90;

let observer;

const reveal = () => {
  if (observer) observer.disconnect();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const elements = [...document.querySelectorAll(TARGETS)]
    .filter((element) => !element.classList.contains('is-revealed'));
  if (!elements.length) return;

  const pending = new Set();

  const show = (target, index) => {
    target.style.transitionDelay = `${index * STAGGER_MS}ms`;
    target.classList.add('is-revealed');
    pending.delete(target);
    observer.unobserve(target);

    // Hand the element its own hover transitions back once it has faded in
    const settle = (event) => {
      if (event.target !== target) return;

      target.removeEventListener('transitionend', settle);
      target.classList.remove('reveal');
      target.style.transitionDelay = '';
    };
    target.addEventListener('transitionend', settle);
  };

  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(({ isIntersecting }) => isIntersecting)
      .map(({ target }) => target);
    // A fast scroll can jump past an element without it ever being on screen
    const skipped = [...pending]
      .filter((element) => element.getBoundingClientRect().bottom < 0);

    elements
      .filter((element) => visible.includes(element) || skipped.includes(element))
      .forEach(show);
  }, { rootMargin: '0px 0px -8% 0px' });

  elements.forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight) {
      element.classList.remove('reveal');
      return;
    }

    element.classList.add('reveal');
    pending.add(element);
    observer.observe(element);
  });
};

module.exports = reveal;

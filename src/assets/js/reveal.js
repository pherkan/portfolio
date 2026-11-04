// Fades homepage sections in as they scroll into view, row by row: cards that
// sit side by side fade in together, and each row waits for its images so
// nothing pops in afterwards. Anything already on screen when the page loads is
// shown right away, and visitors who prefer reduced motion see no animation.
const TARGETS = [
  '.home-page > .list-header',
  '.home-page > .home-statement',
  '.home-page .home-building__card',
  '.home-page .home-series__item',
  '.home-page .home-project-card',
  '.home-page .article-card',
].join(',');
const ROW_STAGGER_MS = 120;
const SAME_ROW_PX = 8;
const MEDIA_WAIT_MS = 300;

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

// Resolves once the element's images (and video posters) can be painted, or after a short wait at most
const mediaReady = (element) => {
  const images = [...element.querySelectorAll('img')];
  const posters = [...element.querySelectorAll('video[poster]')].map((video) => {
    const image = new Image();
    image.src = video.poster;
    return image;
  });
  const decoded = [...images, ...posters].map((image) => {
    image.loading = 'eager';
    return image.decode().catch(() => {});
  });

  return Promise.race([Promise.all(decoded), wait(MEDIA_WAIT_MS)]);
};

let observer;

const reveal = () => {
  if (observer) observer.disconnect();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const elements = [...document.querySelectorAll(TARGETS)]
    .filter((element) => !element.classList.contains('is-revealed'));
  if (!elements.length) return;

  const pending = new Set();

  const show = (target, row) => {
    target.style.transitionDelay = `${row * ROW_STAGGER_MS}ms`;
    target.classList.add('is-revealed');

    // Hand the element its own hover transitions back once it has faded in
    const settle = (event) => {
      if (event.target !== target) return;

      target.removeEventListener('transitionend', settle);
      target.classList.remove('reveal');
      target.style.transitionDelay = '';
    };
    target.addEventListener('transitionend', settle);
  };

  const showBatch = async (batch) => {
    const tops = batch.map((element) => element.getBoundingClientRect().top);
    const rowTops = [];

    tops.forEach((top) => {
      if (!rowTops.some((rowTop) => Math.abs(rowTop - top) <= SAME_ROW_PX)) rowTops.push(top);
    });
    rowTops.sort((a, b) => a - b);

    await Promise.all(batch.map(mediaReady));
    batch.forEach((element, index) => {
      show(element, rowTops.findIndex((rowTop) => Math.abs(rowTop - tops[index]) <= SAME_ROW_PX));
    });
  };

  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(({ isIntersecting }) => isIntersecting)
      .map(({ target }) => target);
    // A fast scroll can jump past an element without it ever being on screen
    const skipped = [...pending]
      .filter((element) => element.getBoundingClientRect().bottom < 0);
    const batch = elements
      .filter((element) => pending.has(element))
      .filter((element) => visible.includes(element) || skipped.includes(element));

    if (!batch.length) return;

    batch.forEach((element) => {
      pending.delete(element);
      observer.unobserve(element);
    });
    showBatch(batch);
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

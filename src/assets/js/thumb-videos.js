// Plays moving project thumbnails only while they are on screen.
// Visitors who prefer reduced motion keep the still poster image.
let observer;

const thumbVideos = () => {
  if (observer) observer.disconnect();

  const videos = document.querySelectorAll('[data-thumb-video]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!videos.length || reduceMotion || !('IntersectionObserver' in window)) return;

  observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.preload = 'auto';
        target.play().catch(() => {});
      } else {
        target.pause();
      }
    });
  }, { threshold: 0.25 });

  videos.forEach((video) => observer.observe(video));
};

module.exports = thumbVideos;

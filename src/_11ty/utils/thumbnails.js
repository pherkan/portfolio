const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Small WebP copies of large source images, so pages don't download full-size
// photos for thumbnails. The `thumb` filter returns the URL and queues the file;
// the files are written once the build finishes.
const SOURCE_DIR = 'src';
const OUTPUT_DIR = '_site';
const THUMB_URL = '/assets/img/thumbs';
const RESIZABLE = /^\/assets\/img\/.+\.(png|jpe?g|webp)$/i;

const queue = new Map();

// `size` is the shortest side in pixels, so images that get cropped to a
// square or zoomed on hover still have enough detail on high-resolution screens.
function thumbFilter(src, size = 640) {
  if (typeof src !== 'string' || !RESIZABLE.test(src)) return src;

  // Images generated during the build (e.g. by the image shortcode) have no source file
  const input = path.join(SOURCE_DIR, src);
  if (!fs.existsSync(input)) return src;

  const slug = src
    .replace(/^\/assets\/img\//, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-');
  const url = `${THUMB_URL}/${slug}-${size}.webp`;

  queue.set(url, { input, size });
  return url;
}

async function writeThumbnails() {
  const jobs = [...queue].map(async ([url, { input, size }]) => {
    const output = path.join(OUTPUT_DIR, url);

    try {
      if (fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) return;
    } catch (_error) {
      // Thumbnail doesn't exist yet
    }

    fs.mkdirSync(path.dirname(output), { recursive: true });
    await sharp(input)
      .rotate()
      .resize({ width: size, height: size, fit: 'outside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(output);
  });

  await Promise.all(jobs);
  if (jobs.length) console.log(`✅ ${queue.size} thumbnails ready`);
}

module.exports = { thumbFilter, writeThumbnails };

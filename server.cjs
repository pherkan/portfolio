const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const SITE_DIR = path.join(__dirname, '_site');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']);
const compressedCache = new Map();

// Text files are small and never change while the server runs, so each is compressed once and kept in memory.
function getCompressed(filePath, encoding, mtimeMs) {
  const key = `${encoding}:${filePath}`;
  const cached = compressedCache.get(key);
  if (cached && cached.mtimeMs === mtimeMs) return cached.body;

  const raw = fs.readFileSync(filePath);
  const body = encoding === 'br'
    ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } })
    : zlib.gzipSync(raw, { level: 9 });

  compressedCache.set(key, { mtimeMs, body });
  return body;
}

function pickEncoding(req) {
  const accepted = req.headers['accept-encoding'] || '';
  if (/\bbr\b/.test(accepted)) return 'br';
  if (/\bgzip\b/.test(accepted)) return 'gzip';
  return null;
}

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function sendJson(res, statusCode, payload, headers = {}) {
  send(res, statusCode, JSON.stringify(payload), {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
}

function safeStaticPath(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (_error) {
    return null;
  }

  const normalized = path.normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const relativePath = normalized === '/' ? 'index.html' : normalized.replace(/^\/+/, '');
  return path.join(SITE_DIR, relativePath);
}

function getStaticFile(pathname) {
  const requested = safeStaticPath(pathname);
  if (!requested || !requested.startsWith(SITE_DIR)) return null;

  const candidates = [requested];
  if (!path.extname(requested)) {
    candidates.push(path.join(requested, 'index.html'));
    candidates.push(`${requested}.html`);
  }

  return candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch (_error) {
      return false;
    }
  }) || null;
}

function serveStatic(req, res, pathname, versioned = false) {
  const filePath = getStaticFile(pathname);
  if (!filePath) {
    const notFound = getStaticFile('/404.html');
    if (notFound) {
      return serveFile(req, res, notFound, 404);
    }
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  return serveFile(req, res, filePath, 200, versioned);
}

function serveFile(req, res, filePath, statusCode, versioned = false) {
  const ext = path.extname(filePath).toLowerCase();
  const { size, mtimeMs } = fs.statSync(filePath);
  const headers = {
    'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  };

  // CSS and JS are requested with a ?v=<release> query, so a cached copy is never stale.
  if (versioned || ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.wav', '.mp3', '.mp4'].includes(ext)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else {
    headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  }

  if (ext === '.mp4') {
    const range = req.headers.range;
    headers['Accept-Ranges'] = 'bytes';

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1] ? Number(match[1]) : 0;
      const end = match?.[2] ? Number(match[2]) : size - 1;

      if (!match || start >= size || end >= size || start > end) {
        return send(res, 416, '', { 'Content-Range': `bytes */${size}` });
      }

      headers['Content-Length'] = end - start + 1;
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      res.writeHead(206, headers);
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }
  }

  if (COMPRESSIBLE.has(ext)) {
    headers.Vary = 'Accept-Encoding';
    const encoding = pickEncoding(req);

    if (encoding) {
      const body = getCompressed(filePath, encoding, mtimeMs);
      headers['Content-Encoding'] = encoding;
      headers['Content-Length'] = body.length;
      res.writeHead(statusCode, headers);
      return res.end(req.method === 'HEAD' ? undefined : body);
    }
  }

  headers['Content-Length'] = size;
  res.writeHead(statusCode, headers);
  if (req.method === 'HEAD') return res.end();
  return fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname === '/health') {
      return sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() }, {
        'Cache-Control': 'no-store',
      });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, 'Method not allowed', {
        'Content-Type': 'text/plain; charset=utf-8',
        Allow: 'GET, HEAD',
      });
    }

    const versioned = url.searchParams.has('v') && /\.(css|js)$/.test(pathname);
    return serveStatic(req, res, pathname, versioned);
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error.message || 'internal_error',
    }, {
      'Cache-Control': 'no-store',
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`pherkan.com server listening on http://${HOST}:${PORT}`);
});

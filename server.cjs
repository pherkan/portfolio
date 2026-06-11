const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

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
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

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

function serveStatic(req, res, pathname) {
  const filePath = getStaticFile(pathname);
  if (!filePath) {
    const notFound = getStaticFile('/404.html');
    if (notFound) {
      return serveFile(res, notFound, 404);
    }
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  return serveFile(res, filePath, 200);
}

function serveFile(res, filePath, statusCode) {
  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  };

  if (['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.wav', '.mp3'].includes(ext)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else {
    headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  }

  res.writeHead(statusCode, headers);
  fs.createReadStream(filePath).pipe(res);
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

    return serveStatic(req, res, pathname);
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

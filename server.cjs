const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URLSearchParams } = require('node:url');

const verifyIftarCode = require('./netlify/functions/verify-iftar-code');
const notifyIftarSignup = require('./netlify/functions/notify-iftar-signup');
const iftarClaims = require('./netlify/functions/iftar-claims');

const SITE_DIR = path.join(__dirname, '_site');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY_BYTES = 1024 * 1024;

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

const FUNCTION_HANDLERS = {
  '/.netlify/functions/verify-iftar-code': verifyIftarCode.handler,
  '/.netlify/functions/notify-iftar-signup': notifyIftarSignup.handler,
  '/.netlify/functions/iftar-claims': iftarClaims.handler,
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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('request_body_too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function getFunctionHandler(pathname) {
  return Object.entries(FUNCTION_HANDLERS).find(([prefix]) => (
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  ));
}

async function handleFunction(req, res, pathname, searchParams, handler) {
  const body = await readBody(req);
  const queryStringParameters = {};
  for (const [key, value] of searchParams.entries()) {
    queryStringParameters[key] = value;
  }

  const result = await handler({
    httpMethod: req.method,
    headers: req.headers,
    path: pathname,
    rawUrl: `${req.headers.host || ''}${req.url || ''}`,
    queryStringParameters,
    body,
    isBase64Encoded: false,
  });

  send(res, result.statusCode || 200, result.body || '', result.headers || {});
}

function parseContactPayload(rawBody, contentType = '') {
  if (contentType.includes('application/json')) {
    return JSON.parse(rawBody || '{}');
  }

  const params = new URLSearchParams(rawBody);
  return Object.fromEntries(params.entries());
}

async function sendContactEmail(payload) {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('resend_api_key_missing');
  }

  const from = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev').trim();
  const to = (process.env.CONTACT_TO_EMAIL || process.env.RESEND_TO || 'me@pherkan.com').trim();
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const message = String(payload.message || '').trim();

  if (!name || !email || !message) {
    const error = new Error('missing_required_contact_fields');
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New pherkan.com contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        message,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`resend_failed: ${detail}`);
    error.statusCode = response.status;
    throw error;
  }
}

async function handleContact(req, res) {
  const rawBody = await readBody(req);
  const payload = parseContactPayload(rawBody, req.headers['content-type'] || '');
  await sendContactEmail(payload);

  send(res, 303, '', {
    Location: '/contact/?sent=1',
    'Cache-Control': 'no-store',
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

    const functionRoute = getFunctionHandler(pathname);
    if (functionRoute) {
      return await handleFunction(req, res, pathname, url.searchParams, functionRoute[1]);
    }

    if (req.method === 'POST' && (pathname === '/contact/' || pathname === '/contact/index.html')) {
      return await handleContact(req, res);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, 'Method not allowed', {
        'Content-Type': 'text/plain; charset=utf-8',
        Allow: 'GET, HEAD, POST',
      });
    }

    return serveStatic(req, res, pathname);
  } catch (error) {
    const statusCode = error.statusCode || (error.message === 'request_body_too_large' ? 413 : 500);
    return sendJson(res, statusCode, {
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

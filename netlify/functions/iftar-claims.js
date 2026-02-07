const crypto = require('node:crypto');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

let tokenCache = { accessToken: null, expiresAt: 0 };
let sheetMetaCache = { sheetId: null, expiresAt: 0 };

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  };
}

function base64UrlEncode(value) {
  const asBuffer = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return asBuffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function getEnvConfig() {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1';

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  if (!serviceEmail || !privateKey || !spreadsheetId) {
    throw new Error('Missing Google Sheets environment variables.');
  }

  return { serviceEmail, privateKey, spreadsheetId, sheetName };
}

function buildServiceAccountJwt({ serviceEmail, privateKey }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceEmail,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(privateKey);
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(config) {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt - 30_000 > now) {
    return tokenCache.accessToken;
  }

  const assertion = buildServiceAccountJwt(config);
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    }).toString()
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google token error ${response.status}: ${detail}`);
  }

  const data = await response.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + Number(data.expires_in || 3600) * 1000
  };
  return tokenCache.accessToken;
}

async function sheetsRequest(config, token, path, options = {}) {
  const url = `${SHEETS_API_BASE}/${encodeURIComponent(config.spreadsheetId)}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Sheets error ${response.status}: ${detail}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function toObjectRows(values) {
  if (!Array.isArray(values) || values.length === 0) return { headers: [], rows: [] };
  const headers = (values[0] || []).map((v) => String(v || '').trim());
  const rows = values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, idx) => {
      if (!header) return;
      obj[header] = row[idx] ?? '';
    });
    return obj;
  });
  return { headers, rows };
}

async function getAllRows(config, token) {
  const range = encodeURIComponent(`${config.sheetName}!A:Z`);
  const data = await sheetsRequest(config, token, `/values/${range}`);
  return toObjectRows(data.values || []);
}

async function ensureHeaders(config, token, incomingKeys) {
  const topRowRange = encodeURIComponent(`${config.sheetName}!1:1`);
  const topRowData = await sheetsRequest(config, token, `/values/${topRowRange}`);
  const existing = (topRowData.values && topRowData.values[0]) ? topRowData.values[0].map((v) => String(v || '').trim()) : [];

  const requiredBase = ['claimId', 'tableId', 'tableName', 'date', 'seatNumber', 'name', 'note', 'selfieUrl', 'createdAt'];
  const combined = [...requiredBase, ...incomingKeys];
  const nextHeaders = [];
  combined.forEach((key) => {
    const clean = String(key || '').trim();
    if (!clean) return;
    if (!nextHeaders.includes(clean)) nextHeaders.push(clean);
  });

  const missing = nextHeaders.filter((header) => !existing.includes(header));
  if (existing.length === 0 || missing.length > 0) {
    const finalHeaders = existing.length > 0 ? [...existing, ...missing] : nextHeaders;
    await sheetsRequest(
      config,
      token,
      `/values/${topRowRange}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({
          range: `${config.sheetName}!1:1`,
          majorDimension: 'ROWS',
          values: [finalHeaders]
        })
      }
    );
    return finalHeaders;
  }

  return existing;
}

async function appendClaim(config, token, payload) {
  const normalizedDate = normalizeDateValue(payload.date);
  const normalizedPayload = {
    ...payload,
    date: normalizedDate || payload.date
  };
  const headers = await ensureHeaders(config, token, Object.keys(normalizedPayload));
  const claimId = String(payload.claimId || '').trim() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  normalizedPayload.claimId = claimId;
  const row = headers.map((header) => normalizedPayload[header] ?? '');
  const appendRange = encodeURIComponent(`${config.sheetName}!A:Z`);

  await sheetsRequest(
    config,
    token,
    `/values/${appendRange}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      body: JSON.stringify({
        range: `${config.sheetName}!A:Z`,
        majorDimension: 'ROWS',
        values: [row]
      })
    }
  );

  return { id: claimId };
}

function normalizeDateValue(value) {
  const input = String(value || '').trim();
  if (!input) return '';
  const match = input.match(/(\d{1,2})[/-](\d{1,2})/);
  if (!match) return input;
  const day = String(Number.parseInt(match[1], 10)).padStart(2, '0');
  const month = String(Number.parseInt(match[2], 10)).padStart(2, '0');
  return `${day}/${month}`;
}

async function getSheetId(config, token) {
  const now = Date.now();
  if (sheetMetaCache.sheetId !== null && sheetMetaCache.expiresAt > now) {
    return sheetMetaCache.sheetId;
  }

  const meta = await sheetsRequest(config, token, '?fields=sheets.properties');
  const sheets = Array.isArray(meta.sheets) ? meta.sheets : [];
  const match = sheets.find((sheet) => String(sheet.properties && sheet.properties.title).toLowerCase() === config.sheetName.toLowerCase());
  const fallback = sheets[0];
  const sheetId = match?.properties?.sheetId ?? fallback?.properties?.sheetId;
  if (typeof sheetId !== 'number') {
    throw new Error(`Sheet "${config.sheetName}" not found.`);
  }

  sheetMetaCache = { sheetId, expiresAt: now + 5 * 60 * 1000 };
  return sheetId;
}

async function deleteById(config, token, id) {
  const { headers, rows } = await getAllRows(config, token);
  const claimIdIndex = headers.indexOf('claimId');
  const idIndex = headers.indexOf('id');
  const targetId = String(id || '').trim();

  let rowIndex = -1;
  rows.some((row, idx) => {
    const claimId = claimIdIndex >= 0 ? String(row.claimId || '').trim() : '';
    const legacyId = idIndex >= 0 ? String(row.id || '').trim() : '';
    if (targetId && (claimId === targetId || legacyId === targetId)) {
      rowIndex = idx;
      return true;
    }
    return false;
  });

  if (rowIndex < 0) {
    return { deleted: 0 };
  }

  const sheetId = await getSheetId(config, token);
  const startIndex = rowIndex + 1; // +1 because row 0 is header
  const endIndex = startIndex + 1;

  await sheetsRequest(config, token, ':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex,
              endIndex
            }
          }
        }
      ]
    })
  });

  return { deleted: 1 };
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (err) {
    return {};
  }
}

function getDeleteIdFromPath(path = '') {
  const parts = path.split('/').filter(Boolean);
  const fnIndex = parts.findIndex((p) => p === 'iftar-claims');
  if (fnIndex < 0) return '';
  const tail = parts.slice(fnIndex + 1);
  if (tail.length >= 2 && tail[0] === 'claimId') return decodeURIComponent(tail[1]);
  if (tail.length >= 1) return decodeURIComponent(tail[0]);
  return '';
}

exports.handler = async (event) => {
  try {
    const config = getEnvConfig();
    const token = await getAccessToken(config);

    if (event.httpMethod === 'GET') {
      const { rows } = await getAllRows(config, token);
      return json(200, rows);
    }

    if (event.httpMethod === 'POST') {
      const body = parseBody(event);
      const payload = (Array.isArray(body.data) && body.data[0]) || body.sheet1 || body.sheet || body;
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return json(400, { error: 'Invalid payload.' });
      }
      const created = await appendClaim(config, token, payload);
      return json(201, { created: 1, sheet1: created });
    }

    if (event.httpMethod === 'DELETE') {
      const id = getDeleteIdFromPath(event.path || '');
      if (!id) return json(400, { error: 'Missing claim identifier.' });
      const result = await deleteById(config, token, id);
      return json(200, result);
    }

    return json(405, { error: 'Method not allowed.' });
  } catch (error) {
    return json(500, { error: error.message || 'Internal error.' });
  }
};

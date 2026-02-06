const fs = require('node:fs');
const path = require('node:path');

function readEnvValue(name) {
  const direct = process.env[name];
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const localFiles = ['.env.local', '.env'];
  for (const fileName of localFiles) {
    try {
      const fullPath = path.join(process.cwd(), fileName);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex <= 0) continue;
        const key = trimmed.slice(0, separatorIndex).trim();
        if (key !== name) continue;
        let value = trimmed.slice(separatorIndex + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"'))
          || (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        return value.trim();
      }
    } catch (err) {
      // ignore file read/parse issues and continue fallback checks
    }
  }

  return '';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ ok: false, error: 'method_not_allowed' })
    };
  }

  const secret = readEnvValue('SECRET_CODE_IFTAR');
  if (!secret) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ ok: false, error: 'secret_not_configured' })
    };
  }

  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ ok: false, error: 'invalid_json' })
    };
  }

  const code = String(payload.code || '').trim();
  const ok = code === secret;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify({ ok })
  };
};

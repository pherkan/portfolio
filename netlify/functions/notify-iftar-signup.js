exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'method_not_allowed' })
    };
  }

  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'resend_api_key_missing' })
    };
  }

  const from = (process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev').trim();
  const to = (process.env.IFTAR_NOTIFY_EMAIL || 'suzkanmedal@gmail.com').trim();

  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'invalid_json' })
    };
  }

  const tableName = String(payload.tableName || '').trim();
  const date = String(payload.date || '').trim();
  const primaryName = String(payload.primaryName || '').trim();
  const primarySeat = String(payload.primarySeat || '').trim();
  const plusOneName = String(payload.plusOneName || '').trim();
  const plusOneSeat = String(payload.plusOneSeat || '').trim();
  const hasPlusOne = Boolean(plusOneName);

  const subject = 'User signed up for table';
  const lines = [
    'User signed up for table',
    '',
    `table: ${tableName || '-'}`,
    `date: ${date || '-'}`,
    `name: ${primaryName || '-'}`,
    `seat: ${primarySeat || '-'}`,
    hasPlusOne ? `+1 name: ${plusOneName}` : '',
    hasPlusOne ? `+1 seat: ${plusOneSeat || '-'}` : ''
  ].filter(Boolean);

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: lines.join('\n')
    })
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return {
      statusCode: resendResponse.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'resend_failed', detail: errorText })
    };
  }

  const result = await resendResponse.json();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, id: result.id || null })
  };
};

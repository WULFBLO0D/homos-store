const crypto = require('crypto');
const redis = require('./_lib');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: '' };
  }

  if (!redis) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, needsSetup: true }) };
  }

  try {
    const { password } = JSON.parse(event.body);
    const hash = await redis.get('password_hash');
    if (!hash) return { statusCode: 200, headers, body: JSON.stringify({ ok: true, needsSetup: true }) };
    const match = crypto.createHash('sha256').update(password).digest('hex') === hash;
    return { statusCode: 200, headers, body: JSON.stringify({ ok: match }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, needsSetup: true }) };
  }
};

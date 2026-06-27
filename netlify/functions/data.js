const redis = require('./_lib');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const raw = await redis.get('site_data');
      return { statusCode: 200, headers, body: JSON.stringify(raw || {}) };
    }

    if (event.httpMethod === 'POST') {
      const crypto = require('crypto');
      const { password, data } = JSON.parse(event.body);
      const hash = await redis.get('password_hash');
      if (!hash) return { statusCode: 400, headers, body: JSON.stringify({ error: 'No password set' }) };
      if (crypto.createHash('sha256').update(password).digest('hex') !== hash) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      await redis.set('site_data', data);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: '' };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

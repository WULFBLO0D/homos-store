const crypto = require('crypto');
const redis = require('./_lib');

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!redis) {
    return { statusCode: 200, headers, body: JSON.stringify({ hasPassword: false }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      const hash = await redis.get('password_hash');
      return { statusCode: 200, headers, body: JSON.stringify({ hasPassword: hash !== null }) };
    }

    if (event.httpMethod === 'POST') {
      const { password, newPassword } = JSON.parse(event.body);
      const hash = await redis.get('password_hash');

      if (hash) {
        if (!password || hashPassword(password) !== hash)
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Wrong password' }) };
        if (!newPassword || newPassword.length < 4)
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Password too short' }) };
        await redis.set('password_hash', hashPassword(newPassword));
      } else {
        if (!password || password.length < 4)
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Password must be at least 4 characters' }) };
        await redis.set('password_hash', hashPassword(password));
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: '' };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

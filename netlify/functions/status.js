const redis = require('./_lib');

exports.handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const hash = await redis.get('password_hash');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ hasPassword: hash !== null }),
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

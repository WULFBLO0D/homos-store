const redis = require('./_lib');
const crypto = require('crypto');

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const raw = await redis.get('site_data');
      return res.json(raw || {});
    }

    if (req.method === 'POST') {
      const { password, data } = req.body;
      const hash = await redis.get('password_hash');
      if (!hash) return res.status(400).json({ error: 'No password set' });
      if (hashPassword(password) !== hash) return res.status(401).json({ error: 'Unauthorized' });
      await redis.set('site_data', data);
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

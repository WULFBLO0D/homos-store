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
      const hash = await redis.get('password_hash');
      return res.json({ hasPassword: hash !== null });
    }

    if (req.method === 'POST') {
      const { password, newPassword } = req.body;
      const hash = await redis.get('password_hash');

      if (hash) {
        if (!password || hashPassword(password) !== hash)
          return res.status(401).json({ error: 'Wrong password' });
        if (!newPassword || newPassword.length < 4)
          return res.status(400).json({ error: 'Password too short' });
        await redis.set('password_hash', hashPassword(newPassword));
      } else {
        if (!password || password.length < 4)
          return res.status(400).json({ error: 'Password must be at least 4 characters' });
        await redis.set('password_hash', hashPassword(password));
      }
      return res.json({ ok: true });
    }

    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

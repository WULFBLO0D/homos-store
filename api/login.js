const redis = require('./_lib');
const crypto = require('crypto');

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { password } = req.body;
    const hash = await redis.get('password_hash');
    if (!hash) return res.json({ ok: true, needsSetup: true });
    res.json({ ok: hashPassword(password) === hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

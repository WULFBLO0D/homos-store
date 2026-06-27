const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.FLY_APP_NAME ? '/data' : __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const PW_FILE = path.join(DATA_DIR, 'password.hash');

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

function getStoredHash() {
  try { return fs.readFileSync(PW_FILE, 'utf8').trim(); } catch { return null; }
}

function setStoredHash(hash) {
  fs.writeFileSync(PW_FILE, hash, 'utf8');
}

app.get('/api/status', (req, res) => {
  res.json({ hasPassword: getStoredHash() !== null });
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  const hash = getStoredHash();
  if (!hash) return res.json({ ok: true, needsSetup: true });
  res.json({ ok: hashPassword(password) === hash });
});

app.post('/api/password', (req, res) => {
  const { password, newPassword } = req.body;
  const hash = getStoredHash();
  if (hash) {
    if (!password || hashPassword(password) !== hash) return res.status(401).json({ error: 'Wrong password' });
    if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: 'Password too short' });
    setStoredHash(hashPassword(newPassword));
  } else {
    if (!password || password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
    setStoredHash(hashPassword(password));
  }
  res.json({ ok: true });
});

app.get('/api/data', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(raw));
  } catch {
    res.json({});
  }
});

app.post('/api/data', (req, res) => {
  const { password, data } = req.body;
  const hash = getStoredHash();
  if (!hash) return res.status(400).json({ error: 'No password set. Visit admin panel first.' });
  if (hashPassword(password) !== hash) return res.status(401).json({ error: 'Unauthorized' });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';
import { loginSchema, mnemonicSchema } from './schemas.js';
import { requireStage } from './middleware.js';

export const authRoutes = Router();

function normalizeMnemonic(phrase: string): string {
  return phrase.toLowerCase().trim().replace(/\s+/g, ' ');
}

// POST /api/auth/login — first stage: username + password
authRoutes.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { username, password } = parsed.data;
  const user = getDb()
    .prepare('SELECT password_hash FROM users WHERE username = ?')
    .getAsObject([username]) as { password_hash: string } | undefined;

  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.stage = 1;
  req.session.username = username;

  return new Promise<void>((resolve) => {
    req.session.save(() => {
      res.json({ stage: 1, username });
      resolve();
    });
  });
});

// POST /api/auth/mnemonic — second stage: mnemonic phrase
authRoutes.post('/mnemonic', requireStage(1), async (req, res) => {
  const parsed = mnemonicSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const username = req.session.username!;
  const user = getDb()
    .prepare('SELECT mnemonic_hash FROM users WHERE username = ?')
    .getAsObject([username]) as { mnemonic_hash: string } | undefined;

  if (!user || !user.mnemonic_hash) {
    return res.status(401).json({ error: 'User not found' });
  }

  const valid = await bcrypt.compare(
    normalizeMnemonic(parsed.data.phrase),
    user.mnemonic_hash as string
  );

  if (!valid) {
    return res.status(401).json({ error: 'Invalid mnemonic phrase' });
  }

  req.session.stage = 2;

  return new Promise<void>((resolve) => {
    req.session.save(() => {
      res.json({ stage: 2, username });
      resolve();
    });
  });
});

// GET /api/auth/session — check current session state
authRoutes.get('/session', (req, res) => {
  res.json({
    stage: req.session.stage ?? 0,
    username: req.session.username ?? null,
  });
});

// POST /api/auth/logout — destroy session
authRoutes.post('/logout', (req, res) => {
  return new Promise<void>((resolve) => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ ok: true });
      resolve();
    });
  });
});

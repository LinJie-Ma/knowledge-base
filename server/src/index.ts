import express from 'express';
import session from 'express-session';
import { initDb } from './db.js';
import { config } from './config.js';
import { SqlJsSessionStore } from './session-store.js';
import { authRoutes } from './auth/routes.js';

const app = express();

app.use(express.json());

app.use(
  session({
    store: new SqlJsSessionStore(),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);

async function start() {
  await initDb();
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;

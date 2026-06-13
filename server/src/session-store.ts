import { Store } from 'express-session';
import { getDb, save } from './db.js';

export class SqlJsSessionStore extends Store {
  constructor() {
    super();
    // Periodically prune expired sessions
    setInterval(() => this.prune(), 15 * 60 * 1000);
  }

  get(sid: string, callback: (err?: unknown, session?: Express.SessionData | null) => void): void {
    try {
      const row = getDb()
        .prepare('SELECT data FROM sessions WHERE sid = ? AND expires > ?')
        .getAsObject([sid, new Date().toISOString()]) as { data: string } | undefined;

      if (!row || !row.data) return callback(null, null);
      callback(null, JSON.parse(row.data));
    } catch (err) {
      callback(err);
    }
  }

  set(sid: string, session: Express.SessionData, callback?: (err?: unknown) => void): void {
    try {
      const maxAge = session.cookie?.maxAge ?? 24 * 60 * 60 * 1000;
      const expires = new Date(Date.now() + maxAge).toISOString();
      const data = JSON.stringify(session);

      getDb()
        .prepare('INSERT OR REPLACE INTO sessions (sid, expires, data) VALUES (?, ?, ?)')
        .run([sid, expires, data]);
      save();
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    try {
      getDb().prepare('DELETE FROM sessions WHERE sid = ?').run([sid]);
      save();
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  private prune(): void {
    try {
      getDb().prepare('DELETE FROM sessions WHERE expires <= ?').run([new Date().toISOString()]);
      save();
    } catch {
      // ignore prune errors
    }
  }
}

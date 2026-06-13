import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { join } from 'path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { config } from './config.js';

mkdirSync(config.dataDir, { recursive: true });

const DB_PATH = join(config.dataDir, 'main.db');

let db: SqlJsDatabase;

function saveDb() {
  writeFileSync(DB_PATH, Buffer.from(db.export()));
}

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      mnemonic_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      expires TEXT,
      data TEXT
    )
  `);

  saveDb();
}

export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('DB not initialized. Call initDb() first.');
  return db;
}

export function save(): void {
  saveDb();
}

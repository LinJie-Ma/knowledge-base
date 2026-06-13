import bcrypt from 'bcryptjs';
import { initDb, getDb, save } from './db.js';
import { config } from './config.js';

function normalizeMnemonic(phrase: string): string {
  return phrase.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function seed() {
  await initDb();

  const existing = getDb()
    .prepare('SELECT id FROM users WHERE username = ?')
    .getAsObject([config.adminUsername]);

  if (existing && existing.id) {
    console.log(`User "${config.adminUsername}" already exists. Skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(config.adminPassword, 12);
  const mnemonicHash = await bcrypt.hash(normalizeMnemonic(config.adminMnemonic), 12);

  getDb()
    .prepare('INSERT INTO users (username, password_hash, mnemonic_hash) VALUES (?, ?, ?)')
    .run([config.adminUsername, passwordHash, mnemonicHash]);

  save();
  console.log(`User "${config.adminUsername}" created successfully.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

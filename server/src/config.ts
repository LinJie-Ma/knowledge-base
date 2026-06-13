import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  dataDir: resolve(__dirname, '..', process.env.DATA_DIR || 'data'),
  sessionSecret: process.env.SESSION_SECRET || 'change-me-in-production',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  adminMnemonic: process.env.ADMIN_MNEMONIC || 'apple banana cherry delta echo',
};

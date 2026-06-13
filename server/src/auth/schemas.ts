import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export const mnemonicSchema = z.object({
  phrase: z.string().min(1).max(500),
});

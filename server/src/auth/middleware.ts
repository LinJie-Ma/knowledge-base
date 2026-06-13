import { Request, Response, NextFunction } from 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    stage: number;
    username: string;
  }
}

export function requireStage(minStage: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req.session.stage ?? 0) >= minStage) return next();
    res.status(401).json({ error: 'Unauthorized' });
  };
}

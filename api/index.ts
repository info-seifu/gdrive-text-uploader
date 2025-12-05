import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import authRoutes from '../backend/dist/routes/auth';
import uploadRoutes from '../backend/dist/routes/upload';
import { failure } from '../backend/dist/utils/apiResponse';

const app = express();

const sessionSecret = process.env.SESSION_SECRET ?? 'dev-secret';

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json(failure('NOT_FOUND', `Path not found: ${req.path}`));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json(failure('INTERNAL_ERROR', '予期せぬエラーが発生しました'));
});

// Export handler for Vercel Serverless Functions
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};

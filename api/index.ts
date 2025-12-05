import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';

import authRoutes from '../backend/src/routes/auth';
import uploadRoutes from '../backend/src/routes/upload';
import { failure } from '../backend/src/utils/apiResponse';

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

export default app;

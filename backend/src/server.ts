import cors from 'cors';
import { config } from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';

import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import { failure } from './utils/apiResponse';

config({ path: path.resolve('../.env') });

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
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
    cookie: { secure: false }
  })
);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/api', uploadRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json(failure('NOT_FOUND', `Path not found: ${req.path}`));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json(failure('INTERNAL_ERROR', '予期せぬエラーが発生しました'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

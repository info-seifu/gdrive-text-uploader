import path from 'path';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import { failure } from './utils/apiResponse.js';

dotenv.config({ path: path.resolve('../.env') });

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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/api', uploadRoutes);

app.use((req, res) => {
  res.status(404).json(failure('NOT_FOUND', `Path not found: ${req.path}`));
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json(failure('INTERNAL_ERROR', '予期せぬエラーが発生しました'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

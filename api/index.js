const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');

const authRoutes = require('../backend/dist/routes/auth').default;
const uploadRoutes = require('../backend/dist/routes/upload').default;
const { failure } = require('../backend/dist/utils/apiResponse');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

// Session middleware - reconstruct session from cookies
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Cookies:', req.cookies);

  // Reconstruct session object from cookies
  req.session = {
    userEmail: req.cookies.userEmail,
    accessToken: req.cookies.accessToken,
    refreshToken: req.cookies.refreshToken,
    tokenExpiry: req.cookies.tokenExpiry ? parseInt(req.cookies.tokenExpiry) : undefined
  };

  console.log('Session reconstructed:', req.session);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);

app.use((req, res) => {
  res.status(404).json(failure('NOT_FOUND', `Path not found: ${req.path}`));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json(failure('INTERNAL_ERROR', '予期せぬエラーが発生しました'));
});

// Export handler for Vercel Serverless Functions
module.exports = (req, res) => {
  return app(req, res);
};

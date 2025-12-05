import express, { Request, Response } from 'express';

import { failure, success } from '../utils/apiResponse';
import { buildAuthUrl, exchangeCodeForTokens, fetchUserInfo } from '../utils/googleClient';

const router = express.Router();

// Helper function to get frontend origin
const getFrontendOrigin = () => process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

router.get('/google', (_req: Request, res: Response) => {
  const url = buildAuthUrl();
  res.redirect(url);
});

router.get('/google/callback', async (req: Request, res: Response) => {
  const frontendOrigin = getFrontendOrigin();
  const { code, error } = req.query as { code?: string; error?: string };

  if (error) {
    res.redirect(`${frontendOrigin}?error=${encodeURIComponent(error)}`);
    return;
  }

  if (!code) {
    res.redirect(`${frontendOrigin}?error=missing_code`);
    return;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await fetchUserInfo(tokens.access_token);

    req.session.userEmail = userInfo.email ?? 'unknown-user';
    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token;
    req.session.tokenExpiry = Date.now() + tokens.expires_in * 1000;

    res.redirect(frontendOrigin);
  } catch (err) {
    res.redirect(`${frontendOrigin}?error=${encodeURIComponent((err as Error).message)}`);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json(success({ authenticated: false }, 'ログアウトしました'));
  });
});

router.get('/me', (req: Request, res: Response) => {
  if (req.session.userEmail) {
    res.json(success({ authenticated: true, email: req.session.userEmail }));
    return;
  }
  res.status(401).json(failure('UNAUTHENTICATED', 'ログインが必要です'));
});

export default router;

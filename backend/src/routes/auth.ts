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

  console.log('[AUTH CALLBACK] Received callback');
  console.log('[AUTH CALLBACK] Session before auth:', req.session);

  if (error) {
    console.log('[AUTH CALLBACK] Error:', error);
    res.redirect(`${frontendOrigin}?error=${encodeURIComponent(error)}`);
    return;
  }

  if (!code) {
    console.log('[AUTH CALLBACK] Missing code');
    res.redirect(`${frontendOrigin}?error=missing_code`);
    return;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await fetchUserInfo(tokens.access_token);

    console.log('[AUTH CALLBACK] User email:', userInfo.email);

    const cookieOptions = {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const
    };

    // Set cookies manually
    res.cookie('userEmail', userInfo.email ?? 'unknown-user', cookieOptions);
    res.cookie('accessToken', tokens.access_token, cookieOptions);
    if (tokens.refresh_token) {
      res.cookie('refreshToken', tokens.refresh_token, cookieOptions);
    }
    res.cookie('tokenExpiry', String(Date.now() + tokens.expires_in * 1000), cookieOptions);

    console.log('[AUTH CALLBACK] Cookies set, redirecting to:', frontendOrigin);

    res.redirect(frontendOrigin);
  } catch (err) {
    console.log('[AUTH CALLBACK] Exception:', err);
    res.redirect(`${frontendOrigin}?error=${encodeURIComponent((err as Error).message)}`);
  }
});

router.post('/logout', (req: Request, res: Response) => {
  // Clear all session cookies
  res.clearCookie('userEmail');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('tokenExpiry');
  res.json(success({ authenticated: false }, 'ログアウトしました'));
});

router.get('/me', (req: Request, res: Response) => {
  if (req.session.userEmail) {
    res.json(success({ authenticated: true, email: req.session.userEmail }));
    return;
  }
  res.status(401).json(failure('UNAUTHENTICATED', 'ログインが必要です'));
});

export default router;

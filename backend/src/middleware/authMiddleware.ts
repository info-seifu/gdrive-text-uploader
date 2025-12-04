import { Request, Response, NextFunction } from 'express';
import { failure } from '../utils/apiResponse.js';

export interface AuthedRequest extends Request {
  session: Request['session'] & {
    userEmail?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
  };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (req.session?.userEmail) {
    next();
    return;
  }

  res.status(401).json(failure('AUTH_REQUIRED', '認証が必要です'));
}

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtAccessPayload } from '../utils/jwt';
import { sendError } from '../utils/response';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Access token is required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: unknown) {
    const message = (err as Error).name === 'TokenExpiredError'
      ? 'Access token has expired'
      : 'Invalid access token';
    sendError(res, message, 401);
  }
}

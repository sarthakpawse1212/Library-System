import { Request, Response, NextFunction } from 'express';
import {
  loginUser,
  registerUser,
  refreshTokens,
  revokeRefreshToken,
} from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { createAuditLog } from '../utils/auditLog';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);

    await createAuditLog({
      userId: result.user.id,
      action: 'USER_LOGIN',
      resource: 'auth',
      ipAddress: req.ip,
    });

    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password } = req.body;
    const result = await registerUser(username, email, password);

    await createAuditLog({
      userId: result.user.id,
      action: 'USER_REGISTER',
      resource: 'auth',
      ipAddress: req.ip,
    });

    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {

    if (!req.body.refreshToken) {
      res.status(422).json({
        success: false,
        message: 'refreshToken is required',
      });
    }

    const { refreshToken } = req.body;
    const tokens = await refreshTokens(refreshToken);

    await createAuditLog({
      userId: req.user?.userId || null,
      action: 'TOKEN_REFRESH',
      resource: 'auth',
      ipAddress: req.ip,
    });

    sendSuccess(res, { tokens }, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    await createAuditLog({
      userId: req.user?.userId || null,
      action: 'USER_LOGOUT',
      resource: 'auth',
      ipAddress: req.ip,
    });

    sendSuccess(res, null, 'Logout successful');
  } catch (err) {
    next(err);
  }
}

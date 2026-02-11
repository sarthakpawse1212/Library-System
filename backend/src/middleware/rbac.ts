import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { UserRole } from '../models/user.model';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      sendError(
        res,
        `User is not authorized. Required role: ${roles.join(' or ')}`,
        403
      );
      return;
    }

    next();
  };
}

// Shorthand for admin-only routes
export const requireAdmin = requireRole('admin');

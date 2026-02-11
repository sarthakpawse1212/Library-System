import { Router } from 'express';
import { login, register, refresh, logout } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  loginValidator,
  registerValidator,
  refreshTokenValidator,
} from '../validators/auth.validator';

const router = Router();

// POST /auth/login
router.post('/login', validate(loginValidator), login);

// POST /auth/register
router.post('/register', validate(registerValidator), register);

// POST /auth/refresh
router.post('/refresh', validate(refreshTokenValidator), refresh);

// POST /auth/logout  (protected - revokes the refresh token)
router.post('/logout', authenticate, logout);

export default router;

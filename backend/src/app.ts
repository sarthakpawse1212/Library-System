import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.cors.origin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // HTTP Request Logging
  if (!config.server.isProduction) {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    );
  }

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use(limiter);

  // Stricter rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts, please try again later.' },
  });

  // ─── Health Check ─────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy', timestamp: new Date().toISOString() });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────────
  app.use('/auth', authLimiter, authRoutes);
  app.use('/books', bookRoutes);

  // ─── 404 Handler ──────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global Error Handler ─────────────────────────────────────────────────────
  app.use(globalErrorHandler);

  return app;
}

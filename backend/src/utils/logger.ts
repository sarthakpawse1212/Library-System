import winston from 'winston';
import { config } from '../config/env';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// Dev: human-readable colorized output
// Prod: structured JSON to stdout — let Docker/Kubernetes handle log collection
// Never write to files inside the container
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  simple()
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: config.server.isProduction ? 'info' : 'debug',
  format: config.server.isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
  ],
});
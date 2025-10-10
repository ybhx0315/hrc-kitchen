import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP as it conflicts with Vite dev server
  crossOriginResourcePolicy: { policy: "cross-origin" },
})); // Security headers
// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

const allowedOrigins = isDevelopment
  ? [
      // Development origins
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://192.168.0.9:5173', // Local network access
      /^https:\/\/.*\.ngrok-free\.dev$/, // ngrok HTTPS tunnels
      /^https:\/\/.*\.ngrok\.io$/, // ngrok HTTPS tunnels (alternative)
    ]
  : [
      // Production origins - IMPORTANT: Replace with your actual production domain
      process.env.FRONTEND_URL || 'https://your-production-domain.com',
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else {
        return allowed.test(origin);
      }
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Add cache-control header
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
// Increase payload size limit for image uploads (default is 100kb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use(`/api/${API_VERSION}`, apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 HRC Kitchen API server running on port ${PORT}`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API base URL: http://localhost:${PORT}/api/${API_VERSION}`);
});

export default app;

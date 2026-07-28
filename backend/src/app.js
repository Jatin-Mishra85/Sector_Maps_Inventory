const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const appConfig = require('./config/app.config');
const requestLogger = require('./middleware/requestLogger.middleware');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const ApiResponse = require('./utils/apiResponse.util');
const HTTP_STATUS = require('./constants/httpStatusCodes.constant');

const app = express();

// ==============================
// GLOBAL MIDDLEWARE
// ==============================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ==============================
// CORS CONFIG
// Allows localhost (dev) + FRONTEND_URL (production, e.g. Vercel)
// FRONTEND_URL can hold a single origin or a comma-separated list
// ==============================
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : []),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. mobile apps, curl, health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (appConfig.isDevelopment) {
  app.use(morgan('dev'));
}

app.use(requestLogger);
const { attachUser } = require('./middleware/auth.middleware');
app.use(attachUser);

// ==============================
// STATIC FILES
// ==============================
app.use('/uploads', express.static('public/uploads'));

// ==============================
// HEALTH CHECK
// ==============================
app.get('/health', (req, res) => {
  return ApiResponse.success(res, HTTP_STATUS.OK, 'Service is healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const routes = require('./routes/index.routes');
app.use('/api/v1', routes);

// ==============================
// ERROR HANDLING (must remain last)
// ==============================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
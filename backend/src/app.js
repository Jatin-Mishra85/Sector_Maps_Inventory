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
app.set('trust proxy', 1); // ← YE LINE ADD KARO

// ==============================
// GLOBAL MIDDLEWARE
// ==============================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// ==============================
// CORS CONFIG
// Allows localhost (dev) + FRONTEND_URL (production, e.g. Vercel)
// FRONTEND_URL can hold a single origin or a comma-separated list
// ==============================
const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173', // local dev mein kabhi-kabhi Chrome http ko https samajh leta hai
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : []),
].filter(Boolean);

// Local network se (phone/tablet testing ke liye) bhi allow karo — 192.168.x.x,
// 10.x.x.x, 172.16-31.x.x pattern par kisi bhi port se, sirf jab production na ho.
const isLanOrigin = (origin) =>
  /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
    origin
  );

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. mobile apps, curl, health checks)
    if (!origin || allowedOrigins.includes(origin) || isLanOrigin(origin)) {
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
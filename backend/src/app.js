const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (appConfig.isDevelopment) {
  app.use(morgan('dev'));
}

app.use(requestLogger);

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
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const monogoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const reportRouter = require('./routes/reportRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Global Middlewares
// Set Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour'
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NOSQL Query injection
app.use(monogoSanitize());

// Data sanitization against xSS attack
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reports', reportRouter);

// Handle Unhandle Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

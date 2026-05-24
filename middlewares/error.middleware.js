// ─── Error Handler Class ──────────────────────────────────────────────────────

export class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Global Error Middleware ──────────────────────────────────────────────────

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ─── Mongoose Duplicate Key ───────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value entered for: ${field}`;
    statusCode = 400;
  }

  // ─── Mongoose Cast Error (invalid ObjectId) ───────────────────────────────
  if (err.name === 'CastError') {
    message = `Invalid value for field: ${err.path}`;
    statusCode = 400;
  }

  // ─── Mongoose Validation Error ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    statusCode = 422;
  }

  // ─── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired. Please log in again';
    statusCode = 401;
  }

  // ─── Log in development only ──────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error(
      `[${req.method}] ${req.originalUrl} → ${statusCode}: ${message}`,
    );
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

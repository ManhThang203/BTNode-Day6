module.exports = {
  // Server
  DEFAULT_PORT: 3000,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,

  // Server Configuration
  SERVER: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },

  // JWT Configuration
  JWT: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    verifyEmailSecret: process.env.JWT_VERIFY_EMAIL_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h",
    verifyEmailExpiresIn: process.env.JWT_VERIFY_EMAIL_EXPIRES_IN || "2h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    algorithm: process.env.JWT_ALGORITHM || "HS256",
  },

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // Rate Limiter Configuration
  RATE_LIMITER: {
    windowMs: parseInt(process.env.RATE_LIMITER_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMITER_MAX_REQUESTS) || 100,
    message: process.env.RATE_LIMITER_MESSAGE || "Quá nhiều requests",
  },

  // Pagination Configuration
  PAGINATION: {
    defaultPage: parseInt(process.env.PAGINATION_DEFAULT_PAGE) || 1,
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT) || 10,
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT) || 100,
  },

  // Database Configuration
  DATABASE: {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  },

  // Authentication
  BCRYPT_SALT_ROUNDS: 10,
  ACCESS_TOKEN_TTL_SECONDS: 3600,
  REFRESH_TOKEN_TTL_DAYS: 30,

  // Database
  DB_CONNECTION_LIMIT: 10,
  DB_MAX_IDLE: 10,
  DB_IDLE_TIMEOUT_MS: 60000,

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: "Unauthorized",
    NOT_FOUND: "Not found",
    INVALID_JSON: "Invalid JSON format",
    DATABASE_ERROR: "Database operation failed",
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  },

  QUEUE_STATUS: {
    PENDING: "pending",
    INPROGRESS: "inprogress",
    COMPLETED: "completed",
    FAILED: "failed",
  },
};

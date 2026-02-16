const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },

  // JWT configuration
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    algorithm: process.env.JWT_ALGORITHM || "HS512",
  },

  // Rate Limiter configuration
  rateLimiter: {
    windowMs: parseInt(process.env.RATE_LIMITER_WINDOW_MS) || 60000, // 1 phút
    maxRequests: parseInt(process.env.RATE_LIMITER_MAX_REQUESTS) || 100,
    message: process.env.RATE_LIMITER_MESSAGE || "Quá nhiều requests",
  },

  // Pagination configuration
  pagination: {
    defaultPage: parseInt(process.env.PAGINATION_DEFAULT_PAGE) || 1,
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT) || 10,
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT) || 100,
  },

  // Database configuration
  database: {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  },
};

module.exports = config;

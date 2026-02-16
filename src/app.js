require("dotenv").config();
const express = require("express");
const cors = require("cors");

const config = require("./config/app.config");

const db = require("./config/database");
const User = require("./models/user.model");
const Todo = require("./models/todo.model");
const RevokedToken = require("./models/revokedToken.model");
const authRoutes = require("./routes/auth.route");
const todoRoutes = require("./routes/todo.route");
const response = require("./middlewares/response");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const { apiRateLimiter } = require("./middlewares/rateLimiter");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(response);

// Apply rate limiter to all routes
app.use(apiRateLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.success({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFound);

// Database connection and server start
const PORT = config.server.port;

async function startServer() {
  try {
    // Test database connection
    const connected = await db.testConnection();
    if (!connected) {
      console.error(
        "Cannot connect to database. Please check your .env configuration.",
      );
      process.exit(1);
    }

    // Create tables if they don't exist
    console.log("Creating database tables...");

    try {
      await User.createTable();
      console.log("✅ Users table created/verified");
    } catch (error) {
      console.error("❌ Error creating users table:", error.message);
    }

    try {
      await Todo.createTable();
      console.log("✅ Todos table created/verified");
    } catch (error) {
      console.error("❌ Error creating todos table:", error.message);
    }

    try {
      await RevokedToken.createTable();
      console.log("✅ RevokedTokens table created/verified");
    } catch (error) {
      console.error("❌ Error creating revoked_tokens table:", error.message);
    }

    console.log("Database tables initialization complete!");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

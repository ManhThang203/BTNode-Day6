const express = require("express");
const authController = require("@/controllers/auth.controller");
const authRequired = require("@/middlewares/authRequired");

// Tạo router instance
const router = express.Router();

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/verify-email
router.post("/verify-email", authController.verifyEmail);

// POST /api/auth/resend-verify-email (yêu cầu đăng nhập)
router.post(
  "/resend-verify-email",
  authRequired,
  authController.resendVerifyEmail,
);

// POST /api/auth/refresh-token
router.post("/refresh-token", authController.refreshToken);

// POST /api/auth/logout
router.post(
  "/logout",
  authRequired, // Middleware kiểm tra token
  authController.logout,
);

// POST /api/auth/change-password (yêu cầu đăng nhập)
router.post("/change-password", authRequired, authController.changePassword);

module.exports = router;

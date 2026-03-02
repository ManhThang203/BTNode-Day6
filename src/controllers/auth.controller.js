const authService = require("@/services/auth.service");
const emailService = require("@/services/email.service");
const queueService = require("@/services/queue.service");
const User = require("@/models/user.model");

class AuthController {
  /**
   * Đăng ký user mới
   * @route POST /api/auth/register
   */
  async register(req, res) {
    try {
      // Lấy thông tin từ request body
      const { username, email, password } = req.body;

      // Validate input - kiểm tra các field bắt buộc
      if (!username || !email || !password) {
        return res.status(400).json({
          error: "Please provide username, email, and password",
        });
      }

      // Gọi service layer để xử lý logic đăng ký
      const result = await authService.register({ username, email, password });

      // Đẩy job gửi email xác thực vào queue
      queueService.push({
        type: "sendVerificationEmail",
        payload: {
          user: result.user,
          verifyToken: result.verifyToken,
        },
      });

      // Trả về response thành công với status 201 (Created)
      res.status(201).json({
        message: "User registered successfully",
        ...result,
      });
    } catch (error) {
      // Log lỗi và trả về response lỗi
      console.error("Register error:", error);
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * Đăng nhập user
   * @route POST /api/auth/login
   */
  async login(req, res) {
    try {
      // Lấy email và password từ request
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: "Please provide email and password",
        });
      }

      // Gọi service để xác thực thông tin đăng nhập
      const result = await authService.login({ email, password });

      // Trả về token và thông tin user
      res.status(200).json({
        message: "Login successful",
        ...result,
      });
    } catch (error) {
      // Trả về status 401 (Unauthorized) nếu đăng nhập thất bại
      console.error("Login error:", error);
      res.status(401).json({
        error: error.message,
      });
    }
  }

  /**
   * Đăng xuất user
   * @route POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // Lấy Authorization header
      const authHeader = req.headers.authorization;

      // Kiểm tra có Bearer token không
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).json({
          error: "Access token is required",
        });
      }

      // Tách lấy token từ "Bearer <token>"
      const accessToken = authHeader.split(" ")[1];

      // Gọi service để invalidate token
      await authService.logout(accessToken);

      // Trả về response đăng xuất thành công
      res.status(200).json({
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * Làm mới access token bằng refresh token
   * @route POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      // Lấy refresh token từ request body
      const { refresh_token } = req.body;

      // Kiểm tra refresh token có tồn tại không
      if (!refresh_token) {
        return res.status(400).json({
          error: "Refresh token is required",
        });
      }

      // Gọi service để tạo access token mới
      const tokens = await authService.refreshToken(refresh_token);

      // Trả về token mới
      res.status(200).json({
        message: "Token refreshed successfully",
        ...tokens,
      });
    } catch (error) {
      // Trả về lỗi 401 nếu refresh token không hợp lệ
      console.error("Refresh token error:", error);
      res.status(401).json({
        error: error.message,
      });
    }
  }
  /**
   * Xác thực email
   * @route POST /api/auth/verify-email
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          error: "Token is required",
        });
      }

      // Verify token
      const decoded = authService.verifyVerifyToken(token);

      if (!decoded) {
        return res.status(400).json({
          error: "Invalid or expired token",
        });
      }

      // Check token type
      if (decoded.type !== "verify") {
        return res.status(400).json({
          error: "Invalid token type",
        });
      }

      // Check if user already verified
      const user = await User.findById(decoded.sub);

      //  User not found
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }
      // Already verified
      if (user.verified_at) {
        return res.status(400).json({
          error: "Email already verified",
        });
      }

      // Cập nhật verified_at trong database
      await User.verifyEmail(decoded.sub);

      // Xác thực email thành công
      res.status(200).json({
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * Gửi lại email xác thực
   * @route POST /api/auth/resend-verify-email
   * @requires authRequired - user phải đăng nhập
   */
  async resendVerifyEmail(req, res) {
    try {
      // Lấy thông tin user từ req.user (đã được decode từ JWT middleware)
      const userId = req.user.sub;

      // Lấy thông tin user từ database
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Kiểm tra nếu email đã được xác thực
      if (user.verified_at) {
        return res.status(400).json({
          error: "Email already verified",
        });
      }

      // Tạo verify token
      const verifyToken = authService.generateVerifyToken(user);

      // Đẩy job gửi email xác thực vào queue
      queueService.push({
        type: "sendVerificationEmail",
        payload: {
          user: { id: user.id, email: user.email },
          verifyToken,
        },
      });

      res.status(200).json({
        message: "Verification email sent successfully",
      });
    } catch (error) {
      console.error("Resend verify email error:", error);
      res.status(400).json({
        error: error.message,
      });
    }
  }

  /**
   * Đổi mật khẩu
   * @route POST /api/auth/change-password
   * @requires authRequired
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          error:
            "Current password, new password, and confirm password are required",
        });
      }

      // Validate new password matches confirm
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          error: "New password and confirm password do not match",
        });
      }

      // Validate new password is different from current
      if (currentPassword === newPassword) {
        return res.status(400).json({
          error: "New password must be different from current password",
        });
      }

      // Get user from database (with password)
      const userId = req.user.sub;
      const user = await User.findByIdWithPassword(userId);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Verify current password
      const isMatch = await User.comparePassword(
        currentPassword,
        user.password,
      );
      if (!isMatch) {
        return res.status(400).json({
          error: "Current password is incorrect",
        });
      }

      // Change password
      const changedAt = await User.changePassword(userId, newPassword);

      // Push job to queue to send password change notification
      queueService.push({
        type: "sendPasswordChangeEmail",
        payload: {
          user: { id: user.id, username: user.username, email: user.email },
          changedAt,
        },
      });

      res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(400).json({
        error: error.message,
      });
    }
  }
}

// Export instance của controller
module.exports = new AuthController();

const authService = require("@/services/auth.service");

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
}

// Export instance của controller
module.exports = new AuthController();

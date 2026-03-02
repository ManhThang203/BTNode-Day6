const jwt = require("jsonwebtoken");

// Lấy cấu hình từ app.config
const config = require("@/config/app.config");
const accessSecret = config.JWT.accessSecret;
const jwtAlgorithm = config.JWT.algorithm;

/**
 * Middleware xác thực JWT token
 * Kiểm tra và verify token trong Authorization header
 * Nếu valid, decode token và attach user info vào req.user
 */
const authRequired = (req, res, next) => {
  // Lấy Authorization header từ request
  const authHeader = req.headers.authorization;

  // Kiểm tra xem có Authorization header và có format "Bearer <token>" không
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Tách lấy token từ "Bearer <token>" (lấy phần sau "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Verify token với secret key và thuật toán từ config
    const decoded = jwt.verify(token, accessSecret, {
      algorithms: [jwtAlgorithm], // Chỉ accept token được mã hóa bằng thuật toán từ config
    });

    // Attach thông tin user đã decode vào request object
    // Các middleware/controller tiếp theo có thể access thông qua req.user
    req.user = decoded;

    // Chuyển sang middleware/controller tiếp theo
    next();
  } catch (error) {
    // Nếu token không hợp lệ (expired, invalid signature, malformed...)
    // Trả về lỗi 401 Unauthorized
    res.status(401).json({ error: "Invalid token" });
  }
};

// Export middleware để sử dụng ở routes khác
module.exports = authRequired;

// Import modules để làm việc với file system và đường dẫn
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

// Tạo đường dẫn đến thư mục logs (2 cấp lên từ thư mục hiện tại)
const logsDir = path.join(__dirname, "..", "..", "logs");

// Kiểm tra và tạo thư mục logs nếu chưa tồn tại
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true }); // recursive: true để tạo cả parent directories
}

// Đường dẫn file log lỗi
const errorLogFile = path.join(logsDir, "error.log");

/**
 * Ghi log lỗi vào file để debug
 *
 * @param {Error} error - Error object
 * @param {Request} req - Express request object
 */
const logErrorToFile = (error, req) => {
  // Tạo timestamp theo chuẩn ISO
  const timestamp = new Date().toISOString();

  // Format log entry với đầy đủ thông tin
  const logEntry = `[${timestamp}] 
    Method: ${req.method}           // HTTP method (GET, POST, PUT...)
    URL: ${req.originalUrl}         // URL được request
    IP: ${req.ip}                   // IP address của client
    Error: ${error.message}         // Thông điệp lỗi
    Stack: ${error.stack}           // Stack trace để debug
    --------------------------
  \n`;

  // Append log entry vào file (không overwrite)
  fs.appendFileSync(errorLogFile, logEntry);
};

/**
 * Global Error Handler Middleware
 * Middleware này phải được define sau tất cả routes
 * Express sẽ tự động gọi middleware này khi có lỗi xảy ra
 */
const errorHandler = (err, req, res, next) => {
  // Log lỗi ra console để dev có thể thấy ngay
  console.error(err.stack);

  // Ghi chi tiết lỗi vào file để phân tích sau
  logErrorToFile(err, req);

  // Xử lý các loại lỗi JWT cụ thể
  if (err.name === "JsonWebTokenError") {
    // Token malformed, signature không khớp, etc.
    return res.error(401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    // Token đã hết hạn
    return res.error(401, "Token expired");
  }

  // Lỗi chung - trả về 500 Internal Server Error
  // QUAN TRỌNG: Chỉ trả message chung chung cho client,
  // không expose chi tiết lỗi server (bảo mật)
  res.error(500, err.message || "Internal server error");
};

// Export error handler
module.exports = errorHandler;

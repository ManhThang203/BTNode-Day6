// Hàm tạo middleware giới hạn tốc độ request
const createRateLimiter = (config) => {
  // Lấy cấu hình từ tham số
  const { windowMs, maxRequests, message } = config;

  // Lưu trữ số lượng request của mỗi địa chỉ IP
  const requestCounts = new Map();

  // Trả về middleware function
  return (req, res, next) => {
    // Lấy địa chỉ IP của người gửi request
    const ip = req.ip || req.connection.remoteAddress;

    // Lấy thời gian hiện tại (milliseconds)
    const now = Date.now();

    // Lấy bản ghi hiện có của IP này
    let record = requestCounts.get(ip);

    // Nếu chưa có bản ghi hoặc cửa sổ thời gian đã hết hạn, tạo bản ghi mới
    if (!record || now - record.startTime > windowMs) {
      record = {
        count: 0, // Số lượng request
        startTime: now, // Thời điểm bắt đầu đếm
      };
      requestCounts.set(ip, record);
    }

    // Tăng số lượng request lên 1
    record.count++;

    // Thiết lập các header về giới hạn tốc độ
    res.setHeader("X-RateLimit-Limit", maxRequests); // Giới hạn tối đa
    res.setHeader(
      "X-RateLimit-Remaining", // Số request còn lại
      Math.max(0, maxRequests - record.count),
    );
    res.setHeader(
      "X-RateLimit-Reset", // Thời điểm reset (Unix timestamp)
      Math.ceil((record.startTime + windowMs) / 1000),
    );

    // Kiểm tra nếu số lượng request vượt quá giới hạn
    if (record.count > maxRequests) {
      return res.status(429).json({
        error: message, // Trả lỗi 429 (Too Many Requests)
      });
    }

    // Cho phép request tiếp tục đến middleware/route tiếp theo
    next();
  };
};

// Tạo sẵn một instance rate limiter cho API
const apiRateLimiter = createRateLimiter(
  require("@/config/app.config").RATE_LIMITER,
);

// Xuất để sử dụng ở file khác
module.exports = { createRateLimiter, apiRateLimiter };

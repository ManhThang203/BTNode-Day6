const mysql = require("mysql2/promise");

// Lấy cấu hình từ app.config
const config = require("./app.config");

// Cấu hình thông tin database từ environment variables
const databaseConfig = {
  host: process.env.DB_HOST, // Địa chỉ host database
  port: parseInt(process.env.DB_PORT), // Port database
  user: process.env.DB_USER, // Username database
  password: process.env.DB_PASSWORD, // Password database
  name: process.env.DB_NAME, // Tên database
};

// Tạo connection pool để quản lý kết nối database hiệu quả
const pool = mysql.createPool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.name,
  waitForConnections: true, // Chờ nếu không có connection available
  connectionLimit: config.database.connectionLimit, // Giới hạn tối đa connections đồng thời
  queueLimit: config.database.queueLimit, // Không giới hạn số lượng request chờ
  enableKeepAlive: true, // Giữ kết nối alive
  keepAliveInitialDelay: 0, // Không delay khi keep alive
});

/**
 * Thực thi câu lệnh SQL với prepared statements
 */
const execute = async (sql, params = []) => {
  try {
    // Thực thi query và trả về kết quả dưới dạng mảng [results]
    const [results] = await pool.execute(sql, params);
    return [results];
  } catch (error) {
    // Log lỗi và throw để xử lý ở tầng cao hơn
    console.error("Database error:", error.message);
    throw error;
  }
};

/**
 * Lấy một connection từ pool để thực hiện transaction
 */
const getConnection = async () => {
  return await pool.getConnection();
};

/**
 * Kiểm tra kết nối database
 */
const testConnection = async () => {
  try {
    // Thử lấy connection từ pool
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    // Giải phóng connection về pool
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

/**
 * Đóng tất cả connections trong pool
 * Gọi khi shutdown application
 */
const closePool = async () => {
  await pool.end();
};

// Export các functions để sử dụng ở module khác
module.exports = {
  pool,
  execute,
  getConnection,
  testConnection,
  closePool,
};

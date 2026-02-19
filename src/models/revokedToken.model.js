const db = require("@/config/database");

/**
 * RevokedToken Model - Thao tác với bảng revoked_tokens
 * Sử dụng raw SQL queries thay vì ORM
 * Dùng để lưu trữ các JWT tokens đã bị thu hồi (logout)
 */

const RevokedToken = {
  /**
   * Tạo bảng revoked_tokens nếu chưa tồn tại
   */
  createTable: async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(512) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_expires_at (expires_at),
        INDEX idx_token (token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await db.execute(sql);
  },

  /**
   * Kiểm tra token có bị thu hồi không
   */
  isRevoked: async (token) => {
    const sql = `SELECT id FROM revoked_tokens WHERE token = ?`;
    const [rows] = await db.execute(sql, [token]);
    return rows.length > 0;
  },

  /**
   * Thêm token vào danh sách thu hồi
   */
  revoke: async ({ token, expiresAt }) => {
    const sql = `
      INSERT INTO revoked_tokens (token, expires_at)
      VALUES (?, ?)
    `;
    try {
      const [result] = await db.execute(sql, [token, expiresAt]);
      return { id: result.insertId };
    } catch (error) {
      // Nếu token đã tồn tại (unique constraint), bỏ qua lỗi
      if (error.code === "ER_DUP_ENTRY") {
        return null;
      }
      throw error;
    }
  },
};

module.exports = RevokedToken;

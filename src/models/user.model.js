const db = require("@/config/database");
const bcrypt = require("bcryptjs");

/**
 * User Model - Thao tác với bảng users
 * Sử dụng raw SQL queries thay vì ORM
 */

const User = {
  /**
   * Tạo bảng users nếu chưa tồn tại
   */
  createTable: async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await db.execute(sql);
  },

  // Đếm số lượng user mới được tạo trong ngày hôm qua
  async countNewUser() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const prev = date.toISOString().slice(0, 10);

    const [rows] = await db.execute(
      "select count(*) as count from users where created_at between ? and ?;",
      [`${prev} 00:00:00`, `${prev} 23:59:59`],
    );
    return rows[0].count;
  },

  /**
   * Tìm user theo ID
   */
  findById: async (id) => {
    const sql = `SELECT id, username, email, created_at, updated_at, verified_at FROM users WHERE id = ?`;
    // chuyền id vào câu truy vấn để tránh SQL Injection
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Tìm user theo ID (bao gồm password)
   */
  findByIdWithPassword: async (id) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Tìm user theo username
   */
  findByUsername: async (username) => {
    const sql = `SELECT * FROM users WHERE username = ?`;
    const [rows] = await db.execute(sql, [username]);
    return rows[0] || null;
  },

  /**
   * Tìm user theo email
   */
  findByEmail: async (email) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0] || null;
  },

  /**
   * Tạo user mới
   */
  create: async ({ username, email, password }) => {
    // Mã hóa password
    const salt = await bcrypt.genSalt(10);

    // Hash password với salt để tăng cường bảo mật
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(sql, [username, email, hashedPassword]);
    // result.insertId là ID của user mới được tạo ra
    return { id: result.insertId, username, email };
  },

  /**
   * Cập nhật user
   */
  update: async (id, { username, email }) => {
    const sql = `
      UPDATE users
      SET username = ?, email = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [username, email, id]);
    // affectedRows là số dòng bị thay đổi sau khi UPDATE
    return result.affectedRows > 0;
  },

  /**
   * Cập nhật verified_at khi xác thực email thành công
   */
  verifyEmail: async (id) => {
    const sql = `
      UPDATE users
      SET verified_at = NOW()
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  },

  /**
   * Xóa user
   */
  delete: async (id) => {
    const sql = `DELETE FROM users WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    // affectedRows là số dòng bị thay đổi sau khi DELETE
    return result.affectedRows > 0;
  },

  /**
   * So sánh password
   */
  comparePassword: async (candidatePassword, hashedPassword) => {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (id, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const sql = `
      UPDATE users
      SET password = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [hashedPassword, id]);

    if (result.affectedRows > 0) {
      // Return the timestamp when password was changed
      const [rows] = await db.execute(
        `SELECT updated_at FROM users WHERE id = ?`,
        [id],
      );
      return rows[0].updated_at;
    }
    return null;
  },
};

module.exports = User;

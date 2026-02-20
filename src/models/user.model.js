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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await db.execute(sql);
  },

  /**
   * Tìm user theo ID
   */
  findById: async (id) => {
    const sql = `SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?`;
    // chuyền id vào câu truy vấn để tránh SQL Injection
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
};

module.exports = User;

const db = require("../config/database");

/**
 * Todo Model - Thao tác với bảng todos
 * Sử dụng raw SQL queries thay vì ORM
 */

const Todo = {
  /**
   * Tạo bảng todos nếu chưa tồn tại
   */
  createTable: async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        user_id INT NOT NULL,
        due_date DATE,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_user_created (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    await db.execute(sql);
  },

  /**
   * Tìm todo theo ID
   */
  findById: async (id) => {
    const sql = `
      SELECT id, title, description, completed, user_id, due_date, priority, created_at, updated_at
      FROM todos
      WHERE id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Lấy tất cả todos của một user
   */
  findByUserId: async (userId) => {
    const sql = `
      SELECT id, title, description, completed, user_id, due_date, priority, created_at, updated_at
      FROM todos
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  },

  /**
   * Lấy todos theo trạng thái hoàn thành
   */
  findByUserIdAndStatus: async (userId, completed) => {
    const sql = `
      SELECT id, title, description, completed, user_id, due_date, priority, created_at, updated_at
      FROM todos
      WHERE user_id = ? AND completed = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(sql, [userId, completed]);
    return rows;
  },

  /**
   * Tạo todo mới
   */
  create: async ({ title, description, userId, dueDate, priority }) => {
    const sql = `
      INSERT INTO todos (title, description, user_id, due_date, priority)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      title,
      description || null,
      userId,
      dueDate || null,
      priority || "medium",
    ]);
    return {
      id: result.insertId,
      title,
      description,
      userId,
      dueDate,
      priority,
    };
  },

  /**
   * Cập nhật todo
   */
  update: async (id, { title, description, completed, dueDate, priority }) => {
    const sql = `
      UPDATE todos
      SET title = ?, description = ?, completed = ?, due_date = ?, priority = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [
      title,
      description,
      completed,
      dueDate,
      priority,
      id,
    ]);
    return result.affectedRows > 0;
  },

  /**
   * Cập nhật trạng thái hoàn thành
   */
  updateStatus: async (id, completed) => {
    const sql = `UPDATE todos SET completed = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [completed, id]);
    return result.affectedRows > 0;
  },

  /**
   * Xóa todo
   */
  delete: async (id) => {
    const sql = `DELETE FROM todos WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  },

  /**
   * Xóa tất cả todos của một user
   */
  deleteByUserId: async (userId) => {
    const sql = `DELETE FROM todos WHERE user_id = ?`;
    const [result] = await db.execute(sql, [userId]);
    return result.affectedRows;
  },

  /**
   * Đếm số lượng todos của một user
   */
  countByUserId: async (userId) => {
    const sql = `SELECT COUNT(*) as count FROM todos WHERE user_id = ?`;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0].count;
  },
};

module.exports = Todo;

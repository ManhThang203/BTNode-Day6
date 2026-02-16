const todoService = require("../services/todo.service");
const config = require("../config/app.config");

class TodoController {
  /**
   * Tạo todo mới
   * @route POST /api/todos
   */
  async create(req, res) {
    try {
      // Lấy thông tin todo từ request body
      const { title, description, dueDate, priority } = req.body;

      // Validate: title là bắt buộc
      if (!title) {
        return res.status(400).json({
          error: "Title is required",
        });
      }

      // Tạo todo mới với user_id từ authenticated user (req.user)
      const todo = await todoService.create(
        { title, description, dueDate, priority },
        req.user.id, // ID user đã được xác thực từ middleware
      );

      // Trả về todo vừa tạo với status 201
      res.success(todo, 201);
    } catch (error) {
      console.error("Create todo error:", error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Lấy danh sách todos với phân trang và filter
   * @route GET /api/todos
   */
  async getAll(req, res) {
    try {
      // Lấy query parameters để filter và sort
      const { page, limit, completed, priority, sortBy, sortOrder } = req.query;

      // Gọi service với các options
      const result = await todoService.getAll(req.user.id, {
        page: Math.min(
          parseInt(page) || config.pagination.defaultPage,
          config.pagination.maxLimit,
        ), // Trang hiện tại
        limit: Math.min(
          parseInt(limit) || config.pagination.defaultLimit,
          config.pagination.maxLimit,
        ), // Số item per page
        completed: completed !== undefined ? completed === "true" : undefined, // Filter theo trạng thái
        priority, // Filter theo priority
        sortBy, // Field để sort
        sortOrder, // ASC hoặc DESC
      });

      // Trả về danh sách todos cùng với pagination info
      res.status(200).json({
        message: "Todos retrieved successfully",
        ...result,
      });
    } catch (error) {
      console.error("Get todos error:", error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Lấy chi tiết một todo theo ID
   * @route GET /api/todos/:id
   */
  async getById(req, res) {
    try {
      // Lấy ID từ route params
      const { id } = req.params;

      // Lấy todo, đảm bảo todo thuộc về user hiện tại
      const todo = await todoService.getById(id, req.user.id);

      // Nếu không tìm thấy, trả về 404
      if (!todo) {
        return res.status(404).json({
          error: "Todo not found",
        });
      }

      // Trả về todo
      res.status(200).json({
        message: "Todo retrieved successfully",
        todo,
      });
    } catch (error) {
      console.error("Get todo error:", error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Cập nhật todo
   * @route PUT /api/todos/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body; // Dữ liệu cần update

      // Cập nhật todo, verify ownership bằng user_id
      const todo = await todoService.update(id, updateData, req.user.id);

      // Nếu không tìm thấy hoặc không có quyền, trả về 404
      if (!todo) {
        return res.status(404).json({
          error: "Todo not found",
        });
      }

      // Trả về todo đã được cập nhật
      res.status(200).json({
        message: "Todo updated successfully",
        todo,
      });
    } catch (error) {
      console.error("Update todo error:", error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Xóa todo
   * @route DELETE /api/todos/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Xóa todo, verify ownership
      const deleted = await todoService.delete(id, req.user.id);

      // Nếu không tìm thấy, trả về 404
      if (!deleted) {
        return res.status(404).json({
          error: "Todo not found",
        });
      }

      // Trả về thông báo xóa thành công
      res.status(200).json({
        message: "Todo deleted successfully",
      });
    } catch (error) {
      console.error("Delete todo error:", error);
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Toggle trạng thái completed/incomplete của todo
   * @route PATCH /api/todos/:id/toggle
   */
  async toggleComplete(req, res) {
    try {
      const { id } = req.params;

      // Toggle trạng thái completed
      const todo = await todoService.toggleComplete(id, req.user.id);

      // Nếu không tìm thấy, trả về 404
      if (!todo) {
        return res.status(404).json({
          error: "Todo not found",
        });
      }

      // Trả về todo với trạng thái mới
      res.status(200).json({
        message: `Todo marked as ${todo.completed ? "completed" : "incomplete"}`,
        todo,
      });
    } catch (error) {
      console.error("Toggle todo error:", error);
      res.status(500).json({
        error: error.message,
      });
    }
  }
}

// Export instance của controller
module.exports = new TodoController();

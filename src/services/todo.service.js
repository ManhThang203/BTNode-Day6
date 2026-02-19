const Todo = require("@/models/todo.model");

class TodoService {
  /**
   * Tạo todo mới
   */
  async create(todoData, userId) {
    const todo = await Todo.create({
      ...todoData,
      userId: parseInt(userId),
    });
    return todo;
  }

  /**
   * Lấy tất cả todos của user với phân trang
   */
  async getAll(userId, options = {}) {
    const { page = 1, limit = 10, completed, priority } = options;

    let todos;

    // Lọc theo trạng thái nếu có
    if (completed !== undefined) {
      // completed
      const isCompleted = completed === "true" || completed === true;
      todos = await Todo.findByUserIdAndStatus(userId, isCompleted);
    } else {
      todos = await Todo.findByUserId(userId);
    }

    // Lọc theo priority nếu có
    if (priority) {
      todos = todos.filter((todo) => todo.priority === priority);
    }

    // Sắp xếp theo created_at giảm dần
    todos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Phân trang
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTodos = todos.slice(startIndex, endIndex);

    return {
      todos: paginatedTodos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: todos.length,
        pages: Math.ceil(todos.length / parseInt(limit)),
      },
    };
  }

  /**
   * Lấy todo theo ID
   */
  async getById(todoId, userId) {
    const todo = await Todo.findById(parseInt(todoId));

    // Kiểm tra todo thuộc về user
    if (!todo || todo.user_id !== parseInt(userId)) {
      return null;
    }

    return todo;
  }

  /**
   * Cập nhật todo
   */
  async update(todoId, updateData, userId) {
    // Kiểm tra todo tồn tại và thuộc về user
    const existingTodo = await this.getById(todoId, userId);

    if (!existingTodo) {
      return null;
    }

    const updated = await Todo.update(parseInt(todoId), {
      title: updateData.title,
      description: updateData.description,
      completed: updateData.completed,
      priority: updateData.priority,
    });

    if (updated) {
      return await Todo.findById(parseInt(todoId));
    }

    return null;
  }

  /**
   * Xóa todo
   */
  async delete(todoId, userId) {
    // Kiểm tra todo tồn tại và thuộc về user
    const existingTodo = await this.getById(todoId, userId);

    if (!existingTodo) {
      return null;
    }

    return await Todo.delete(parseInt(todoId));
  }

  /**
   * Chuyển đổi trạng thái hoàn thành
   */
  async toggleComplete(todoId, userId) {
    const todo = await this.getById(todoId, userId);

    if (!todo) {
      return null;
    }

    const newStatus = !todo.completed;
    await Todo.updateStatus(parseInt(todoId), newStatus);

    return await Todo.findById(parseInt(todoId));
  }
}

module.exports = new TodoService();

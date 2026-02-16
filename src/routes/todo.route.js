const express = require("express");
const todoController = require("../controllers/todo.controller");
const authRequired = require("../middlewares/authRequired");

// Tạo router instance
const router = express.Router();

router.use(authRequired);

// GET /api/todos
router.get("/", todoController.getAll);

// POST /api/todos
router.post("/", todoController.create);

//  GET /api/todos/:id
router.get("/:id", todoController.getById);

// PUT /api/todos/:id
router.put("/:id", todoController.update);

// DELETE /api/todos/:id
router.delete("/:id", todoController.delete);

//  PATCH /api/todos/:id/toggle
router.patch("/:id/toggle", todoController.toggleComplete);

module.exports = router;

const fs = require("fs");

const basePath = "./src/tasks"; // Thư mục chứa các file task
const postfix = "Task.js"; // Hậu tố để lọc đúng file task

// Đọc tất cả file trong thư mục, chỉ lấy file có đuôi "Task.js"

const entries = fs
  // readdirSync: đọc tất cả tên file trong thư mục
  // readdir trả về mảng tên file, ví dụ: ["createTask.js", "deleteTask.js", "index.js"]
  .readdirSync(basePath)
  .filter((fileName) => fileName.endsWith(postfix));

// Chuyển mảng file thành object dạng { tênTask: module }
const tasksMap = entries.reduce((obj, fileName) => {
  return {
    ...obj, // Giữ lại các key cũ

    // Key: bỏ phần "Task.js" → "createTask.js" thành "create"
    // Value: import module từ file đó
    [fileName.replace(postfix, "")]: require(`./${fileName}`),
  };
}, {}); // Bắt đầu từ object rỗng {}

// Xuất ra để các file khác có thể dùng
module.exports = tasksMap;

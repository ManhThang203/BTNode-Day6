const console = require("console");
const fs = require("fs");
const path = require("path");

const basePath = "./src/tasks";
// Điều chỉnh postfix để khớp chính xác với đuôi file trong ảnh (.task.js)
const postfix = ".task.js";

const entries = fs
  .readdirSync(basePath)
  .filter((fileName) => fileName.endsWith(postfix));

const tasksMap = entries.reduce((obj, fileName) => {
  // 1. Cắt bỏ đuôi ".task.js" để lấy tên task sạch
  const taskName = fileName.replace(postfix, "");

  return {
    ...obj,
    // 2. Sử dụng path.join hoặc template string chuẩn để require
    // Lưu ý: require cần đường dẫn tương đối từ file index này đến file task
    [taskName]: require(path.join(__dirname, fileName)),
  };
}, {});
console.log("tasksMap: ", tasksMap);

module.exports = tasksMap;

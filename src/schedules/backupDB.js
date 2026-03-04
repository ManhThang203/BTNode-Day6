const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const driveService = require("@/services/drive.service");
const emailService = require("@/services/email.service");

/**
 * Backup database và upload lên Google Drive
 * Chạy vào 3h sáng mỗi ngày
 */
async function backupDB() {
  console.log("=== Bắt đầu backup database ===");

  // Đảm bảo thư mục backup tồn tại
  const backupDir = path.join(__dirname, "..", "..", "backup");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Tạo tên file backup: [DB_NAME]-[YYYY-MM-DD].sql
  const filename = `${process.env.DB_NAME}-${new Date().toISOString().slice(0, 10)}.sql`;
  const outputPath = path.join(backupDir, filename);
  console.log(`outputPath: ${outputPath}`);

  // Thực hiện backup database
  await performBackup(outputPath, filename);
}

/**
 * Thực hiện backup database sử dụng mysqldump
 */
function performBackup(outputPath, filename) {
  return new Promise((resolve, reject) => {
    // Chạy mysqldump command để backup database
    const mysqldump = spawn(
      "mysqldump",
      [
        "-u",
        process.env.DB_USER,
        "-P",
        process.env.DB_PORT || "3306",
        process.env.DB_NAME,
      ],
      {
        env: {
          ...process.env,
          MYSQL_PWD: process.env.DB_PASSWORD, // ← password truyền qua env, không lộ trên command line
        },
      },
    );

    // Tạo writable stream để ghi dữ liệu vào file
    // luồng ghi vào file .sql
    const outputFile = fs.createWriteStream(outputPath);

    // Redirect stdout (dữ liệu SQL) → file
    // pipe luồng ra của mysqldump
    // outputFile luồng ghi vào file .sql
    // stdout dữ liệu SQL tự động chảy vào file từng chunk một, liên tục
    mysqldump.stdout.pipe(outputFile);

    // Log lỗi từ stderr
    mysqldump.stderr.on("data", (data) => {
      console.error(`mysqldump stderr: ${data}`);
    });

    // Xử lý khi mysqldump hoàn thành
    mysqldump.on("close", async (code) => {
      if (code === 0) {
        console.log(`Backup thành công: ${outputPath}`);

        try {
          // Upload lên Google Drive
          await uploadToDrive(outputPath, filename);

          // Gửi email thông báo cho admin
          await sendNotificationEmail(filename);

          resolve();
        } catch (error) {
          console.error("Lỗi khi upload hoặc gửi email:", error);
          reject(error);
        }
      } else {
        console.error(`mysqldump thất bại với code ${code}`);
        reject(new Error(`mysqldump thất bại với code ${code}`));
      }
    });

    // Xử lý lỗi khi không thể chạy mysqldump
    mysqldump.on("error", (err) => {
      console.error(`Không thể chạy mysqldump: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Upload file backup lên Google Drive
 */
async function uploadToDrive(filePath, filename) {
  // Sử dụng drive service để upload file
  const fileId = await driveService.uploadFileWithReplace(
    filePath, // 1. Đường dẫn file trên máy chủ (D:\BE-F8\Todo_App\BTNode-Day6\backup\todo_app-2026-03-04.sql)
    filename, // 2. Tên file trên Google Drive
    "application/sql", // 3. Loại file (MIME Type)
  );
  console.log(`Upload lên Google Drive thành công. File ID: ${fileId}`);
}

/**
 * Gửi email thông báo cho quản trị viên
 */
async function sendNotificationEmail(filename) {
  const adminEmail = process.env.GOOGLE_APP_USER;

  if (!adminEmail) {
    console.log("Không tìm thấy địa chỉ email admin, bỏ qua gửi thông báo");
    return;
  }

  const subject = "📦 Backup Database Thành Công";

  try {
    await emailService.sendBackupNotification(adminEmail, filename);
    console.log(`Đã gửi email thông báo cho admin: ${adminEmail}`);
  } catch (error) {
    console.error("Lỗi khi gửi email thông báo:", error);
  }
}

module.exports = backupDB;

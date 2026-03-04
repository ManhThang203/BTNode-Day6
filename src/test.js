/**
 * =====================================================
 * GOOGLE DRIVE BACKUP SCRIPT
 * Script tự động backup database lên Google Drive
 * =====================================================
 */

require("dotenv").config();

// Thư viện để đọc/ghi dữ liệu từ console
const readline = require("readline");
// Thư viện để làm việc với file system
const fs = require("node:fs");
// Thư viện Google APIs để làm việc với Google Drive
const { google } = require("googleapis");

/**
 * =====================================================
 * KHỞI TẠO OAUTH2 CLIENT
 * Dùng để xác thực với Google API
 * =====================================================
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, // ID của ứng dụng Google Cloud
  process.env.GOOGLE_CLIENT_SECRET, // Secret key của ứng dụng
  "http://localhost:3000", // Redirect URI sau khi xác thực
);

/**
 * =====================================================
 * HÀM: getRefreshToken()
 * Mục đích: Lấy refresh token để xác thực lâu dài với Google
 *
 * Cách sử dụng:
 * 1. Bỏ comment dòng: getRefreshToken().catch(console.error);
 * 2. Chạy script: node src/test.js
 * 3. Dán authorization code vào console
 * 4. Copy refresh token được in ra và lưu vào .env
 * =====================================================
 */
async function getRefreshToken() {
  // Bước 1: Tạo URL xác thực Google
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // offline = lấy refresh token (không cần đăng nhập lại)
    scope: ["https://www.googleapis.com/auth/drive.file"], // Quyền đọc/ghi file trong Drive
    prompt: "consent", // Luôn hiển màn xin quyền để chắc chắn có refresh token
  });

  console.log("🔗 Truy cập URL để xác thực:");
  console.log(authUrl);
  console.log("\n");

  // Bước 2: Tạo giao diện nhập liệu trên console
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Bước 3: Đợi user nhập authorization code
  return new Promise((resolve) => {
    rl.question("📋 Paste authorization code từ URL: ", async (code) => {
      rl.close();

      // Bước 4: Đổi authorization code lấy tokens
      const { tokens } = await oauth2Client.getToken(code);

      console.log("\n✅ Đã lấy được tokens!");
      console.log("\n🔑 Refresh Token (copy vào .env):");
      console.log(tokens.refresh_token);
      console.log("\n📝 Thêm vào file .env:");
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

      resolve(tokens);
    });
  });
}

// Bỏ comment dòng dưới đây nếu cần lấy refresh token mới
// getRefreshToken().catch(console.error);

/**
 * =====================================================
 * KIỂM TRA VÀ KHỞI TẠO
 * Chỉ chạy main() nếu đã có refresh token hợp lệ
 * =====================================================
 */
if (process.env.GOOGLE_REFRESH_TOKEN) {
  // Đặt credentials sử dụng refresh token
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  // Khởi tạo Google Drive API
  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  /**
   * =====================================================
   * HÀM: main()
   * Mục đích: Tự động backup database lên Google Drive
   *
   * Quy trình:
   * 1. Tạo tên file backup theo ngày
   * 2. Tìm hoặc tạo thư mục backupdb trên Drive
   * 3. Upload file SQL vào thư mục đó
   * =====================================================
   */
  async function main() {
    // Bước 1: Tạo tên file backup với định dạng: tencsdl-YYYY-MM-DD.sql
    const outputFile = `./backup/${process.env.DB_NAME}-${new Date().toISOString().split("T")[0]}.sql`;
    console.log(`📦 File backup: ${outputFile}`);

    // Bước 2: Tìm hoặc tạo thư mục backupdb trên Google Drive
    const folderName = "backupdb"; // Tên thư mục sẽ lưu trữ backup

    // Tìm kiếm thư mục đã tồn tại chưa
    const searchResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    let folderId; // ID của thư mục backupdb

    if (searchResponse.data.files.length > 0) {
      // ✅ Thư mục đã tồn tại, lấy ID của nó
      folderId = searchResponse.data.files[0].id;
      console.log(`📁 Thư mục '${folderName}' đã tồn tại: ${folderId}`);
    } else {
      // ❌ Thư mục chưa có, tạo mới
      const folderResponse = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder", // Loại folder của Google Drive
        },
        fields: "id, name",
      });
      folderId = folderResponse.data.id;
      console.log(`📁 Tạo thư mục '${folderName}' mới: ${folderId}`);
    }

    // Bước 3: Upload file backup lên Google Drive
    const res = await drive.files.create({
      requestBody: {
        name: outputFile.split("/").pop(), // Lấy tên file (không có đường dẫn)
        mimeType: "text/plain", // Loại file (text/SQL)
        parents: [folderId], // Thư mục cha (backupdb)
      },
      media: {
        mimeType: "text/plain",
        body: fs.createReadStream(outputFile), // Nội dung file cần upload
      },
    });

    console.log("✅ Upload thành công!");
    console.log("📋 Thông tin file trên Drive:", res.data);
  }

  // Chạy hàm main
  main().catch(console.error);
} else {
  // Không có refresh token, hiển thị hướng dẫn
  console.log("⚠️  Chưa có GOOGLE_REFRESH_TOKEN trong .env");
  console.log(
    "👉 Bỏ comment dòng 'getRefreshToken()' và chạy lại để lấy token",
  );
}

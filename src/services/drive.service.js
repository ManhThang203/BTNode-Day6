const { google } = require("googleapis");

/**
 * DriveService - Service để làm việc với Google Drive API
 * Các nơi khác trong dự án không làm việc trực tiếp với googleapis,
 * mà thông qua drive service này
 */
class DriveService {
  constructor() {
    this.drive = null;
    this.folderName = "backupdb"; // Tên thư mục lưu backup trên Google Drive
    this.folderId = null;
  }

  /**
   * Khởi tạo Google Drive client (async để đợi tạo folder)
   */
  async _init() {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    // Sử dụng refresh token để lấy access token
    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.drive = google.drive({ version: "v3", auth });
    console.log("this.drive:", this.drive);

    // Lấy hoặc tạo thư mục backupdb
    this.folderId = await this.getOrCreateFolder(this.folderName);
    console.log("Folder ID:", this.folderId);
    console.log(
      `Google Drive folder ID for '${this.folderName}': ${this.folderId}`,
    );
  }

  /**
   * Khởi tạo và đợi cho xong (dùng cho trường hợp cần đợi init)
   */
  async ensureInit() {
    if (!this.folderId) {
      await this._init();
    }
  }

  /**
   * Lấy ID thư mục nếu đã tồn tại, hoặc tạo mới nếu chưa có
   */
  async getOrCreateFolder(folderName) {
    try {
      // Tìm thư mục đã tồn tại
      const response = await this.drive.files.list({
        // q` là câu **query tìm kiếm** trên Drive, giống như câu SQL
        // and mimeType='application/vnd.google-apps.folder'  → phải là thư mục (không phải file)
        // and trashed=false → phải chưa bị xóa (không nằm trong thùng rác)
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,

        // Chỉ lấy ID và tên của thư mục (không cần các trường khác)
        fields: "files(id, name)", // data -> files: [ { id: '...', name: 'backupdb' } ]
      });

      console.log("Response from Drive API:", response.data);

      if (response.data.files && response.data.files.length > 0) {
        console.log(
          `Folder '${folderName}' đã tồn tại với ID: ${response.data.files[0].id}`,
        );
        return response.data.files[0].id;
      }

      // Tạo thư mục mới nếu chưa tồn tại
      const folder = await this.drive.files.create({
        requestBody: {
          name: folderName, // Tên thư mục trên Google Drive
          mimeType: "application/vnd.google-apps.folder", // Loại MIME cho thư mục
        },
      });

      console.log(`Đã tạo folder '${folderName}' với ID: ${folder.data.id}`);
      return folder.data.id;
    } catch (error) {
      console.error("Error getting/creating folder:", error);
      throw error;
    }
  }

  /**
   * Upload file lên Google Drive
   * mimeType mặc định là application/octet-stream (binary), có thể thay đổi nếu biết rõ loại file
   */
  async uploadFile(filePath, fileName, mimeType = "application/octet-stream") {
    // Đảm bảo đã khởi tạo
    await this.ensureInit();

    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: mimeType,
          parents: [this.folderId], // Đặt file vào thư mục đã tạo
        },
        // media là phần nội dung file, dùng createReadStream để đọc file từ hệ thống
        media: {
          body: require("fs").createReadStream(filePath),
        },
      });

      console.log(`File uploaded successfully. File ID: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra file có tồn tại trong thư mục không
   */
  async fileExists(fileName) {
    // Đảm bảo đã khởi tạo
    await this.ensureInit();

    try {
      const response = await this.drive.files.list({
        q: `name='${fileName}' and '${this.folderId}' in parents and trashed=false`,
        fields: "files(id, name)",
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }
      return null;
    } catch (error) {
      console.error("Error checking file existence:", error);
      return null;
    }
  }

  /**
   * Xóa file khỏi Google Drive
   */
  async deleteFile(fileId) {
    // Đảm bảo đã khởi tạo
    await this.ensureInit();

    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
      console.log(`File ${fileId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting file from Google Drive:", error);
      throw error;
    }
  }

  /**
   * Upload file và thay thế nếu đã tồn tại
   */
  async uploadFileWithReplace(
    filePath,
    fileName,
    mimeType = "application/octet-stream",
  ) {
    // Đảm bảo đã khởi tạo
    await this.ensureInit();

    // Kiểm tra file đã tồn tại chưa
    const existingFileId = await this.fileExists(fileName);

    // Nếu đã tồn tại, xóa file cũ
    if (existingFileId) {
      await this.deleteFile(existingFileId);
    }

    // Upload file mới
    return await this.uploadFile(filePath, fileName, mimeType);
  }
}

// Export instance và đợi khởi tạo
const driveService = new DriveService();
// Khởi tạo ngay khi export
driveService._init().catch(console.error);

module.exports = driveService;

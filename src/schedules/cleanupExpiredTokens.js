const RevokedToken = require("@/models/revokedToken.model");

/**
 * CleanupExpiredTokens - Xóa các access token đã hết hạn khỏi blacklist
 * Chạy vào 1h sáng mỗi ngày
 */
async function cleanupExpiredTokens() {
  console.log("=== Bắt đầu dọn dẹp tokens hết hạn ===");

  try {
    const deletedCount = await RevokedToken.deleteExpired();
    console.log(`Đã xóa ${deletedCount} token hết hạn khỏi blacklist`);
    return deletedCount;
  } catch (error) {
    console.error("Lỗi khi dọn dẹp tokens hết hạn:", error);
    throw error;
  }
}

module.exports = cleanupExpiredTokens;

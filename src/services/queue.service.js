const queueModel = require("@/models/queue.model");

class QueueService {
  async push(job) {
    const { type, payload } = job;
    // chuyển payload thành string để lưu vào database
    await queueModel.create(type, JSON.stringify(payload));
  }
}

module.exports = new QueueService();

require("module-alias").addAliases({
  "@": __dirname,
});
require("dotenv").config();

require("@/config/database");
const tasks = require("@/tasks");

const sleep = require("@/utils/sleep");
const queueModel = require("@/models/queue.model");

const constants = require("@/config/constants");

(async () => {
  while (true) {
    const pendingJobs = await queueModel.findOnePending();

    if (pendingJobs) {
      const type = pendingJobs.type;

      const payload = JSON.parse(pendingJobs.payload);
      switch (type) {
        case "sendVerifyEmail":
          try {
            console.log(`Job: "${type}" is processing...`);
            await queueModel.updateStatus(
              pendingJobs.id,
              constants.QUEUE_STATUS.PROCESSING,
            );

            const handler = tasks[type];

            if (!handler) {
              throw new Error(`No handler found for job type: ${type}`);
            }
            await handler(
              payload,
              "Xác thực email của bạn",
              payload.verifyToken,
            );

            await queueModel.updateStatus(
              pendingJobs.id,
              constants.QUEUE_STATUS.COMPLETED,
            );

            console.log(`Job: "${type}" is processed!`);
          } catch (error) {
            console.error("Error processing job:", error);

            await queueModel.updateStatus(
              pendingJobs.id,
              constants.QUEUE_STATUS.FAILED,
            );
          }
          break;

        case "sendPasswordChangeEmail":
          try {
            console.log(`Job: "${type}" is processing...`);
            await queueModel.updateStatus(
              pendingJobs.id,
              constants.QUEUE_STATUS.PROCESSING,
            );

            const handler = tasks[type];
            console.log("handler", handler);
            if (!handler) {
              throw new Error(`No handler found for job type: ${type}`);
            }

            await handler(payload, "Your password has been changed");

            await queueModel.updateStatus(
              pendingJobs.id,
              constants.QUEUE_STATUS.COMPLETED,
            );

            console.log(`Job: "${type}" is processed!`);
          } catch (error) {
            console.error("Error processing job:", error);

            await queueModel.updateStatus(
              pendingJobs.id,
              constants.QUEUE_STATUS.FAILED,
            );
          }
          break;
      }
    }

    await sleep(1000);
  }
})();

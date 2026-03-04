const userModel = require("@/models/user.model");
const emailService = require("@/services/email.service");
const sleep = require("@/utils/sleep");
async function dailyReport() {
  const usersCount = await userModel.countNewUser();

  const date = new Date();
  date.setDate(date.getDate() - 1);
  const prev = date.toISOString().slice(0, 10);

  await emailService.sendReportEmail(
    "dongthang848@gmail.com",
    `Daily Report ${prev}`,
    usersCount,
  );

  console.log("Done");
}

module.exports = dailyReport;

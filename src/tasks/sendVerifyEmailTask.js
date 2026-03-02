const emailService = require("@/services/email.service");

async function sendVerifyEmailTask(payload, subject, token) {
  await emailService.sendVerifyEmail(payload.user, subject, token);
}

module.exports = sendVerifyEmailTask;

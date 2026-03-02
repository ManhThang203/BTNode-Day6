const emailService = require("@/services/email.service");

async function sendPasswordChangeEmailTask(payload, subject) {
  await emailService.sendPasswordChangeEmail(
    payload.user,
    subject,
    payload.changedAt,
  );
}

module.exports = sendPasswordChangeEmailTask;

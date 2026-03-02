const transporter = require("@/config/nodemailer");
const config = require("@/config/app.config");

class EmailService {
  async sendVerifyEmail(user, subject, token) {
    try {
      const verifyLink = `${config.FRONTEND_URL}?token=${token}`;
      const info = await transporter.sendMail({
        from: '"F8" <thangdmf8@fullstack.edu.vn>',
        to: user.email,
        subject: subject,
        html: `<p><a href="${verifyLink}">Click here</a> to verify your email!</p>`,
      });
      return info;
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  }

  async sendPasswordChangeEmail(user, subject, changedAt) {
    try {
      const info = await transporter.sendMail({
        from: '"F8" <thangdmf8@fullstack.edu.vn>',
        to: user.email,
        subject: subject,
        html: `<p>Your password was changed at ${changedAt}. If you didn't do this, please contact support.</p>`,
      });
      return info;
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();

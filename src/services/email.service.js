const transporter = require("@/config/nodemailer");
const config = require("@/config/app.config");

class EmailService {
  // Gửi email xác thực tài khoản
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
  // Gửi báo cáo hệ thống hàng ngày
  async sendReportEmail(email, subject, usersCount) {
    try {
      const info = await transporter.sendMail({
        from: '"F8" <thangdmf8@fullstack.edu.vn>',
        to: email,
        subject: subject,
        html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                  style="background:#ffffff; border-radius:10px; overflow:hidden;
                         box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f05123, #ff7043);
                               padding: 32px; text-align: center;">
                      <h1 style="margin:0; color:#ffffff; font-size:28px;
                                 letter-spacing:1px;">F8</h1>
                      <p style="margin:6px 0 0; color:rgba(255,255,255,0.85);
                                font-size:14px;">Fullstack.edu.vn</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 36px 40px;">
                      <h2 style="margin:0 0 12px; color:#1a1a2e; font-size:20px;">
                        📊 Báo cáo hệ thống
                      </h2>
                      <p style="margin:0 0 24px; color:#555; font-size:15px; line-height:1.7;">
                        Xin chào, đây là báo cáo mới nhất từ hệ thống F8.
                        Vui lòng xem thông tin bên dưới.
                      </p>

                      <!-- Stats Card -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background:#fff8f6; border:1px solid #fdddd5;
                               border-radius:8px; margin-bottom:28px;">
                        <tr>
                          <td style="padding:20px; text-align:center;">
                            <p style="margin:0; color:#888; font-size:13px;
                                      text-transform:uppercase; letter-spacing:1px;">
                              Tổng số người dùng
                            </p>
                            <p style="margin:8px 0 0; color:#f05123;
                                      font-size:36px; font-weight:bold;">
                              ${usersCount?.toLocaleString() ?? "—"}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0; color:#aaa; font-size:13px; text-align:center;">
                        Đây là email tự động từ hệ thống, vui lòng không trả lời.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9f9f9; padding:20px 40px;
                               text-align:center; border-top:1px solid #eee;">
                      <p style="margin:0; color:#bbb; font-size:12px;">
                        © ${new Date().getFullYear()} F8 – Fullstack.edu.vn · All rights reserved
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      });
      return info;
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  }

  // Gửi email thông báo thay đổi mật khẩu
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

  // Gửi email thông báo backup database thành công
  async sendBackupNotification(email, filename) {
    try {
      const subject = "📦 Backup Database Thành Công";
      const html = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                  style="background:#ffffff; border-radius:10px; overflow:hidden;
                         box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #28a745, #20c997);
                               padding: 32px; text-align: center;">
                      <h1 style="margin:0; color:#ffffff; font-size:28px;
                                 letter-spacing:1px;">✅ Backup Thành Công</h1>
                      <p style="margin:6px 0 0; color:rgba(255,255,255,0.85);
                                 font-size:14px;">Hệ thống Todo App</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 36px 40px;">
                      <h2 style="margin:0 0 12px; color:#1a1a2e; font-size:20px;">
                        📦 Thông tin backup
                      </h2>
                      <p style="margin:0 0 24px; color:#555; font-size:15px; line-height:1.7;">
                        Backup database đã được thực hiện và upload lên Google Drive thành công.
                      </p>

                      <!-- Info Card -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background:#f8f9fa; border:1px solid #e9ecef;
                               border-radius:8px; margin-bottom:28px;">
                        <tr>
                          <td style="padding:20px;">
                            <p style="margin:0 0 8px; color:#888; font-size:13px;
                                      text-transform:uppercase; letter-spacing:1px;">
                              Tên file
                            </p>
                            <p style="margin:0; color:#333; font-size:16px; font-weight:bold;">
                              ${filename}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 20px 20px;">
                            <p style="margin:0 0 8px; color:#888; font-size:13px;
                                      text-transform:uppercase; letter-spacing:1px;">
                              Thời gian
                            </p>
                            <p style="margin:0; color:#333; font-size:16px; font-weight:bold;">
                              ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" })}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0; color:#aaa; font-size:13px; text-align:center;">
                        Đây là email tự động từ hệ thống, vui lòng không trả lời.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9f9f9; padding:20px 40px;
                               text-align:center; border-top:1px solid #eee;">
                      <p style="margin:0; color:#bbb; font-size:12px;">
                        © ${new Date().getFullYear()} F8 – Fullstack.edu.vn · All rights reserved
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const info = await transporter.sendMail({
        from: '"F8" <thangdmf8@fullstack.edu.vn>',
        to: email,
        subject: subject,
        html: html,
      });
      return info;
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();

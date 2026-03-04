const path = require("path");

require("module-alias").addAliases({
  "@": path.join(__dirname, "src"),
});

require("dotenv").config();
require("@/config/database");

const { CronJob } = require("cron");

const dailyReport = require("@/schedules/dailyReport");
const backupDB = require("@/schedules/backupDB");
const cleanupExpiredTokens = require("@/schedules/cleanupExpiredTokens");

// Daily report: 2h sáng mỗi ngày

// new CronJob("0 0 2 * * *", dailyReport, null, true);
new CronJob("*/5 * * * * *", dailyReport, null, true);

// Backup DB: 3h sáng mỗi ngày

new CronJob("0 0 3 * * *", backupDB, null, true);

// Cleanup expired tokens: 1h sáng mỗi ngày

new CronJob("0 0 1 * * *", cleanupExpiredTokens, null, true);

const http = require("http");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const { autoExpirePlans } = require("./api/v1/cron/autoExpiredPlan");
const port = config.port || 7000;
const server = http.createServer(app);
const cron = require("node-cron");

// auto expire plans in very 10 minutes
// cron.schedule("*/10 * * * *", async () => {
//   console.log("[CRON] Running autoExpirePlans...");
//   await autoExpirePlans();
// });

//-------------------------------
//start server
// TODO: check server connection, do not remove console logs in this file
const serverConnected = server.listen(port, async () => {
  logger.info(`Server is running on port ${port}`);
});

//--------------------------------------------------------------------
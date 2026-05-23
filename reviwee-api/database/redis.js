const redis = require("redis");
const logger = require("../config/logger");

const clientConfig = {
  socket: {
    host: process.env.REDIS_HOST || "reviwee-redis",
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
};

if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== "") {
  clientConfig.password = process.env.REDIS_PASSWORD;
}

const redisClient = redis.createClient(clientConfig);

redisClient.connect();

redisClient.on("connect", function () {
  logger.info("Redis client connected");
});

redisClient.on("error", function (error) {
  logger.info("Redis Error Encountered: ", error);
});

module.exports = redisClient;
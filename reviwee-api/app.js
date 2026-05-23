const express = require("express");
const app = express();
const helmet = require("helmet");
var cors = require("cors");
require("express-async-errors");
const httpStatus = require("http-status");
const morgan = require("./config/morgan");
const config = require("./config/config");
const logger = require("./config/logger");
const routes = require("./api/v1/Route");
const { errorConverter, errorHandler } = require("./middleware/error");

require("./database/mongo");
require("./database/redis");

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-access-token", "device-id", "device-type", "timezone", "lang"],
  credentials: false
}));

app.use(helmet({
  crossOriginResourcePolicy: false
}));

if (config.mode !== "development") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!", 
    status: true 
  });
});

app.use(`/v1`, routes); // yeh already hai

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/public", express.static(__dirname + "/public"));
app.use(`/v1`, routes);

app.use((req, res) => {
  logger.info("Invalid url requested. It may be because of versioning. Please check.");
  return res.status(httpStatus.NOT_FOUND).send({
    message: "Page Not found",
    status: false,
    code: "PAGE_NOT_FOUND",
    issue: "INVALID_REQUEST_ROUTE",
    data: null,
  });
});

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
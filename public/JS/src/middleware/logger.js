const pino = require("pino-http");

const logger = pino({
  transport: {
    target: "pino-pretty"
  }
});

module.exports = logger;
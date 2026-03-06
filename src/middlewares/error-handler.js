const { error: errorResponse } = require("../utils/response");

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";
  const isDev = process.env.NODE_ENV === "development";

  console.error(`[${new Date().toISOString()}] ${status} - ${message}`, err);

  errorResponse(res, message, status);
}

module.exports = errorHandler;

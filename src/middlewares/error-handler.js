function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV === "development";

  res.status(status).json({
    success: false,
    error: err.message || "Error interno del servidor",
    ...(isDev && { stack: err.stack })
  });
}

module.exports = errorHandler;

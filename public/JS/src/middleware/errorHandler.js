export const errorHandler = (err, req, res, next) => {

  const isDev = process.env.NODE_ENV === "development";

  console.error({
    message: err.message,
    stack: err.stack
  });

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Error interno",
    ...(isDev && { stack: err.stack })
  });
};
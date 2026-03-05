const AppError = require("../errors/AppError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(
      new AppError(
        "Datos inválidos",
        400,
        "VALIDATION_ERROR"
      )
    );
  }

  req.body = result.data;
  next();
};

module.exports = validate;
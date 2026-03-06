/**
 * Clases de errores personalizados
 */

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ForbiddenError
};

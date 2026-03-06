/**
 * Utilidades para respuestas estandarizadas de la API
 */

/**
 * Respuesta exitosa
 */
function success(res, data, message = null, status = 200) {
  return res.status(status).json({
    ok: true,
    message,
    data
  });
}

/**
 * Respuesta de error
 */
function error(res, errorMessage, status = 400) {
  return res.status(status).json({
    ok: false,
    error: errorMessage
  });
}

/**
 * Respuesta paginada
 */
function paginated(res, data, pagination, message = null, status = 200) {
  return res.status(status).json({
    ok: true,
    message,
    data,
    pagination
  });
}

/**
 * Respuesta de error de validación
 */
function validation(res, errors) {
  return res.status(400).json({
    ok: false,
    error: "Error de validación",
    details: errors
  });
}

/**
 * Respuesta no autorizada
 */
function unauthorized(res, message = "No autorizado") {
  return res.status(401).json({
    ok: false,
    error: message
  });
}

/**
 * Respuesta no encontrado
 */
function notFound(res, message = "Recurso no encontrado") {
  return res.status(404).json({
    ok: false,
    error: message
  });
}

/**
 * Respuesta conflicto
 */
function conflict(res, message = "Conflicto") {
  return res.status(409).json({
    ok: false,
    error: message
  });
}

module.exports = {
  success,
  error,
  paginated,
  validation,
  unauthorized,
  notFound,
  conflict
};

/**
 * Middleware de Autenticación - Proteger rutas con JWT
 */

const authService = require("../services/auth.service");
const { unauthorized } = require("../utils/response");
const { UnauthorizedError } = require("../utils/errors");

/**
 * Middleware para verificar JWT
 */
function verificarAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return unauthorized(res, "Token no proporcionado");
    }

    const token = authService.extraerToken(authHeader);

    if (!token) {
      return unauthorized(res, "Formato de token inválido");
    }

    // Verificar token
    const decoded = authService.verificarToken(token);

    // Agregar usuario al request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized(res, error.message);
    }

    return unauthorized(res, error.message || "Error de autenticación");
  }
}

/**
 * Middleware para verificar que es admin
 */
function verificarAdmin(req, res, next) {
  if (!req.user) {
    return unauthorized(res, "Usuario no autenticado");
  }

  if (req.user.rol !== "admin") {
    return res.status(403).json({
      ok: false,
      error: "Acceso denegado. Se requiere rol de administrador"
    });
  }

  next();
}

/**
 * Middleware para verificar que es el usuario propietario del recurso (para cambiar contraseña, perfil, etc)
 */
function verificarPropietario(req, res, next) {
  if (!req.user) {
    return unauthorized(res, "Usuario no autenticado");
  }

  // El ID del usuario que se quiere modificar está en req.params.id o req.body.id
  const idAModificar = req.params.id || req.body.id;

  if (Number(req.user.id) !== Number(idAModificar)) {
    return res.status(403).json({
      ok: false,
      error: "No tienes permiso para modificar este recurso"
    });
  }

  next();
}

module.exports = {
  verificarAuth,
  verificarAdmin,
  verificarPropietario
};

/**
 * Servicio de Autenticación - JWT y tokens
 */

const jwt = require("jsonwebtoken");
const usuariosService = require("./usuarios.service");
const { UnauthorizedError, ValidationError } = require("../utils/errors");

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_super_segura_12345";
const JWT_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES || process.env.JWT_EXPIRES || "24h";
const revokedTokens = new Map();

function cleanupRevokedTokens() {
  const nowSec = Math.floor(Date.now() / 1000);
  for (const [token, exp] of revokedTokens.entries()) {
    if (!exp || exp <= nowSec) {
      revokedTokens.delete(token);
    }
  }
}

/**
 * Generar JWT token
 */
function generarToken(usuarioId, email, rol) {
  return jwt.sign(
    {
      id: usuarioId,
      email,
      rol
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verificar JWT token
 */
function verificarToken(token) {
  cleanupRevokedTokens();

  if (revokedTokens.has(token)) {
    throw new UnauthorizedError("Sesion cerrada. Inicia sesion nuevamente");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new UnauthorizedError("Token inválido o expirado");
  }
}

function revocarToken(token) {
  if (!token) return;

  try {
    const decoded = jwt.decode(token);
    const exp = decoded && decoded.exp ? Number(decoded.exp) : null;
    revokedTokens.set(token, exp);
    cleanupRevokedTokens();
  } catch {
    revokedTokens.set(token, null);
  }
}

/**
 * Extraer token del header Authorization
 */
function extraerToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Login: verificar credenciales y generar token
 */
async function login(email, password) {
  if (!email || !password) {
    throw new ValidationError("Email y contraseña son obligatorios");
  }

  // Validar credenciales
  let usuario;
  try {
    usuario = await usuariosService.validarPassword(email, password);
  } catch (error) {
    throw new UnauthorizedError("Email o contraseña incorrectos");
  }

  // Generar token
  const token = generarToken(usuario.id_usuario, usuario.email, usuario.rol);

  return {
    token,
    usuario
  };
}

/**
 * Refresh token (opcional)
 */
function refreshToken(usuarioId, email, rol) {
  return generarToken(usuarioId, email, rol);
}

module.exports = {
  generarToken,
  verificarToken,
  extraerToken,
  login,
  refreshToken,
  revocarToken
};

/**
 * Servicio de Usuarios - Gestión de usuarios
 */

const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { NotFoundError, ConflictError, ValidationError } = require("../utils/errors");

/**
 * Obtener usuario por email
 */
async function obtenerPorEmail(email) {
  if (!email) throw new ValidationError("Email es obligatorio");

  const result = await pool.query(
    "SELECT id_usuario, nombre_completo, email, rol FROM usuarios WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Obtener usuario por ID
 */
async function obtenerPorId(id) {
  if (!id || id <= 0) throw new ValidationError("ID de usuario inválido");

  const result = await pool.query(
    "SELECT id_usuario, nombre_completo, email, telefono, foto_perfil, rol, fecha_registro FROM usuarios WHERE id_usuario = $1",
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Usuario no encontrado");
  }

  return result.rows[0];
}

/**
 * Crear nuevo usuario
 */
async function crear(nombre_completo, email, password) {
  if (!nombre_completo || nombre_completo.trim().length < 2) {
    throw new ValidationError("Nombre debe tener al menos 2 caracteres");
  }

  if (!email || !email.includes("@")) {
    throw new ValidationError("Email inválido");
  }

  if (!password || password.length < 8) {
    throw new ValidationError("Contraseña debe tener al menos 8 caracteres");
  }

  // Verificar que el email no exista
  const existing = await obtenerPorEmail(email);
  if (existing) {
    throw new ConflictError("El email ya está registrado");
  }

  // Hashear contraseña
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO usuarios (nombre_completo, email, password_hash, rol)
     VALUES ($1, $2, $3, 'cliente')
     RETURNING id_usuario, nombre_completo, email, rol, fecha_registro`,
    [nombre_completo, email, passwordHash]
  );

  return result.rows[0];
}

/**
 * Validar contraseña (para login)
 */
async function validarPassword(email, password) {
  const result = await pool.query(
    "SELECT id_usuario, nombre_completo, email, password_hash, rol FROM usuarios WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const usuario = result.rows[0];
  const esValida = await bcrypt.compare(password, usuario.password_hash);

  if (!esValida) {
    throw new ValidationError("Contraseña incorrecta");
  }

  // Devolver sin password_hash
  const { password_hash, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
}

/**
 * Actualizar contraseña
 */
async function actualizarPassword(idUsuario, passwordActual, passwordNueva) {
  if (!idUsuario || idUsuario <= 0) {
    throw new ValidationError("ID de usuario inválido");
  }

  if (!passwordNueva || passwordNueva.length < 8) {
    throw new ValidationError("Contraseña nueva debe tener al menos 8 caracteres");
  }

  // Obtener usuario con hash actual
  const result = await pool.query(
    "SELECT password_hash FROM usuarios WHERE id_usuario = $1",
    [idUsuario]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Usuario no encontrado");
  }

  // Validar contraseña actual
  const esValida = await bcrypt.compare(passwordActual, result.rows[0].password_hash);
  if (!esValida) {
    throw new ValidationError("Contraseña actual incorrecta");
  }

  // Hashear nueva contraseña
  const passwordHash = await bcrypt.hash(passwordNueva, 10);

  await pool.query(
    "UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2",
    [passwordHash, idUsuario]
  );

  return { message: "Contraseña actualizada exitosamente" };
}

/**
 * Actualizar perfil
 */
async function actualizarPerfil(idUsuario, datos) {
  if (!idUsuario || idUsuario <= 0) {
    throw new ValidationError("ID de usuario inválido");
  }

  const { nombre_completo, telefono, foto_perfil } = datos;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (nombre_completo !== undefined) {
    updates.push(`nombre_completo = $${paramCount}`);
    values.push(nombre_completo);
    paramCount++;
  }

  if (telefono !== undefined) {
    updates.push(`telefono = $${paramCount}`);
    values.push(telefono);
    paramCount++;
  }

  if (foto_perfil !== undefined) {
    updates.push(`foto_perfil = $${paramCount}`);
    values.push(foto_perfil);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new ValidationError("Ningún campo para actualizar");
  }

  values.push(idUsuario);

  const result = await pool.query(
    `UPDATE usuarios SET ${updates.join(", ")} WHERE id_usuario = $${paramCount}
     RETURNING id_usuario, nombre_completo, email, telefono, foto_perfil, rol`,
    values
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Usuario no encontrado");
  }

  return result.rows[0];
}

module.exports = {
  obtenerPorEmail,
  obtenerPorId,
  crear,
  validarPassword,
  actualizarPassword,
  actualizarPerfil
};

/**
 * Servicio de Métodos de Pago - Gestión de tarjetas y paypal
 */

const pool = require("../config/db");
const { NotFoundError, ValidationError } = require("../utils/errors");

/**
 * Obtener métodos de pago del usuario
 */
async function obtenerPorUsuario(idUsuario) {
  if (!idUsuario || idUsuario <= 0) {
    throw new ValidationError("ID de usuario inválido");
  }

  const result = await pool.query(
    `SELECT id_metodo, tipo, last_four, es_principal
     FROM metodos_pago
     WHERE id_usuario = $1
     ORDER BY es_principal DESC, id_metodo`,
    [idUsuario]
  );

  return result.rows;
}

/**
 * Crear método de pago
 */
async function crear(idUsuario, datos) {
  if (!idUsuario || idUsuario <= 0) {
    throw new ValidationError("ID de usuario inválido");
  }

  const { tipo, token_pago, last_four, es_principal } = datos;

  if (!tipo || !["tarjeta", "paypal"].includes(tipo)) {
    throw new ValidationError("Tipo de método de pago inválido (tarjeta|paypal)");
  }

  if (!token_pago || token_pago.trim() === "") {
    throw new ValidationError("Token de pago es obligatorio");
  }

  // last_four es opcional
  const lastFour = last_four ? String(last_four).trim().slice(-4) : null;

  const result = await pool.query(
    `INSERT INTO metodos_pago (id_usuario, tipo, token_pago, last_four, es_principal)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_metodo, tipo, last_four, es_principal`,
    [idUsuario, tipo, token_pago, lastFour, es_principal || false]
  );

  return result.rows[0];
}

/**
 * Actualizar método de pago
 */
async function actualizar(idMetodo, idUsuario, datos) {
  if (!idMetodo || idMetodo <= 0) {
    throw new ValidationError("ID de método de pago inválido");
  }

  // Verificar que pertenece al usuario
  const existente = await pool.query(
    "SELECT id_metodo FROM metodos_pago WHERE id_metodo = $1 AND id_usuario = $2",
    [idMetodo, idUsuario]
  );

  if (existente.rows.length === 0) {
    throw new NotFoundError("Método de pago no encontrado");
  }

  const { es_principal } = datos;

  if (es_principal !== undefined) {
    // Si se marca como principal, desmarcar los demás
    if (es_principal) {
      await pool.query(
        "UPDATE metodos_pago SET es_principal = false WHERE id_usuario = $1 AND id_metodo != $2",
        [idUsuario, idMetodo]
      );
    }
  }

  const result = await pool.query(
    `UPDATE metodos_pago SET es_principal = $1 WHERE id_metodo = $2
     RETURNING id_metodo, tipo, last_four, es_principal`,
    [es_principal !== undefined ? es_principal : true, idMetodo]
  );

  return result.rows[0];
}

/**
 * Eliminar método de pago
 */
async function eliminar(idMetodo, idUsuario) {
  if (!idMetodo || idMetodo <= 0) {
    throw new ValidationError("ID de método de pago inválido");
  }

  // Verificar que pertenece al usuario
  const existente = await pool.query(
    "SELECT id_metodo FROM metodos_pago WHERE id_metodo = $1 AND id_usuario = $2",
    [idMetodo, idUsuario]
  );

  if (existente.rows.length === 0) {
    throw new NotFoundError("Método de pago no encontrado");
  }

  await pool.query("DELETE FROM metodos_pago WHERE id_metodo = $1", [idMetodo]);

  return { message: "Método de pago eliminado" };
}

module.exports = {
  obtenerPorUsuario,
  crear,
  actualizar,
  eliminar
};

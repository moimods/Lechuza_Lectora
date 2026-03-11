/**
 * Servicio de Direcciones - Gestión de domicilios
 */

const pool = require("../config/db");
const { NotFoundError, ValidationError } = require("../utils/errors");

/**
 * Obtener direcciones del usuario
 */
async function obtenerPorUsuario(idUsuario) {
  if (!idUsuario || idUsuario <= 0) {
    throw new ValidationError("ID de usuario inválido");
  }

  const result = await pool.query(
    `SELECT id_direccion, calle_numero, colonia, codigo_postal, ciudad_estado, es_principal
     FROM direcciones
     WHERE id_usuario = $1
     ORDER BY es_principal DESC, id_direccion`,
    [idUsuario]
  );

  return result.rows;
}

/**
 * Crear dirección
 */
async function crear(idUsuario, datos) {
  if (!idUsuario || idUsuario <= 0) {
    throw new ValidationError("ID de usuario inválido");
  }

  const { calle_numero, colonia, codigo_postal, ciudad_estado, es_principal } = datos;

  if (!calle_numero || calle_numero.trim() === "") {
    throw new ValidationError("Calle y número son obligatorios");
  }

  if (!ciudad_estado || ciudad_estado.trim() === "") {
    throw new ValidationError("Ciudad/estado es obligatorio");
  }

  if (!codigo_postal || codigo_postal.trim() === "") {
    throw new ValidationError("Código postal es obligatorio");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const countResult = await client.query(
      "SELECT COUNT(*)::int AS total FROM direcciones WHERE id_usuario = $1",
      [idUsuario]
    );
    const totalDirecciones = Number(countResult.rows[0]?.total || 0);

    // Si es la primera dirección del usuario, forzamos principal.
    let principalFinal = Boolean(es_principal);
    if (totalDirecciones === 0) {
      principalFinal = true;
    }

    // Si la nueva dirección será principal, desmarcamos las anteriores.
    if (principalFinal) {
      await client.query(
        "UPDATE direcciones SET es_principal = FALSE WHERE id_usuario = $1 AND es_principal = TRUE",
        [idUsuario]
      );
    }

    const result = await client.query(
      `INSERT INTO direcciones (id_usuario, calle_numero, colonia, codigo_postal, ciudad_estado, es_principal)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_direccion, calle_numero, colonia, codigo_postal, ciudad_estado, es_principal`,
      [idUsuario, calle_numero, colonia || null, codigo_postal, ciudad_estado, principalFinal]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Actualizar dirección
 */
async function actualizar(idDireccion, idUsuario, datos) {
  if (!idDireccion || idDireccion <= 0) {
    throw new ValidationError("ID de dirección inválido");
  }

  // Verificar que pertenece al usuario
  const existente = await pool.query(
    "SELECT id_direccion FROM direcciones WHERE id_direccion = $1 AND id_usuario = $2",
    [idDireccion, idUsuario]
  );

  if (existente.rows.length === 0) {
    throw new NotFoundError("Dirección no encontrada");
  }

  const { calle_numero, colonia, codigo_postal, ciudad_estado, es_principal } = datos;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (calle_numero !== undefined) {
    updates.push(`calle_numero = $${paramCount}`);
    values.push(calle_numero);
    paramCount++;
  }

  if (colonia !== undefined) {
    updates.push(`colonia = $${paramCount}`);
    values.push(colonia);
    paramCount++;
  }

  if (codigo_postal !== undefined) {
    updates.push(`codigo_postal = $${paramCount}`);
    values.push(codigo_postal);
    paramCount++;
  }

  if (ciudad_estado !== undefined) {
    updates.push(`ciudad_estado = $${paramCount}`);
    values.push(ciudad_estado);
    paramCount++;
  }

  if (es_principal !== undefined) {
    updates.push(`es_principal = $${paramCount}`);
    values.push(es_principal);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new ValidationError("Ningún campo para actualizar");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Si esta dirección se marca como principal, desmarcamos las demás del usuario.
    if (es_principal === true) {
      await client.query(
        "UPDATE direcciones SET es_principal = FALSE WHERE id_usuario = $1 AND id_direccion <> $2 AND es_principal = TRUE",
        [idUsuario, idDireccion]
      );
    }

    values.push(idDireccion);

    const result = await client.query(
      `UPDATE direcciones SET ${updates.join(", ")} WHERE id_direccion = $${paramCount}
       RETURNING id_direccion, calle_numero, colonia, codigo_postal, ciudad_estado, es_principal`,
      values
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Eliminar dirección
 */
async function eliminar(idDireccion, idUsuario) {
  if (!idDireccion || idDireccion <= 0) {
    throw new ValidationError("ID de dirección inválido");
  }

  // Verificar que pertenece al usuario
  const existente = await pool.query(
    "SELECT id_direccion FROM direcciones WHERE id_direccion = $1 AND id_usuario = $2",
    [idDireccion, idUsuario]
  );

  if (existente.rows.length === 0) {
    throw new NotFoundError("Dirección no encontrada");
  }

  await pool.query("DELETE FROM direcciones WHERE id_direccion = $1", [idDireccion]);

  return { message: "Dirección eliminada" };
}

module.exports = {
  obtenerPorUsuario,
  crear,
  actualizar,
  eliminar
};

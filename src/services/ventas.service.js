/**
 * Servicio de Ventas - Gestión de ventas y pedidos
 */

const pool = require("../config/db");
const { ValidationError, NotFoundError } = require("../utils/errors");
const carritoService = require("./carrito.service");
const productosService = require("./productos.service");

/**
 * Registrar una venta (pedido)
 */
async function registrarVenta(idUsuario, datos) {
  if (!idUsuario || idUsuario <= 0) {
    throw new ValidationError("Usuario inválido");
  }

  const {
    items = [],
    id_direccion = null,
    id_metodo_pago = null,
    estado = "completado"
  } = datos;

  // Validar carrito
  const carritoValidado = await carritoService.validarItems(items);

  // Iniciar transacción
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insertar venta
    const ventaResult = await client.query(
      `INSERT INTO ventas (id_usuario, id_direccion, id_metodo_pago, total, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_venta, id_usuario, total, estado, fecha_venta`,
      [idUsuario, id_direccion, id_metodo_pago, carritoValidado.total, estado]
    );

    const venta = ventaResult.rows[0];

    // Insertar detalles de venta y actualizar stock
    for (const item of carritoValidado.items) {
      // Insertar detalle
      await client.query(
        `INSERT INTO detalles_ventas (id_venta, id_producto, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [venta.id_venta, item.id_producto, item.cantidad, item.precio_unitario]
      );

      // Reducir stock
      await client.query(
        `UPDATE productos SET stock = stock - $1 WHERE id_producto = $2`,
        [item.cantidad, item.id_producto]
      );
    }

    await client.query("COMMIT");

    return {
      id_venta: venta.id_venta,
      id_usuario: venta.id_usuario,
      total: venta.total,
      estado: venta.estado,
      fecha_venta: venta.fecha_venta,
      items: carritoValidado.items
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Obtener venta por ID
 */
async function obtenerPorId(idVenta) {
  if (!idVenta || idVenta <= 0) {
    throw new ValidationError("ID de venta inválido");
  }

  const ventaResult = await pool.query(
    `SELECT id_venta, id_usuario, id_direccion, id_metodo_pago, total, estado, fecha_venta
     FROM ventas WHERE id_venta = $1`,
    [idVenta]
  );

  if (ventaResult.rows.length === 0) {
    throw new NotFoundError("Venta no encontrada");
  }

  const venta = ventaResult.rows[0];

  // Obtener detalles
  const detallesResult = await pool.query(
    `SELECT dv.id_detalle, dv.id_producto, p.titulo, dv.cantidad, dv.precio_unitario, dv.subtotal_item
     FROM detalles_ventas dv
     JOIN productos p ON p.id_producto = dv.id_producto
     WHERE dv.id_venta = $1`,
    [idVenta]
  );

  return {
    ...venta,
    items: detallesResult.rows
  };
}

/**
 * Obtener ventas del usuario
 */
async function obtenerPorUsuario(idUsuario, page = 1, limit = 10) {
  if (!idUsuario || idUsuario <= 0) {
    throw new ValidationError("ID de usuario inválido");
  }

  page = Math.max(1, Number(page));
  limit = Math.max(1, Number(limit));
  const offset = (page - 1) * limit;

  const totalResult = await pool.query(
    "SELECT COUNT(*)::int AS total FROM ventas WHERE id_usuario = $1",
    [idUsuario]
  );
  const total = totalResult.rows[0].total;

  const ventasResult = await pool.query(
    `SELECT id_venta, id_usuario, total, estado, fecha_venta
     FROM ventas WHERE id_usuario = $1
     ORDER BY fecha_venta DESC
     LIMIT $2 OFFSET $3`,
    [idUsuario, limit, offset]
  );

  return {
    data: ventasResult.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

/**
 * Actualizar estado de venta
 */
async function actualizarEstado(idVenta, nuevoEstado) {
  if (!idVenta || idVenta <= 0) {
    throw new ValidationError("ID de venta inválido");
  }

  const estadosValidos = ["pendiente", "completado", "enviado", "entregado", "cancelado"];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new ValidationError(`Estado inválido. Opciones: ${estadosValidos.join(", ")}`);
  }

  // Verificar que existe
  await obtenerPorId(idVenta);

  const result = await pool.query(
    `UPDATE ventas SET estado = $1 WHERE id_venta = $2
     RETURNING id_venta, estado, fecha_venta`,
    [nuevoEstado, idVenta]
  );

  return result.rows[0];
}

/**
 * Obtener estadísticas de ventas
 */
async function obtenerEstadisticas() {
  const ventasResult = await pool.query(
    `SELECT
      COUNT(*)::int AS total_ventas,
      SUM(total)::decimal AS total_ingresos,
      AVG(total)::decimal AS promedio_venta
     FROM ventas WHERE estado = 'completado'`
  );

  const productosResult = await pool.query(
    "SELECT COUNT(*)::int AS total_productos FROM productos"
  );

  const usuariosResult = await pool.query(
    "SELECT COUNT(*)::int AS total_usuarios FROM usuarios WHERE rol = 'cliente'"
  );

  return {
    ventas: ventasResult.rows[0],
    productos: productosResult.rows[0],
    usuarios: usuariosResult.rows[0]
  };
}

module.exports = {
  registrarVenta,
  obtenerPorId,
  obtenerPorUsuario,
  actualizarEstado,
  obtenerEstadisticas
};

const ventasService = require("../services/ventas.service");
const productosService = require("../services/productos.service");
const { success } = require("../utils/response");

/**
 * Obtener estadísticas del dashboard
 */
async function estadisticas(req, res, next) {
  try {
    const stats = await ventasService.obtenerEstadisticas();

    return success(res, stats, null, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener lista de pedidos (para admin)
 */
async function pedidos(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;

    // Como no tenemos un método directo para obtener todos los pedidos,
    // podemos usar una query personalizada
    const pool = require("../config/db");

    page = Math.max(1, Number(page));
    limit = Math.max(1, Number(limit));
    const offset = (page - 1) * limit;

    const totalResult = await pool.query("SELECT COUNT(*)::int AS total FROM ventas");
    const total = totalResult.rows[0].total;

    const pedidosResult = await pool.query(
      `SELECT
        v.id_venta,
        v.id_usuario,
        u.nombre_completo,
        u.email,
        v.total,
        v.estado,
        v.fecha_venta
      FROM ventas v
      JOIN usuarios u ON u.id_usuario = v.id_usuario
      ORDER BY v.fecha_venta DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return success(res, {
      data: pedidosResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }, null, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  estadisticas,
  pedidos
};

const ventasService = require("../services/ventas.service");
const { success, paginated, error } = require("../utils/response");

/**
 * Registrar una venta (checkout)
 */
async function registrarVenta(req, res, next) {
  try {
    const idUsuario = req.user.id;
    const { items, id_direccion, id_metodo_pago } = req.body;

    const venta = await ventasService.registrarVenta(idUsuario, {
      items,
      id_direccion,
      id_metodo_pago,
      estado: "completado"
    });

    return success(res, venta, "Venta registrada exitosamente", 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener venta por ID
 */
async function obtenerVenta(req, res, next) {
  try {
    const { id } = req.params;

    const venta = await ventasService.obtenerPorId(id);

    // Verificar que el usuario sea propietario
    if (venta.id_usuario !== req.user.id && req.user.rol !== "admin") {
      return error(res, "No tienes permiso para ver esta venta", 403);
    }

    return success(res, venta, null, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener ventas del usuario
 */
async function obtenerVentasUsuario(req, res, next) {
  try {
    const idUsuario = req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const resultado = await ventasService.obtenerPorUsuario(idUsuario, page, limit);

    return paginated(res, resultado.data, resultado.pagination, null, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener todas las ventas (admin)
 */
async function obtenerVentas(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const resultado = await ventasService.obtenerTodas(page, limit);

    return paginated(res, resultado.data, resultado.pagination, null, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar estado de venta (admin)
 */
async function actualizarEstado(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return error(res, "Estado es obligatorio", 400);
    }

    const venta = await ventasService.actualizarEstado(id, estado);

    return success(res, venta, "Estado de venta actualizado", 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener estadísticas de ventas (admin)
 */
async function obtenerEstadisticas(req, res, next) {
  try {
    const estadisticas = await ventasService.obtenerEstadisticas();

    return success(res, estadisticas, null, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registrarVenta,
  obtenerVenta,
  obtenerVentas,
  obtenerVentasUsuario,
  actualizarEstado,
  obtenerEstadisticas
};

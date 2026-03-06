/**
 * Controlador de Usuario - Perfil y gestión personal
 */

const usuariosService = require("../services/usuarios.service");
const direccionesService = require("../services/direcciones.service");
const metodosPagoService = require("../services/metodos_pago.service");
const { success } = require("../utils/response");

/**
 * Obtener perfil del usuario actual
 */
async function obtenerPerfil(req, res, next) {
  try {
    const usuario = await usuariosService.obtenerPorId(req.user.id);

    return success(res, usuario, null, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar perfil del usuario
 */
async function actualizarPerfil(req, res, next) {
  try {
    const usuario = await usuariosService.actualizarPerfil(req.user.id, req.body);

    return success(res, usuario, "Perfil actualizado exitosamente", 200);
  } catch (err) {
    next(err);
  }
}

/**
 * DIRECCIONES
 */

async function obtenerDirecciones(req, res, next) {
  try {
    const direcciones = await direccionesService.obtenerPorUsuario(req.user.id);

    return success(res, direcciones, null, 200);
  } catch (err) {
    next(err);
  }
}

async function crearDireccion(req, res, next) {
  try {
    const direccion = await direccionesService.crear(req.user.id, req.body);

    return success(res, direccion, "Dirección creada exitosamente", 201);
  } catch (err) {
    next(err);
  }
}

async function actualizarDireccion(req, res, next) {
  try {
    const { id } = req.params;

    const direccion = await direccionesService.actualizar(id, req.user.id, req.body);

    return success(res, direccion, "Dirección actualizada exitosamente", 200);
  } catch (err) {
    next(err);
  }
}

async function eliminarDireccion(req, res, next) {
  try {
    const { id } = req.params;

    const resultado = await direccionesService.eliminar(id, req.user.id);

    return success(res, null, resultado.message, 200);
  } catch (err) {
    next(err);
  }
}

/**
 * MÉTODOS DE PAGO
 */

async function obtenerMetodosPago(req, res, next) {
  try {
    const metodos = await metodosPagoService.obtenerPorUsuario(req.user.id);

    return success(res, metodos, null, 200);
  } catch (err) {
    next(err);
  }
}

async function crearMetodoPago(req, res, next) {
  try {
    const metodo = await metodosPagoService.crear(req.user.id, req.body);

    return success(res, metodo, "Método de pago agregado exitosamente", 201);
  } catch (err) {
    next(err);
  }
}

async function actualizarMetodoPago(req, res, next) {
  try {
    const { id } = req.params;

    const metodo = await metodosPagoService.actualizar(id, req.user.id, req.body);

    return success(res, metodo, "Método de pago actualizado exitosamente", 200);
  } catch (err) {
    next(err);
  }
}

async function eliminarMetodoPago(req, res, next) {
  try {
    const { id } = req.params;

    const resultado = await metodosPagoService.eliminar(id, req.user.id);

    return success(res, null, resultado.message, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  obtenerDirecciones,
  crearDireccion,
  actualizarDireccion,
  eliminarDireccion,
  obtenerMetodosPago,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago
};

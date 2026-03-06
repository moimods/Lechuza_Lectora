/**
 * Servicio de Carrito - Gestión del carrito de compras
 * Nota: El carrito se maneja en sesión/localStorage en el frontend
 * Este servicio es para operaciones de servidor si se requiere
 */

const pool = require("../config/db");
const { ValidationError, NotFoundError } = require("../utils/errors");
const productosService = require("./productos.service");

/**
 * Validar items del carrito antes de checkout
 */
async function validarItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("Carrito vacío");
  }

  const itemsValidados = [];
  let totalPrecio = 0;

  for (const item of items) {
    const { id_producto, cantidad } = item;

    if (!id_producto || !cantidad) {
      throw new ValidationError("Item debe tener id_producto y cantidad");
    }

    if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 1) {
      throw new ValidationError(`Cantidad inválida para producto ${id_producto}`);
    }

    // Obtener producto para validar stock y precio
    const producto = await productosService.obtenerPorId(id_producto);

    if (producto.stock < cantidad) {
      throw new ValidationError(
        `Stock insuficiente para ${producto.titulo}. Disponible: ${producto.stock}`
      );
    }

    const subtotal = producto.precio * cantidad;
    itemsValidados.push({
      id_producto,
      titulo: producto.titulo,
      precio_unitario: producto.precio,
      cantidad: Number(cantidad),
      subtotal
    });

    totalPrecio += subtotal;
  }

  return {
    items: itemsValidados,
    total: parseFloat(totalPrecio.toFixed(2))
  };
}

/**
 * Calcular total del carrito
 */
function calcularTotal(items) {
  return items.reduce((total, item) => {
    const subtotal = (item.precio_unitario || item.precio) * item.cantidad;
    return total + subtotal;
  }, 0);
}

/**
 * Obtener carrito (desde sesión/BD si se implementa persistencia)
 */
function obtenerCarrito(sesionCarrito) {
  if (!Array.isArray(sesionCarrito)) {
    return { items: [], total: 0 };
  }

  const total = calcularTotal(sesionCarrito);
  return { items: sesionCarrito, total };
}

module.exports = {
  validarItems,
  calcularTotal,
  obtenerCarrito
};

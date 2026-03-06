const productosService = require("../services/productos.service");
const { success, paginated, error } = require("../utils/response");
const { validateProductInput } = require("../utils/validators");

async function obtenerProductos(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 12;

    const resultado = await productosService.obtenerTodos(page, limit);

    return paginated(res, resultado.data, resultado.pagination, null, 200);
  } catch (err) {
    next(err);
  }
}

async function obtenerCategorias(req, res, next) {
  try {
    const categorias = await productosService.obtenerCategorias();
    return success(res, categorias, null, 200);
  } catch (err) {
    next(err);
  }
}

async function crearProducto(req, res, next) {
  try {
    const { titulo, autor, precio, stock, categoria, id_categoria, imagen_url, descripcion } = req.body;

    // Validar
    const { isValid, errors } = validateProductInput(titulo, precio, stock);
    if (!isValid) {
      return error(res, errors.join(", "), 400);
    }

    const producto = await productosService.crear(req.body);

    return success(res, producto, "Producto creado exitosamente", 201);
  } catch (err) {
    next(err);
  }
}

async function actualizarProducto(req, res, next) {
  try {
    const { id } = req.params;

    const producto = await productosService.actualizar(id, req.body);

    return success(res, producto, "Producto actualizado exitosamente", 200);
  } catch (err) {
    next(err);
  }
}

async function eliminarProducto(req, res, next) {
  try {
    const { id } = req.params;

    const resultado = await productosService.eliminar(id);

    return success(res, null, resultado.message, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  obtenerProductos,
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};

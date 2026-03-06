/**
 * Servicio de Productos - Gestión de libros/productos
 */

const pool = require("../config/db");
const { NotFoundError, ValidationError } = require("../utils/errors");

/**
 * Resolver categoría (ID o nombre)
 */
async function resolveCategoryId(rawCategory) {
  if (!rawCategory) return null;

  // Si ya es ID
  if (Number.isInteger(rawCategory) || /^\d+$/.test(String(rawCategory))) {
    return Number(rawCategory);
  }

  // Si es nombre de categoría
  const categoryName = String(rawCategory).trim();
  if (!categoryName) return null;

  const existing = await pool.query(
    "SELECT id_categoria FROM categorias WHERE LOWER(nombre) = LOWER($1)",
    [categoryName]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id_categoria;
  }

  // Crear categoría si no existe
  const inserted = await pool.query(
    "INSERT INTO categorias (nombre) VALUES ($1) RETURNING id_categoria",
    [categoryName]
  );

  return inserted.rows[0].id_categoria;
}

/**
 * Obtener todos los productos con paginación
 */
async function obtenerTodos(page = 1, limit = 12) {
  page = Math.max(1, Number(page));
  limit = Math.max(1, Number(limit));
  const offset = (page - 1) * limit;

  const totalResult = await pool.query("SELECT COUNT(*)::int AS total FROM productos");
  const total = totalResult.rows[0].total;

  const result = await pool.query(
    `SELECT
      p.id_producto,
      p.titulo,
      p.autor,
      p.precio,
      p.stock,
      p.imagen_url,
      p.descripcion,
      p.id_categoria,
      c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
    ORDER BY p.id_producto
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    data: result.rows,
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
 * Obtener producto por ID
 */
async function obtenerPorId(id) {
  if (!Number.isInteger(Number(id)) || id <= 0) {
    throw new ValidationError("ID de producto inválido");
  }

  const result = await pool.query(
    `SELECT
      p.id_producto,
      p.titulo,
      p.autor,
      p.isbn,
      p.precio,
      p.stock,
      p.imagen_url,
      p.descripcion,
      p.id_categoria,
      c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
    WHERE p.id_producto = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Producto no encontrado");
  }

  return result.rows[0];
}

/**
 * Obtener todas las categorías
 */
async function obtenerCategorias() {
  const result = await pool.query(
    "SELECT id_categoria, nombre, descripcion FROM categorias ORDER BY nombre"
  );

  return result.rows;
}

/**
 * Crear producto
 */
async function crear(datos) {
  const { titulo, autor, precio, stock, categoria, id_categoria, imagen_url, descripcion, isbn } = datos;

  // Validar
  if (!titulo || String(titulo).trim() === "") {
    throw new ValidationError("Título es obligatorio");
  }

  if (isNaN(Number(precio)) || Number(precio) < 0) {
    throw new ValidationError("Precio debe ser un número positivo");
  }

  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    throw new ValidationError("Stock debe ser un número entero positivo");
  }

  const categoryId = await resolveCategoryId(id_categoria ?? categoria);

  const result = await pool.query(
    `INSERT INTO productos (
      id_categoria,
      titulo,
      autor,
      isbn,
      precio,
      stock,
      imagen_url,
      descripcion
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id_producto,
      id_categoria,
      titulo,
      autor,
      isbn,
      precio,
      stock,
      imagen_url,
      descripcion`,
    [
      categoryId,
      String(titulo).trim(),
      autor ? String(autor).trim() : null,
      isbn ? String(isbn).trim() : null,
      Number(precio),
      Number(stock),
      imagen_url ? String(imagen_url).trim() : null,
      descripcion ? String(descripcion).trim() : null
    ]
  );

  return result.rows[0];
}

/**
 * Actualizar producto
 */
async function actualizar(id, datos) {
  if (!Number.isInteger(Number(id)) || id <= 0) {
    throw new ValidationError("ID de producto inválido");
  }

  // Verificar que existe
  await obtenerPorId(id);

  const { titulo, autor, precio, stock, categoria, id_categoria, imagen_url, descripcion, isbn } = datos;

  const result = await pool.query("SELECT * FROM productos WHERE id_producto = $1", [id]);
  const current = result.rows[0];

  // Resolver categoría
  let categoryId = current.id_categoria;
  if (id_categoria !== undefined || categoria !== undefined) {
    categoryId = await resolveCategoryId(id_categoria ?? categoria);
  }

  const updated = await pool.query(
    `UPDATE productos SET
      id_categoria = $1,
      titulo = $2,
      autor = $3,
      isbn = $4,
      precio = $5,
      stock = $6,
      imagen_url = $7,
      descripcion = $8
    WHERE id_producto = $9
    RETURNING
      id_producto,
      id_categoria,
      titulo,
      autor,
      isbn,
      precio,
      stock,
      imagen_url,
      descripcion`,
    [
      categoryId,
      titulo !== undefined ? String(titulo).trim() : current.titulo,
      autor !== undefined ? String(autor).trim() : current.autor,
      isbn !== undefined ? String(isbn).trim() : current.isbn,
      precio !== undefined ? Number(precio) : current.precio,
      stock !== undefined ? Number(stock) : current.stock,
      imagen_url !== undefined ? String(imagen_url).trim() : current.imagen_url,
      descripcion !== undefined ? String(descripcion).trim() : current.descripcion,
      id
    ]
  );

  return updated.rows[0];
}

/**
 * Eliminar producto
 */
async function eliminar(id) {
  if (!Number.isInteger(Number(id)) || id <= 0) {
    throw new ValidationError("ID de producto inválido");
  }

  // Verificar que existe
  await obtenerPorId(id);

  await pool.query("DELETE FROM productos WHERE id_producto = $1", [id]);

  return { message: "Producto eliminado exitosamente" };
}

/**
 * Reducir stock de producto
 */
async function reducirStock(idProducto, cantidad) {
  if (!Number.isInteger(Number(idProducto)) || idProducto <= 0) {
    throw new ValidationError("ID de producto inválido");
  }

  if (!Number.isInteger(Number(cantidad)) || cantidad < 1) {
    throw new ValidationError("Cantidad debe ser un número entero positivo");
  }

  // Verificar stock disponible
  const producto = await obtenerPorId(idProducto);
  if (producto.stock < cantidad) {
    throw new ValidationError(`Stock insuficiente. Disponible: ${producto.stock}`);
  }

  const result = await pool.query(
    `UPDATE productos SET stock = stock - $1 WHERE id_producto = $2 RETURNING stock`,
    [cantidad, idProducto]
  );

  return result.rows[0];
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerCategorias,
  crear,
  actualizar,
  eliminar,
  reducirStock,
  resolveCategoryId
};

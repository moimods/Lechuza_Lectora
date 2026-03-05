const pool = require("../config/db");

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

async function resolveCategoryId(rawCategory) {
  if (!rawCategory) return null;

  if (Number.isInteger(rawCategory) || /^\d+$/.test(String(rawCategory))) {
    return Number(rawCategory);
  }

  const categoryName = String(rawCategory).trim();
  if (!categoryName) return null;

  const existing = await pool.query(
    "SELECT id_categoria FROM categorias WHERE LOWER(nombre) = LOWER($1) LIMIT 1",
    [categoryName]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id_categoria;
  }

  const inserted = await pool.query(
    "INSERT INTO categorias (nombre) VALUES ($1) RETURNING id_categoria",
    [categoryName]
  );

  return inserted.rows[0].id_categoria;
}

async function obtenerProductos(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const offset = (page - 1) * limit;

    try {
      const totalResult = await pool.query("SELECT COUNT(*)::int AS total FROM productos");
      const total = totalResult.rows[0].total;

      const result = await pool.query(
        `
          SELECT
            p.id_producto,
            p.titulo,
            p.autor,
            p.precio,
            p.stock,
            p.imagen_url,
            p.descripcion,
            p.id_categoria,
            c.nombre AS categoria
          FROM productos
          p
          LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
          ORDER BY p.id_producto
          LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );

      return res.json({
        success: true,
        data: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } catch {
      return res.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }
  } catch (error) {
    next(error);
  }
}

async function obtenerCategorias(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT id_categoria, nombre FROM categorias ORDER BY nombre"
    );

    res.json({
      success: true,
      data: normalizeList(result.rows)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerProductos,
  obtenerCategorias,
  async crearProducto(req, res, next) {
    try {
      const {
        titulo,
        autor,
        precio,
        stock,
        categoria,
        id_categoria,
        imagen_url,
        descripcion
      } = req.body || {};

      if (!titulo || String(titulo).trim() === "") {
        return res.status(400).json({ success: false, error: "El título es obligatorio" });
      }

      const categoryId = await resolveCategoryId(id_categoria ?? categoria);

      const insertResult = await pool.query(
        `
          INSERT INTO productos (
            id_categoria,
            titulo,
            autor,
            precio,
            stock,
            imagen_url,
            descripcion
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id_producto, id_categoria, titulo, autor, precio, stock, imagen_url, descripcion
        `,
        [
          categoryId,
          String(titulo).trim(),
          autor ? String(autor).trim() : null,
          Number(precio || 0),
          Number(stock || 0),
          imagen_url ? String(imagen_url).trim() : null,
          descripcion ? String(descripcion).trim() : null
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Producto creado",
        data: insertResult.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },
  async actualizarProducto(req, res, next) {
    try {
      const idProducto = Number(req.params.id);
      if (!Number.isInteger(idProducto)) {
        return res.status(400).json({ success: false, error: "ID de producto inválido" });
      }

      const currentResult = await pool.query("SELECT * FROM productos WHERE id_producto = $1", [idProducto]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: "Producto no encontrado" });
      }

      const current = currentResult.rows[0];
      const payload = req.body || {};
      const nextCategory = payload.id_categoria ?? payload.categoria;
      const categoryId = nextCategory !== undefined ? await resolveCategoryId(nextCategory) : current.id_categoria;

      const updated = await pool.query(
        `
          UPDATE productos
          SET
            id_categoria = $1,
            titulo = $2,
            autor = $3,
            precio = $4,
            stock = $5,
            imagen_url = $6,
            descripcion = $7
          WHERE id_producto = $8
          RETURNING id_producto, id_categoria, titulo, autor, precio, stock, imagen_url, descripcion
        `,
        [
          categoryId,
          payload.titulo !== undefined ? String(payload.titulo).trim() : current.titulo,
          payload.autor !== undefined ? String(payload.autor).trim() : current.autor,
          payload.precio !== undefined ? Number(payload.precio) : current.precio,
          payload.stock !== undefined ? Number(payload.stock) : current.stock,
          payload.imagen_url !== undefined ? String(payload.imagen_url).trim() : current.imagen_url,
          payload.descripcion !== undefined ? String(payload.descripcion).trim() : current.descripcion,
          idProducto
        ]
      );

      return res.json({
        success: true,
        message: "Producto actualizado",
        data: updated.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },
  async eliminarProducto(req, res, next) {
    try {
      const idProducto = Number(req.params.id);
      if (!Number.isInteger(idProducto)) {
        return res.status(400).json({ success: false, error: "ID de producto inválido" });
      }

      const deleted = await pool.query(
        "DELETE FROM productos WHERE id_producto = $1 RETURNING id_producto",
        [idProducto]
      );

      if (deleted.rows.length === 0) {
        return res.status(404).json({ success: false, error: "Producto no encontrado" });
      }

      return res.json({
        success: true,
        message: "Producto eliminado",
        id: idProducto
      });
    } catch (error) {
      next(error);
    }
  }
};

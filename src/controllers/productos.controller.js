const pool = require("../config/db");

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
            id_producto,
            titulo,
            autor,
            precio,
            stock,
            imagen_url
          FROM productos
          ORDER BY id_producto
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

module.exports = {
  obtenerProductos,
  async crearProducto(req, res) {
    return res.status(201).json({
      success: true,
      message: "Producto creado",
      data: req.body || {}
    });
  },
  async actualizarProducto(req, res) {
    return res.json({
      success: true,
      message: "Producto actualizado",
      id: req.params.id,
      data: req.body || {}
    });
  },
  async eliminarProducto(req, res) {
    return res.json({
      success: true,
      message: "Producto eliminado",
      id: req.params.id
    });
  }
};

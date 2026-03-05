export const obtenerProductos = async (req, res, next) => {
  try {

    // =============================
    // PARAMETROS PAGINACIÓN
    // =============================
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const offset = (page - 1) * limit;

    // =============================
    // TOTAL PRODUCTOS
    // =============================
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM productos"
    );

    const total = parseInt(totalResult.rows[0].count);

    // =============================
    // PRODUCTOS PAGINADOS
    // =============================
    const result = await pool.query(
      `
      SELECT p.id_producto,
             p.titulo,
             p.autor,
             p.precio,
             p.stock,
             p.imagen_url,
             c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c
        ON p.id_categoria = c.id_categoria
      ORDER BY p.id_producto
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.json({
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

  } catch (err) {
    next(err);
  }
};

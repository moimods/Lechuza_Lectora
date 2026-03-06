const pool = require("../config/db");

const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function parseDate(value, endOfDay = false) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed;
}

async function ventas(req, res, next) {
  try {
    const desde = parseDate(req.query.desde);
    const hasta = parseDate(req.query.hasta, true);
    const estado = req.query.estado && req.query.estado !== "all"
      ? String(req.query.estado).trim()
      : null;

    const filtros = [desde, hasta, estado];

    const resumenResult = await pool.query(
      `SELECT
         COALESCE(SUM(v.total), 0)::numeric(12,2) AS total_ganancias,
         COUNT(*)::int AS total_pedidos,
         COALESCE(AVG(v.total), 0)::numeric(12,2) AS promedio
       FROM ventas v
       WHERE ($1::timestamp IS NULL OR v.fecha_venta >= $1)
         AND ($2::timestamp IS NULL OR v.fecha_venta <= $2)
         AND ($3::text IS NULL OR v.estado = $3)`,
      filtros
    );

    const topResult = await pool.query(
      `SELECT
         p.id_producto,
         p.titulo,
         SUM(dv.cantidad)::int AS total_vendido,
         COALESCE(SUM(dv.subtotal_item), 0)::numeric(12,2) AS ingresos
       FROM detalles_ventas dv
       INNER JOIN ventas v ON v.id_venta = dv.id_venta
       INNER JOIN productos p ON p.id_producto = dv.id_producto
       WHERE ($1::timestamp IS NULL OR v.fecha_venta >= $1)
         AND ($2::timestamp IS NULL OR v.fecha_venta <= $2)
         AND ($3::text IS NULL OR v.estado = $3)
       GROUP BY p.id_producto, p.titulo
       ORDER BY total_vendido DESC, ingresos DESC
       LIMIT 5`,
      filtros
    );

    const graficaResult = await pool.query(
      `WITH rango AS (
         SELECT
           COALESCE(date_trunc('month', $1::timestamp), date_trunc('month', NOW() - INTERVAL '5 months')) AS inicio,
           COALESCE(date_trunc('month', $2::timestamp), date_trunc('month', NOW())) AS fin
       ),
       meses AS (
         SELECT generate_series(r.inicio, r.fin, INTERVAL '1 month') AS mes
         FROM rango r
       ),
       ventas_mensuales AS (
         SELECT
           date_trunc('month', v.fecha_venta) AS mes,
           COALESCE(SUM(v.total), 0)::numeric(12,2) AS monto
         FROM ventas v, rango r
         WHERE v.fecha_venta >= r.inicio
           AND v.fecha_venta < (r.fin + INTERVAL '1 month')
           AND ($3::text IS NULL OR v.estado = $3)
         GROUP BY date_trunc('month', v.fecha_venta)
       )
       SELECT
         EXTRACT(MONTH FROM m.mes)::int AS mes_num,
         EXTRACT(YEAR FROM m.mes)::int AS anio,
         COALESCE(vm.monto, 0)::float AS monto
       FROM meses m
       LEFT JOIN ventas_mensuales vm ON vm.mes = m.mes
       ORDER BY anio, mes_num`,
      filtros
    );

    return res.json({
      resumen: {
        total_ganancias: Number(resumenResult.rows[0].total_ganancias || 0),
        total_pedidos: Number(resumenResult.rows[0].total_pedidos || 0),
        promedio: Number(resumenResult.rows[0].promedio || 0)
      },
      top: topResult.rows.map((row) => ({
        id_producto: row.id_producto,
        titulo: row.titulo,
        total_vendido: Number(row.total_vendido || 0),
        ingresos: Number(row.ingresos || 0)
      })),
      grafica: graficaResult.rows.map((row) => ({
        mes: `${MONTHS_ES[row.mes_num - 1]} ${row.anio}`,
        monto: Number(row.monto || 0)
      }))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  ventas
};

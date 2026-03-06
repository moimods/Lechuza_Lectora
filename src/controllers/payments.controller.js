const pool = require("../config/db");
const { mpClient, Preference } = require("../config/mercadopago");
const { success, error } = require("../utils/response");

async function checkoutMercadoPago(req, res, next) {
  const client = await pool.connect();

  try {
    if (!mpClient) {
      return res.status(503).json({
        success: false,
        error: "MercadoPago no configurado"
      });
    }

    const { items = [], userId = null } = req.body;
    const authUserId = req.user?.id || userId;

    if (!authUserId) {
      return res.status(401).json({
        ok: false,
        error: "Usuario no autenticado"
      });
    }
    const normalizedItems = Array.isArray(items)
      ? items.map((item) => ({
          id: item.id || item.id_producto,
          qty: Number(item.qty || item.cantidad || 1),
          price: Number(item.price || item.precio || 0),
          title: item.title || item.titulo || "Libro"
        }))
      : [];

    if (normalizedItems.length === 0) {
      return error(res, "El checkout requiere al menos un item", 400);
    }

    const invalidItem = normalizedItems.find((item) => !item.id || item.qty <= 0 || item.price < 0);
    if (invalidItem) {
      return error(res, "Hay items inválidos en el checkout", 400);
    }

    const orderTotal = normalizedItems.reduce((acc, item) => acc + (item.qty * item.price), 0);

    await client.query("BEGIN");

    const ventaResult = await client.query(
      `INSERT INTO ventas(id_usuario, total, estado)
       VALUES ($1, $2, 'pendiente')
       RETURNING id_venta`,
      [authUserId, orderTotal]
    );

    const ventaId = ventaResult.rows[0].id_venta;

    for (const item of normalizedItems) {
      await client.query(
        `INSERT INTO detalles_ventas (id_venta, id_producto, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [ventaId, item.id, item.qty, item.price]
      );
    }

    const preferenceClient = new Preference(mpClient);
    const preference = await preferenceClient.create({
      body: {
        items: normalizedItems.map((item) => ({
          title: item.title,
          unit_price: Number(item.price),
          quantity: item.qty,
          currency_id: "MXN"
        })),
        back_urls: {
          success: "http://localhost:3000/html/Logeado/compra/Exito.html",
          failure: "http://localhost:3000/html/Logeado/compra/pago.html"
        },
        auto_return: "approved"
      }
    });

    await client.query("COMMIT");

    return success(res, {
      init_point: preference.init_point,
      id_venta: ventaId
    }, "Checkout MercadoPago generado", 200);
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

async function checkoutPaypal(req, res) {
  return error(res, "PayPal no disponible actualmente", 404);
}

module.exports = {
  checkoutMercadoPago,
  checkoutPaypal
};

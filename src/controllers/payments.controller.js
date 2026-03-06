const pool = require("../config/db");
const { mpClient, Preference } = require("../config/mercadopago");

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

    const orderTotal = normalizedItems.reduce((acc, item) => acc + (item.qty * item.price), 0);

    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders(user_id, total, status)
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [authUserId, orderTotal]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of normalizedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, book_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.qty, item.price]
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

    return res.json({
      success: true,
      init_point: preference.init_point
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

async function checkoutPaypal(req, res) {
  return res.status(404).json({
    success: false,
    error: "PayPal no disponible actualmente"
  });
}

module.exports = {
  checkoutMercadoPago,
  checkoutPaypal
};

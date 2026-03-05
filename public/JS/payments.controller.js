import pool from "../config/db.js";
import mercadopago from "../config/mercadopago.js";

// =====================================================
// MERCADO PAGO (FUNCIONAL)
// =====================================================
export const checkoutMercadoPago = async (req, res, next) => {

  const client = await pool.connect();

  try {

    const { items, userId } = req.body;

    // ===============================
    // BEGIN TRANSACTION ⭐
    // ===============================
    await client.query("BEGIN");

    // 1️⃣ Crear orden
    const orderResult = await client.query(
      `INSERT INTO orders(user_id, status)
       VALUES ($1,'pending')
       RETURNING id`,
      [userId]
    );

    const orderId = orderResult.rows[0].id;

    // 2️⃣ Guardar items
    for (const item of items) {

      await client.query(
        `INSERT INTO order_items
        (order_id, book_id, quantity, price)
        VALUES ($1,$2,$3,$4)`,
        [orderId, item.id, item.qty, item.price]
      );
    }

    // 3️⃣ Crear preferencia MercadoPago
    const preference = await mercadopago.preferences.create({
      items: items.map(i => ({
        title: i.title,
        unit_price: Number(i.price),
        quantity: i.qty,
        currency_id: "MXN"
      })),
      back_urls: {
        success: "http://localhost:5500/success.html",
        failure: "http://localhost:5500/failure.html"
      },
      auto_return: "approved"
    });

    // ===============================
    // COMMIT ⭐
    // ===============================
    await client.query("COMMIT");

    res.json({
      success: true,
      init_point: preference.body.init_point
    });

  } catch (error) {

    // ===============================
    // ROLLBACK ⭐
    // ===============================
    await client.query("ROLLBACK");

    next(error);
  } finally {
    client.release();
  }
};

// =====================================================
// PAYPAL (ERROR INTENCIONAL)
// =====================================================
export const checkoutPaypal = async (req, res) => {

  return res.status(404).json({
    success: false,
    error: "PayPal no disponible actualmente"
  });
};
const pool = require("../config/db");
const { mpClient, Preference, Payment, mpTokenConfigured } = require("../config/mercadopago");
const { success, error } = require("../utils/response");

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

function getWebhookUrl() {
  return `${getAppBaseUrl()}/api/payments/webhook`;
}

function paymentsHealth(req, res) {
  const appBaseUrl = getAppBaseUrl();
  const rawMpToken = String(process.env.MP_ACCESS_TOKEN || "").trim();
  const hasMercadoPagoAccessToken = Boolean(rawMpToken);

  const health = {
    mercadopago: {
      configured: mpTokenConfigured,
      sdkClientReady: Boolean(mpClient),
      tokenPresent: hasMercadoPagoAccessToken,
      webhookUrl: getWebhookUrl()
    },
    app: {
      baseUrl: appBaseUrl
    }
  };

  const message = mpTokenConfigured
    ? "Mercado Pago listo"
    : "Mercado Pago no está configurado correctamente. Revisa MP_ACCESS_TOKEN en .env";
  return success(res, health, message, 200);
}

function normalizeCheckoutItems(items = []) {
  const normalizedItems = Array.isArray(items)
    ? items.map((item) => ({
      id: Number(item.id || item.id_producto || 0),
      qty: Number(item.qty || item.cantidad || 1),
      price: Number(item.price || item.precio || 0),
      title: String(item.title || item.titulo || "Libro")
    }))
    : [];

  if (normalizedItems.length === 0) {
    throw new Error("El checkout requiere al menos un item");
  }

  const invalidItem = normalizedItems.find((item) => !item.id || item.qty <= 0 || item.price < 0);
  if (invalidItem) {
    throw new Error("Hay items inválidos en el checkout");
  }

  return normalizedItems;
}

async function resolveMetodoPagoId(client, userId, providedId) {
  const parsedProvided = Number(providedId || 0);
  if (parsedProvided > 0) return parsedProvided;

  const methodResult = await client.query(
    `SELECT id_metodo
     FROM metodos_pago
     WHERE id_usuario = $1
     ORDER BY es_principal DESC, id_metodo ASC
     LIMIT 1`,
    [userId]
  );

  return methodResult.rows[0]?.id_metodo || null;
}

async function createPendingSale(client, { authUserId, id_direccion, id_metodo_pago, normalizedItems }) {
  const orderTotal = normalizedItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const metodoPagoId = await resolveMetodoPagoId(client, authUserId, id_metodo_pago);

  const ventaResult = await client.query(
    `INSERT INTO ventas(id_usuario, id_direccion, id_metodo_pago, total, estado)
     VALUES ($1, $2, $3, $4, 'pendiente')
     RETURNING id_venta`,
    [authUserId, id_direccion, metodoPagoId, orderTotal]
  );

  const ventaId = ventaResult.rows[0].id_venta;

  for (const item of normalizedItems) {
    await client.query(
      `INSERT INTO detalles_ventas (id_venta, id_producto, cantidad, precio_unitario)
       VALUES ($1, $2, $3, $4)`,
      [ventaId, item.id, item.qty, item.price]
    );
  }

  return { ventaId, orderTotal, metodoPagoId };
}

function mapMercadoPagoStatusToVentaEstado(mpStatus) {
  const status = String(mpStatus || "").toLowerCase();
  if (status === "approved") return "completado";
  if (status === "pending" || status === "in_process" || status === "in_mediation") return "pendiente";
  return "cancelado";
}

async function checkoutMercadoPago(req, res, next) {
  const client = await pool.connect();

  try {
    if (!mpClient || !mpTokenConfigured) {
      return res.status(503).json({
        success: false,
        error: "MercadoPago no configurado correctamente. Define MP_ACCESS_TOKEN válido en .env"
      });
    }

    const { items = [], userId = null, id_direccion = null, id_metodo_pago = null } = req.body;
    const authUserId = req.user?.id || userId;

    if (!authUserId) {
      return res.status(401).json({
        ok: false,
        error: "Usuario no autenticado"
      });
    }
    let normalizedItems;
    try {
      normalizedItems = normalizeCheckoutItems(items);
    } catch (validationError) {
      return error(res, validationError.message, 400);
    }

    await client.query("BEGIN");

    const { ventaId } = await createPendingSale(client, {
      authUserId,
      id_direccion,
      id_metodo_pago,
      normalizedItems
    });

    const appBaseUrl = String(process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
    const successUrl = `${appBaseUrl}/html/Logeado/compra/Exito.html?provider=mercadopago&id_venta=${ventaId}`;
    const failureUrl = `${appBaseUrl}/html/Logeado/compra/pago.html?provider=mercadopago&status=failure&id_venta=${ventaId}`;
    const pendingUrl = `${appBaseUrl}/html/Logeado/compra/pago.html?provider=mercadopago&status=pending&id_venta=${ventaId}`;
    const preferenceClient = new Preference(mpClient);
    const preference = await preferenceClient.create({
      body: {
        items: normalizedItems.map((item) => ({
          title: item.title,
          unit_price: Number(item.price),
          quantity: item.qty,
          currency_id: "MXN"
        })),
        external_reference: String(ventaId),
        notification_url: getWebhookUrl(),
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl
        }
      }
    });

    await client.query("COMMIT");

    return success(res, {
      init_point: preference.init_point,
      preference_id: preference.id,
      id_venta: ventaId
    }, "Checkout MercadoPago generado", 200);
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

async function getMercadoPagoPaymentById(paymentId) {
  if (!mpClient || !mpTokenConfigured) {
    throw new Error("MercadoPago no configurado correctamente. Define MP_ACCESS_TOKEN válido en .env");
  }

  const paymentClient = new Payment(mpClient);
  const payment = await paymentClient.get({ id: String(paymentId) });
  return payment;
}

async function getMercadoPagoPaymentStatus(req, res, next) {
  try {
    const paymentId = String(req.params.paymentId || "").trim();
    const authUserId = req.user?.id;

    if (!paymentId) {
      return error(res, "payment_id es obligatorio", 400);
    }

    const payment = await getMercadoPagoPaymentById(paymentId);
    const ventaId = Number(payment?.external_reference || 0);

    if (authUserId && ventaId > 0) {
      const result = await pool.query(
        `SELECT id_venta
         FROM ventas
         WHERE id_venta = $1 AND id_usuario = $2
         LIMIT 1`,
        [ventaId, authUserId]
      );
      if (!result.rows.length) {
        return error(res, "No tienes permiso para consultar este pago", 403);
      }
    }

    const estadoVenta = mapMercadoPagoStatusToVentaEstado(payment?.status);

    return success(res, {
      payment_id: payment?.id || paymentId,
      status: payment?.status || null,
      status_detail: payment?.status_detail || null,
      id_venta: ventaId || null,
      estado_mapeado: estadoVenta
    }, "Estado de pago Mercado Pago consultado", 200);
  } catch (err) {
    next(err);
  }
}

async function webhookMercadoPago(req, res, next) {
  try {
    const topic = String(req.body?.type || req.query?.topic || "").toLowerCase();
    const paymentId =
      req.body?.data?.id ||
      req.query?.id ||
      req.query?.["data.id"] ||
      null;

    if (topic && topic !== "payment") {
      return res.status(200).json({ ok: true, ignored: true });
    }

    if (!paymentId) {
      return res.status(200).json({ ok: true, ignored: true, reason: "missing_payment_id" });
    }

    if (!mpClient || !mpTokenConfigured) {
      return res.status(200).json({ ok: true, ignored: true, reason: "mp_not_configured" });
    }

    const payment = await getMercadoPagoPaymentById(paymentId);
    const ventaId = Number(payment?.external_reference || 0);
    if (!ventaId) {
      return res.status(200).json({ ok: true, ignored: true, reason: "missing_external_reference" });
    }

    const estadoVenta = mapMercadoPagoStatusToVentaEstado(payment?.status);

    await pool.query(
      `UPDATE ventas
       SET estado = $1
       WHERE id_venta = $2`,
      [estadoVenta, ventaId]
    );

    return res.status(200).json({
      ok: true,
      processed: true,
      payment_id: payment?.id || paymentId,
      id_venta: ventaId,
      status: payment?.status || null,
      estado_mapeado: estadoVenta
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkoutMercadoPago,
  getMercadoPagoPaymentStatus,
  webhookMercadoPago,
  paymentsHealth
};

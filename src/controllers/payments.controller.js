const pool = require("../config/db");
const { mpClient, Preference } = require("../config/mercadopago");
const { success, error } = require("../utils/response");

function getAppBaseUrl() {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

function getPayPalMode() {
  return String(process.env.PAYPAL_MODE || "sandbox").toLowerCase() === "live" ? "live" : "sandbox";
}

function getPayPalApiBase() {
  return getPayPalMode() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function isPayPalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function paymentsHealth(req, res) {
  const appBaseUrl = getAppBaseUrl();
  const hasMercadoPagoAccessToken = Boolean(process.env.MP_ACCESS_TOKEN);
  const hasPayPalClientId = Boolean(process.env.PAYPAL_CLIENT_ID);
  const hasPayPalClientSecret = Boolean(process.env.PAYPAL_CLIENT_SECRET);

  const health = {
    mercadopago: {
      configured: hasMercadoPagoAccessToken,
      sdkClientReady: Boolean(mpClient)
    },
    paypal: {
      configured: hasPayPalClientId && hasPayPalClientSecret,
      fallbackEnabled: true,
      mode: getPayPalMode(),
      apiBase: getPayPalApiBase()
    },
    app: {
      baseUrl: appBaseUrl
    }
  };

  const allConfigured = health.mercadopago.configured && health.paypal.configured;
  const message = allConfigured
    ? "Pasarelas configuradas"
    : "Mercado Pago listo. PayPal operará en modo registro local hasta configurar credenciales";
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

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal no configurado (faltan PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET)");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || "No se pudo obtener token de PayPal");
  }

  return tokenData.access_token;
}

async function checkoutMercadoPago(req, res, next) {
  const client = await pool.connect();

  try {
    if (!mpClient) {
      return res.status(503).json({
        success: false,
        error: "MercadoPago no configurado"
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

    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
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
        back_urls: {
          success: `${appBaseUrl}/html/Logeado/compra/Exito.html?provider=mercadopago&id_venta=${ventaId}`,
          failure: `${appBaseUrl}/html/Logeado/compra/pago.html?provider=mercadopago&status=failure&id_venta=${ventaId}`,
          pending: `${appBaseUrl}/html/Logeado/compra/pago.html?provider=mercadopago&status=pending&id_venta=${ventaId}`
        },
        auto_return: "approved"
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

async function checkoutPayPal(req, res, next) {
  const client = await pool.connect();

  try {
    const { items = [], userId = null, id_direccion = null, id_metodo_pago = null } = req.body;
    const authUserId = req.user?.id || userId;

    if (!authUserId) {
      return res.status(401).json({ ok: false, error: "Usuario no autenticado" });
    }

    let normalizedItems;
    try {
      normalizedItems = normalizeCheckoutItems(items);
    } catch (validationError) {
      return error(res, validationError.message, 400);
    }

    await client.query("BEGIN");

    const { ventaId, orderTotal } = await createPendingSale(client, {
      authUserId,
      id_direccion,
      id_metodo_pago,
      normalizedItems
    });

    const appBaseUrl = getAppBaseUrl();

    if (!isPayPalConfigured()) {
      await client.query("COMMIT");
      return success(res, {
        approve_url: `${appBaseUrl}/html/Logeado/compra/Exito.html?provider=paypal&id_venta=${ventaId}&status=simulated`,
        order_id: null,
        id_venta: ventaId,
        simulated: true
      }, "Checkout PayPal simulado para registro local", 200);
    }

    const accessToken = await getPayPalAccessToken();

    const orderRes = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: String(ventaId),
          custom_id: String(ventaId),
          amount: {
            currency_code: "MXN",
            value: Number(orderTotal).toFixed(2)
          },
          description: "Compra en La Lechuza Lectora"
        }],
        application_context: {
          brand_name: "La Lechuza Lectora",
          user_action: "PAY_NOW",
          return_url: `${appBaseUrl}/html/Logeado/compra/Exito.html?provider=paypal&id_venta=${ventaId}`,
          cancel_url: `${appBaseUrl}/html/Logeado/compra/pago.html?provider=paypal&status=cancelled&id_venta=${ventaId}`
        }
      })
    });

    const orderData = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok) {
      throw new Error(orderData?.message || orderData?.error || "No se pudo crear la orden de PayPal");
    }

    const approveLink = Array.isArray(orderData?.links)
      ? orderData.links.find((link) => link.rel === "approve")?.href
      : null;

    if (!approveLink) {
      throw new Error("No se recibió URL de aprobación de PayPal");
    }

    await client.query("COMMIT");

    return success(res, {
      approve_url: approveLink,
      order_id: orderData.id,
      id_venta: ventaId
    }, "Checkout PayPal generado", 200);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}

async function capturePayPal(req, res, next) {
  try {
    const { order_id, id_venta = null } = req.body || {};
    const authUserId = req.user?.id;

    if (!authUserId) {
      return res.status(401).json({ ok: false, error: "Usuario no autenticado" });
    }

    if (!order_id) {
      return error(res, "order_id es obligatorio", 400);
    }

    const accessToken = await getPayPalAccessToken();
    const captureRes = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(order_id)}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    });

    const captureData = await captureRes.json().catch(() => ({}));
    if (!captureRes.ok) {
      return error(res, captureData?.message || "No se pudo capturar el pago PayPal", 400);
    }

    const resolvedVentaId = Number(
      id_venta ||
      captureData?.purchase_units?.[0]?.custom_id ||
      captureData?.purchase_units?.[0]?.reference_id ||
      0
    );

    if (resolvedVentaId > 0) {
      await pool.query(
        `UPDATE ventas
         SET estado = 'completado'
         WHERE id_venta = $1 AND id_usuario = $2`,
        [resolvedVentaId, authUserId]
      );
    }

    return success(res, {
      order_id,
      id_venta: resolvedVentaId || null,
      status: captureData?.status || "UNKNOWN"
    }, "Pago PayPal capturado", 200);
  } catch (err) {
    next(err);
  }
}

async function confirmarVenta(req, res, next) {
  try {
    const authUserId = req.user?.id;
    const ventaId = Number(req.body?.id_venta || req.body?.external_reference || 0);
    const estado = String(req.body?.estado || "completado").toLowerCase();

    if (!authUserId) {
      return res.status(401).json({ ok: false, error: "Usuario no autenticado" });
    }

    if (!ventaId) {
      return error(res, "id_venta es obligatorio", 400);
    }

    const estadosPermitidos = ["pendiente", "completado", "cancelado"];
    if (!estadosPermitidos.includes(estado)) {
      return error(res, "Estado no permitido", 400);
    }

    const result = await pool.query(
      `UPDATE ventas
       SET estado = $1
       WHERE id_venta = $2 AND id_usuario = $3
       RETURNING id_venta, estado`,
      [estado, ventaId, authUserId]
    );

    if (!result.rows.length) {
      return error(res, "No se encontró la venta para actualizar", 404);
    }

    return success(res, result.rows[0], "Venta actualizada", 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkoutMercadoPago,
  checkoutPayPal,
  capturePayPal,
  confirmarVenta,
  paymentsHealth
};

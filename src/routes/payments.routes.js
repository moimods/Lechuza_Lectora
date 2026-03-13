const express = require("express");
const {
	checkoutMercadoPago,
	getMercadoPagoPaymentStatus,
	webhookMercadoPago,
	paymentsHealth
} = require("../controllers/payments.controller");
const { verificarAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/health", paymentsHealth);
router.post("/mercadopago", verificarAuth, checkoutMercadoPago);
router.get("/mercadopago/payment/:paymentId", verificarAuth, getMercadoPagoPaymentStatus);
router.post("/webhook", webhookMercadoPago);

module.exports = router;

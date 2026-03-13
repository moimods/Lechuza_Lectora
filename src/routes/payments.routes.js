const express = require("express");
const {
	checkoutMercadoPago,
	checkoutPayPal,
	capturePayPal,
	confirmarVenta,
	paymentsHealth
} = require("../controllers/payments.controller");
const { verificarAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/health", paymentsHealth);
router.post("/mercadopago", verificarAuth, checkoutMercadoPago);
router.post("/paypal/create-order", verificarAuth, checkoutPayPal);
router.post("/paypal/capture", verificarAuth, capturePayPal);
router.post("/confirmar", verificarAuth, confirmarVenta);

module.exports = router;

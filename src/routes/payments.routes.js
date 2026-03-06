const express = require("express");
const {
  checkoutMercadoPago,
  checkoutPaypal
} = require("../controllers/payments.controller");
const { verificarAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/mercadopago", verificarAuth, checkoutMercadoPago);
router.post("/paypal", verificarAuth, checkoutPaypal);

module.exports = router;

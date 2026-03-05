const express = require("express");
const {
  checkoutMercadoPago,
  checkoutPaypal
} = require("../controllers/payments.controller");

const router = express.Router();

router.post("/mercadopago", checkoutMercadoPago);
router.post("/paypal", checkoutPaypal);

module.exports = router;

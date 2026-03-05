import express from "express";
import {
  checkoutMercadoPago,
  checkoutPaypal
} from "../controllers/payments.controller.js";

const router = express.Router();

// ✅ MercadoPago funcional
router.post("/mercadopago", checkoutMercadoPago);

// ❌ PayPal NO IMPLEMENTADO
router.post("/paypal", checkoutPaypal);

export default router;
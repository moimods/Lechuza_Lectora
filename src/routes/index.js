const express = require("express");
const crypto = require("crypto");
const authRoutes = require("./auth.routes");
const productosRoutes = require("./productos.routes");
const paymentsRoutes = require("./payments.routes");
const ventasRoutes = require("./ventas.routes");
const adminRoutes = require("./admin.routes");
const reportesRoutes = require("./reportes.routes");

const router = express.Router();

router.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: crypto.randomBytes(24).toString("hex") });
});

router.use("/", authRoutes);
router.use("/productos", productosRoutes);
router.use("/payments", paymentsRoutes);
router.use("/ventas", ventasRoutes);
router.use("/admin", adminRoutes);
router.use("/reportes", reportesRoutes);

module.exports = router;

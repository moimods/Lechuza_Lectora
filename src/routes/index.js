const express = require("express");
const crypto = require("crypto");
const pool = require("../config/db");
const authRoutes = require("./auth.routes");
const usuarioRoutes = require("./usuario.routes");
const productosRoutes = require("./productos.routes");
const paymentsRoutes = require("./payments.routes");
const ventasRoutes = require("./ventas.routes");
const adminRoutes = require("./admin.routes");
const reportesRoutes = require("./reportes.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API de La Lechuza Lectora activa"
  });
});

router.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: crypto.randomBytes(24).toString("hex") });
});

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).json({
      ok: true,
      service: "la-lechuza-api",
      database: "up",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(503).json({
      ok: false,
      service: "la-lechuza-api",
      database: "down",
      error: "Database unavailable"
    });
  }
});

router.use("/auth", authRoutes);
router.use("/usuario", usuarioRoutes);
router.use("/productos", productosRoutes);
router.use("/pagos", paymentsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/ventas", ventasRoutes);
router.use("/admin", adminRoutes);
router.use("/reportes", reportesRoutes);

module.exports = router;

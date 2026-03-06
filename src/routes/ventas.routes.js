const express = require("express");
const {
  registrarVenta,
  obtenerVenta,
  obtenerVentas,
  obtenerVentasUsuario,
  actualizarEstado
} = require("../controllers/ventas.controller");
const { verificarAuth, verificarAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Rutas protegidas
router.post("/registrar", verificarAuth, registrarVenta);
router.get("/", verificarAuth, verificarAdmin, obtenerVentas);
router.get("/usuario", verificarAuth, obtenerVentasUsuario);
router.get("/:id", verificarAuth, obtenerVenta);
router.put("/:id/estado", verificarAuth, verificarAdmin, actualizarEstado);

module.exports = router;

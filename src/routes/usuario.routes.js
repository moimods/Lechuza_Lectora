/**
 * Rutas de Usuario - Perfil, direcciones, métodos de pago
 */

const express = require("express");
const {
  obtenerPerfil,
  actualizarPerfil,
  obtenerDirecciones,
  crearDireccion,
  actualizarDireccion,
  eliminarDireccion,
  obtenerMetodosPago,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago
} = require("../controllers/usuario.controller");
const { verificarAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAuth);

// Perfil
router.get("/perfil", obtenerPerfil);
router.put("/perfil", actualizarPerfil);

// Direcciones
router.get("/direcciones", obtenerDirecciones);
router.post("/direcciones", crearDireccion);
router.put("/direcciones/:id", actualizarDireccion);
router.delete("/direcciones/:id", eliminarDireccion);

// Métodos de pago
router.get("/metodos-pago", obtenerMetodosPago);
router.post("/metodos-pago", crearMetodoPago);
router.put("/metodos-pago/:id", actualizarMetodoPago);
router.delete("/metodos-pago/:id", eliminarMetodoPago);

module.exports = router;

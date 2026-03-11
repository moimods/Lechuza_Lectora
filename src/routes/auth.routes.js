const express = require("express");
const {
  login,
  logout,
  registro,
  actualizarPassword,
  recuperarPassword
} = require("../controllers/auth.controller");
const { verificarAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// Rutas públicas
router.post("/login", login);
router.post("/registro", registro);
router.post("/recuperar-password", recuperarPassword);

// Rutas protegidas
router.post("/logout", verificarAuth, logout);
router.post("/actualizar-password", verificarAuth, actualizarPassword);

module.exports = router;

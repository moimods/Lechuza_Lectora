const express = require("express");
const {
  login,
  logout,
  registro,
  actualizarPassword
} = require("../controllers/auth.controller");
const { verificarAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// Rutas públicas
router.post("/login", login);
router.post("/registro", registro);

// Rutas protegidas
router.post("/logout", verificarAuth, logout);
router.post("/actualizar-password", verificarAuth, actualizarPassword);

module.exports = router;

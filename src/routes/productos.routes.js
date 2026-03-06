const express = require("express");
const {
  obtenerProductos,
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require("../controllers/productos.controller");
const { verificarAuth, verificarAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Rutas públicas
router.get("/categorias", obtenerCategorias);
router.get("/", obtenerProductos);

// Rutas protegidas (admin)
router.post("/", verificarAuth, verificarAdmin, crearProducto);
router.put("/:id", verificarAuth, verificarAdmin, actualizarProducto);
router.delete("/:id", verificarAuth, verificarAdmin, eliminarProducto);

module.exports = router;

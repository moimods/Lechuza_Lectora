const express = require("express");
const {
  obtenerProductos,
  obtenerProducto,
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
router.get("/:id", obtenerProducto);

// Rutas protegidas (admin)
router.post("/", verificarAuth, verificarAdmin, crearProducto);
router.put("/:id", verificarAuth, verificarAdmin, actualizarProducto);
router.delete("/:id", verificarAuth, verificarAdmin, eliminarProducto);

module.exports = router;

const express = require("express");
const {
	obtenerProductos,
	obtenerCategorias,
	crearProducto,
	actualizarProducto,
	eliminarProducto
} = require("../controllers/productos.controller");

const router = express.Router();

router.get("/categorias", obtenerCategorias);
router.get("/", obtenerProductos);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;

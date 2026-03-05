const express = require("express");
const { estadisticas, pedidos } = require("../controllers/admin.controller");

const router = express.Router();

router.get("/estadisticas", estadisticas);
router.get("/pedidos", pedidos);

module.exports = router;

const express = require("express");
const { estadisticas, pedidos } = require("../controllers/admin.controller");
const { verificarAuth, verificarAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/estadisticas", verificarAuth, verificarAdmin, estadisticas);
router.get("/pedidos", verificarAuth, verificarAdmin, pedidos);

module.exports = router;

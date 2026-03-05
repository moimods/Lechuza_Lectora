const express = require("express");
const { ventas } = require("../controllers/reportes.controller");

const router = express.Router();

router.get("/ventas", ventas);

module.exports = router;

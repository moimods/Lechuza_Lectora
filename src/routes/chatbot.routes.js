const express = require("express");
const { responderMensaje } = require("../controllers/chatbot.controller");

const router = express.Router();

router.post("/message", responderMensaje);

module.exports = router;

const express = require("express");
const {
	login,
	logout,
	registro,
	actualizarPassword
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/registro", registro);
router.post("/actualizar-password", actualizarPassword);

module.exports = router;

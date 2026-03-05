const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const { loginSchema } = require("../validators/auth.schema");

router.post(
  "/login",
  validate(loginSchema), // ⭐ AQUÍ SE USA
  async (req, res, next) => {

    const { email, password } = req.body;

    // ya vienen validados y seguros
    res.json({ success: true });

  }
);

module.exports = router;
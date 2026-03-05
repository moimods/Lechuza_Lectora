const { z } = require("zod");

const loginSchema = z.object({

  email: z
    .string()
    .email("Email inválido")
    .max(100),

  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .max(60)
});

module.exports = {
  loginSchema
};
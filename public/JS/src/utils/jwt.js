import jwt from "jsonwebtoken";

export function generarToken(usuario) {

  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol || "user"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES
    }
  );
}
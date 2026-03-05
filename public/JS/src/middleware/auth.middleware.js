import jwt from "jsonwebtoken";

export function verificarAuth(req, res, next) {

  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Verificar header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("No autenticado");
      error.status = 401;
      throw error;
    }

    // 2️⃣ Obtener token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verificar JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Guardar usuario en request
    req.usuario = decoded;

    next();

  } catch (err) {

    err.status = 401;
    err.message = "Token inválido o expirado";
    next(err);
  }
}

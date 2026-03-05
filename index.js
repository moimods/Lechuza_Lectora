/*****************************************************************
 * 🦉 LA LECHUZA LECTORA - BACKEND SERVER
 * Arquitectura final optimizada
 *****************************************************************/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// =============================
// CONFIGURACIÓN INICIAL
// =============================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === "development";

// =============================
// MIDDLEWARES BASE
// =============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// LOGGER SIMPLE ESTRUCTURADO
// =============================
app.use((req, res, next) => {

  const start = Date.now();

  res.on("finish", () => {
    console.log(JSON.stringify({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      time: `${Date.now() - start}ms`,
      date: new Date().toISOString()
    }));
  });

  next();
});

// =============================
// HEALTH CHECK
// =============================
app.get("/", (req, res) => {
  res.json({
    message: "🦉 API La Lechuza Lectora funcionando",
    environment: process.env.NODE_ENV
  });
});

// =============================
// RUTAS API
// =============================
import routes from "./routes/index.js";

app.use("/api", routes);

// =============================
// 404 HANDLER
// =============================
app.use((req, res, next) => {
  const error = new Error("Ruta no encontrada");
  error.status = 404;
  next(error);
});

// =============================
// ERROR HANDLER GLOBAL ⭐ (PASO 7)
// =============================
app.use((err, req, res, next) => {

  const statusCode = err.status || 500;

  // Logging estructurado
  console.error(JSON.stringify({
    message: err.message,
    status: statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
    date: new Date().toISOString()
  }));

  res.status(statusCode).json({
    success: false,
    error: err.message || "Error interno del servidor",

    // Stack SOLO en desarrollo
    ...(isDev && { stack: err.stack })
  });
});

// =============================
// INICIAR SERVIDOR
// =============================
app.listen(PORT, () => {
  console.log(`
====================================
🦉 LA LECHUZA LECTORA ONLINE
http://localhost:${PORT}
📌 DB usada: ${process.env.DB_DATABASE}
🌎 Entorno: ${process.env.NODE_ENV}
====================================
`);
});
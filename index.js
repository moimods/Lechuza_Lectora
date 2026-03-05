/*****************************************************************
 * 🦉 LA LECHUZA LECTORA - BACKEND SERVER
 * Arquitectura final optimizada + seguridad profesional
 *****************************************************************/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csurf";

// =============================
// CONFIGURACIÓN INICIAL
// =============================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === "development";

// =============================
// VALIDACIÓN VARIABLES ENTORNO ⭐
// =============================
const requiredEnv = [
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "CORS_ORIGIN"
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Falta variable de entorno: ${key}`);
    process.exit(1);
  }
});

// =============================
// SEGURIDAD GLOBAL ⭐⭐⭐
// =============================

// Headers seguros automáticos
app.use(helmet());

// CORS seguro
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting (ANTI BRUTE FORCE)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: "Demasiadas solicitudes, intenta más tarde"
  }
});

app.use("/api", limiter);

// =============================
// PARSEADORES
// =============================
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =============================
// SANITIZACIÓN ANTI SQL INJECTION ⭐
// =============================
app.use((req, res, next) => {

  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key]
          .trim()
          .replace(/['";]/g, ""); // elimina caracteres peligrosos
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);

  next();
});

// =============================
// LOGGER ESTRUCTURADO ⭐
// =============================
app.use((req, res, next) => {

  const start = Date.now();

  res.on("finish", () => {

    console.log(JSON.stringify({
      level: "info",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      date: new Date().toISOString()
    }));

  });

  next();
});

// =============================
// CSRF PROTECTION ⭐
// =============================
const csrfProtection = csrf({
  cookie: true
});

// Endpoint para obtener token CSRF
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// =============================
// HEALTH CHECK
// =============================
app.get("/", (req, res) => {
  res.json({
    message: "🦉 API La Lechuza Lectora funcionando",
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// =============================
// RUTAS API
// =============================
import routes from "./routes/index.js";

// Protegemos TODAS las rutas API con CSRF
app.use("/api", csrfProtection, routes);

// =============================
// 404 HANDLER
// =============================
app.use((req, res, next) => {
  const error = new Error("Ruta no encontrada");
  error.status = 404;
  next(error);
});

// =============================
// ERROR HANDLER GLOBAL ⭐⭐⭐
// =============================
app.use((err, req, res, next) => {

  const statusCode = err.status || 500;

  console.error(JSON.stringify({
    level: "error",
    message: err.message,
    status: statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: isDev ? err.stack : undefined,
    date: new Date().toISOString()
  }));

  res.status(statusCode).json({
    success: false,
    error: err.message || "Error interno del servidor",
    code: err.code || "INTERNAL_ERROR",
    details: err.details || null,
    ...(isDev && { stack: err.stack })
  });
});

import paymentsRoutes from "./payments.routes.js";

router.use("/payments", paymentsRoutes);

// =============================
// INICIAR SERVIDOR
// =============================
app.listen(PORT, () => {

  console.clear();

  console.log(`
====================================
🦉 LA LECHUZA LECTORA ONLINE
http://localhost:${PORT}

🌎 Entorno: ${process.env.NODE_ENV}
🔐 CORS: ${process.env.CORS_ORIGIN}
🛡️ Seguridad: ACTIVADA
====================================
`);
});
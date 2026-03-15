const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const notFound = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());

function resolveAllowedOrigins() {
  const raw = String(process.env.CORS_ORIGIN || "").trim();
  if (!raw) return true;

  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!origins.length) return true;

  return (origin, callback) => {
    // Requests same-origin/server-to-server no traen Origin.
    if (!origin) return callback(null, true);
    if (origins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS: origen no permitido"));
  };
}

app.use((req, res, next) => {
  const isHtmlRequest = req.method === "GET" && (req.path === "/" || req.path.endsWith(".html"));

  if (isHtmlRequest) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
  }

  next();
});

app.use(cors({
  origin: resolveAllowedOrigins(),
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const publicPath = path.resolve(__dirname, "..", "public");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/inicio", (req, res) => {
  res.redirect("/html/Logeado/Inicio_Logeado.html");
});

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

const pageAliases = {
  "/Catalogo.html": "/html/Catalogo.html",
  "/html/Inicio_sesion.html": "/html/Inicio_de_sesion/Inicio_sesion.html",
  "/Inicio_sesion.html": "/html/Inicio_de_sesion/Inicio_sesion.html",
  "/login.html": "/html/Inicio_de_sesion/Inicio_sesion.html",
  "/login": "/html/Inicio_de_sesion/Inicio_sesion.html",
  "/Catalogo_Logeado.html": "/html/Logeado/Catalogo_Logeado.html",
  "/html/Catalogo_Logeado.html": "/html/Logeado/Catalogo_Logeado.html",
  "/carrito.html": "/html/Logeado/carrito.html",
  "/html/carrito.html": "/html/Logeado/carrito.html",
  "/perfil.html": "/html/Logeado/perfil.html",
  "/html/perfil.html": "/html/Logeado/perfil.html",
  "/Informacion_Personal.html": "/html/Logeado/Informacion_Personal.html",
  "/Mis_Pedidos.html": "/html/Logeado/Mis_pedidos.html",
  "/Mis_pedidos.html": "/html/Logeado/Mis_pedidos.html",
  "/Ayuda.html": "/html/Logeado/Ayuda.html",
  "/Acerca de.html": "/html/Logeado/Acerca de.html",
  "/Acerca%20de.html": "/html/Logeado/Acerca%20de.html",
  "/html/Inicio_de_sesion/Panel_Administrador.html": "/html/Admin/panel_de_admin.html"
};

Object.entries(pageAliases).forEach(([from, to]) => {
  app.get(from, (req, res) => {
    res.redirect(to);
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

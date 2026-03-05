/* =====================================================
   VARIABLES DE ENTORNO
===================================================== */
require("dotenv").config();

/* =====================================================
   IMPORTS
===================================================== */
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

/* =====================================================
   APP INIT
===================================================== */
const app = express();

/* =====================================================
   MIDDLEWARES
===================================================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   ARCHIVOS ESTÁTICOS (FRONTEND)
===================================================== */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* =====================================================
   CONEXIÓN POSTGRESQL
===================================================== */
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

/* Test conexión */
(async () => {
  try {
    const res = await pool.query("SELECT current_database()");
    console.log("✅ Base de datos conectada");
    console.log("📌 Conectado a DB:", res.rows[0].current_database);
  } catch (err) {
    console.error("❌ Error DB:", err);
  }
})();

/* =====================================================
   ================== API ==============================
===================================================== */

/* ================= LOGIN ================= */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Datos incompletos",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id_usuario,
              nombre_completo AS nombre,
              email,
              rol,
              password_hash
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Credenciales incorrectas",
      });
    }

    const user = result.rows[0];

    /* comparación segura */
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Credenciales incorrectas",
      });
    }

    delete user.password_hash;

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

/* ================= LOGOUT ================= */
app.post("/api/logout", (req, res) => {
  res.json({ success: true });
});

/* ================= USUARIO ================= */
app.get("/api/usuario/:email", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_usuario, nombre_completo, email, telefono
       FROM usuarios
       WHERE email = $1`,
      [req.params.email]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error servidor" });
  }
});

/* ================= PRODUCTOS ================= */

app.get("/api/productos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id_producto,
             p.titulo,
             p.autor,
             p.precio,
             p.stock,
             p.imagen_url,
             c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c
      ON p.id_categoria = c.id_categoria
      ORDER BY p.id_producto
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error productos" });
  }
});

app.get("/api/productos/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productos WHERE id_producto = $1",
      [req.params.id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error servidor" });
  }
});

app.post("/api/productos", async (req, res) => {
  const { titulo, autor, precio, stock, categoria, imagen_url } = req.body;

  try {
    const cat = await pool.query(
      "SELECT id_categoria FROM categorias WHERE nombre = $1",
      [categoria]
    );

    if (!cat.rows.length)
      return res.status(400).json({ error: "Categoría inválida" });

    await pool.query(
      `INSERT INTO productos
       (titulo, autor, precio, stock, id_categoria, imagen_url)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        titulo,
        autor,
        precio,
        stock,
        cat.rows[0].id_categoria,
        imagen_url,
      ]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  const { titulo, autor, precio, stock, categoria, imagen_url } = req.body;

  try {
    const cat = await pool.query(
      "SELECT id_categoria FROM categorias WHERE nombre=$1",
      [categoria]
    );

    if (!cat.rows.length)
      return res.status(400).json({ error: "Categoría inválida" });

    await pool.query(
      `UPDATE productos SET
        titulo=$1,
        autor=$2,
        precio=$3,
        stock=$4,
        id_categoria=$5,
        imagen_url=$6
       WHERE id_producto=$7`,
      [
        titulo,
        autor,
        precio,
        stock,
        cat.rows[0].id_categoria,
        imagen_url,
        req.params.id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM productos WHERE id_producto=$1",
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(409).json({
      error: "Producto relacionado a ventas",
    });
  }
});

/* ================= VENTAS ================= */
app.post("/api/ventas/registrar", async (req, res) => {
  const { id_usuario, id_direccion, total, productos } = req.body;

  if (!productos?.length)
    return res.status(400).json({ error: "Sin productos" });

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const venta = await client.query(
      `INSERT INTO ventas
       (id_usuario,id_direccion,total,fecha_venta,estado)
       VALUES ($1,$2,$3,NOW(),'completado')
       RETURNING id_venta`,
      [id_usuario, id_direccion || null, total]
    );

    const idVenta = venta.rows[0].id_venta;

    for (const prod of productos) {
      await client.query(
        `INSERT INTO detalles_ventas
         (id_venta,id_producto,cantidad,precio_unitario)
         VALUES ($1,$2,$3,$4)`,
        [idVenta, prod.id_producto, prod.cantidad, prod.precio]
      );

      await client.query(
        `UPDATE productos
         SET stock = stock - $1
         WHERE id_producto = $2`,
        [prod.cantidad, prod.id_producto]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ success: true, id_venta: idVenta });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

/* =====================================================
   404
===================================================== */
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.path,
  });
});

/* =====================================================
   ERROR GLOBAL
===================================================== */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno" });
});

/* =====================================================
   SERVER START
===================================================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.clear();
  console.log("🦉 LA LECHUZA LECTORA ONLINE");
  console.log(`http://localhost:${PORT}`);
  console.log("📌 DB usada:", process.env.DB_NAME);
});
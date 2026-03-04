/* =====================================================
   VARIABLES DE ENTORNO
===================================================== */
require('dotenv').config();

/* =====================================================
   IMPORTS
===================================================== */
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

/* =====================================================
   APP INIT
===================================================== */
const app = express();

/* =====================================================
   CONFIGURACIÓN BASE / MIDDLEWARES
===================================================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   ARCHIVOS ESTÁTICOS (FRONTEND)
===================================================== */
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
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

pool.connect()
    .then(() => console.log("✅ Base de datos conectada"))
    .catch(err => console.error("❌ Error DB:", err));

/* =====================================================
   ================== RUTAS API ========================
===================================================== */

/* ================= LOGIN ================= */
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: "Datos incompletos" });
    }

    try {
        const result = await pool.query(`
            SELECT id_usuario,
                   nombre_completo AS nombre,
                   email,
                   rol,
                   password_hash
            FROM usuarios
            WHERE email = $1
        `, [email]);

        if (result.rows.length === 0 ||
            result.rows[0].password_hash !== password) {
            return res.status(401).json({
                success: false,
                error: "Credenciales incorrectas"
            });
        }

        delete result.rows[0].password_hash;

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
});

/* ================= LOGOUT ================= */
app.post('/api/logout', (req, res) => {
    res.json({ success: true });
});

/* ================= USUARIO ================= */
app.get('/api/usuario/:email', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id_usuario, nombre_completo, email, telefono
            FROM usuarios
            WHERE email = $1
        `, [req.params.email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error servidor" });
    }
});

/* ================= PRODUCTOS ================= */

/* ---- READ ALL ---- */
app.get('/api/productos', async (req, res) => {
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

/* ---- READ ONE ---- */
app.get('/api/productos/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM productos WHERE id_producto = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error servidor" });
    }
});

/* ---- CREATE ---- */
app.post('/api/productos', async (req, res) => {
    const { titulo, autor, precio, stock, categoria, imagen_url } = req.body;

    if (!titulo || !autor) {
        return res.status(400).json({ error: "Datos incompletos" });
    }

    try {
        const cat = await pool.query(
            'SELECT id_categoria FROM categorias WHERE nombre = $1',
            [categoria]
        );

        if (cat.rows.length === 0) {
            return res.status(400).json({ error: "Categoría inválida" });
        }

        await pool.query(`
            INSERT INTO productos
            (titulo, autor, precio, stock, id_categoria, imagen_url)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            titulo,
            autor,
            precio,
            stock,
            cat.rows[0].id_categoria,
            imagen_url
        ]);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear producto" });
    }
});

/* ---- UPDATE ---- */
app.put('/api/productos/:id', async (req, res) => {
    const { titulo, autor, precio, stock, categoria, imagen_url } = req.body;

    try {
        const cat = await pool.query(
            "SELECT id_categoria FROM categorias WHERE nombre = $1",
            [categoria]
        );

        if (cat.rows.length === 0) {
            return res.status(400).json({ error: "Categoría inválida" });
        }

        await pool.query(`
            UPDATE productos
            SET titulo = $1,
                autor = $2,
                precio = $3,
                stock = $4,
                id_categoria = $5,
                imagen_url = $6
            WHERE id_producto = $7
        `, [
            titulo,
            autor,
            precio,
            stock,
            cat.rows[0].id_categoria,
            imagen_url,
            req.params.id
        ]);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar" });
    }
});

/* ---- DELETE ---- */
app.delete('/api/productos/:id', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM productos WHERE id_producto = $1',
            [req.params.id]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(400).json({
            error: "No se puede eliminar: producto relacionado a ventas"
        });
    }
});

/* ================= DIRECCIONES ================= */
app.get('/api/direcciones/usuario/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM direcciones
            WHERE id_usuario = $1
            ORDER BY id_direccion DESC
        `, [req.params.id]);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error direcciones" });
    }
});

/* ================= VENTAS ================= */
app.post('/api/ventas/registrar', async (req, res) => {
    const { id_usuario, id_direccion, total, productos } = req.body;

    if (!productos?.length) {
        return res.status(400).json({ error: "Sin productos" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const venta = await client.query(`
            INSERT INTO ventas
            (id_usuario, id_direccion, total, fecha_venta, estado)
            VALUES ($1, $2, $3, NOW(), 'completado')
            RETURNING id_venta
        `, [id_usuario, id_direccion || null, total]);

        const idVenta = venta.rows[0].id_venta;

        for (const prod of productos) {

            await client.query(`
                INSERT INTO detalles_ventas
                (id_venta, id_producto, cantidad, precio_unitario)
                VALUES ($1, $2, $3, $4)
            `, [idVenta, prod.id_producto, prod.cantidad, prod.precio]);

            await client.query(`
                UPDATE productos
                SET stock = stock - $1
                WHERE id_producto = $2
            `, [prod.cantidad, prod.id_producto]);
        }

        await client.query('COMMIT');

        res.status(201).json({ success: true, id_venta: idVenta });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

pool.query("SELECT current_database()")
  .then(res => console.log("📌 Conectado a DB:", res.rows[0].current_database))
  .catch(err => console.error(err));

/* =====================================================
   404
===================================================== */
app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        path: req.path
    });
});

/* =====================================================
   ERRORES GLOBALES
===================================================== */
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Error interno" });
});

/* =====================================================
   INICIAR SERVIDOR
===================================================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.clear();
    console.log("🦉 LA LECHUZA LECTORA ONLINE");
    console.log(`http://localhost:${PORT}`);
});
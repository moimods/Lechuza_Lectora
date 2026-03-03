require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();

// ===============================
// CONFIGURACIÓN BASE
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// CONEXIÓN POSTGRESQL
// ===============================
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

pool.connect()
    .then(() => console.log("✅ Base de datos conectada"))
    .catch(err => console.error("❌ Error DB:", err));

// ===============================
// LOGIN
// ===============================
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "Email y contraseña requeridos"
        });
    }

    try {
        const result = await pool.query(
            `SELECT id_usuario,
                    nombre_completo AS nombre,
                    email,
                    rol,
                    password_hash
             FROM Usuarios
             WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: "Correo o contraseña incorrectos"
            });
        }

        // ⚠️ Comparación simple (recomendado usar bcrypt)
        if (result.rows[0].password_hash !== password) {
            return res.status(401).json({
                success: false,
                error: "Correo o contraseña incorrectos"
            });
        }

        delete result.rows[0].password_hash;

        res.json({
            success: true,
            message: "Login exitoso",
            user: result.rows[0]
        });

    } catch (err) {
        console.error("Error login:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// ===============================
// LOGOUT
// ===============================
app.post('/api/logout', (req, res) => {
    console.log("🦉 Sesión finalizada");
    res.json({ success: true });
});

// ===============================
// OBTENER USUARIO POR EMAIL
// ===============================
app.get('/api/usuario/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const result = await pool.query(
            `SELECT id_usuario, nombre_completo, email, telefono
             FROM Usuarios
             WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Usuario no encontrado" });

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener usuario" });
    }
});

// ===============================
// PRODUCTOS
// ===============================
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
            FROM Productos p
            LEFT JOIN Categorias c
            ON p.id_categoria = c.id_categoria
            ORDER BY p.id_producto
        `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

app.get('/api/productos/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM Productos WHERE id_producto = $1',
            [req.params.id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Producto no encontrado" });

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: "Error al obtener producto" });
    }
});

// ===============================
// DIRECCIONES
// ===============================
app.get('/api/direcciones/usuario/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM Direcciones
             WHERE id_usuario = $1
             ORDER BY id_direccion DESC`,
            [req.params.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener direcciones" });
    }
});

// ===============================
// REGISTRAR VENTA
// ===============================
app.post('/api/ventas/registrar', async (req, res) => {

    const { id_usuario, id_direccion, total, productos } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const venta = await client.query(
            `INSERT INTO Ventas
            (id_usuario,id_direccion,total,fecha_venta,estado)
            VALUES ($1,$2,$3,NOW(),'completado')
            RETURNING id_venta`,
            [id_usuario, id_direccion || null, total]
        );

        const idVenta = venta.rows[0].id_venta;

        for (const prod of productos) {

            await client.query(
                `INSERT INTO Detalles_Ventas
                (id_venta,id_producto,cantidad,precio_unitario)
                VALUES ($1,$2,$3,$4)`,
                [idVenta, prod.id_producto, prod.cantidad, prod.precio]
            );

            await client.query(
                `UPDATE Productos
                 SET stock = stock - $1
                 WHERE id_producto = $2`,
                [prod.cantidad, prod.id_producto]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            id_venta: idVenta
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: "Error en la venta" });
    } finally {
        client.release();
    }
});

// ===============================
// 404
// ===============================
app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        path: req.path
    });
});

// ===============================
// ERRORES GLOBALES
// ===============================
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: "Error interno del servidor"
    });
});

// ===============================
// INICIAR SERVIDOR
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.clear();
    console.log(`🦉 LA LECHUZA LECTORA ONLINE`);
    console.log(`http://localhost:${PORT}`);
});
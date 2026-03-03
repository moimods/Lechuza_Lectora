require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();

// --- 1. CONFIGURACIÓN Y MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la raíz y carpetas de recursos
app.use(express.static(path.join(__dirname))); 

// --- 2. CONEXIÓN A BASE DE DATOS ---
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Probar conexión inicial
pool.query('SELECT NOW()', (err) => {
    if (err) console.error("❌ Error conectando a PostgreSQL:", err.stack);
    else console.log("🐘 Conexión a Base de Datos: Exitosa");
});

// ==========================================
// 3. RUTAS DE NAVEGACIÓN (FRONTEND)
// ==========================================

// Inicia directamente en la Página Principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de Login
app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'Inicio_de_sesion', 'Inicio_sesion.html'));
});

// Panel Admin
app.get('/admin/panel', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Admin', 'panel_de_admin.html')));
app.get('/admin/inventario', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Admin', 'Gestion_de_inventario.html')));

// Secciones de Cliente
app.get('/inicio-cliente', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'Inicio_Logeado.html')));
app.get('/carrito', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'carrito.html')));
app.get('/perfil', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'perfil.html')));

// ==========================================
// 4. API (BACKEND)
// ==========================================

// Login con validación
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT id_usuario, nombre_completo as nombre, email, rol 
            FROM Usuarios 
            WHERE email = $1 AND password_hash = $2`;
        const result = await pool.query(query, [email, password]);

        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, error: "Credenciales inválidas." });
        }
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ success: false, error: "Error en el servidor." });
    }
});

// Logout (Aviso al servidor)
app.post('/api/logout', (req, res) => {
    console.log("🦉 Sesión finalizada en servidor.");
    res.json({ success: true });
});

// Registro de Ventas (Transacción Atómica)
app.post('/api/ventas/registrar', async (req, res) => {
    const { id_usuario, total, productos } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const resVenta = await client.query(
            `INSERT INTO Ventas (id_usuario, total, fecha_venta, estado) 
             VALUES ($1, $2, NOW(), 'completado') RETURNING id_venta`,
            [id_usuario, total]
        );
        const idVenta = resVenta.rows[0].id_venta;

        for (const item of productos) {
            await client.query(
                'INSERT INTO Detalles_Ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idVenta, item.id, item.quantity, item.price]
            );
            await client.query('UPDATE Productos SET stock = stock - $1 WHERE id_producto = $2', [item.quantity, item.id]);
        }

        await client.query('COMMIT');
        res.json({ success: true, id_venta: idVenta });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, error: "Fallo en la transacción." });
    } finally {
        client.release();
    }
});

// Catálogo de Productos
app.get('/api/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Productos ORDER BY id_producto ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos." });
    }
});

// ==========================================
// 5. MANEJO DE ERRORES (404)
// ==========================================
app.use((req, res) => {
    res.status(404).send(`
        <div style="text-align:center; padding:50px; font-family:Arial, sans-serif; color:#5d4037;">
            <h1>🦉 404 - ¡Vuelo equivocado!</h1>
            <p>La página que buscas no existe en el nido.</p>
            <a href="/" style="color:#fbc02d; font-weight:bold; text-decoration:none;">Volver a la Página Principal</a>
        </div>
    `);
});

// --- 6. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.clear();
    console.log(`\x1b[32m%s\x1b[0m`, `✨ LA LECHUZA LECTORA ✨`);
    console.log(`🏠 Home:    http://localhost:${PORT}`);
});
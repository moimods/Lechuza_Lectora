require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ==========================================
// 1. AUTENTICACIÓN Y SEGURIDAD
// ==========================================

// Registro de Usuario
app.post('/api/registro', async (req, res) => {
    const { nombre, email, password, telefono } = req.body;
    try {
        const query = `
            INSERT INTO Usuarios (nombre_completo, email, password_hash, telefono, rol) 
            VALUES ($1, $2, $3, $4, 'cliente') RETURNING id_usuario`;
        const result = await pool.query(query, [nombre, email, password, telefono]);
        res.status(201).json({ success: true, id: result.rows[0].id_usuario });
    } catch (err) {
        console.error("Error en registro:", err.message);
        res.status(500).json({ success: false, error: "El correo ya existe o faltan datos." });
    }
});

// Login (Clientes y Admins)
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
            res.status(401).json({ success: false, error: "Correo o contraseña incorrectos." });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "Error interno del servidor." });
    }
});

// Actualizar Contraseña (Recuperación)
app.put('/api/actualizar-password', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Ajustado a los nombres de columna correctos: password_hash y email
        const query = 'UPDATE Usuarios SET password_hash = $1 WHERE email = $2';
        const result = await pool.query(query, [password, email]);

        if (result.rowCount > 0) {
            res.json({ success: true, message: "Contraseña actualizada correctamente" });
        } else {
            res.status(404).json({ success: false, error: "Usuario no encontrado" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Error en el servidor al actualizar clave" });
    }
});

// ==========================================
// 2. PANEL ADMINISTRATIVO (NUEVO)
// ==========================================

// Obtener todos los usuarios para la tabla del administrador
app.get('/api/admin/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT id_usuario, nombre_completo, email, rol, telefono FROM Usuarios ORDER BY id_usuario ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "No se pudo obtener la lista de usuarios" });
    }
});

// ==========================================
// 3. PRODUCTOS, DIRECCIONES Y PEDIDOS
// ==========================================

app.get('/api/libros/stock/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT stock_actual FROM Libros WHERE id_libro = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pedidos/crear', async (req, res) => {
    const client = await pool.connect(); 
    try {
        await client.query('BEGIN');
        const { id_usuario, id_direccion, total, productos } = req.body;

        const queryPedido = `
            INSERT INTO Pedidos (id_usuario, id_direccion, id_metodo_pago, total, subtotal, envio, estado, fecha_pedido) 
            VALUES ($1, $2, 1, $3, $3, 0.00, 'pagado', NOW()) RETURNING id_pedido`;
        
        const pedidoRes = await client.query(queryPedido, [id_usuario, id_direccion || null, total]);
        const idPedido = pedidoRes.rows[0].id_pedido;

        for (const prod of productos) {
            await client.query('INSERT INTO Detalle_Pedidos (id_pedido, id_libro, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)', [idPedido, prod.id_libro, prod.cantidad, prod.precio]);
            await client.query('UPDATE Libros SET stock_actual = stock_actual - $1 WHERE id_libro = $2', [prod.cantidad, prod.id_libro]);
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, id_pedido: idPedido });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Error en la compra", detalle: err.message });
    } finally { client.release(); }
});

// ==========================================
// 4. RUTAS DE NAVEGACIÓN
// ==========================================

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/inicio', (req, res) => res.sendFile(path.join(__dirname, 'Paginas', 'Usuarios', 'Inicio_Logeado.html')));

// --- MANEJO 404 ---
app.use((req, res) => {
    res.status(404).send('<h1 style="text-align:center; margin-top:50px;">🦉 404 - Página no encontrada</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `✨ SERVER ONLINE - PUERTO ${PORT} ✨`);
});
// Para el Reporte de Ventas (Gráfica)
app.get('/api/reportes/ventas-mensuales', async (req, res) => {
    // Aquí harías un COUNT o SUM agrupado por mes en SQL
});

// Para eliminar productos (Usado en Gestión_de_inventario.html)
app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Libros WHERE id_libro = $1', [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// Endpoint para obtener todas las compras (Pedidos + Nombre del Cliente)
app.get('/api/admin/pedidos', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id_pedido, 
                u.nombre_completo AS nombre_cliente, 
                p.fecha_pedido, 
                p.total, 
                p.estado 
            FROM Pedidos p
            JOIN Usuarios u ON p.id_usuario = u.id_usuario
            ORDER BY p.fecha_pedido DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener el reporte de compras" });
    }
});
 // Endpoint de analítica de ventas
app.get('/api/reportes/ventas-totales', async (req, res) => {
    try {
        // Consulta para ingresos totales y conteo
        const resumenQuery = `
            SELECT 
                SUM(total) as ingresos_totales, 
                COUNT(id_pedido) as total_pedidos,
                AVG(total) as ticket_promedio
            FROM Pedidos WHERE estado = 'pagado'`;
        
        // Consulta para el top de libros (basado en Detalle_Pedidos)
        const topLibrosQuery = `
            SELECT l.titulo, SUM(dp.cantidad) as total_vendido
            FROM Detalle_Pedidos dp
            JOIN Libros l ON dp.id_libro = l.id_libro
            GROUP BY l.titulo
            ORDER BY total_vendido DESC LIMIT 5`;

        const resumen = await pool.query(resumenQuery);
        const top = await pool.query(topLibrosQuery);

        res.json({
            resumen: resumen.rows[0],
            top: top.rows
        });
    } catch (err) {
        res.status(500).json({ error: "Error al generar estadísticas" });
    }
});
// Ruta para generar estadísticas avanzadas de ventas
app.get('/api/admin/estadisticas-ventas', async (req, res) => {
    try {
        // 1. Resumen general
        const resumenRes = await pool.query(`
            SELECT 
                COALESCE(SUM(total), 0) as total_ganancias, 
                COUNT(*) as total_pedidos,
                COALESCE(AVG(total), 0) as promedio
            FROM Pedidos 
            WHERE estado = 'pagado'
        `);

        // 2. Top 5 libros más vendidos (Uniendo Pedidos con Libros)
        const topRes = await pool.query(`
            SELECT l.titulo, SUM(dp.cantidad) as total_vendido
            FROM Detalle_Pedidos dp
            JOIN Libros l ON dp.id_libro = l.id_libro
            GROUP BY l.titulo
            ORDER BY total_vendido DESC
            LIMIT 5
        `);

        // 3. Datos para la gráfica (Ventas por mes del último año)
        const graficaRes = await pool.query(`
            SELECT to_char(fecha_pedido, 'Mon') as mes, SUM(total) as monto
            FROM Pedidos
            WHERE fecha_pedido > NOW() - INTERVAL '6 months'
            GROUP BY mes, to_char(fecha_pedido, 'MM')
            ORDER BY to_char(fecha_pedido, 'MM')
        `);

        res.json({
            resumen: resumenRes.rows[0],
            top: topRes.rows,
            grafica: graficaRes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor");
    }
});
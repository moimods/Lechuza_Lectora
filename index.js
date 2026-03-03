const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db'); 

const app = express();

// --- 1. CONFIGURACIÓN Y MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SERVICIO DE ARCHIVOS ESTÁTICOS
// Esto permite que el navegador encuentre tus carpetas de recursos sin importar la URL
app.use(express.static(path.join(__dirname))); 
app.use('/Estilos', express.static(path.join(__dirname, 'Estilos')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));
app.use('/Imagenes', express.static(path.join(__dirname, 'Imagenes')));

// --- 2. API DE USUARIOS (REGISTRO Y LOGIN) ---
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

// --- 3. API DE PRODUCTOS ---
app.get('/api/productos', async (req, res) => {
    const soloDisponibles = req.query.disponibles === 'true';
    try {
        let sql = `
            SELECT p.*, c.nombre as categoria 
            FROM Productos p 
            LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria`;
        
        if (soloDisponibles) {
            sql += ` WHERE p.stock > 0`;
        }
        
        sql += ` ORDER BY p.id_producto ASC`;
        
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "No se pudieron cargar los productos." });
    }
});

app.post('/api/productos', async (req, res) => {
    const { titulo, autor, precio, stock, categoria, imagen_url } = req.body;
    try {
        const catRes = await pool.query('SELECT id_categoria FROM Categorias WHERE nombre = $1', [categoria]);
        if (catRes.rows.length === 0) return res.status(400).json({ error: "Categoría no válida" });

        const id_categoria = catRes.rows[0].id_categoria;
        const query = `
            INSERT INTO Productos (titulo, autor, precio, stock, id_categoria, imagen_url)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const resultado = await pool.query(query, [titulo, autor, precio, stock, id_categoria, imagen_url]);
        res.status(201).json({ success: true, producto: resultado.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al guardar el producto" });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Productos WHERE id_producto = $1', [id]);
        res.json({ success: true, message: "Producto eliminado correctamente." });
    } catch (err) {
        console.error("Error al eliminar:", err.message);
        res.status(500).json({ error: "No se puede eliminar un libro que ya ha sido vendido." });
    }
});

// --- 4. API DE VENTAS Y REPORTES ---
app.post('/api/ventas/registrar', async (req, res) => {
    const { id_usuario, id_direccion, total, productos } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const queryVenta = `
            INSERT INTO Ventas (id_usuario, id_direccion, total, fecha_venta, estado) 
            VALUES ($1, $2, $3, NOW(), 'completado') RETURNING id_venta`;
        const resultVenta = await client.query(queryVenta, [id_usuario, id_direccion, total]);
        const idVenta = resultVenta.rows[0].id_venta;

        for (const prod of productos) {
            await client.query(
                'INSERT INTO Detalles_Ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idVenta, prod.id, prod.quantity, prod.price]
            );
            await client.query('UPDATE Productos SET stock = stock - $1 WHERE id_producto = $2', [prod.quantity, prod.id]);
        }
        await client.query('COMMIT');
        res.json({ success: true, id_venta: idVenta });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, error: "Error en la transacción." });
    } finally {
        client.release();
    }
});

app.get('/api/reportes/ventas-mensuales', async (req, res) => {
    try {
        const query = `
            SELECT TO_CHAR(fecha_venta, 'Mon') as mes, SUM(total) as monto, EXTRACT(MONTH FROM fecha_venta) as mes_num
            FROM Ventas WHERE EXTRACT(YEAR FROM fecha_venta) = 2026
            GROUP BY mes, mes_num ORDER BY mes_num`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error en reporte" });
    }
});

// --- 5. RUTAS DE NAVEGACIÓN (FRONTEND) CORREGIDAS ---

// Raíz e Inicio de Sesión
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Inicio_de_sesion', 'Inicio_sesion.html')));

// Administración (RUTAS CORREGIDAS A /html/Admin/)
app.get('/admin/panel', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Admin', 'panel_de_admin.html')));
app.get('/admin/inventario', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Admin', 'Gestion_de_inventario.html')));
app.get('/admin/reporte-ventas', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Admin', 'Reporte_de_ventas.html')));
app.get('/admin/reporte-compras', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Admin', 'Reporte_de_compras.html')));
app.get('/admin/nuevo-producto', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Admin', 'Gestion_productos.html')));

// Usuario Logeado (RUTAS EN /html/Logeado/)
app.get('/inicio-cliente', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'Inicio_Logeado.html')));
app.get('/mi-carrito', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'carrito.html')));
app.get('/perfil', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'perfil.html')));
app.get('/contacto', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'Contacto.html')));

// Flujo de compra (RUTAS EN /html/Logeado/compra/)
app.get('/compra/domicilio', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'compra', 'domicilio.html')));
app.get('/compra/procesando', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'compra', 'Procesando.html')));
app.get('/compra/exito', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Logeado', 'compra', 'Exito.html')));

// --- 6. MANEJO DE ERRORES 404 ---
app.use((req, res) => {
    // Intentamos enviar tu archivo 404 si existe, si no, enviamos el HTML de respaldo
    const path404 = path.join(__dirname, '404.html');
    res.status(404).sendFile(path404, (err) => {
        if (err) {
            res.send(`
                <div style="text-align:center; font-family:sans-serif; margin-top:100px; color:#5d4037;">
                    <h1>🦉 404 - ¡Vuelo equivocado!</h1>
                    <p>La página solicitada no existe.</p>
                    <a href="/">Volver al Inicio</a>
                </div>`);
        }
    });
});

// --- 7. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.clear();
    console.log(`\x1b[32m%s\x1b[0m`, `✨ LA LECHUZA LECTORA - SERVER ONLINE ✨`);
    console.log(`🏠 Home:           http://localhost:${PORT}`);
    console.log(`📊 Panel Admin:    http://localhost:${PORT}/admin/panel`);
    console.log(`📦 Inventario:     http://localhost:${PORT}/admin/inventario`);
});
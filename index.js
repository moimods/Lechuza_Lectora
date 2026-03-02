const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db'); 

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
// Servir archivos estáticos (CSS, Imágenes, JS del cliente)
app.use(express.static(path.join(__dirname))); 

// --- API USUARIOS: REGISTRO Y LOGIN ---
app.post('/api/registro', async (req, res) => {
    const { nombre, email, password, telefono } = req.body;
    try {
        const query = 'INSERT INTO Usuarios (nombre_completo, email, password_hash, telefono, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario';
        const values = [nombre, email, password, telefono, 'cliente'];
        const result = await pool.query(query, values);
        res.status(201).json({ success: true, id: result.rows[0].id_usuario });
    } catch (err) {
        console.error("Error en registro:", err.message);
        res.status(500).json({ success: false, error: "El correo ya existe o faltan datos" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT nombre_completo as nombre, email, rol FROM Usuarios WHERE email = $1 AND password_hash = $2';
        const result = await pool.query(query, [email, password]);
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, error: "Credenciales incorrectas" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "Error en el servidor" });
    }
});

// --- API ADMINISTRACIÓN: PRODUCTOS E INVENTARIO ---
app.get('/api/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Productos ORDER BY id_producto ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// --- API: OBTENER PERFIL DE USUARIO ---
app.get('/api/usuario/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const query = 'SELECT nombre_completo, email, telefono FROM Usuarios WHERE email = $1';
        const result = await pool.query(query, [email]);
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ error: "Error al obtener perfil" });
    }
});

app.post('/api/productos', async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    try {
        const query = 'INSERT INTO Productos (nombre, descripcion, precio, stock, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await pool.query(query, [nombre, descripcion, precio, stock, categoria]);
        res.status(201).json({ success: true, producto: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al crear producto" });
    }
});

app.put('/api/usuario/actualizar', (req, res) => {
    const { email, nombre } = req.body;
    const sql = "UPDATE Usuarios SET nombre_completo = ? WHERE email = ?";
    
    db.query(sql, [nombre, email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: "Error al actualizar" });
        }
        res.json({ mensaje: "Usuario actualizado con éxito" });
    });
});

// --- API ADMINISTRACIÓN: DASHBOARD Y REPORTES ---
app.get('/api/admin/stats', async (req, res) => {
    try {
        // Consultas en paralelo para mejor rendimiento
        const [totalVentas, totalLibros, stockBajo] = await Promise.all([
            pool.query('SELECT SUM(total) FROM Ventas'),
            pool.query('SELECT COUNT(*) FROM Productos'),
            pool.query('SELECT COUNT(*) FROM Productos WHERE stock < 5')
        ]);
        
        res.json({
            ventasTotales: parseFloat(totalVentas.rows[0].sum || 0),
            librosRegistrados: parseInt(totalLibros.rows[0].count),
            alertasStock: parseInt(stockBajo.rows[0].count)
        });
    } catch (err) {
        console.error("Error stats:", err.message);
        res.status(500).json({ error: "Error al cargar estadísticas" });
    }
});

// --- RUTAS PARA SERVIR LOS HTMLS (Frontend) ---

// Vistas de Autenticación
app.get('/registro', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Inicio_de_sesion', 'Registro.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Inicio_de_sesion', 'Inicio_sesion.html')));
app.get('/login-admin', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Inicio_de_sesion', 'Inicio_sesion_admin.html')));

// Vistas del Panel de Administrador (Rutas corregidas)
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Administrador', 'dashboard_inventario.html')));
app.get('/admin/inventario', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Administrador', 'Gestion_de_inventario.html')));
app.get('/admin/reporte-ventas', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Administrador', 'Reporte_de_ventas.html')));
app.get('/admin/reporte-compras', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Administrador', 'Reporte_de_compras.html')));
app.get('/admin/productos', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Administrador', 'Gestion_productos.html')));
app.get('/admin/perfil', (req, res) => res.sendFile(path.join(__dirname, 'html', 'Administrador', 'panel_de_admin.html')));

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de La Lechuza Lectora corriendo en http://localhost:${PORT}`);
});

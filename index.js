<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
=======
// Adding missing endpoints and fixing age validation

const express = require('express');
const router = express.Router();
>>>>>>> 8f85dd1101edd13231a5807a1fe6243e7f21665d

// Missing Endpoints

// Endpoint to get user directions by ID
router.get('/api/direcciones/usuario/:id', (req, res) => {
    const userId = req.params.id;
    // Implementation to retrieve user directions
});

<<<<<<< HEAD
// Servir la raíz y carpetas de recursos
app.use(express.static(path.join(__dirname))); 
app.use('/Estilos', express.static(path.join(__dirname, 'Estilos')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));
app.use('/Imagenes', express.static(path.join(__dirname, 'Imagenes')));

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
app.get('/login', (req, res) => {
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
// 4. API DE AUTENTICACIÓN Y USUARIOS
// ==========================================

/**
 * REGISTRO DE USUARIO CON VALIDACIÓN DE EDAD
 * POST /api/registro
 * Body: { nombre, email, password, telefono, fecha_nacimiento }
 */
app.post('/api/registro', async (req, res) => {
    const { nombre, email, password, telefono, fecha_nacimiento } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !password || !telefono || !fecha_nacimiento) {
        return res.status(400).json({ 
            success: false, 
            error: "Todos los campos son requeridos" 
        });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            error: "Email no válido" 
        });
    }

    // Validar teléfono
    if (!/^\d{8,15}$/.test(telefono)) {
        return res.status(400).json({ 
            success: false, 
            error: "Teléfono debe tener entre 8 y 15 números" 
        });
    }

    // ✅ VALIDAR EDAD (MAYOR DE 18 AÑOS)
    const birthDate = new Date(fecha_nacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        return res.status(400).json({ 
            success: false, 
            error: "Debes ser mayor de 18 años para registrarte" 
        });
    }

    try {
        const query = `
            INSERT INTO Usuarios (nombre_completo, email, password_hash, telefono, rol) 
            VALUES ($1, $2, $3, $4, 'cliente') 
            RETURNING id_usuario, nombre_completo, email`;
        
        const result = await pool.query(query, [nombre, email, password, telefono]);
        
        res.status(201).json({ 
            success: true, 
            message: "Registro exitoso",
            user: result.rows[0]
        });
    } catch (err) {
        console.error("Error en registro:", err.message);
        
        // Detectar error de correo duplicado
        if (err.code === '23505') {
            return res.status(400).json({ 
                success: false, 
                error: "El correo ya está registrado" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            error: "Error al registrar usuario" 
        });
=======
// Endpoint to get user by email
router.get('/api/usuario/:email', (req, res) => {
    const userEmail = req.params.email;
    // Implementation to retrieve user by email
});

// Endpoint to get orders by user ID
router.get('/api/pedidos/usuario/:id', (req, res) => {
    const userId = req.params.id;
    // Implementation to retrieve user orders
});

// Endpoint to create a new order
router.post('/api/pedidos/crear', (req, res) => {
    // Implementation to create a new order
});

// Admin statistics endpoint
router.get('/api/admin/estadisticas-ventas', (req, res) => {
    // Implementation to get sales statistics
});

// Updated /api/registro endpoint with age validation
router.post('/api/registro', (req, res) => {
    const { username, password, age } = req.body;
    // Age validation
    if (age < 18) {
        return res.status(400).json({ message: 'Age must be 18 or older.' });
>>>>>>> 8f85dd1101edd13231a5807a1fe6243e7f21665d
    }
    // Implementation to handle registration
});

<<<<<<< HEAD
/**
 * LOGIN DE USUARIO
 * POST /api/login
 * Body: { email, password }
 */
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            error: "Email y contraseña requeridos" 
        });
    }

    try {
        const query = `
            SELECT id_usuario, nombre_completo as nombre, email, rol 
            FROM Usuarios 
            WHERE email = $1 AND password_hash = $2`;
        
        const result = await pool.query(query, [email, password]);
        
        if (result.rows.length > 0) {
            res.json({ 
                success: true, 
                message: "Login exitoso",
                user: result.rows[0] 
            });
        } else {
            res.status(401).json({ 
                success: false, 
                error: "Correo o contraseña incorrectos" 
            });
        }
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ 
            success: false, 
            error: "Error interno del servidor" 
        });
    }
});

/**
 * LOGOUT (Limpieza en servidor)
 * POST /api/logout
 */
app.post('/api/logout', (req, res) => {
    console.log("🦉 Sesión finalizada en servidor");
    res.json({ success: true, message: "Sesión cerrada correctamente" });
});

/**
 * OBTENER USUARIO POR EMAIL
 * GET /api/usuario/:email
 */
app.get('/api/usuario/:email', async (req, res) => {
    const { email } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT id_usuario, nombre_completo, email, telefono FROM Usuarios WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener usuario:", err);
        res.status(500).json({ error: "Error al obtener usuario" });
    }
});

/**
 * ACTUALIZAR CONTRASEÑA
 * PUT /api/actualizar-password
 * Body: { email, password }
 */
app.put('/api/actualizar-password', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            error: "Email y contraseña requeridos" 
        });
    }

    try {
        const query = 'UPDATE Usuarios SET password_hash = $1 WHERE email = $2 RETURNING id_usuario';
        const result = await pool.query(query, [password, email]);

        if (result.rowCount > 0) {
            res.json({ 
                success: true, 
                message: "Contraseña actualizada correctamente" 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                error: "Usuario no encontrado" 
            });
        }
    } catch (err) {
        console.error("Error al actualizar contraseña:", err);
        res.status(500).json({ 
            success: false, 
            error: "Error al actualizar contraseña" 
        });
    }
});

/**
 * ENVIAR CÓDIGO DE RECUPERACIÓN
 * POST /api/recuperacion/enviar-codigo
 * Body: { email }
 */
app.post('/api/recuperacion/enviar-codigo', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            success: false, 
            error: "Email requerido" 
        });
    }

    try {
        // Verificar que el usuario existe
        const userQuery = 'SELECT id_usuario FROM Usuarios WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: "Usuario no encontrado" 
            });
        }

        // Generar código aleatorio
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        
        console.log(`📧 Código de recuperación para ${email}: ${codigo}`);
        
        // En producción aquí enviarías email
        
        res.json({ 
            success: true, 
            message: `Código enviado a ${email}`,
            codigo: codigo // SOLO PARA DESARROLLO
        });
    } catch (err) {
        console.error("Error al enviar código:", err);
        res.status(500).json({ 
            success: false, 
            error: "Error al procesar solicitud de recuperación" 
        });
    }
});

// ==========================================
// 5. API DE DIRECCIONES (NUEVO - CRÍTICO)
// ==========================================

/**
 * OBTENER DIRECCIONES DE UN USUARIO
 * GET /api/direcciones/usuario/:id
 */
app.get('/api/direcciones/usuario/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT id_direccion, id_usuario, direccion_texto, colonia, municipio_alcaldia, 
                    estado, cp, tipo_domicilio, nombre_contacto, telefono_contacto, indicaciones
             FROM Direcciones 
             WHERE id_usuario = $1 
             ORDER BY id_direccion DESC`,
            [id]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener direcciones:", err);
        res.status(500).json({ error: "Error al obtener direcciones" });
    }
});

/**
 * CREAR NUEVA DIRECCIÓN
 * POST /api/direcciones/agregar
 * Body: { id_usuario, direccion_texto, colonia, municipio_alcaldia, estado, cp, tipo_domicilio, nombre_contacto, telefono_contacto, indicaciones }
 */
app.post('/api/direcciones/agregar', async (req, res) => {
    const { 
        id_usuario, direccion_texto, colonia, municipio_alcaldia, 
        estado, cp, tipo_domicilio, nombre_contacto, telefono_contacto, indicaciones 
    } = req.body;
    
    if (!id_usuario || !direccion_texto || !colonia || !estado || !cp) {
        return res.status(400).json({ 
            error: "Faltan campos requeridos" 
        });
    }

    try {
        const query = `
            INSERT INTO Direcciones (id_usuario, direccion_texto, colonia, municipio_alcaldia, estado, cp, tipo_domicilio, nombre_contacto, telefono_contacto, indicaciones)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id_direccion`;
        
        const result = await pool.query(query, [
            id_usuario, direccion_texto, colonia, municipio_alcaldia,
            estado, cp, tipo_domicilio || 'Casa', nombre_contacto, telefono_contacto, indicaciones
        ]);
        
        res.status(201).json({ 
            success: true, 
            message: "Dirección agregada correctamente",
            id_direccion: result.rows[0].id_direccion
        });
    } catch (err) {
        console.error("Error al agregar dirección:", err);
        res.status(500).json({ error: "Error al guardar dirección" });
    }
});

// ==========================================
// 6. API DE PRODUCTOS
// ==========================================

/**
 * OBTENER TODOS LOS PRODUCTOS
 * GET /api/productos?disponibles=true
 */
app.get('/api/productos', async (req, res) => {
    const soloDisponibles = req.query.disponibles === 'true';
    
    try {
        let sql = `
            SELECT p.id_producto, p.titulo, p.autor, p.precio, p.stock, p.imagen_url, c.nombre as categoria
            FROM Productos p 
            LEFT JOIN Categorias c ON p.id_categoria = c.id_categoria`;
        
        if (soloDisponibles) {
            sql += ` WHERE p.stock > 0`;
        }
        
        sql += ` ORDER BY p.id_producto ASC`;
        
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener productos:", err);
        res.status(500).json({ error: "No se pudieron cargar los productos" });
    }
});

/**
 * OBTENER UN PRODUCTO ESPECÍFICO
 * GET /api/productos/:id
 */
app.get('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT * FROM Productos WHERE id_producto = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener producto" });
    }
});

/**
 * CREAR NUEVO PRODUCTO (ADMIN)
 * POST /api/productos
 * Body: { titulo, autor, precio, stock, categoria, imagen_url }
 */
app.post('/api/productos', async (req, res) => {
    const { titulo, autor, precio, stock, categoria, imagen_url } = req.body;
    
    // Validaciones
    if (!titulo || !precio || stock === undefined) {
        return res.status(400).json({ 
            error: "Título, precio y stock son requeridos" 
        });
    }

    try {
        // Obtener ID de categoría
        const catRes = await pool.query(
            'SELECT id_categoria FROM Categorias WHERE nombre = $1',
            [categoria || 'General']
        );
        
        let id_categoria = null;
        if (catRes.rows.length > 0) {
            id_categoria = catRes.rows[0].id_categoria;
        }

        const query = `
            INSERT INTO Productos (titulo, autor, precio, stock, id_categoria, imagen_url)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
        
        const resultado = await pool.query(query, [
            titulo, 
            autor || null, 
            parseFloat(precio), 
            parseInt(stock), 
            id_categoria,
            imagen_url || null
        ]);
        
        res.status(201).json({ 
            success: true, 
            producto: resultado.rows[0] 
        });
    } catch (err) {
        console.error("Error al crear producto:", err);
        res.status(500).json({ error: "Error al guardar el producto" });
    }
});

/**
 * ACTUALIZAR PRODUCTO (ADMIN)
 * PUT /api/productos/:id
 * Body: { titulo, precio, stock, etc... }
 */
app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, precio, stock } = req.body;

    try {
        const query = `
            UPDATE Productos 
            SET titulo = COALESCE($1, titulo),
                precio = COALESCE($2, precio),
                stock = COALESCE($3, stock)
            WHERE id_producto = $4
            RETURNING *`;
        
        const result = await pool.query(query, [titulo, precio, stock, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json({ success: true, producto: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar producto" });
    }
});

/**
 * ELIMINAR PRODUCTO (ADMIN)
 * DELETE /api/productos/:id
 */
app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'DELETE FROM Productos WHERE id_producto = $1 RETURNING id_producto',
            [id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json({ 
            success: true, 
            message: "Producto eliminado correctamente" 
        });
    } catch (err) {
        console.error("Error al eliminar:", err.message);
        res.status(500).json({ 
            error: "No se puede eliminar un producto que ya ha sido vendido" 
        });
    }
});

// ==========================================
// 7. API DE VENTAS / PEDIDOS
// ==========================================

/**
 * REGISTRAR VENTA (TRANSACCIÓN ATÓMICA)
 * POST /api/ventas/registrar
 * Body: { id_usuario, id_direccion, total, productos }
 */
app.post('/api/ventas/registrar', async (req, res) => {
    const { id_usuario, id_direccion, total, productos } = req.body;
    
    if (!id_usuario || !total || !productos) {
        return res.status(400).json({ 
            success: false, 
            error: "Datos incompletos para registrar venta" 
        });
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const queryVenta = `
            INSERT INTO Ventas (id_usuario, id_direccion, total, fecha_venta, estado) 
            VALUES ($1, $2, $3, NOW(), 'completado') 
            RETURNING id_venta`;
        
        const resultVenta = await client.query(queryVenta, [
            id_usuario, 
            id_direccion || null, 
            parseFloat(total)
        ]);
        
        const idVenta = resultVenta.rows[0].id_venta;

        // Registrar detalles de venta y actualizar stock
        for (const prod of productos) {
            const idProducto = prod.id || prod.id_producto || prod.id_libro;
            const cantidad = parseInt(prod.quantity || prod.cantidad || 1);
            const precioUnitario = parseFloat(prod.price || prod.precio || 0);

            await client.query(
                'INSERT INTO Detalles_Ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idVenta, idProducto, cantidad, precioUnitario]
            );
            
            await client.query(
                'UPDATE Productos SET stock = stock - $1 WHERE id_producto = $2',
                [cantidad, idProducto]
            );
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            success: true, 
            message: "Venta registrada correctamente",
            id_venta: idVenta 
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error en venta:", err);
        res.status(500).json({ 
            success: false, 
            error: "Error en la transacción de venta" 
        });
    } finally {
        client.release();
    }
});

/**
 * CREAR PEDIDO (ALIAS DE VENTA)
 * POST /api/pedidos/crear
 * Body: { id_usuario, id_direccion, total, metodo_pago, productos }
 */
app.post('/api/pedidos/crear', async (req, res) => {
    const { id_usuario, id_direccion, total, metodo_pago, productos } = req.body;
    
    if (!id_usuario || !total || !productos) {
        return res.status(400).json({ 
            success: false, 
            error: "Datos incompletos para crear pedido" 
        });
    }

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const queryPedido = `
            INSERT INTO Ventas (id_usuario, id_direccion, total, fecha_venta, estado, metodo_pago) 
            VALUES ($1, $2, $3, NOW(), 'pendiente', $4) 
            RETURNING id_venta`;
        
        const resultPedido = await client.query(queryPedido, [
            id_usuario, 
            id_direccion || null, 
            parseFloat(total),
            metodo_pago || 'tarjeta'
        ]);
        
        const idPedido = resultPedido.rows[0].id_venta;

        // Registrar detalles del pedido
        for (const prod of productos) {
            const idProducto = prod.id || prod.id_producto || prod.id_libro;
            const cantidad = parseInt(prod.quantity || prod.cantidad || 1);
            const precioUnitario = parseFloat(prod.price || prod.precio || 0);

            await client.query(
                'INSERT INTO Detalles_Ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idPedido, idProducto, cantidad, precioUnitario]
            );
            
            // Actualizar stock
            await client.query(
                'UPDATE Productos SET stock = stock - $1 WHERE id_producto = $2',
                [cantidad, idProducto]
            );
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            success: true, 
            message: "Pedido creado correctamente",
            id_pedido: idPedido 
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error al crear pedido:", err);
        res.status(500).json({ 
            success: false, 
            error: "Error al crear el pedido" 
        });
    } finally {
        client.release();
    }
});

/**
 * OBTENER PEDIDOS DE UN USUARIO
 * GET /api/pedidos/usuario/:id
 */
app.get('/api/pedidos/usuario/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT id_venta, fecha_venta, total, estado
             FROM Ventas
             WHERE id_usuario = $1
             ORDER BY fecha_venta DESC`,
            [id]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener pedidos:", err);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

/**
 * OBTENER REPORTES DE VENTAS MENSUALES
 * GET /api/reportes/ventas-mensuales
 */
app.get('/api/reportes/ventas-mensuales', async (req, res) => {
    try {
        const query = `
            SELECT 
                TO_CHAR(fecha_venta, 'Mon') as mes, 
                SUM(total) as monto, 
                EXTRACT(MONTH FROM fecha_venta) as mes_num,
                COUNT(*) as cantidad_ventas
            FROM Ventas 
            WHERE EXTRACT(YEAR FROM fecha_venta) = EXTRACT(YEAR FROM NOW())
            GROUP BY mes, mes_num 
            ORDER BY mes_num`;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error en reporte:", err);
        res.status(500).json({ error: "Error al generar reporte" });
    }
});

// ==========================================
// 8. API DE ADMIN - ESTADÍSTICAS
// ==========================================

/**
 * OBTENER ESTADÍSTICAS DEL ADMIN
 * GET /api/admin/estadisticas
 */
app.get('/api/admin/estadisticas', async (req, res) => {
    try {
        // Total de stock
        const stockRes = await pool.query(
            'SELECT COALESCE(SUM(stock), 0) as total FROM Productos'
        );
        
        // Total de libros/productos
        const librosRes = await pool.query(
            'SELECT COUNT(*) as total FROM Productos'
        );
        
        // Total de pedidos/ventas
        const pedidosRes = await pool.query(
            'SELECT COUNT(*) as total FROM Ventas'
        );
        
        // Ingresos totales
        const ingresosRes = await pool.query(
            'SELECT COALESCE(SUM(total), 0) as total FROM Ventas WHERE estado = \'completado\''
        );

        // Venta promedio
        const promedioRes = await pool.query(
            'SELECT COALESCE(AVG(total), 0) as promedio FROM Ventas WHERE estado = \'completado\''
        );

        res.json({
            stock: parseInt(stockRes.rows[0].total),
            totalLibros: parseInt(librosRes.rows[0].total),
            totalPedidos: parseInt(pedidosRes.rows[0].total),
            ingresosTotales: parseFloat(ingresosRes.rows[0].total).toFixed(2),
            ventaPromedio: parseFloat(promedioRes.rows[0].promedio).toFixed(2)
        });
    } catch (err) {
        console.error("Error en estadísticas:", err);
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
});

/**
 * OBTENER ESTADÍSTICAS DE VENTAS CON DETALLES
 * GET /api/admin/estadisticas-ventas
 */
app.get('/api/admin/estadisticas-ventas', async (req, res) => {
    try {
        // Resumen general
        const resumen = await pool.query(`
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(total) as total_ganancias,
                AVG(total) as promedio
            FROM Ventas WHERE estado = 'completado'
        `);

        // Top 5 productos más vendidos
        const top = await pool.query(`
            SELECT 
                p.titulo,
                SUM(dv.cantidad) as total_vendido,
                SUM(dv.cantidad * dv.precio_unitario) as ingresos
            FROM Detalles_Ventas dv
            JOIN Productos p ON dv.id_producto = p.id_producto
            GROUP BY p.titulo
            ORDER BY total_vendido DESC
            LIMIT 5
        `);

        // Gráfica mensual
        const grafica = await pool.query(`
            SELECT 
                TO_CHAR(fecha_venta, 'Mon') as mes,
                EXTRACT(MONTH FROM fecha_venta) as mes_num,
                SUM(total) as monto
            FROM Ventas
            WHERE EXTRACT(YEAR FROM fecha_venta) = EXTRACT(YEAR FROM NOW())
            GROUP BY TO_CHAR(fecha_venta, 'Mon'), EXTRACT(MONTH FROM fecha_venta)
            ORDER BY mes_num
        `);

        res.json({
            resumen: resumen.rows[0],
            top: top.rows,
            grafica: grafica.rows
        });
    } catch (err) {
        console.error("Error en estadísticas de ventas:", err);
        res.status(500).json({ error: "Error al obtener estadísticas de ventas" });
    }
});

/**
 * OBTENER LISTA DE USUARIOS (ADMIN)
 * GET /api/admin/usuarios
 */
app.get('/api/admin/usuarios', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id_usuario, nombre_completo, email, rol, telefono, created_at FROM Usuarios ORDER BY id_usuario DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

/**
 * OBTENER LISTA DE PEDIDOS (ADMIN)
 * GET /api/admin/pedidos
 */
app.get('/api/admin/pedidos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                v.id_venta,
                u.nombre_completo as nombre_cliente,
                u.email,
                v.fecha_venta,
                v.total,
                v.estado,
                COUNT(dv.id_detalle) as cantidad_items
            FROM Ventas v
            JOIN Usuarios u ON v.id_usuario = u.id_usuario
            LEFT JOIN Detalles_Ventas dv ON v.id_venta = dv.id_venta
            GROUP BY v.id_venta, u.nombre_completo, u.email, v.fecha_venta, v.total, v.estado
            ORDER BY v.fecha_venta DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener pedidos:", err);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

/**
 * OBTENER DETALLES DE UN PEDIDO (ADMIN)
 * GET /api/admin/pedidos/:id
 */
app.get('/api/admin/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(`
            SELECT 
                v.id_venta,
                u.nombre_completo,
                u.email,
                u.telefono,
                v.fecha_venta,
                v.total,
                v.estado,
                p.titulo,
                p.precio,
                dv.cantidad,
                (dv.cantidad * dv.precio_unitario) as subtotal
            FROM Ventas v
            JOIN Usuarios u ON v.id_usuario = u.id_usuario
            LEFT JOIN Detalles_Ventas dv ON v.id_venta = dv.id_venta
            LEFT JOIN Productos p ON dv.id_producto = p.id_producto
            WHERE v.id_venta = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener detalles del pedido" });
    }
});

/**
 * CAMBIAR ESTADO DE PEDIDO (ADMIN)
 * PUT /api/admin/pedidos/:id/estado
 * Body: { estado }
 */
app.put('/api/admin/pedidos/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    const estadosValidos = ['pendiente', 'procesando', 'completado', 'cancelado'];
    
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
            error: "Estado inválido. Usa: pendiente, procesando, completado, cancelado" 
        });
    }

    try {
        const result = await pool.query(
            'UPDATE Ventas SET estado = $1 WHERE id_venta = $2 RETURNING *',
            [estado, id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        
        res.json({ 
            success: true, 
            message: "Estado del pedido actualizado",
            pedido: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar estado" });
    }
});

/**
 * TOP 5 PRODUCTOS MÁS VENDIDOS (ADMIN)
 * GET /api/admin/top-productos
 */
app.get('/api/admin/top-productos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.titulo,
                SUM(dv.cantidad) as total_vendido,
                SUM(dv.cantidad * dv.precio_unitario) as ingresos
            FROM Detalles_Ventas dv
            JOIN Productos p ON dv.id_producto = p.id_producto
            GROUP BY p.titulo
            ORDER BY total_vendido DESC
            LIMIT 5
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener top productos" });
    }
});

// ==========================================
// 9. MANEJO DE ERRORES 404
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        path: req.path,
        method: req.method
    });
});

// ==========================================
// 10. MANEJO DE ERRORES GLOBAL
// ==========================================

app.use((err, req, res, next) => {
    console.error("Error no manejado:", err);
    res.status(500).json({
        error: "Error interno del servidor",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==========================================
// 11. INICIO DEL SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.clear();
    console.log(`\x1b[32m%s\x1b[0m`, `LA LECHUZA LECTORA - SERVER ONLINE`);
    console.log(`Home:   http://localhost:${PORT}`);
    console.log(`\nBase de datos: Conectada\n`);
});

module.exports = app;
=======
module.exports = router;
>>>>>>> 8f85dd1101edd13231a5807a1fe6243e7f21665d

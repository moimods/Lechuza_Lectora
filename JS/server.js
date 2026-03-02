const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

// 1. Configuración de conexión a pgAdmin
const pool = new Pool({
    user: 'tu_usuario',
    host: 'localhost',
    database: 'la_lechuza_lectora',
    password: 'tu_password',
    port: 5432,
});

// 2. RUTA: Obtener datos del usuario por Email
app.get('/api/usuario/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const result = await pool.query('SELECT * FROM Usuarios WHERE email = $1', [email]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/libros/stock/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT stock_actual FROM Libros WHERE id_libro = $1', [id]);
    res.json(result.rows[0]);
});

// 3. RUTA: Obtener historial de pedidos con los nombres de los libros (Punto 1)
app.get('/api/pedidos/usuario/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const query = `
            SELECT 
                p.id_pedido, 
                p.fecha_pedido, 
                p.total, 
                p.estado,
                string_agg(l.titulo, ', ') AS libros_comprados
            FROM Pedidos p
            JOIN Detalle_Pedidos dp ON p.id_pedido = dp.id_pedido
            JOIN Libros l ON dp.id_libro = l.id_libro
            WHERE p.id_usuario = $1
            GROUP BY p.id_pedido
            ORDER BY p.fecha_pedido DESC;
        `;
        const result = await pool.query(query, [id_usuario]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
// RUTA: Guardar nuevo domicilio en pgAdmin
app.post('/api/pedidos/crear', async (req, res) => {
    const client = await pool.connect(); // Usamos un cliente para manejar transacciones
    try {
        await client.query('BEGIN'); // Iniciamos transacción
        
        const { id_usuario, id_direccion, total, productos } = req.body;

        // 1. Insertar en la tabla Pedidos
        const pedidoRes = await client.query(
            'INSERT INTO Pedidos (id_usuario, id_direccion, total, subtotal, estado) VALUES ($1, $2, $3, $3, $4) RETURNING id_pedido',
            [id_usuario, id_direccion, total, 'pendiente']
        );
        const idPedido = pedidoRes.rows[0].id_pedido;

        // 2. Insertar cada producto en Detalle_Pedidos
        for (const prod of productos) {
            await client.query(
                'INSERT INTO Detalle_Pedidos (id_pedido, id_libro, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idPedido, prod.id_libro, prod.cantidad, prod.precio]
            );
            
            // 3. Opcional: Descontar Stock
            await client.query(
                'UPDATE Libros SET stock_actual = stock_actual - $1 WHERE id_libro = $2',
                [prod.cantidad, prod.id_libro]
            );
        }

        await client.query('COMMIT'); // Guardamos todo
        res.status(201).json({ success: true, id_pedido: idPedido });

    } catch (err) {
        await client.query('ROLLBACK'); // Si algo falla, deshacemos todo
        console.error(err);
        res.status(500).json({ error: "No se pudo procesar la compra" });
    } finally {
        client.release();
    }
});
app.post('/api/direcciones/agregar', async (req, res) => {
    try {
        const { 
            id_usuario, direccion, cp, estado, municipio, 
            colonia, numero, tipo_domicilio, nombre, telefono, indicaciones 
        } = req.body;

        const query = `
            INSERT INTO Direcciones (
                id_usuario, direccion_texto, cp, estado, municipio_alcaldia, 
                colonia, num_int_depto, tipo_domicilio, nombre_receptor, 
                telefono_contacto, referencias
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id_direccion;
        `;

        const values = [
            id_usuario, direccion, cp, estado, municipio, 
            colonia, numero, tipo_domicilio, nombre, telefono, indicaciones
        ];

        const result = await pool.query(query, values);
        res.status(201).json({ 
            success: true, 
            message: "Domicilio guardado", 
            id: result.rows[0].id_direccion 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar el domicilio en la base de datos" });
    }
});
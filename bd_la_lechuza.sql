-- 1. LIMPIEZA DE TABLAS (Opcional, por si necesitas re-ejecutar el script)
-- DROP TABLE IF EXISTS Detalle_Pedidos, Pedidos, Libros, Categorias, Metodos_Pago, Direcciones, Usuarios CASCADE;

-- 2. TABLA DE USUARIOS
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Para almacenar contraseñas encriptadas
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255) DEFAULT 'default_avatar.png',
    rol VARCHAR(20) CHECK (rol IN ('cliente', 'admin')) DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE DIRECCIONES (Relacionado con Direcciones.html y Agregar_domicilio.html)
CREATE TABLE Direcciones (
    id_direccion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    calle_numero VARCHAR(255) NOT NULL,
    colonia VARCHAR(150),
    codigo_postal VARCHAR(10),
    ciudad_estado VARCHAR(150),
    es_principal BOOLEAN DEFAULT FALSE, -- Para marcar dirección por defecto
    CONSTRAINT fk_usuario_direccion FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- 4. TABLA DE MÉTODOS DE PAGO (Relacionado con Metodos_pago_agregados.html)
CREATE TABLE Metodos_Pago (
    id_metodo SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('tarjeta', 'paypal')),
    token_pago VARCHAR(255), -- Para seguridad, no guardamos el número real completo
    last_four VARCHAR(4),    -- Los últimos 4 dígitos visibles para el cliente
    es_principal BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_usuario_pago FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- 5. TABLA DE CATEGORÍAS
CREATE TABLE Categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 6. TABLA DE LIBROS (Relacionado con Catalogo_Logeado.html y Gestion_productos.html)
CREATE TABLE Libros (
    id_libro SERIAL PRIMARY KEY,
    id_categoria INT,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(150),
    isbn VARCHAR(20) UNIQUE,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 5, -- Para alertas automáticas en el inventario
    imagen_url VARCHAR(255),
    descripcion TEXT,
    CONSTRAINT fk_categoria_libro FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria) ON DELETE SET NULL
);

-- 7. TABLA DE PEDIDOS (Relacionado con resumen_compra.html y finalizar.html)
CREATE TABLE Pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_direccion INT,
    id_metodo_pago INT,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    envio DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) CHECK (estado IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')) DEFAULT 'pendiente',
    CONSTRAINT fk_usuario_pedido FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_direccion_pedido FOREIGN KEY (id_direccion) REFERENCES Direcciones(id_direccion) ON DELETE SET NULL,
    CONSTRAINT fk_metodo_pago_pedido FOREIGN KEY (id_metodo_pago) REFERENCES Metodos_Pago(id_metodo) ON DELETE SET NULL
);

-- 8. TABLA DETALLE DE PEDIDOS (Relacionado con Reporte_de_ventas.html)
CREATE TABLE Detalle_Pedidos (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_libro INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL, -- Guardamos el precio histórico al momento de la compra
    subtotal_libro DECIMAL(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    CONSTRAINT fk_pedido_detalle FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_libro_detalle FOREIGN KEY (id_libro) REFERENCES Libros(id_libro) ON DELETE CASCADE
);

-- 9. INSERCIONES DE PRUEBA (Opcional, pero recomendado para ver datos iniciales)
INSERT INTO Categorias (nombre) VALUES ('Novelas'), ('Terror'), ('Infantil'), ('Ciencia Ficción');

INSERT INTO Usuarios (nombre_completo, email, password_hash, rol) 
VALUES ('Administrador', 'admin@lechuza.com', 'hashed_password_123', 'admin');

INSERT INTO Libros (titulo, autor, precio, stock_actual, id_categoria) 
VALUES ('La Lechuza Lectora', 'Autor Desconocido', 299.99, 50, 1);
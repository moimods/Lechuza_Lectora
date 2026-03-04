-- =========================================
-- LIMPIEZA TOTAL
-- =========================================
DROP TABLE IF EXISTS detalles_ventas, ventas, productos, categorias, metodos_pago, direcciones, usuarios CASCADE;

-- =========================================
-- TABLA USUARIOS
-- =========================================
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255) DEFAULT 'default_avatar.png',
    rol VARCHAR(20) CHECK (rol IN ('cliente', 'admin')) DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- TABLA DIRECCIONES
-- =========================================
CREATE TABLE direcciones (
    id_direccion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    calle_numero VARCHAR(255) NOT NULL,
    colonia VARCHAR(150),
    codigo_postal VARCHAR(10),
    ciudad_estado VARCHAR(150),
    es_principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================
-- TABLA MÉTODOS DE PAGO
-- =========================================
CREATE TABLE metodos_pago (
    id_metodo SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('tarjeta', 'paypal')),
    token_pago VARCHAR(255),
    last_four VARCHAR(4),
    es_principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================================
-- TABLA CATEGORÍAS
-- =========================================
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- =========================================
-- TABLA PRODUCTOS
-- =========================================
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    id_categoria INT,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(150),
    isbn VARCHAR(20) UNIQUE,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    imagen_url VARCHAR(255),
    descripcion TEXT,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

-- =========================================
-- TABLA VENTAS
-- =========================================
CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_direccion INT,
    id_metodo_pago INT,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) CHECK (estado IN ('pendiente', 'completado', 'enviado', 'entregado', 'cancelado')) DEFAULT 'completado',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion) ON DELETE SET NULL,
    FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id_metodo) ON DELETE SET NULL
);

-- =========================================
-- TABLA DETALLES DE VENTAS
-- =========================================
CREATE TABLE detalles_ventas (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal_item DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- =========================================
-- DATOS INICIALES
-- =========================================

-- Categorías
INSERT INTO categorias (nombre) VALUES 
('Fantasía'),
('Clásicos'),
('Terror');

-- Productos
INSERT INTO productos (titulo, autor, precio, stock, id_categoria, imagen_url, descripcion) VALUES 
('Harry Potter y la Piedra Filosofal', 'J.K. Rowling', 350.00, 10, 1, '/Imagenes/Libros/hp1.jpg', 'El inicio de la saga mágica.'),
('Drácula', 'Bram Stoker', 280.00, 8, 3, '/Imagenes/Libros/dracula.jpg', 'Clásico del terror gótico.'),
('Orgullo y Prejuicio', 'Jane Austen', 300.00, 5, 2, '/Imagenes/Libros/orgullo.jpg', 'Clásico romántico.');

-- Usuario Cliente
INSERT INTO usuarios (nombre_completo, email, password_hash, telefono, rol) VALUES
('Juan Perez', 'juan@ejemplo.com', '123456', '1234567890', 'cliente');

-- Usuario Admin
INSERT INTO usuarios (nombre_completo, email, password_hash, telefono, rol) VALUES
('Moi Admin', 'admin@lechuza.com', '123456789', '9999999999', 'admin');

SELECT current_database();
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'usuarios';

SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
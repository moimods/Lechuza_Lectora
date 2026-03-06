

-- =========================================
-- LIMPIEZA DE TABLAS
-- =========================================

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS detalles_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS metodos_pago CASCADE;
DROP TABLE IF EXISTS direcciones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;


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
    rol VARCHAR(20) CHECK (rol IN ('cliente','admin')) DEFAULT 'cliente',
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
-- TABLA METODOS DE PAGO
-- =========================================

CREATE TABLE metodos_pago (
    id_metodo SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('tarjeta','paypal')),
    token_pago VARCHAR(255),
    last_four VARCHAR(4),
    es_principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);


-- =========================================
-- TABLA CATEGORIAS
-- =========================================

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);


-- =========================================
-- TABLA PRODUCTOS (LIBROS)
-- =========================================

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    id_categoria INT,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(150),
    isbn VARCHAR(20) UNIQUE,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0,
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
    estado VARCHAR(50) CHECK (estado IN ('pendiente','completado','enviado','entregado','cancelado')) DEFAULT 'completado',

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

    subtotal_item DECIMAL(10,2)
    GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,

    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);


-- =========================================
-- TABLAS COMPATIBLES CON payments.controller
-- =========================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);


CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT,
    price DECIMAL(10,2),

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES productos(id_producto) ON DELETE CASCADE
);


-- =========================================
-- INSERTAR CATEGORIAS
-- =========================================

INSERT INTO categorias (nombre, descripcion) VALUES
('Fantasía','Libros de magia y mundos fantásticos'),
('Clásicos','Obras clásicas de la literatura'),
('Terror','Historias de miedo y suspenso'),
('Ciencia Ficción','Libros futuristas y tecnológicos');


-- =========================================
-- INSERTAR LIBROS
-- =========================================
INSERT INTO productos
(titulo,autor,precio,stock,id_categoria,imagen_url,descripcion)
VALUES

('Harry Potter y la Piedra Filosofal','J.K. Rowling',350,10,
(SELECT id_categoria FROM categorias WHERE nombre='Fantasía'),
'/Imagenes/Libro1.png',
'El inicio de la saga del joven mago Harry Potter'),

('Drácula','Bram Stoker',280,8,
(SELECT id_categoria FROM categorias WHERE nombre='Terror'),
'/Imagenes/Libro2.png',
'Clásico del terror gótico'),

('Orgullo y Prejuicio','Jane Austen',300,5,
(SELECT id_categoria FROM categorias WHERE nombre='Clásicos'),
'/Imagenes/Libro3.png',
'Clásico romántico'),

('El Resplandor','Stephen King',350,6,
(SELECT id_categoria FROM categorias WHERE nombre='Terror'),
'/Imagenes/Libro4.png',
'Terror psicológico en el hotel Overlook'),

('Cien Años de Soledad','Gabriel García Márquez',420,7,
(SELECT id_categoria FROM categorias WHERE nombre='Clásicos'),
'/Imagenes/Libro5.png',
'Historia de la familia Buendía'),

('1984','George Orwell',310,9,
(SELECT id_categoria FROM categorias WHERE nombre='Ciencia Ficción'),
'/Imagenes/Libro6.png',
'Distopía futurista'),

('El Hobbit','J.R.R. Tolkien',390,12,
(SELECT id_categoria FROM categorias WHERE nombre='Fantasía'),
'/Imagenes/Libro7.png',
'Aventura en la Tierra Media'),

('Frankenstein','Mary Shelley',260,6,
(SELECT id_categoria FROM categorias WHERE nombre='Terror'),
'/Imagenes/Libro8.png',
'El científico y su criatura'),

('Don Quijote de la Mancha','Miguel de Cervantes',450,4,
(SELECT id_categoria FROM categorias WHERE nombre='Clásicos'),
'/Imagenes/Libro1.png',
'El caballero de la triste figura'),

('Fahrenheit 451','Ray Bradbury',295,8,
(SELECT id_categoria FROM categorias WHERE nombre='Ciencia Ficción'),
'/Imagenes/Libro2.png',
'Una sociedad donde los libros son prohibidos');


-- =========================================
-- USUARIOS CON HASH BCRYPT
-- contraseña: 123456
-- =========================================

INSERT INTO usuarios
(nombre_completo,email,password_hash,telefono,rol)
VALUES
(
'Moi Cliente',
'moiram@ejemplo.com',
'$2b$10$BSGjAnq3eL1nD/R7dch/2.zyCRCGB.Ns6Oi9Z0M/xOPfkuA2utoEu',
'1234567890',
'cliente'
),
(
'Moi Admin',
'admin@lechuza.com',
'$2b$10$BSGjAnq3eL1nD/R7dch/2.zyCRCGB.Ns6Oi9Z0M/xOPfkuA2utoEu',
'9999999999',
'admin'
);
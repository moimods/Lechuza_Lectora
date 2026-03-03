-- 1. TABLA DE USUARIOS
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255) DEFAULT 'default_avatar.png',
    rol VARCHAR(20) CHECK (rol IN ('cliente', 'admin')) DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE DIRECCIONES
CREATE TABLE Direcciones (
    id_direccion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    calle_numero VARCHAR(255) NOT NULL,
    colonia VARCHAR(150),
    codigo_postal VARCHAR(10),
    ciudad_estado VARCHAR(150),
    es_principal BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_usuario_direccion FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- 3. TABLA DE MÉTODOS DE PAGO
CREATE TABLE Metodos_Pago (
    id_metodo SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('tarjeta', 'paypal')),
    token_pago VARCHAR(255), 
    last_four VARCHAR(4),    
    es_principal BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_usuario_pago FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- 4. TABLA DE CATEGORÍAS
CREATE TABLE Categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 5. TABLA DE PRODUCTOS (Libros)
CREATE TABLE Productos (
    id_producto SERIAL PRIMARY KEY,
    id_categoria INT,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(150),
    isbn VARCHAR(20) UNIQUE,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0, 
    stock_minimo INT DEFAULT 5,
    imagen_url VARCHAR(255),
    descripcion TEXT,
    CONSTRAINT fk_categoria_producto FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria) ON DELETE SET NULL
);

-- 6. TABLA DE VENTAS (Cabecera)
CREATE TABLE Ventas (
    id_venta SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_direccion INT,
    id_metodo_pago INT,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) CHECK (estado IN ('pendiente', 'completado', 'enviado', 'entregado', 'cancelado')) DEFAULT 'completado',
    CONSTRAINT fk_usuario_venta FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_direccion_venta FOREIGN KEY (id_direccion) REFERENCES Direcciones(id_direccion) ON DELETE SET NULL,
    CONSTRAINT fk_metodo_pago_venta FOREIGN KEY (id_metodo_pago) REFERENCES Metodos_Pago(id_metodo) ON DELETE SET NULL
);

-- 7. TABLA DETALLES DE VENTAS
CREATE TABLE Detalles_Ventas (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal_item DECIMAL(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    CONSTRAINT fk_venta_detalle FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta) ON DELETE CASCADE,
    CONSTRAINT fk_producto_detalle FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE
);

-- 8. DATOS INICIALES (Para probar tu sistema de inmediato)
INSERT INTO Categorias (nombre) VALUES ('Fantasía'), ('Clásicos'), ('Terror');

INSERT INTO Productos (titulo, autor, precio, stock, id_categoria, imagen_url) 
VALUES ('Harry Potter y la Piedra Filosofal', 'J.K. Rowling', 350.00, 10, 1, '/Imagenes/Libros/hp1.jpg');

INSERT INTO Usuarios (nombre_completo, email, password_hash, rol) 
VALUES ('Juan Perez', 'juan@ejemplo.com', '123456', 'cliente');
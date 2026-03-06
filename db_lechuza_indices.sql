-- =========================================
-- OPTIMIZACIÓN: ÍNDICES PARA BD
-- =========================================
-- Estos índices mejoran significativamente el rendimiento de queries

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Direcciones
CREATE INDEX IF NOT EXISTS idx_direcciones_usuario ON direcciones(id_usuario);

-- Métodos de pago
CREATE INDEX IF NOT EXISTS idx_metodos_pago_usuario ON metodos_pago(id_usuario);
CREATE INDEX IF NOT EXISTS idx_metodos_pago_tipo ON metodos_pago(tipo);

-- Productos
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(id_categoria);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);

-- Categorías
CREATE INDEX IF NOT EXISTS idx_categorias_nombre ON categorias(LOWER(nombre));

-- Ventas
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario_fecha ON ventas(id_usuario, fecha_venta);

-- Detalles ventas
CREATE INDEX IF NOT EXISTS idx_detalles_ventas_venta ON detalles_ventas(id_venta);
CREATE INDEX IF NOT EXISTS idx_detalles_ventas_producto ON detalles_ventas(id_producto);

-- =========================================
-- CONSTRAINTS Y VALIDACIONES ADICIONALES
-- =========================================

-- Asegurar que el stock no sea negativo
ALTER TABLE productos
ADD CONSTRAINT chk_stock_positivo CHECK (stock >= 0);

-- Asegurar que el precio no sea negativo
ALTER TABLE productos
ADD CONSTRAINT chk_precio_positivo CHECK (precio >= 0);

-- Asegurar que la cantidad no sea negativa
ALTER TABLE detalles_ventas
ADD CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0);

-- Asegurar que el total no sea negativo
ALTER TABLE ventas
ADD CONSTRAINT chk_total_positivo CHECK (total >= 0);

-- =========================================
-- VISTAS ÚTILES
-- =========================================

-- Vista de ventas con información de usuario
CREATE OR REPLACE VIEW vw_ventas_completas AS
SELECT
  v.id_venta,
  v.id_usuario,
  u.nombre_completo,
  u.email,
  v.total,
  v.estado,
  v.fecha_venta,
  COUNT(dv.id_detalle) AS cantidad_items
FROM ventas v
JOIN usuarios u ON u.id_usuario = v.id_usuario
LEFT JOIN detalles_ventas dv ON dv.id_venta = v.id_venta
GROUP BY v.id_venta, u.id_usuario, u.nombre_completo, u.email;

-- Vista de productos con stock bajo
CREATE OR REPLACE VIEW vw_productos_stock_bajo AS
SELECT
  id_producto,
  titulo,
  autor,
  stock,
  stock_minimo,
  (stock - stock_minimo) AS diferencia
FROM productos
WHERE stock <= stock_minimo
ORDER BY diferencia;

-- Vista de ventas por categoría
CREATE OR REPLACE VIEW vw_ventas_por_categoria AS
SELECT
  c.id_categoria,
  c.nombre AS categoria,
  COUNT(DISTINCT dv.id_venta) AS numero_ventas,
  SUM(dv.cantidad) AS cantidad_vendida,
  SUM(dv.subtotal_item) AS total_vendido
FROM detalles_ventas dv
JOIN productos p ON p.id_producto = dv.id_producto
JOIN categorias c ON c.id_categoria = p.id_categoria
GROUP BY c.id_categoria, c.nombre
ORDER BY total_vendido DESC;

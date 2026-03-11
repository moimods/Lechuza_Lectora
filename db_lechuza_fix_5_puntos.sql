-- =========================================================
-- FIXES MINIMOS (5 PUNTOS) PARA db_lechuza
-- Ejecutar conectado a la base: db_lechuza
-- =========================================================

BEGIN;

-- 1) Extension requerida por chatbot
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2) Homologar categorias para compatibilidad con scripts (acentos)
UPDATE categorias SET nombre = 'Fantasía'
WHERE lower(unaccent(nombre)) = 'fantasia';

UPDATE categorias SET nombre = 'Clásicos'
WHERE lower(unaccent(nombre)) = 'clasicos';

UPDATE categorias SET nombre = 'Ciencia Ficción'
WHERE lower(unaccent(nombre)) = 'ciencia ficcion';

-- 3) Volver idempotentes constraints (crear solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_stock_positivo') THEN
    ALTER TABLE productos ADD CONSTRAINT chk_stock_positivo CHECK (stock >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_precio_positivo') THEN
    ALTER TABLE productos ADD CONSTRAINT chk_precio_positivo CHECK (precio >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_cantidad_positiva') THEN
    ALTER TABLE detalles_ventas ADD CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_total_positivo') THEN
    ALTER TABLE ventas ADD CONSTRAINT chk_total_positivo CHECK (total >= 0);
  END IF;
END
$$;

-- 4) Endurecer metodos_pago (tipo/token obligatorios)
UPDATE metodos_pago
SET tipo = 'tarjeta'
WHERE tipo IS NULL;

UPDATE metodos_pago
SET token_pago = 'token_pendiente'
WHERE token_pago IS NULL OR btrim(token_pago) = '';

ALTER TABLE metodos_pago
  ALTER COLUMN tipo SET NOT NULL,
  ALTER COLUMN token_pago SET NOT NULL;

-- 5) Asegurar un solo principal por usuario (direcciones/metodos)
WITH dups AS (
  SELECT id_direccion,
         ROW_NUMBER() OVER (PARTITION BY id_usuario ORDER BY es_principal DESC, id_direccion) AS rn
  FROM direcciones
  WHERE es_principal = TRUE
)
UPDATE direcciones d
SET es_principal = FALSE
FROM dups
WHERE d.id_direccion = dups.id_direccion
  AND dups.rn > 1;

WITH dups AS (
  SELECT id_metodo,
         ROW_NUMBER() OVER (PARTITION BY id_usuario ORDER BY es_principal DESC, id_metodo) AS rn
  FROM metodos_pago
  WHERE es_principal = TRUE
)
UPDATE metodos_pago m
SET es_principal = FALSE
FROM dups
WHERE m.id_metodo = dups.id_metodo
  AND dups.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_direcciones_principal_por_usuario
ON direcciones(id_usuario)
WHERE es_principal;

CREATE UNIQUE INDEX IF NOT EXISTS uq_metodo_principal_por_usuario
ON metodos_pago(id_usuario)
WHERE es_principal;

COMMIT;

-- Verificacion rapida recomendada:
-- SELECT extname FROM pg_extension WHERE extname='unaccent';
-- SELECT nombre FROM categorias ORDER BY nombre;
-- \d metodos_pago
-- \di uq_direcciones_principal_por_usuario
-- \di uq_metodo_principal_por_usuario

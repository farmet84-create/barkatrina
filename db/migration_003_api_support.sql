-- Soporte adicional para la API: icono de categoría y relajar FKs de usuario
-- (el frontend actual no maneja login/usuarios todavía, solo empleados).

BEGIN;

ALTER TABLE categorias ADD COLUMN IF NOT EXISTS icono VARCHAR(10) NOT NULL DEFAULT '🍽️';

ALTER TABLE pedidos ALTER COLUMN id_usuario DROP NOT NULL;
ALTER TABLE facturas ALTER COLUMN id_usuario DROP NOT NULL;
ALTER TABLE compras ALTER COLUMN id_usuario DROP NOT NULL;
ALTER TABLE gastos ALTER COLUMN id_usuario DROP NOT NULL;
ALTER TABLE movimientos_inventario ALTER COLUMN id_usuario DROP NOT NULL;
ALTER TABLE caja_sesiones ALTER COLUMN abierta_por DROP NOT NULL;
ALTER TABLE caja_movimientos ALTER COLUMN id_usuario DROP NOT NULL;

COMMIT;

-- Ajustes para alinear el esquema con los campos que ya consume el frontend (POSContext.tsx)

BEGIN;

ALTER TABLE pedidos  ADD COLUMN IF NOT EXISTS impuesto NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE pedidos  ADD COLUMN IF NOT EXISTS propina  NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE pedidos  ADD COLUMN IF NOT EXISTS notas    TEXT;

ALTER TABLE facturas ADD COLUMN IF NOT EXISTS impuesto NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE empleados ADD COLUMN IF NOT EXISTS correo VARCHAR(150);
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS rol    VARCHAR(30) NOT NULL DEFAULT 'Mesero'
  CHECK (rol IN ('Administrador','Cajero','Mesero','Cocinero'));

ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);

ALTER TABLE mesas ADD COLUMN IF NOT EXISTS zona_orden INTEGER NOT NULL DEFAULT 0;

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS total_visitas INTEGER NOT NULL DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS total_gastado NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE movimientos_inventario DROP CONSTRAINT IF EXISTS movimientos_inventario_tipo_movimiento_check;
ALTER TABLE movimientos_inventario ADD CONSTRAINT movimientos_inventario_tipo_movimiento_check
  CHECK (tipo_movimiento IN ('Compra','Venta','Ajuste','Merma','Devolucion','Entrada','Salida'));

-- Sesión de caja: vincular consecutivo por sesión al total ingresos/egresos por método de pago,
-- necesarios para el módulo de Caja del frontend.
ALTER TABLE caja_sesiones ADD COLUMN IF NOT EXISTS total_ventas_efectivo      NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE caja_sesiones ADD COLUMN IF NOT EXISTS total_ventas_tarjeta       NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE caja_sesiones ADD COLUMN IF NOT EXISTS total_ventas_transferencia NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE caja_sesiones ADD COLUMN IF NOT EXISTS total_ventas_puntos        NUMERIC(12,2) NOT NULL DEFAULT 0;

COMMIT;

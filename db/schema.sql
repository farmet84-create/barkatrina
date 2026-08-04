-- ERP POS Bar y Restaurante — esquema PostgreSQL
-- Generado a partir de: Proyecto_ERP_BAR_Resumen.pdf + ERP_BAR_Base_Datos_Entrega_1..5.xlsx
-- Convenciones: snake_case, PK serial, timestamps de auditoría, estados como texto con CHECK.

BEGIN;

-- ============================================================
-- ENTREGA 1: Productos, Categorías, Clientes, Empleados, Usuarios
-- ============================================================

CREATE TABLE categorias (
  id_categoria   SERIAL PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  descripcion    TEXT,
  estado         VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE productos (
  id_producto    SERIAL PRIMARY KEY,
  codigo         VARCHAR(30) UNIQUE NOT NULL,
  nombre         VARCHAR(150) NOT NULL,
  id_categoria   INTEGER REFERENCES categorias(id_categoria) ON DELETE SET NULL,
  costo          NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (costo >= 0),
  precio_venta   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (precio_venta >= 0),
  stock          INTEGER NOT NULL DEFAULT 0,
  stock_minimo   INTEGER NOT NULL DEFAULT 0,
  unidad         VARCHAR(20) NOT NULL DEFAULT 'unidad',
  es_cocina      BOOLEAN NOT NULL DEFAULT false,
  imagen_url     TEXT,
  descripcion    TEXT,
  estado         VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clientes (
  id_cliente     SERIAL PRIMARY KEY,
  documento      VARCHAR(30) UNIQUE,
  nombre         VARCHAR(150) NOT NULL,
  celular        VARCHAR(20),
  correo         VARCHAR(150),
  direccion      TEXT,
  puntos         INTEGER NOT NULL DEFAULT 0,
  estado         VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE empleados (
  id_empleado    SERIAL PRIMARY KEY,
  documento      VARCHAR(30) UNIQUE NOT NULL,
  nombre         VARCHAR(150) NOT NULL,
  cargo          VARCHAR(50) NOT NULL,
  celular        VARCHAR(20),
  fecha_ingreso  DATE NOT NULL DEFAULT CURRENT_DATE,
  salario        NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado         VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo'))
);

CREATE TABLE usuarios (
  id_usuario     SERIAL PRIMARY KEY,
  usuario        VARCHAR(50) UNIQUE NOT NULL,
  contrasena_hash TEXT NOT NULL,
  rol            VARCHAR(30) NOT NULL CHECK (rol IN ('Administrador','Cajero','Mesero','Cocinero')),
  id_empleado    INTEGER REFERENCES empleados(id_empleado) ON DELETE SET NULL,
  estado         VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ENTREGA 2: Mesas, Pedidos, Facturas, Formas de Pago, Caja
-- ============================================================

CREATE TABLE mesas (
  id_mesa        SERIAL PRIMARY KEY,
  numero         VARCHAR(20) NOT NULL,
  zona           VARCHAR(50) NOT NULL DEFAULT 'Salón Principal',
  capacidad      INTEGER NOT NULL DEFAULT 4,
  estado         VARCHAR(20) NOT NULL DEFAULT 'Libre' CHECK (estado IN ('Libre','Ocupada','Por_Pagar','Reservada')),
  observaciones  TEXT
);

CREATE TABLE formas_pago (
  id_forma_pago  SERIAL PRIMARY KEY,
  nombre         VARCHAR(50) UNIQUE NOT NULL,
  comision_pct   NUMERIC(5,2) NOT NULL DEFAULT 0,
  estado         VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo'))
);

CREATE TABLE pedidos (
  id_pedido      SERIAL PRIMARY KEY,
  fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
  hora           TIME NOT NULL DEFAULT CURRENT_TIME,
  id_mesa        INTEGER REFERENCES mesas(id_mesa) ON DELETE SET NULL,
  id_cliente     INTEGER REFERENCES clientes(id_cliente) ON DELETE SET NULL,
  id_usuario     INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  tipo           VARCHAR(20) NOT NULL DEFAULT 'mesa' CHECK (tipo IN ('mesa','llevar','domicilio')),
  estado         VARCHAR(20) NOT NULL DEFAULT 'Abierto' CHECK (estado IN ('Abierto','En_Cocina','Servido','Facturado','Cancelado')),
  subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE detalle_pedidos (
  id_detalle       SERIAL PRIMARY KEY,
  id_pedido        INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  id_producto      INTEGER NOT NULL REFERENCES productos(id_producto),
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(12,2) NOT NULL,
  subtotal         NUMERIC(12,2) NOT NULL,
  notas            TEXT,
  preparado        BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE facturas (
  id_factura      SERIAL PRIMARY KEY,
  numero_factura  VARCHAR(20) UNIQUE NOT NULL,
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  id_pedido       INTEGER UNIQUE NOT NULL REFERENCES pedidos(id_pedido), -- 1:1 (RN002)
  id_cliente      INTEGER REFERENCES clientes(id_cliente) ON DELETE SET NULL,
  id_usuario      INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  subtotal        NUMERIC(12,2) NOT NULL,
  propina         NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL,
  id_forma_pago   INTEGER NOT NULL REFERENCES formas_pago(id_forma_pago),
  monto_pagado    NUMERIC(12,2) NOT NULL DEFAULT 0,
  cambio          NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado          VARCHAR(20) NOT NULL DEFAULT 'Pagada' CHECK (estado IN ('Pagada','Anulada')),
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE detalle_facturas (
  id_detalle       SERIAL PRIMARY KEY,
  id_factura       INTEGER NOT NULL REFERENCES facturas(id_factura) ON DELETE CASCADE,
  id_producto      INTEGER NOT NULL REFERENCES productos(id_producto),
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(12,2) NOT NULL,
  subtotal         NUMERIC(12,2) NOT NULL
);

CREATE TABLE caja_sesiones (
  id_sesion        SERIAL PRIMARY KEY,
  abierta_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  cerrada_en       TIMESTAMPTZ,
  abierta_por      INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  cerrada_por      INTEGER REFERENCES usuarios(id_usuario),
  monto_inicial    NUMERIC(12,2) NOT NULL DEFAULT 0,
  monto_esperado   NUMERIC(12,2) NOT NULL DEFAULT 0,
  monto_real       NUMERIC(12,2),
  diferencia       NUMERIC(12,2),
  estado           VARCHAR(20) NOT NULL DEFAULT 'Abierta' CHECK (estado IN ('Abierta','Cerrada')),
  notas            TEXT
);

CREATE TABLE caja_movimientos (
  id_movimiento    SERIAL PRIMARY KEY,
  id_sesion        INTEGER NOT NULL REFERENCES caja_sesiones(id_sesion) ON DELETE CASCADE,
  fecha            TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo             VARCHAR(20) NOT NULL CHECK (tipo IN ('Ingreso','Egreso')),
  concepto         VARCHAR(200) NOT NULL,
  valor            NUMERIC(12,2) NOT NULL,
  id_forma_pago    INTEGER REFERENCES formas_pago(id_forma_pago),
  id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  id_factura       INTEGER REFERENCES facturas(id_factura),
  saldo            NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- ENTREGA 3: Inventario, Proveedores, Compras, Gastos
-- ============================================================

CREATE TABLE inventario (
  id_inventario         SERIAL PRIMARY KEY,
  id_producto           INTEGER UNIQUE NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
  stock_actual          INTEGER NOT NULL DEFAULT 0,
  stock_minimo          INTEGER NOT NULL DEFAULT 0,
  stock_maximo          INTEGER NOT NULL DEFAULT 0,
  costo_promedio        NUMERIC(12,2) NOT NULL DEFAULT 0,
  ultima_actualizacion  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE movimientos_inventario (
  id_movimiento     SERIAL PRIMARY KEY,
  fecha             TIMESTAMPTZ NOT NULL DEFAULT now(),
  id_producto       INTEGER NOT NULL REFERENCES productos(id_producto),
  tipo_movimiento   VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('Compra','Venta','Ajuste','Merma','Devolucion')),
  cantidad          INTEGER NOT NULL,
  costo_unitario    NUMERIC(12,2),
  documento         VARCHAR(50),
  observacion       TEXT,
  id_usuario        INTEGER NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE proveedores (
  id_proveedor    SERIAL PRIMARY KEY,
  nit             VARCHAR(30) UNIQUE NOT NULL,
  razon_social    VARCHAR(150) NOT NULL,
  contacto        VARCHAR(100),
  telefono        VARCHAR(20),
  celular         VARCHAR(20),
  correo          VARCHAR(150),
  direccion       TEXT,
  ciudad          VARCHAR(80),
  estado          VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo'))
);

CREATE TABLE compras (
  id_compra           SERIAL PRIMARY KEY,
  fecha               DATE NOT NULL DEFAULT CURRENT_DATE,
  factura_proveedor   VARCHAR(50),
  id_proveedor        INTEGER NOT NULL REFERENCES proveedores(id_proveedor),
  subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
  iva                 NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento           NUMERIC(12,2) NOT NULL DEFAULT 0,
  total               NUMERIC(12,2) NOT NULL DEFAULT 0,
  id_forma_pago       INTEGER REFERENCES formas_pago(id_forma_pago),
  estado              VARCHAR(20) NOT NULL DEFAULT 'Recibida' CHECK (estado IN ('Pendiente','Recibida','Anulada')),
  id_usuario          INTEGER NOT NULL REFERENCES usuarios(id_usuario)
);

CREATE TABLE detalle_compras (
  id_detalle       SERIAL PRIMARY KEY,
  id_compra        INTEGER NOT NULL REFERENCES compras(id_compra) ON DELETE CASCADE,
  id_producto      INTEGER NOT NULL REFERENCES productos(id_producto),
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  costo_unitario   NUMERIC(12,2) NOT NULL,
  subtotal         NUMERIC(12,2) NOT NULL
);

CREATE TABLE gastos (
  id_gasto        SERIAL PRIMARY KEY,
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria       VARCHAR(50) NOT NULL CHECK (categoria IN ('Servicios','Nomina','Mantenimiento','Arriendo','Insumos','Otros')),
  concepto        VARCHAR(200) NOT NULL,
  proveedor       VARCHAR(150),
  valor           NUMERIC(12,2) NOT NULL,
  id_forma_pago   INTEGER REFERENCES formas_pago(id_forma_pago),
  id_usuario      INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  observaciones   TEXT
);

-- ============================================================
-- ENTREGA 4: Dashboard, Reportes, Fidelización, Configuración
-- ============================================================

CREATE TABLE reportes (
  id_reporte     SERIAL PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  descripcion    TEXT,
  frecuencia     VARCHAR(20) NOT NULL DEFAULT 'Diario' CHECK (frecuencia IN ('Diario','Semanal','Mensual')),
  activo         BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE fidelizacion (
  id_cliente      INTEGER PRIMARY KEY REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  puntos          INTEGER NOT NULL DEFAULT 0,
  nivel           VARCHAR(20) NOT NULL DEFAULT 'Bronce' CHECK (nivel IN ('Bronce','Plata','Oro','Platino')),
  ultima_compra   DATE,
  beneficio       VARCHAR(150) DEFAULT 'Sin beneficio'
);

-- Configuración/Parámetros (Entregas 4 y 5 son el mismo patrón clave/valor: se unifican)
CREATE TABLE configuracion (
  clave          VARCHAR(50) PRIMARY KEY,
  valor          TEXT NOT NULL,
  descripcion    TEXT
);

-- ============================================================
-- ENTREGA 5: Permisos (matriz rol x módulo, normalizada)
-- ============================================================

CREATE TABLE permisos (
  rol      VARCHAR(30) NOT NULL CHECK (rol IN ('Administrador','Cajero','Mesero','Cocinero')),
  modulo   VARCHAR(30) NOT NULL CHECK (modulo IN ('ventas','inventario','compras','caja','dashboard','configuracion')),
  permitido BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (rol, modulo)
);

-- ============================================================
-- Índices de apoyo
-- ============================================================
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_detalle_pedidos_pedido ON detalle_pedidos(id_pedido);
CREATE INDEX idx_detalle_facturas_factura ON detalle_facturas(id_factura);
CREATE INDEX idx_movimientos_inventario_producto ON movimientos_inventario(id_producto);
CREATE INDEX idx_caja_movimientos_sesion ON caja_movimientos(id_sesion);

COMMIT;

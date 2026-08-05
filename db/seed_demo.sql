-- Migra los datos de demo de src/data/initialData.ts a Postgres,
-- para que la app conectada a la API muestre el mismo negocio ("Bar & Restaurante La Terraza")
-- que mostraba con datos mock en memoria.

BEGIN;

-- Configuración real del negocio (sobrescribe los defaults genéricos del seed.sql)
INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('empresa', 'Bar & Restaurante La Terraza', 'Nombre comercial'),
  ('nit', '900.123.456-7', 'NIT / identificación fiscal'),
  ('direccion', 'Av. Principal #45-12, Zona Rosa', 'Dirección del negocio'),
  ('telefono', '+57 (300) 987-6543', 'Teléfono de contacto'),
  ('correo', 'contacto@laterraza.com', 'Correo de contacto'),
  ('moneda_simbolo', '$', 'Símbolo de moneda'),
  ('iva', '8', 'IVA / Impoconsumo %'),
  ('propina_por_defecto', '10', 'Propina sugerida %'),
  ('puntos_por_compra', '100', 'Pesos gastados por 1 punto de fidelización (10 pts / $1.000)'),
  ('valor_punto', '50', 'Valor en pesos de 1 punto redimido'),
  ('pie_recibo', '¡Gracias por su preferencia! Síguenos en IG @laterrazabar', 'Texto al pie de la factura')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, descripcion = EXCLUDED.descripcion;

-- Categorías
INSERT INTO categorias (id_categoria, nombre, descripcion, icono) VALUES
  (1, 'Cócteles & Tragos', 'Cócteles de autor, clásicos y destilados', '🍸'),
  (2, 'Cervezas Artesanales', 'Nacionales e importadas de barril y botella', '🍺'),
  (3, 'Entradas & Tapas', 'Para compartir en grupo', '🍤'),
  (4, 'Platos Fuertes', 'Cortes premium, hamburguesas y especialidades', '🥩'),
  (5, 'Postres', 'Delicias dulces para terminar', '🍰'),
  (6, 'Bebidas Sin Alcohol', 'Sodas saborizadas, jugos y cafés', '☕')
ON CONFLICT (id_categoria) DO NOTHING;
SELECT setval('categorias_id_categoria_seq', (SELECT MAX(id_categoria) FROM categorias));

-- Productos
INSERT INTO productos (id_producto, codigo, nombre, id_categoria, costo, precio_venta, stock, stock_minimo, unidad, imagen_url, descripcion, es_cocina) VALUES
  (1, 'COC-001', 'Mojito Cubano Tradicional', 1, 8500, 28000, 120, 25, 'Copas', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60', 'Ron blanco, hierbabuena fresca, azúcar de caña, lima y soda.', false),
  (2, 'COC-002', 'Margarita Smoked Passion', 1, 10200, 32000, 85, 20, 'Copas', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=60', 'Tequila reposado, triple sec, maracuyá y sal ahumada de gusano.', false),
  (3, 'CER-001', 'Cerveza IPA Artesanal (Draft 500ml)', 2, 6000, 18000, 200, 40, 'Vasos', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=60', 'Cerveza lupulada intensa con notas cítricas y resinosas.', false),
  (4, 'ENT-001', 'Nachos Supremos con Queso & Carne', 3, 12000, 34000, 45, 10, 'Porción', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60', 'Totopos crujientes, queso fundido, guacamole, pico de gallo y frijoles.', true),
  (5, 'ENT-002', 'Alitas Búfalo & BBQ (12 uds)', 3, 14000, 38000, 30, 8, 'Plato', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60', 'Acompañadas de bastones de apio, zanahoria y aderezo blue cheese.', true),
  (6, 'PLA-001', 'Hamburguesa Angus Trufada', 4, 16500, 45000, 40, 12, 'Unidad', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60', '200g carne Angus, queso gouda ahumado, mayonesa de trufa y papas rústicas.', true),
  (7, 'PLA-002', 'Corte Ribeye 350g Madurado', 4, 32000, 78000, 15, 5, 'Plato', 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=60', 'Acompañado de papas a la francesa y vegetales salteados a la mantequilla.', true),
  (8, 'POS-001', 'Volcán de Chocolate con Helado', 5, 6500, 22000, 25, 5, 'Unidad', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60', 'Bizcocho tibio de cacao con centro fluido y bola de helado de vainilla.', true),
  (9, 'BEB-001', 'Limonada de Coco Artesanal', 6, 3500, 14000, 150, 30, 'Vaso', 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=500&auto=format&fit=crop&q=60', 'Zumo de limón recién exprimido, crema de coco natural y hielo frappé.', false)
ON CONFLICT (id_producto) DO NOTHING;
SELECT setval('productos_id_producto_seq', (SELECT MAX(id_producto) FROM productos));

INSERT INTO inventario (id_producto, stock_actual, stock_minimo, stock_maximo, costo_promedio)
SELECT id_producto, stock, stock_minimo, stock_minimo * 8, costo FROM productos
ON CONFLICT (id_producto) DO NOTHING;

-- Mesas (reemplaza las 4 genéricas del seed.sql)
DELETE FROM mesas;
ALTER SEQUENCE mesas_id_mesa_seq RESTART WITH 1;
INSERT INTO mesas (numero, zona, capacidad, estado, zona_orden) VALUES
  ('Mesa 01', 'Salón Principal', 2, 'Ocupada', 1),
  ('Mesa 02', 'Salón Principal', 4, 'Libre', 2),
  ('Mesa 03', 'Salón Principal', 4, 'Por_Pagar', 3),
  ('Mesa 04', 'Salón Principal', 6, 'Libre', 4),
  ('Mesa 05 (Terraza)', 'Terraza', 4, 'Ocupada', 5),
  ('Mesa 06 (Terraza)', 'Terraza', 2, 'Libre', 6),
  ('Mesa 07 (Terraza)', 'Terraza', 8, 'Reservada', 7),
  ('Barra 01', 'Barra', 1, 'Libre', 8),
  ('Barra 02', 'Barra', 1, 'Libre', 9),
  ('Mesa VIP 01', 'VIP', 10, 'Libre', 10);

-- Clientes
INSERT INTO clientes (id_cliente, documento, nombre, celular, correo, puntos, total_visitas, total_gastado, creado_en) VALUES
  (1, '1098765432', 'Carlos Mendoza', '+57 311 456 7890', 'carlos.m@example.com', 340, 12, 680000, '2026-01-15'),
  (2, '52345678', 'Sofía Restrepo', '+57 300 123 4567', 'sofia.r@example.com', 890, 24, 1450000, '2025-11-20'),
  (3, '901.445.892-1', 'Empresa TechCorp S.A.S.', '+57 601 234 5678', 'eventos@techcorp.com', 2150, 8, 3200000, '2026-03-01')
ON CONFLICT (id_cliente) DO NOTHING;
SELECT setval('clientes_id_cliente_seq', (SELECT MAX(id_cliente) FROM clientes));

INSERT INTO fidelizacion (id_cliente, puntos, nivel, ultima_compra)
SELECT id_cliente, puntos,
  CASE WHEN puntos >= 500 THEN 'Platino' WHEN puntos >= 200 THEN 'Oro' WHEN puntos >= 50 THEN 'Plata' ELSE 'Bronce' END,
  CURRENT_DATE
FROM clientes
ON CONFLICT (id_cliente) DO NOTHING;

-- Empleados (reemplaza al admin genérico del seed.sql)
DELETE FROM usuarios WHERE usuario <> 'admin';
DELETE FROM empleados WHERE documento <> '000000001';
INSERT INTO empleados (documento, nombre, cargo, celular, correo, rol, salario) VALUES
  ('EMP-002', 'Laura Gómez (Caja)', 'Cajero', '+57 310 000 0002', 'laura.g@laterraza.com', 'Cajero', 1900000),
  ('EMP-003', 'Mateo Morales (Mesero)', 'Mesero', '+57 310 000 0003', 'mateo.m@laterraza.com', 'Mesero', 1600000),
  ('EMP-004', 'Chef Antonio (Cocina)', 'Cocinero', '+57 310 000 0004', 'antonio.c@laterraza.com', 'Cocinero', 2100000)
ON CONFLICT (documento) DO NOTHING;
UPDATE empleados SET nombre = 'Administrador General', correo = 'admin@laterraza.com', rol = 'Administrador' WHERE documento = '000000001';

-- Proveedores
INSERT INTO proveedores (nit, razon_social, contacto, telefono, correo, direccion, categoria) VALUES
  ('800.555.123-4', 'Licores y Destilados del Valle', 'Ricardo Silva', '+57 315 888 9900', 'ventas@licoresdelvalle.com', 'Zona Industrial Lote 14', 'Licores'),
  ('800.777.456-1', 'Distribuidora Carnes Premium', 'Marta Delgado', '+57 318 444 2211', 'pedidos@carnespremium.com', 'Plaza Mayor Modulo B', 'Alimentos')
ON CONFLICT (nit) DO NOTHING;

-- Gastos recientes
INSERT INTO gastos (fecha, categoria, concepto, valor, id_forma_pago, observaciones) VALUES
  (CURRENT_DATE, 'Insumos', 'Compra urgente de hielos y limones', 45000, (SELECT id_forma_pago FROM formas_pago WHERE nombre = 'Efectivo'), 'Registrado por Laura Gómez'),
  (CURRENT_DATE - 1, 'Servicios', 'Pago parcial de gas propano industrial', 120000, (SELECT id_forma_pago FROM formas_pago WHERE nombre = 'Transferencia'), 'Registrado por Administrador General');

-- Sesión de caja abierta
INSERT INTO caja_sesiones (monto_inicial, monto_esperado, estado, notas,
  total_ventas_efectivo, total_ventas_tarjeta, total_ventas_transferencia, total_ventas_puntos)
VALUES (200000, 338000, 'Abierta', 'Apertura de turno tarde sin novedades', 138000, 210000, 60000, 0);

INSERT INTO caja_movimientos (id_sesion, tipo, concepto, valor, id_forma_pago, saldo)
SELECT id_sesion, 'Egreso', 'Gasto: Compra urgente de hielos y limones', 45000,
  (SELECT id_forma_pago FROM formas_pago WHERE nombre = 'Efectivo'), 293000
FROM caja_sesiones WHERE estado = 'Abierta' ORDER BY id_sesion DESC LIMIT 1;

COMMIT;

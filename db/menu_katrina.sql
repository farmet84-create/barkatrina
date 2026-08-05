-- Reemplaza el catálogo de demo ("La Terraza") por el menú real de La Katrina Gastro Bar.
-- No se borran filas (hay pedidos/facturas históricos que las referencian): se desactivan.

BEGIN;

UPDATE productos SET estado = 'Inactivo' WHERE estado = 'Activo';
UPDATE productos SET codigo = codigo || '-OLD' WHERE codigo NOT LIKE '%-OLD';
UPDATE categorias SET estado = 'Inactivo' WHERE estado = 'Activo';

INSERT INTO categorias (nombre, descripcion, icono) VALUES
  ('Licores', 'Tequilas, rones, whiskys, vodkas, ginebras y aguardientes', '🥃'),
  ('Cócteles', 'Cócteles de la casa La Katrina', '🍹'),
  ('Bebidas Sin Alcohol', 'Limonadas, jugos, gaseosas y energizantes', '🥤'),
  ('Cervezas', 'Cervezas nacionales e importadas', '🍺'),
  ('Comida', 'Antojitos mexicanos', '🌮');

-- Licores
INSERT INTO productos (codigo, nombre, id_categoria, costo, precio_venta, stock, stock_minimo, unidad, es_cocina) VALUES
  ('LIC-001', 'Tequila Cuernavaca', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 32000, 90000, 10, 3, 'Botella', false),
  ('LIC-002', 'Tequila José Cuervo Especial', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 32000, 90000, 10, 3, 'Botella', false),
  ('LIC-003', 'Tequila 1800 Reposado', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 45000, 130000, 8, 3, 'Botella', false),
  ('LIC-004', 'Tequila Don Julio Añejo', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 75000, 210000, 6, 2, 'Botella', false),
  ('LIC-005', 'Ron Bacardí Carta Blanca', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 28000, 80000, 10, 3, 'Botella', false),
  ('LIC-006', 'Ron Bacardí Añejo', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 32000, 90000, 10, 3, 'Botella', false),
  ('LIC-007', 'Ron Medellín 8 Años', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 38000, 110000, 8, 3, 'Botella', false),
  ('LIC-008', 'Whisky Johnnie Walker Red Label', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 35000, 100000, 10, 3, 'Botella', false),
  ('LIC-009', 'Whisky Buchanan''s 12', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 56000, 160000, 6, 2, 'Botella', false),
  ('LIC-010', 'Vodka Absolut', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 30000, 85000, 10, 3, 'Botella', false),
  ('LIC-011', 'Vodka Smirnoff', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 26000, 75000, 10, 3, 'Botella', false),
  ('LIC-012', 'Ginebra Tanqueray', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 32000, 90000, 8, 3, 'Botella', false),
  ('LIC-013', 'Ginebra Bombay Sapphire', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 38000, 110000, 8, 3, 'Botella', false),
  ('LIC-014', 'Aguardiente Antioqueño', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 19000, 55000, 15, 5, 'Botella', false),
  ('LIC-015', 'Aguardiente Néctar', (SELECT id_categoria FROM categorias WHERE nombre='Licores' AND estado='Activo'), 21000, 60000, 15, 5, 'Botella', false);

-- Cócteles
INSERT INTO productos (codigo, nombre, id_categoria, costo, precio_venta, stock, stock_minimo, unidad, descripcion, es_cocina) VALUES
  ('COC-001', 'Margarita Clásica', (SELECT id_categoria FROM categorias WHERE nombre='Cócteles' AND estado='Activo'), 9500, 28000, 200, 20, 'Copa', 'Tequila, triple sec, limón.', false),
  ('COC-002', 'Margarita de Maracuyá', (SELECT id_categoria FROM categorias WHERE nombre='Cócteles' AND estado='Activo'), 11000, 32000, 200, 20, 'Copa', 'Tequila, maracuyá, triple sec, limón.', false),
  ('COC-003', 'Mojito', (SELECT id_categoria FROM categorias WHERE nombre='Cócteles' AND estado='Activo'), 9500, 28000, 200, 20, 'Copa', 'Ron, hierbabuena, limón, azúcar, soda.', false),
  ('COC-004', 'Piña Colada', (SELECT id_categoria FROM categorias WHERE nombre='Cócteles' AND estado='Activo'), 9500, 28000, 200, 20, 'Copa', 'Ron, piña, crema de coco.', false),
  ('COC-005', 'Paloma', (SELECT id_categoria FROM categorias WHERE nombre='Cócteles' AND estado='Activo'), 9500, 28000, 200, 20, 'Copa', 'Tequila, toronja, limón, soda, sal.', false),
  ('COC-006', 'Mezcalita', (SELECT id_categoria FROM categorias WHERE nombre='Cócteles' AND estado='Activo'), 10500, 30000, 200, 20, 'Copa', 'Mezcal, limón, triple sec, sal.', false),
  ('COC-007', 'Katrina Passion', (SELECT id_categoria FROM categorias WHERE nombre='Cócteles' AND estado='Activo'), 11000, 32000, 200, 20, 'Copa', 'Vodka, maracuyá, limón, jarabe natural.', false),
  ('COC-008', 'Cantarito La Katrina', (SELECT id_categoria FROM categorias WHERE nombre='Cócteles' AND estado='Activo'), 14000, 40000, 200, 20, 'Copa', 'Tequila, jugo de cítricos, toronja, sal de gusano.', false);

-- Bebidas sin alcohol
INSERT INTO productos (codigo, nombre, id_categoria, costo, precio_venta, stock, stock_minimo, unidad, es_cocina) VALUES
  ('BEB-001', 'Limonada Natural', (SELECT id_categoria FROM categorias WHERE nombre='Bebidas Sin Alcohol' AND estado='Activo'), 3000, 10000, 100, 20, 'Vaso', false),
  ('BEB-002', 'Limonada de Coco', (SELECT id_categoria FROM categorias WHERE nombre='Bebidas Sin Alcohol' AND estado='Activo'), 3800, 12000, 100, 20, 'Vaso', false),
  ('BEB-003', 'Naranjada', (SELECT id_categoria FROM categorias WHERE nombre='Bebidas Sin Alcohol' AND estado='Activo'), 3000, 10000, 100, 20, 'Vaso', false),
  ('BEB-004', 'Agua con Gas', (SELECT id_categoria FROM categorias WHERE nombre='Bebidas Sin Alcohol' AND estado='Activo'), 2500, 8000, 100, 20, 'Unidad', false),
  ('BEB-005', 'Agua Natural', (SELECT id_categoria FROM categorias WHERE nombre='Bebidas Sin Alcohol' AND estado='Activo'), 1800, 6000, 100, 20, 'Unidad', false),
  ('BEB-006', 'Red Bull', (SELECT id_categoria FROM categorias WHERE nombre='Bebidas Sin Alcohol' AND estado='Activo'), 6000, 12000, 60, 15, 'Unidad', false),
  ('BEB-007', 'Gaseosas', (SELECT id_categoria FROM categorias WHERE nombre='Bebidas Sin Alcohol' AND estado='Activo'), 2000, 6000, 100, 20, 'Unidad', false);

-- Cervezas
INSERT INTO productos (codigo, nombre, id_categoria, costo, precio_venta, stock, stock_minimo, unidad, es_cocina) VALUES
  ('CER-001', 'Corona', (SELECT id_categoria FROM categorias WHERE nombre='Cervezas' AND estado='Activo'), 4500, 10000, 150, 30, 'Botella', false),
  ('CER-002', 'Modelo Especial', (SELECT id_categoria FROM categorias WHERE nombre='Cervezas' AND estado='Activo'), 5000, 11000, 150, 30, 'Botella', false),
  ('CER-003', 'Stella Artois', (SELECT id_categoria FROM categorias WHERE nombre='Cervezas' AND estado='Activo'), 5000, 11000, 150, 30, 'Botella', false),
  ('CER-004', 'Club Colombia Dorada', (SELECT id_categoria FROM categorias WHERE nombre='Cervezas' AND estado='Activo'), 3200, 7000, 150, 30, 'Botella', false),
  ('CER-005', 'Club Colombia Negra', (SELECT id_categoria FROM categorias WHERE nombre='Cervezas' AND estado='Activo'), 3200, 7000, 150, 30, 'Botella', false),
  ('CER-006', 'Águila', (SELECT id_categoria FROM categorias WHERE nombre='Cervezas' AND estado='Activo'), 2700, 6000, 150, 30, 'Botella', false);

-- Comida
INSERT INTO productos (codigo, nombre, id_categoria, costo, precio_venta, stock, stock_minimo, unidad, descripcion, es_cocina) VALUES
  ('COM-001', 'Nachos La Katrina', (SELECT id_categoria FROM categorias WHERE nombre='Comida' AND estado='Activo'), 9500, 28000, 80, 15, 'Porción', 'Nachos con frijoles, queso cheddar, pico de gallo, jalapeños, guacamole y crema agria.', true),
  ('COM-002', 'Guacamole', (SELECT id_categoria FROM categorias WHERE nombre='Comida' AND estado='Activo'), 8000, 22000, 80, 15, 'Porción', 'Tradicional guacamole con totopos.', true),
  ('COM-003', 'Flautas Mixtas', (SELECT id_categoria FROM categorias WHERE nombre='Comida' AND estado='Activo'), 9500, 26000, 80, 15, 'Porción', '4 flautas (2 de pollo, 2 de res) con lechuga, crema, queso y guacamole.', true),
  ('COM-004', 'Quesadillas', (SELECT id_categoria FROM categorias WHERE nombre='Comida' AND estado='Activo'), 8500, 24000, 80, 15, 'Porción', 'Tortilla de harina con queso fundido. Opción: Pollo / Res / Champiñones.', true),
  ('COM-005', 'Tacos (3 unidades)', (SELECT id_categoria FROM categorias WHERE nombre='Comida' AND estado='Activo'), 8500, 24000, 80, 15, 'Porción', 'Tacos al estilo mexicano. Opción: Pastor / Res / Pollo / Vegetariano.', true),
  ('COM-006', 'Extra Salsa', (SELECT id_categoria FROM categorias WHERE nombre='Comida' AND estado='Activo'), 500, 2000, 100, 20, 'Unidad', 'Adicional de salsa.', true),
  ('COM-007', 'Extra Guacamole', (SELECT id_categoria FROM categorias WHERE nombre='Comida' AND estado='Activo'), 1800, 5000, 100, 20, 'Unidad', 'Adicional de guacamole.', true);

INSERT INTO inventario (id_producto, stock_actual, stock_minimo, stock_maximo, costo_promedio)
SELECT id_producto, stock, stock_minimo, stock_minimo * 6, costo FROM productos
WHERE id_producto NOT IN (SELECT id_producto FROM inventario);

COMMIT;

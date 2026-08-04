-- Datos semilla mínimos para operar el ERP

BEGIN;

INSERT INTO formas_pago (nombre, comision_pct) VALUES
  ('Efectivo', 0),
  ('Tarjeta', 2.5),
  ('Nequi', 0),
  ('Transferencia', 0),
  ('Mixto', 0),
  ('Puntos', 0)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('empresa', 'Mi Bar', 'Nombre comercial'),
  ('nit', '', 'NIT / identificación fiscal'),
  ('direccion', '', 'Dirección del negocio'),
  ('telefono', '', 'Teléfono de contacto'),
  ('correo', '', 'Correo de contacto'),
  ('moneda_simbolo', '$', 'Símbolo de moneda'),
  ('iva', '19', 'IVA %'),
  ('propina_por_defecto', '10', 'Propina sugerida %'),
  ('puntos_por_compra', '1000', 'Pesos gastados por 1 punto de fidelización'),
  ('valor_punto', '50', 'Valor en pesos de 1 punto redimido'),
  ('pie_recibo', 'Gracias por su visita', 'Texto al pie de la factura')
ON CONFLICT (clave) DO NOTHING;

-- Matriz de permisos (Entrega 5 · 28_Permisos)
INSERT INTO permisos (rol, modulo, permitido) VALUES
  ('Administrador','ventas',true), ('Administrador','inventario',true), ('Administrador','compras',true),
  ('Administrador','caja',true), ('Administrador','dashboard',true), ('Administrador','configuracion',true),
  ('Cajero','ventas',true), ('Cajero','inventario',false), ('Cajero','compras',false),
  ('Cajero','caja',true), ('Cajero','dashboard',false), ('Cajero','configuracion',false),
  ('Mesero','ventas',true), ('Mesero','inventario',false), ('Mesero','compras',false),
  ('Mesero','caja',false), ('Mesero','dashboard',false), ('Mesero','configuracion',false),
  ('Cocinero','ventas',false), ('Cocinero','inventario',false), ('Cocinero','compras',false),
  ('Cocinero','caja',false), ('Cocinero','dashboard',false), ('Cocinero','configuracion',false)
ON CONFLICT (rol, modulo) DO NOTHING;

INSERT INTO empleados (documento, nombre, cargo, celular, salario) VALUES
  ('000000001', 'Administrador', 'Administrador', '', 0)
ON CONFLICT (documento) DO NOTHING;

-- Contraseña por defecto: admin123 (bcrypt) — CAMBIAR en el primer login.
INSERT INTO usuarios (usuario, contrasena_hash, rol, id_empleado) VALUES
  ('admin', '$2b$10$2HL7lD7WD4OzqCQDmhUE0eW7/SJh2.BtRtiaE.ag7CLu1aAOdC0Sq', 'Administrador',
   (SELECT id_empleado FROM empleados WHERE documento = '000000001'))
ON CONFLICT (usuario) DO NOTHING;

INSERT INTO mesas (numero, zona, capacidad) VALUES
  ('Mesa 1', 'Salón Principal', 4),
  ('Mesa 2', 'Salón Principal', 4),
  ('Mesa 3', 'Terraza', 6),
  ('Barra 1', 'Barra', 2)
ON CONFLICT DO NOTHING;

COMMIT;

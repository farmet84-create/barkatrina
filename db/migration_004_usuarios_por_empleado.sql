-- Asegura que todo empleado tenga una cuenta de usuario asociada,
-- ya que pedidos/facturas/compras/gastos se vinculan via id_usuario -> id_empleado.

BEGIN;

INSERT INTO usuarios (usuario, contrasena_hash, rol, id_empleado, estado)
SELECT
  lower(regexp_replace(split_part(e.nombre, ' ', 1), '[^a-zA-Zá-úÁ-Ú0-9]', '', 'g')) || '.' || e.id_empleado,
  '$2b$10$2HL7lD7WD4OzqCQDmhUE0eW7/SJh2.BtRtiaE.ag7CLu1aAOdC0Sq', -- admin123 (temporal, cambiar en producción)
  e.rol,
  e.id_empleado,
  e.estado
FROM empleados e
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.id_empleado = e.id_empleado);

COMMIT;

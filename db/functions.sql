-- Reglas de negocio del diccionario (Entrega 5 · 25_Reglas_Negocio)
-- RN001: Toda venta descuenta inventario
-- RN002: Factura nace de un pedido (ya forzado por facturas.id_pedido UNIQUE NOT NULL)

BEGIN;

-- RN001: al insertar una línea de detalle_facturas, descuenta stock de productos e inventario,
-- y deja registro en movimientos_inventario.
CREATE OR REPLACE FUNCTION fn_descontar_inventario_venta() RETURNS TRIGGER AS $$
DECLARE
  v_id_usuario INTEGER;
BEGIN
  SELECT id_usuario INTO v_id_usuario FROM facturas WHERE id_factura = NEW.id_factura;

  UPDATE productos SET stock = stock - NEW.cantidad WHERE id_producto = NEW.id_producto;

  UPDATE inventario
     SET stock_actual = stock_actual - NEW.cantidad,
         ultima_actualizacion = now()
   WHERE id_producto = NEW.id_producto;

  INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, costo_unitario, documento, observacion, id_usuario)
  VALUES (NEW.id_producto, 'Venta', -NEW.cantidad, NULL,
          (SELECT numero_factura FROM facturas WHERE id_factura = NEW.id_factura),
          'Descuento automático por venta (RN001)', v_id_usuario);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_descontar_inventario_venta ON detalle_facturas;
CREATE TRIGGER trg_descontar_inventario_venta
  AFTER INSERT ON detalle_facturas
  FOR EACH ROW EXECUTE FUNCTION fn_descontar_inventario_venta();

-- Compras: al insertar una línea de detalle_compras, incrementa stock e inventario,
-- y recalcula costo_promedio (promedio ponderado).
CREATE OR REPLACE FUNCTION fn_incrementar_inventario_compra() RETURNS TRIGGER AS $$
DECLARE
  v_id_usuario INTEGER;
  v_stock_prev INTEGER;
  v_costo_prev NUMERIC(12,2);
  v_costo_nuevo NUMERIC(12,2);
BEGIN
  SELECT id_usuario INTO v_id_usuario FROM compras WHERE id_compra = NEW.id_compra;

  SELECT stock_actual, costo_promedio INTO v_stock_prev, v_costo_prev
    FROM inventario WHERE id_producto = NEW.id_producto;

  IF v_stock_prev IS NULL THEN
    INSERT INTO inventario (id_producto, stock_actual, stock_minimo, stock_maximo, costo_promedio)
    VALUES (NEW.id_producto, NEW.cantidad, 0, 0, NEW.costo_unitario);
  ELSE
    v_costo_nuevo := CASE WHEN (v_stock_prev + NEW.cantidad) = 0 THEN v_costo_prev
      ELSE ((v_stock_prev * COALESCE(v_costo_prev,0)) + (NEW.cantidad * NEW.costo_unitario)) / (v_stock_prev + NEW.cantidad)
      END;
    UPDATE inventario
       SET stock_actual = stock_actual + NEW.cantidad,
           costo_promedio = v_costo_nuevo,
           ultima_actualizacion = now()
     WHERE id_producto = NEW.id_producto;
  END IF;

  UPDATE productos SET stock = stock + NEW.cantidad, costo = NEW.costo_unitario WHERE id_producto = NEW.id_producto;

  INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, costo_unitario, documento, observacion, id_usuario)
  VALUES (NEW.id_producto, 'Compra', NEW.cantidad, NEW.costo_unitario,
          (SELECT factura_proveedor FROM compras WHERE id_compra = NEW.id_compra),
          'Ingreso automático por compra', v_id_usuario);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incrementar_inventario_compra ON detalle_compras;
CREATE TRIGGER trg_incrementar_inventario_compra
  AFTER INSERT ON detalle_compras
  FOR EACH ROW EXECUTE FUNCTION fn_incrementar_inventario_compra();

-- Fidelización: al pagar una factura con cliente, acumula puntos (1 punto por cada
-- `puntos_por_compra` pesos, según configuracion) y sube de nivel.
CREATE OR REPLACE FUNCTION fn_acumular_puntos_factura() RETURNS TRIGGER AS $$
DECLARE
  v_puntos_por_compra NUMERIC;
  v_puntos_ganados INTEGER;
  v_puntos_totales INTEGER;
  v_nivel VARCHAR(20);
BEGIN
  IF NEW.id_cliente IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(valor::NUMERIC, 1000) INTO v_puntos_por_compra
    FROM configuracion WHERE clave = 'puntos_por_compra';
  IF v_puntos_por_compra IS NULL THEN v_puntos_por_compra := 1000; END IF;

  v_puntos_ganados := FLOOR(NEW.total / v_puntos_por_compra);

  INSERT INTO fidelizacion (id_cliente, puntos, nivel, ultima_compra)
  VALUES (NEW.id_cliente, v_puntos_ganados, 'Bronce', NEW.fecha)
  ON CONFLICT (id_cliente) DO UPDATE
    SET puntos = fidelizacion.puntos + v_puntos_ganados,
        ultima_compra = NEW.fecha
  RETURNING puntos INTO v_puntos_totales;

  v_nivel := CASE
    WHEN v_puntos_totales >= 500 THEN 'Platino'
    WHEN v_puntos_totales >= 200 THEN 'Oro'
    WHEN v_puntos_totales >= 50  THEN 'Plata'
    ELSE 'Bronce'
  END;

  UPDATE fidelizacion SET nivel = v_nivel WHERE id_cliente = NEW.id_cliente;
  UPDATE clientes SET puntos = v_puntos_totales WHERE id_cliente = NEW.id_cliente;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_acumular_puntos_factura ON facturas;
CREATE TRIGGER trg_acumular_puntos_factura
  AFTER INSERT ON facturas
  FOR EACH ROW EXECUTE FUNCTION fn_acumular_puntos_factura();

COMMIT;

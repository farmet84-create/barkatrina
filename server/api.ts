import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool, q } from './db';
import { createSession, getSession, destroySession } from './sessions';

export const api = Router();

const ok = (fn: (req: any, res: any) => Promise<any>) => async (req: any, res: any) => {
  try {
    await fn(req, res);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
};

// ---------- helpers ----------

async function getConfigMap(): Promise<Record<string, string>> {
  const { rows } = await q('SELECT clave, valor FROM configuracion');
  const map: Record<string, string> = {};
  for (const r of rows) map[r.clave] = r.valor;
  return map;
}

const statusDbToFe: Record<string, string> = {
  Libre: 'libre', Ocupada: 'ocupada', Por_Pagar: 'por_pagar', Reservada: 'reservada'
};
const statusFeToDb: Record<string, string> = {
  libre: 'Libre', ocupada: 'Ocupada', por_pagar: 'Por_Pagar', reservada: 'Reservada'
};

const orderStatusDbToFe: Record<string, string> = {
  Abierto: 'pendiente', En_Cocina: 'en_cocina', Servido: 'servido', Facturado: 'facturado', Cancelado: 'cancelado'
};
const orderStatusFeToDb: Record<string, string> = {
  pendiente: 'Abierto', en_cocina: 'En_Cocina', servido: 'Servido', facturado: 'Facturado', cancelado: 'Cancelado'
};

const roleDbToFe: Record<string, string> = {
  Administrador: 'admin', Cajero: 'cajero', Mesero: 'mesero', Cocinero: 'cocinero'
};
const roleFeToDb: Record<string, string> = {
  admin: 'Administrador', cajero: 'Cajero', mesero: 'Mesero', cocinero: 'Cocinero'
};

const paymentFeToName: Record<string, string> = {
  efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', mixto: 'Mixto', puntos: 'Puntos'
};

async function recalcOrderTotals(idPedido: number) {
  const cfg = await getConfigMap();
  const taxRate = Number(cfg.iva ?? 8) / 100;
  const tipRate = Number(cfg.propina_por_defecto ?? 10) / 100;

  const { rows } = await q(
    `SELECT COALESCE(SUM(subtotal),0) AS subtotal FROM detalle_pedidos WHERE id_pedido = $1`,
    [idPedido]
  );
  const subtotal = Number(rows[0].subtotal);
  const { rows: prevRows } = await q('SELECT descuento FROM pedidos WHERE id_pedido = $1', [idPedido]);
  const descuento = Number(prevRows[0]?.descuento ?? 0);
  const impuesto = Math.round(subtotal * taxRate);
  const propina = Math.round(subtotal * tipRate);
  const total = Math.max(0, subtotal + impuesto + propina - descuento);

  await q(
    `UPDATE pedidos SET subtotal=$1, impuesto=$2, propina=$3, total=$4 WHERE id_pedido=$5`,
    [subtotal, impuesto, propina, total, idPedido]
  );
}

// ---------- mappers (DB row -> frontend shape) ----------

function mapProduct(r: any) {
  return {
    id: String(r.id_producto),
    code: r.codigo,
    name: r.nombre,
    categoryId: r.id_categoria !== null ? String(r.id_categoria) : '',
    price: Number(r.precio_venta),
    cost: Number(r.costo),
    stock: r.stock,
    minStock: r.stock_minimo,
    unit: r.unidad,
    image: r.imagen_url || undefined,
    description: r.descripcion || undefined,
    isKitchenItem: r.es_cocina
  };
}

function mapCategory(r: any) {
  return { id: String(r.id_categoria), name: r.nombre, icon: r.icono, description: r.descripcion || undefined };
}

function mapTable(r: any) {
  return {
    id: String(r.id_mesa),
    number: r.zona_orden,
    name: r.numero,
    zone: r.zona,
    capacity: r.capacidad,
    status: statusDbToFe[r.estado] || 'libre',
    activeOrderId: r.active_order_id ? String(r.active_order_id) : undefined
  };
}

function mapOrderItem(r: any) {
  return {
    id: String(r.id_detalle),
    productId: String(r.id_producto),
    productName: r.producto_nombre,
    unitPrice: Number(r.precio_unitario),
    quantity: r.cantidad,
    notes: r.notas || undefined,
    isPrepared: r.preparado
  };
}

function mapOrder(r: any, items: any[]) {
  return {
    id: String(r.id_pedido),
    code: `PED-${r.id_pedido}`,
    tableId: r.id_mesa !== null ? String(r.id_mesa) : undefined,
    tableName: r.mesa_nombre || (r.tipo === 'llevar' ? 'Para Llevar' : r.tipo === 'domicilio' ? 'Domicilio' : undefined),
    customerId: r.id_cliente !== null ? String(r.id_cliente) : undefined,
    customerName: r.cliente_nombre || undefined,
    waiterId: r.id_usuario !== null ? String(r.id_usuario) : '',
    waiterName: r.mesero_nombre || '',
    items: items.map(mapOrderItem),
    status: orderStatusDbToFe[r.estado] || 'pendiente',
    notes: r.notas || undefined,
    subtotal: Number(r.subtotal),
    taxAmount: Number(r.impuesto),
    tipAmount: Number(r.propina),
    discountAmount: Number(r.descuento),
    total: Number(r.total),
    createdAt: r.creado_en,
    type: r.tipo
  };
}

function mapInvoice(r: any, items: any[]) {
  return {
    id: String(r.id_factura),
    number: r.numero_factura,
    orderId: String(r.id_pedido),
    customerId: r.id_cliente !== null ? String(r.id_cliente) : undefined,
    customerName: r.cliente_nombre || 'Cliente General',
    customerDoc: r.cliente_documento || undefined,
    waiterName: r.mesero_nombre || '',
    items: items.map(mapOrderItem),
    subtotal: Number(r.subtotal),
    taxAmount: Number(r.impuesto),
    tipAmount: Number(r.propina),
    discountAmount: Number(r.descuento),
    total: Number(r.total),
    paymentMethod: (r.forma_pago_nombre || 'efectivo').toLowerCase(),
    amountPaid: Number(r.monto_pagado),
    changeDue: Number(r.cambio),
    cashierId: r.id_usuario !== null ? String(r.id_usuario) : '',
    cashierName: r.cajero_nombre || '',
    createdAt: r.creado_en
  };
}

function mapCustomer(r: any) {
  return {
    id: String(r.id_cliente),
    name: r.nombre,
    docNumber: r.documento || '',
    email: r.correo || '',
    phone: r.celular || '',
    loyaltyPoints: r.puntos,
    totalVisits: r.total_visitas,
    totalSpent: Number(r.total_gastado),
    createdAt: r.creado_en
  };
}

function mapEmployee(r: any) {
  return {
    id: String(r.id_empleado),
    name: r.nombre,
    role: roleDbToFe[r.rol] || 'mesero',
    email: r.correo || '',
    phone: r.celular || '',
    active: r.estado === 'Activo'
  };
}

function mapSupplier(r: any) {
  return {
    id: String(r.id_proveedor),
    name: r.razon_social,
    taxId: r.nit,
    contactName: r.contacto || '',
    phone: r.telefono || r.celular || '',
    email: r.correo || '',
    address: r.direccion || '',
    category: r.categoria || ''
  };
}

function mapExpense(r: any) {
  return {
    id: String(r.id_gasto),
    category: r.categoria,
    description: r.concepto,
    amount: Number(r.valor),
    date: r.fecha,
    registeredBy: r.usuario_nombre || 'Sistema',
    paymentMethod: (r.forma_pago_nombre || 'efectivo').toLowerCase()
  };
}

function mapStockMovement(r: any) {
  return {
    id: String(r.id_movimiento),
    productId: String(r.id_producto),
    productName: r.producto_nombre,
    type: r.tipo_movimiento.toLowerCase(),
    quantity: Math.abs(r.cantidad),
    reason: r.observacion || '',
    date: r.fecha,
    registeredBy: r.usuario_nombre || 'Sistema'
  };
}

function mapPurchaseOrder(r: any, items: any[]) {
  return {
    id: String(r.id_compra),
    supplierId: String(r.id_proveedor),
    supplierName: r.proveedor_nombre,
    invoiceNumber: r.factura_proveedor || '',
    items: items.map((i: any) => ({
      productId: String(i.id_producto),
      productName: i.producto_nombre,
      quantity: i.cantidad,
      unitCost: Number(i.costo_unitario),
      subtotal: Number(i.subtotal)
    })),
    total: Number(r.total),
    date: r.fecha,
    notes: r.observaciones || undefined
  };
}

function mapCashSession(r: any) {
  if (!r) return null;
  return {
    id: String(r.id_sesion),
    openedAt: r.abierta_en,
    closedAt: r.cerrada_en || undefined,
    openedBy: r.abierta_por_nombre || '',
    closedBy: r.cerrada_por_nombre || undefined,
    initialAmount: Number(r.monto_inicial),
    expectedCash: Number(r.monto_esperado),
    actualCash: r.monto_real !== null ? Number(r.monto_real) : undefined,
    cashDifference: r.diferencia !== null ? Number(r.diferencia) : undefined,
    totalCashSales: Number(r.total_ventas_efectivo),
    totalCardSales: Number(r.total_ventas_tarjeta),
    totalTransferSales: Number(r.total_ventas_transferencia),
    totalPointsSales: Number(r.total_ventas_puntos),
    totalExpenses: Number(r.total_egresos ?? 0),
    totalIncomes: Number(r.total_ingresos ?? 0),
    status: r.estado === 'Abierta' ? 'abierta' : 'cerrada',
    notes: r.notas || undefined
  };
}

function mapCashMovement(r: any) {
  return {
    id: String(r.id_movimiento),
    sessionId: String(r.id_sesion),
    type: r.tipo.toLowerCase(),
    amount: Number(r.valor),
    reason: r.concepto,
    user: r.usuario_nombre || 'Sistema',
    createdAt: r.fecha
  };
}

// ---------- auth ----------

api.post('/auth/login', ok(async (req, res) => {
  const { usuario, contrasena } = req.body;
  const { rows } = await q(
    `SELECT u.id_usuario, u.id_empleado, u.contrasena_hash, u.estado AS usuario_estado,
            e.id_empleado AS emp_id, e.nombre, e.rol, e.correo, e.celular, e.estado AS empleado_estado
     FROM usuarios u
     JOIN empleados e ON e.id_empleado = u.id_empleado
     WHERE u.usuario = $1`,
    [usuario]
  );
  const row = rows[0];
  if (!row || row.usuario_estado !== 'Activo' || row.empleado_estado !== 'Activo') {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  const match = await bcrypt.compare(contrasena || '', row.contrasena_hash);
  if (!match) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  const token = createSession(row.id_usuario, row.id_empleado);
  res.json({
    token,
    employee: {
      id: String(row.emp_id),
      name: row.nombre,
      role: roleDbToFe[row.rol] || 'mesero',
      email: row.correo || '',
      phone: row.celular || '',
      active: row.empleado_estado === 'Activo'
    }
  });
}));

api.get('/auth/me', ok(async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const session = getSession(token);
  if (!session || !session.idEmpleado) return res.status(401).json({ error: 'Sesión inválida' });
  const { rows } = await q('SELECT * FROM empleados WHERE id_empleado = $1 AND estado = $2', [session.idEmpleado, 'Activo']);
  if (!rows[0]) return res.status(401).json({ error: 'Sesión inválida' });
  res.json(mapEmployee(rows[0]));
}));

api.post('/auth/logout', ok(async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token) destroySession(token);
  res.json({ ok: true });
}));

// ---------- config ----------

api.get('/config', ok(async (_req, res) => {
  const cfg = await getConfigMap();
  res.json({
    businessName: cfg.empresa || '',
    taxId: cfg.nit || '',
    address: cfg.direccion || '',
    phone: cfg.telefono || '',
    email: cfg.correo || '',
    currencySymbol: cfg.moneda_simbolo || '$',
    taxRatePercent: Number(cfg.iva || 8),
    defaultTipPercent: Number(cfg.propina_por_defecto || 10),
    pointsPerPurchase: cfg.puntos_por_compra ? Math.round(1000 / Number(cfg.puntos_por_compra)) : 10,
    currencyPointValue: Number(cfg.valor_punto || 50),
    receiptFooterText: cfg.pie_recibo || ''
  });
}));

api.patch('/config', ok(async (req, res) => {
  const body = req.body;
  const map: Record<string, string> = {};
  if (body.businessName !== undefined) map.empresa = body.businessName;
  if (body.taxId !== undefined) map.nit = body.taxId;
  if (body.address !== undefined) map.direccion = body.address;
  if (body.phone !== undefined) map.telefono = body.phone;
  if (body.email !== undefined) map.correo = body.email;
  if (body.currencySymbol !== undefined) map.moneda_simbolo = body.currencySymbol;
  if (body.taxRatePercent !== undefined) map.iva = String(body.taxRatePercent);
  if (body.defaultTipPercent !== undefined) map.propina_por_defecto = String(body.defaultTipPercent);
  if (body.pointsPerPurchase !== undefined) map.puntos_por_compra = String(Math.round(1000 / Number(body.pointsPerPurchase || 10)));
  if (body.currencyPointValue !== undefined) map.valor_punto = String(body.currencyPointValue);
  if (body.receiptFooterText !== undefined) map.pie_recibo = body.receiptFooterText;

  for (const [clave, valor] of Object.entries(map)) {
    await q(
      `INSERT INTO configuracion (clave, valor) VALUES ($1,$2)
       ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor`,
      [clave, valor]
    );
  }
  res.json({ ok: true });
}));

// ---------- categories ----------

api.get('/categories', ok(async (_req, res) => {
  const { rows } = await q('SELECT * FROM categorias WHERE estado = $1 ORDER BY id_categoria', ['Activo']);
  res.json(rows.map(mapCategory));
}));

// ---------- products ----------

api.get('/products', ok(async (_req, res) => {
  const { rows } = await q('SELECT * FROM productos WHERE estado = $1 ORDER BY id_producto', ['Activo']);
  res.json(rows.map(mapProduct));
}));

api.post('/products', ok(async (req, res) => {
  const b = req.body;
  const { rows } = await q(
    `INSERT INTO productos (codigo, nombre, id_categoria, costo, precio_venta, stock, stock_minimo, unidad, imagen_url, descripcion, es_cocina)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [b.code, b.name, b.categoryId ? Number(b.categoryId) : null, b.cost || 0, b.price || 0,
     b.stock || 0, b.minStock || 0, b.unit || 'unidad', b.image || null, b.description || null, !!b.isKitchenItem]
  );
  await q(
    `INSERT INTO inventario (id_producto, stock_actual, stock_minimo, stock_maximo, costo_promedio)
     VALUES ($1,$2,$3,$4,$5)`,
    [rows[0].id_producto, b.stock || 0, b.minStock || 0, (b.minStock || 0) * 8, b.cost || 0]
  );
  res.json(mapProduct(rows[0]));
}));

api.put('/products/:id', ok(async (req, res) => {
  const b = req.body;
  const { rows } = await q(
    `UPDATE productos SET
       codigo = COALESCE($1, codigo), nombre = COALESCE($2, nombre),
       id_categoria = COALESCE($3, id_categoria), costo = COALESCE($4, costo),
       precio_venta = COALESCE($5, precio_venta), stock = COALESCE($6, stock),
       stock_minimo = COALESCE($7, stock_minimo), unidad = COALESCE($8, unidad),
       imagen_url = COALESCE($9, imagen_url), descripcion = COALESCE($10, descripcion),
       es_cocina = COALESCE($11, es_cocina)
     WHERE id_producto = $12 RETURNING *`,
    [b.code, b.name, b.categoryId ? Number(b.categoryId) : null, b.cost, b.price, b.stock,
     b.minStock, b.unit, b.image, b.description, b.isKitchenItem, Number(req.params.id)]
  );
  res.json(mapProduct(rows[0]));
}));

api.delete('/products/:id', ok(async (req, res) => {
  await q(`UPDATE productos SET estado = 'Inactivo' WHERE id_producto = $1`, [Number(req.params.id)]);
  res.json({ ok: true });
}));

// ---------- tables ----------

const TABLE_SELECT = `
  SELECT m.*,
    (SELECT p.id_pedido FROM pedidos p
      WHERE p.id_mesa = m.id_mesa AND p.estado NOT IN ('Facturado','Cancelado')
      ORDER BY p.id_pedido DESC LIMIT 1) AS active_order_id
  FROM mesas m`;

api.get('/tables', ok(async (_req, res) => {
  const { rows } = await q(`${TABLE_SELECT} ORDER BY m.zona_orden, m.id_mesa`);
  res.json(rows.map(mapTable));
}));

api.patch('/tables/:id/status', ok(async (req, res) => {
  const { status } = req.body;
  await q(`UPDATE mesas SET estado = $1 WHERE id_mesa = $2`, [statusFeToDb[status] || 'Libre', Number(req.params.id)]);
  const { rows } = await q(`${TABLE_SELECT} WHERE m.id_mesa = $1`, [Number(req.params.id)]);
  res.json(mapTable(rows[0]));
}));

// ---------- orders ----------

const ORDER_SELECT = `
  SELECT p.*, m.numero AS mesa_nombre, c.nombre AS cliente_nombre, e.nombre AS mesero_nombre
  FROM pedidos p
  LEFT JOIN mesas m ON m.id_mesa = p.id_mesa
  LEFT JOIN clientes c ON c.id_cliente = p.id_cliente
  LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario
  LEFT JOIN empleados e ON e.id_empleado = u.id_empleado`;

async function loadOrderItems(idPedido: number) {
  const { rows } = await q(
    `SELECT dp.*, pr.nombre AS producto_nombre FROM detalle_pedidos dp
     JOIN productos pr ON pr.id_producto = dp.id_producto
     WHERE dp.id_pedido = $1 ORDER BY dp.id_detalle`,
    [idPedido]
  );
  return rows;
}

async function loadFullOrder(idPedido: number) {
  const { rows } = await q(`${ORDER_SELECT} WHERE p.id_pedido = $1`, [idPedido]);
  if (!rows[0]) return null;
  const items = await loadOrderItems(idPedido);
  return mapOrder(rows[0], items);
}

api.get('/orders', ok(async (_req, res) => {
  const { rows } = await q(`${ORDER_SELECT} ORDER BY p.id_pedido DESC LIMIT 100`);
  const result = [];
  for (const r of rows) {
    const items = await loadOrderItems(r.id_pedido);
    result.push(mapOrder(r, items));
  }
  res.json(result);
}));

api.post('/orders', ok(async (req, res) => {
  const b = req.body; // { tableId, type, customerId, waiterEmployeeId }
  let idUsuario: number | null = null;
  if (b.waiterEmployeeId) {
    const { rows } = await q('SELECT id_usuario FROM usuarios WHERE id_empleado = $1 LIMIT 1', [Number(b.waiterEmployeeId)]);
    idUsuario = rows[0]?.id_usuario ?? null;
  }
  const { rows } = await q(
    `INSERT INTO pedidos (id_mesa, id_cliente, id_usuario, tipo, estado)
     VALUES ($1,$2,$3,$4,'Abierto') RETURNING id_pedido`,
    [b.tableId ? Number(b.tableId) : null, b.customerId ? Number(b.customerId) : null, idUsuario, b.type || 'mesa']
  );
  const idPedido = rows[0].id_pedido;
  if (b.tableId) {
    await q(`UPDATE mesas SET estado = 'Ocupada' WHERE id_mesa = $1`, [Number(b.tableId)]);
  }
  res.json(await loadFullOrder(idPedido));
}));

api.post('/orders/:id/items', ok(async (req, res) => {
  const idPedido = Number(req.params.id);
  const { productId, quantity = 1, notes } = req.body;
  const { rows: prodRows } = await q('SELECT precio_venta FROM productos WHERE id_producto = $1', [Number(productId)]);
  const precio = Number(prodRows[0].precio_venta);

  const { rows: existing } = await q(
    `SELECT id_detalle, cantidad FROM detalle_pedidos WHERE id_pedido=$1 AND id_producto=$2 AND COALESCE(notas,'')=COALESCE($3,'')`,
    [idPedido, Number(productId), notes || null]
  );

  if (existing[0]) {
    const newQty = existing[0].cantidad + quantity;
    await q('UPDATE detalle_pedidos SET cantidad=$1, subtotal=$2 WHERE id_detalle=$3',
      [newQty, newQty * precio, existing[0].id_detalle]);
  } else {
    await q(
      `INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal, notas, preparado)
       SELECT $1,$2,$3,$4,$5,$6, NOT es_cocina FROM productos WHERE id_producto=$2`,
      [idPedido, Number(productId), quantity, precio, quantity * precio, notes || null]
    );
  }
  await recalcOrderTotals(idPedido);
  res.json(await loadFullOrder(idPedido));
}));

api.delete('/orders/:id/items/:itemId', ok(async (req, res) => {
  const idPedido = Number(req.params.id);
  await q('DELETE FROM detalle_pedidos WHERE id_detalle = $1 AND id_pedido = $2', [Number(req.params.itemId), idPedido]);
  await recalcOrderTotals(idPedido);
  res.json(await loadFullOrder(idPedido));
}));

api.patch('/orders/:id/items/:itemId/quantity', ok(async (req, res) => {
  const idPedido = Number(req.params.id);
  const { delta } = req.body;
  const { rows } = await q('SELECT cantidad, precio_unitario FROM detalle_pedidos WHERE id_detalle=$1', [Number(req.params.itemId)]);
  const newQty = Math.max(1, rows[0].cantidad + delta);
  await q('UPDATE detalle_pedidos SET cantidad=$1, subtotal=$2 WHERE id_detalle=$3',
    [newQty, newQty * Number(rows[0].precio_unitario), Number(req.params.itemId)]);
  await recalcOrderTotals(idPedido);
  res.json(await loadFullOrder(idPedido));
}));

api.patch('/orders/:id/items/:itemId/toggle-prepared', ok(async (req, res) => {
  const idPedido = Number(req.params.id);
  await q('UPDATE detalle_pedidos SET preparado = NOT preparado WHERE id_detalle=$1', [Number(req.params.itemId)]);
  const items = await loadOrderItems(idPedido);
  const allPrepared = items.every((i: any) => i.preparado);
  await q(`UPDATE pedidos SET estado = $1 WHERE id_pedido = $2`, [allPrepared ? 'Servido' : 'En_Cocina', idPedido]);
  res.json(await loadFullOrder(idPedido));
}));

api.patch('/orders/:id/notes', ok(async (req, res) => {
  await q('UPDATE pedidos SET notas = $1 WHERE id_pedido = $2', [req.body.notes || null, Number(req.params.id)]);
  res.json(await loadFullOrder(Number(req.params.id)));
}));

api.patch('/orders/:id/send-to-kitchen', ok(async (req, res) => {
  await q(`UPDATE pedidos SET estado = 'En_Cocina' WHERE id_pedido = $1`, [Number(req.params.id)]);
  res.json(await loadFullOrder(Number(req.params.id)));
}));

api.patch('/orders/:id/status', ok(async (req, res) => {
  const idPedido = Number(req.params.id);
  const dbStatus = orderStatusFeToDb[req.body.status] || 'Abierto';
  const { rows } = await q('SELECT id_mesa FROM pedidos WHERE id_pedido = $1', [idPedido]);
  await q('UPDATE pedidos SET estado = $1 WHERE id_pedido = $2', [dbStatus, idPedido]);
  if (rows[0]?.id_mesa && (dbStatus === 'Facturado' || dbStatus === 'Cancelado')) {
    await q(`UPDATE mesas SET estado = 'Libre' WHERE id_mesa = $1`, [rows[0].id_mesa]);
  }
  res.json(await loadFullOrder(idPedido));
}));

// ---------- checkout / invoices ----------

const INVOICE_SELECT = `
  SELECT f.*, c.nombre AS cliente_nombre, c.documento AS cliente_documento,
    fp.nombre AS forma_pago_nombre, e.nombre AS cajero_nombre, ew.nombre AS mesero_nombre
  FROM facturas f
  LEFT JOIN clientes c ON c.id_cliente = f.id_cliente
  LEFT JOIN formas_pago fp ON fp.id_forma_pago = f.id_forma_pago
  LEFT JOIN usuarios u ON u.id_usuario = f.id_usuario
  LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
  LEFT JOIN pedidos p ON p.id_pedido = f.id_pedido
  LEFT JOIN usuarios uw ON uw.id_usuario = p.id_usuario
  LEFT JOIN empleados ew ON ew.id_empleado = uw.id_empleado`;

async function loadFullInvoice(idFactura: number) {
  const { rows } = await q(`${INVOICE_SELECT} WHERE f.id_factura = $1`, [idFactura]);
  if (!rows[0]) return null;
  const { rows: items } = await q(
    `SELECT df.*, pr.nombre AS producto_nombre, df.id_detalle, true AS preparado
     FROM detalle_facturas df JOIN productos pr ON pr.id_producto = df.id_producto
     WHERE df.id_factura = $1`,
    [idFactura]
  );
  return mapInvoice(rows[0], items);
}

api.post('/checkout', ok(async (req, res) => {
  const b = req.body; // { orderId, paymentMethod, amountPaid, tipAmount, discountAmount, customerId }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const idPedido = Number(b.orderId);
    const { rows: orderRows } = await client.query('SELECT * FROM pedidos WHERE id_pedido = $1 FOR UPDATE', [idPedido]);
    const order = orderRows[0];
    const { rows: itemRows } = await client.query('SELECT * FROM detalle_pedidos WHERE id_pedido = $1', [idPedido]);

    const cfgRes = await client.query('SELECT clave, valor FROM configuracion');
    const cfg: Record<string, string> = {};
    cfgRes.rows.forEach((r: any) => (cfg[r.clave] = r.valor));
    const taxRate = Number(cfg.iva ?? 8) / 100;

    const subtotal = itemRows.reduce((acc: number, i: any) => acc + Number(i.subtotal), 0);
    const impuesto = Math.round(subtotal * taxRate);
    const tipAmount = Number(b.tipAmount || 0);
    const discountAmount = Number(b.discountAmount || 0);
    const total = Math.max(0, subtotal + impuesto + tipAmount - discountAmount);
    const amountPaid = Number(b.amountPaid || total);
    const changeDue = Math.max(0, amountPaid - total);

    const idFormaPago = (
      await client.query('SELECT id_forma_pago FROM formas_pago WHERE nombre = $1', [paymentFeToName[b.paymentMethod] || 'Efectivo'])
    ).rows[0].id_forma_pago;

    const customerId = b.customerId ? Number(b.customerId) : order.id_cliente;
    const numeroFactura = `FAC-${String(Date.now()).slice(-6)}`;

    const { rows: facRows } = await client.query(
      `INSERT INTO facturas (numero_factura, id_pedido, id_cliente, id_usuario, subtotal, propina, impuesto, descuento, total, id_forma_pago, monto_pagado, cambio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id_factura`,
      [numeroFactura, idPedido, customerId, order.id_usuario, subtotal, tipAmount, impuesto, discountAmount, total, idFormaPago, amountPaid, changeDue]
    );
    const idFactura = facRows[0].id_factura;

    for (const item of itemRows) {
      await client.query(
        `INSERT INTO detalle_facturas (id_factura, id_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1,$2,$3,$4,$5)`,
        [idFactura, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal]
      );
    }

    await client.query(`UPDATE pedidos SET estado = 'Facturado', total = $1 WHERE id_pedido = $2`, [total, idPedido]);
    if (order.id_mesa) {
      await client.query(`UPDATE mesas SET estado = 'Libre' WHERE id_mesa = $1`, [order.id_mesa]);
    }

    // Caja: registra el ingreso en la sesión abierta (si existe)
    const { rows: sesionRows } = await client.query(`SELECT * FROM caja_sesiones WHERE estado = 'Abierta' ORDER BY id_sesion DESC LIMIT 1 FOR UPDATE`);
    if (sesionRows[0]) {
      const sesion = sesionRows[0];
      const col = b.paymentMethod === 'efectivo' ? 'total_ventas_efectivo'
        : b.paymentMethod === 'tarjeta' ? 'total_ventas_tarjeta'
        : b.paymentMethod === 'transferencia' ? 'total_ventas_transferencia'
        : b.paymentMethod === 'puntos' ? 'total_ventas_puntos' : null;
      const nuevoEsperado = b.paymentMethod === 'efectivo' ? Number(sesion.monto_esperado) + total : Number(sesion.monto_esperado);
      if (col) {
        await client.query(
          `UPDATE caja_sesiones SET monto_esperado=$1, ${col} = ${col} + $2 WHERE id_sesion = $3`,
          [nuevoEsperado, total, sesion.id_sesion]
        );
      }
      await client.query(
        `INSERT INTO caja_movimientos (id_sesion, tipo, concepto, valor, id_forma_pago, id_usuario, id_factura, saldo)
         VALUES ($1,'Ingreso',$2,$3,$4,$5,$6,$7)`,
        [sesion.id_sesion, `Venta ${numeroFactura}`, total, idFormaPago, order.id_usuario, idFactura, nuevoEsperado]
      );
    }

    await client.query('COMMIT');
    res.json(await loadFullInvoice(idFactura));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

api.get('/invoices', ok(async (_req, res) => {
  const { rows } = await q(`${INVOICE_SELECT} ORDER BY f.id_factura DESC LIMIT 100`);
  const result = [];
  for (const r of rows) {
    const { rows: items } = await q(
      `SELECT df.*, pr.nombre AS producto_nombre, true AS preparado FROM detalle_facturas df
       JOIN productos pr ON pr.id_producto = df.id_producto WHERE df.id_factura = $1`,
      [r.id_factura]
    );
    result.push(mapInvoice(r, items));
  }
  res.json(result);
}));

// ---------- cash register ----------

const CASH_SESSION_SELECT = `
  SELECT s.*, eo.nombre AS abierta_por_nombre, ec.nombre AS cerrada_por_nombre,
    (SELECT COALESCE(SUM(valor),0) FROM caja_movimientos WHERE id_sesion = s.id_sesion AND tipo='Ingreso' AND concepto NOT LIKE 'Venta%') AS total_ingresos,
    (SELECT COALESCE(SUM(valor),0) FROM caja_movimientos WHERE id_sesion = s.id_sesion AND tipo='Egreso') AS total_egresos
  FROM caja_sesiones s
  LEFT JOIN usuarios uo ON uo.id_usuario = s.abierta_por
  LEFT JOIN empleados eo ON eo.id_empleado = uo.id_empleado
  LEFT JOIN usuarios uc ON uc.id_usuario = s.cerrada_por
  LEFT JOIN empleados ec ON ec.id_empleado = uc.id_empleado`;

api.get('/cash/current', ok(async (_req, res) => {
  const { rows } = await q(`${CASH_SESSION_SELECT} WHERE s.estado = 'Abierta' ORDER BY s.id_sesion DESC LIMIT 1`);
  const session = rows[0] ? mapCashSession(rows[0]) : null;
  const { rows: movs } = await q(
    `SELECT cm.*, e.nombre AS usuario_nombre FROM caja_movimientos cm
     LEFT JOIN usuarios u ON u.id_usuario = cm.id_usuario
     LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
     WHERE cm.id_sesion = $1 ORDER BY cm.id_movimiento DESC`,
    [rows[0]?.id_sesion || 0]
  );
  res.json({ session, movements: movs.map(mapCashMovement) });
}));

api.post('/cash/open', ok(async (req, res) => {
  const { initialAmount, notes, employeeId } = req.body;
  let idUsuario: number | null = null;
  if (employeeId) {
    const { rows } = await q('SELECT id_usuario FROM usuarios WHERE id_empleado = $1 LIMIT 1', [Number(employeeId)]);
    idUsuario = rows[0]?.id_usuario ?? null;
  }
  const { rows } = await q(
    `INSERT INTO caja_sesiones (monto_inicial, monto_esperado, abierta_por, notas)
     VALUES ($1,$1,$2,$3) RETURNING id_sesion`,
    [initialAmount, idUsuario, notes || null]
  );
  const { rows: full } = await q(`${CASH_SESSION_SELECT} WHERE s.id_sesion = $1`, [rows[0].id_sesion]);
  res.json(mapCashSession(full[0]));
}));

api.post('/cash/close', ok(async (req, res) => {
  const { actualCash, notes, employeeId } = req.body;
  const { rows: cur } = await q(`SELECT * FROM caja_sesiones WHERE estado = 'Abierta' ORDER BY id_sesion DESC LIMIT 1`);
  if (!cur[0]) return res.status(400).json({ error: 'No hay sesión de caja abierta' });
  let idUsuario: number | null = null;
  if (employeeId) {
    const { rows } = await q('SELECT id_usuario FROM usuarios WHERE id_empleado = $1 LIMIT 1', [Number(employeeId)]);
    idUsuario = rows[0]?.id_usuario ?? null;
  }
  const diff = Number(actualCash) - Number(cur[0].monto_esperado);
  await q(
    `UPDATE caja_sesiones SET cerrada_en = now(), cerrada_por = $1, monto_real=$2, diferencia=$3, estado='Cerrada',
       notas = CASE WHEN $4::text IS NOT NULL THEN COALESCE(notas,'') || ' | Cierre: ' || $4 ELSE notas END
     WHERE id_sesion = $5`,
    [idUsuario, actualCash, diff, notes || null, cur[0].id_sesion]
  );
  const { rows: full } = await q(`${CASH_SESSION_SELECT} WHERE s.id_sesion = $1`, [cur[0].id_sesion]);
  res.json(mapCashSession(full[0]));
}));

api.post('/cash/movement', ok(async (req, res) => {
  const { type, amount, reason, employeeId } = req.body; // type: 'ingreso' | 'egreso'
  const { rows: cur } = await q(`SELECT * FROM caja_sesiones WHERE estado = 'Abierta' ORDER BY id_sesion DESC LIMIT 1`);
  if (!cur[0]) return res.status(400).json({ error: 'No hay sesión de caja abierta' });
  let idUsuario: number | null = null;
  if (employeeId) {
    const { rows } = await q('SELECT id_usuario FROM usuarios WHERE id_empleado = $1 LIMIT 1', [Number(employeeId)]);
    idUsuario = rows[0]?.id_usuario ?? null;
  }
  const nuevoEsperado = type === 'ingreso' ? Number(cur[0].monto_esperado) + Number(amount) : Number(cur[0].monto_esperado) - Number(amount);
  await q(`UPDATE caja_sesiones SET monto_esperado = $1 WHERE id_sesion = $2`, [nuevoEsperado, cur[0].id_sesion]);
  await q(
    `INSERT INTO caja_movimientos (id_sesion, tipo, concepto, valor, id_usuario, saldo)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [cur[0].id_sesion, type === 'ingreso' ? 'Ingreso' : 'Egreso', reason, amount, idUsuario, nuevoEsperado]
  );
  const { rows: full } = await q(`${CASH_SESSION_SELECT} WHERE s.id_sesion = $1`, [cur[0].id_sesion]);
  res.json(mapCashSession(full[0]));
}));

// ---------- customers ----------

api.get('/customers', ok(async (_req, res) => {
  const { rows } = await q(`SELECT * FROM clientes WHERE estado = 'Activo' ORDER BY id_cliente DESC`);
  res.json(rows.map(mapCustomer));
}));

api.post('/customers', ok(async (req, res) => {
  const b = req.body;
  const { rows } = await q(
    `INSERT INTO clientes (documento, nombre, celular, correo, direccion) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [b.docNumber || null, b.name, b.phone || null, b.email || null, b.address || null]
  );
  await q(`INSERT INTO fidelizacion (id_cliente, puntos, nivel) VALUES ($1,0,'Bronce') ON CONFLICT DO NOTHING`, [rows[0].id_cliente]);
  res.json(mapCustomer(rows[0]));
}));

api.patch('/customers/:id/points', ok(async (req, res) => {
  const { pointsDelta } = req.body;
  const { rows } = await q(
    `UPDATE clientes SET puntos = GREATEST(0, puntos + $1), total_visitas = total_visitas + 1
     WHERE id_cliente = $2 RETURNING *`,
    [pointsDelta, Number(req.params.id)]
  );
  res.json(mapCustomer(rows[0]));
}));

// ---------- employees ----------

api.get('/employees', ok(async (_req, res) => {
  const { rows } = await q(`SELECT * FROM empleados ORDER BY id_empleado`);
  res.json(rows.map(mapEmployee));
}));

api.post('/employees', ok(async (req, res) => {
  const b = req.body;
  const documento = `EMP-${Date.now()}`;
  const rolDb = roleFeToDb[b.role] || 'Mesero';
  const { rows } = await q(
    `INSERT INTO empleados (documento, nombre, cargo, celular, correo, rol, estado)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [documento, b.name, rolDb, b.phone || null, b.email || null, rolDb, b.active === false ? 'Inactivo' : 'Activo']
  );
  const username = `${(b.name || 'user').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.${rows[0].id_empleado}`;
  await q(
    `INSERT INTO usuarios (usuario, contrasena_hash, rol, id_empleado, estado)
     VALUES ($1,$2,$3,$4,$5)`,
    [username, '$2b$10$2HL7lD7WD4OzqCQDmhUE0eW7/SJh2.BtRtiaE.ag7CLu1aAOdC0Sq', rolDb, rows[0].id_empleado, 'Activo']
  );
  res.json(mapEmployee(rows[0]));
}));

api.patch('/employees/:id', ok(async (req, res) => {
  const b = req.body;
  const { rows } = await q(
    `UPDATE empleados SET
       nombre = COALESCE($1, nombre), rol = COALESCE($2, rol), correo = COALESCE($3, correo),
       celular = COALESCE($4, celular), estado = COALESCE($5, estado)
     WHERE id_empleado = $6 RETURNING *`,
    [b.name, b.role ? roleFeToDb[b.role] : null, b.email, b.phone,
     b.active === undefined ? null : (b.active ? 'Activo' : 'Inactivo'), Number(req.params.id)]
  );
  res.json(mapEmployee(rows[0]));
}));

// ---------- suppliers ----------

api.get('/suppliers', ok(async (_req, res) => {
  const { rows } = await q(`SELECT * FROM proveedores WHERE estado = 'Activo' ORDER BY id_proveedor`);
  res.json(rows.map(mapSupplier));
}));

api.post('/suppliers', ok(async (req, res) => {
  const b = req.body;
  const { rows } = await q(
    `INSERT INTO proveedores (nit, razon_social, contacto, telefono, correo, direccion, categoria)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [b.taxId, b.name, b.contactName || null, b.phone || null, b.email || null, b.address || null, b.category || null]
  );
  res.json(mapSupplier(rows[0]));
}));

// ---------- expenses ----------

api.get('/expenses', ok(async (_req, res) => {
  const { rows } = await q(
    `SELECT g.*, e.nombre AS usuario_nombre, fp.nombre AS forma_pago_nombre FROM gastos g
     LEFT JOIN usuarios u ON u.id_usuario = g.id_usuario
     LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
     LEFT JOIN formas_pago fp ON fp.id_forma_pago = g.id_forma_pago
     ORDER BY g.id_gasto DESC LIMIT 200`
  );
  res.json(rows.map(mapExpense));
}));

api.post('/expenses', ok(async (req, res) => {
  const b = req.body; // { category, description, amount, paymentMethod, employeeId }
  const idFormaPago = (
    await q('SELECT id_forma_pago FROM formas_pago WHERE nombre = $1', [paymentFeToName[b.paymentMethod] || 'Efectivo'])
  ).rows[0]?.id_forma_pago;
  let idUsuario: number | null = null;
  if (b.employeeId) {
    const { rows } = await q('SELECT id_usuario FROM usuarios WHERE id_empleado = $1 LIMIT 1', [Number(b.employeeId)]);
    idUsuario = rows[0]?.id_usuario ?? null;
  }
  const { rows } = await q(
    `INSERT INTO gastos (categoria, concepto, valor, id_forma_pago, id_usuario)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [b.category, b.description, b.amount, idFormaPago, idUsuario]
  );

  if (b.paymentMethod === 'efectivo') {
    const { rows: cur } = await q(`SELECT * FROM caja_sesiones WHERE estado = 'Abierta' ORDER BY id_sesion DESC LIMIT 1`);
    if (cur[0]) {
      const nuevoEsperado = Number(cur[0].monto_esperado) - Number(b.amount);
      await q(`UPDATE caja_sesiones SET monto_esperado = $1 WHERE id_sesion = $2`, [nuevoEsperado, cur[0].id_sesion]);
      await q(
        `INSERT INTO caja_movimientos (id_sesion, tipo, concepto, valor, id_forma_pago, id_usuario, saldo)
         VALUES ($1,'Egreso',$2,$3,$4,$5,$6)`,
        [cur[0].id_sesion, `Gasto: ${b.description}`, b.amount, idFormaPago, idUsuario, nuevoEsperado]
      );
    }
  }

  const { rows: full } = await q(
    `SELECT g.*, e.nombre AS usuario_nombre, fp.nombre AS forma_pago_nombre FROM gastos g
     LEFT JOIN usuarios u ON u.id_usuario = g.id_usuario
     LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
     LEFT JOIN formas_pago fp ON fp.id_forma_pago = g.id_forma_pago
     WHERE g.id_gasto = $1`,
    [rows[0].id_gasto]
  );
  res.json(mapExpense(full[0]));
}));

// ---------- stock movements ----------

const STOCK_MOVEMENT_SELECT = `
  SELECT mi.*, pr.nombre AS producto_nombre, e.nombre AS usuario_nombre FROM movimientos_inventario mi
  JOIN productos pr ON pr.id_producto = mi.id_producto
  LEFT JOIN usuarios u ON u.id_usuario = mi.id_usuario
  LEFT JOIN empleados e ON e.id_empleado = u.id_empleado`;

api.get('/stock-movements', ok(async (_req, res) => {
  const { rows } = await q(`${STOCK_MOVEMENT_SELECT} ORDER BY mi.id_movimiento DESC LIMIT 200`);
  res.json(rows.map(mapStockMovement));
}));

api.post('/stock-movements', ok(async (req, res) => {
  const b = req.body; // { productId, type: entrada|salida|ajuste, quantity, reason, employeeId }
  let idUsuario: number | null = null;
  if (b.employeeId) {
    const { rows } = await q('SELECT id_usuario FROM usuarios WHERE id_empleado = $1 LIMIT 1', [Number(b.employeeId)]);
    idUsuario = rows[0]?.id_usuario ?? null;
  }
  const tipoDb = b.type === 'entrada' ? 'Entrada' : b.type === 'salida' ? 'Salida' : 'Ajuste';
  const cantidadDelta = b.type === 'salida' ? -Math.abs(b.quantity) : (b.type === 'ajuste' ? b.quantity : Math.abs(b.quantity));

  if (b.type === 'ajuste') {
    await q('UPDATE productos SET stock = $1 WHERE id_producto = $2', [b.quantity, Number(b.productId)]);
    await q('UPDATE inventario SET stock_actual = $1, ultima_actualizacion = now() WHERE id_producto = $2', [b.quantity, Number(b.productId)]);
  } else {
    await q('UPDATE productos SET stock = GREATEST(0, stock + $1) WHERE id_producto = $2', [cantidadDelta, Number(b.productId)]);
    await q('UPDATE inventario SET stock_actual = GREATEST(0, stock_actual + $1), ultima_actualizacion = now() WHERE id_producto = $2', [cantidadDelta, Number(b.productId)]);
  }

  const { rows } = await q(
    `INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, observacion, id_usuario)
     VALUES ($1,$2,$3,$4,$5) RETURNING id_movimiento`,
    [Number(b.productId), tipoDb, cantidadDelta, b.reason || null, idUsuario]
  );
  const { rows: full } = await q(`${STOCK_MOVEMENT_SELECT} WHERE mi.id_movimiento = $1`, [rows[0].id_movimiento]);
  res.json(mapStockMovement(full[0]));
}));

// ---------- purchases ----------

api.get('/purchases', ok(async (_req, res) => {
  const { rows } = await q(
    `SELECT c.*, p.razon_social AS proveedor_nombre FROM compras c JOIN proveedores p ON p.id_proveedor = c.id_proveedor
     ORDER BY c.id_compra DESC LIMIT 100`
  );
  const result = [];
  for (const r of rows) {
    const { rows: items } = await q(
      `SELECT dc.*, pr.nombre AS producto_nombre FROM detalle_compras dc
       JOIN productos pr ON pr.id_producto = dc.id_producto WHERE dc.id_compra = $1`,
      [r.id_compra]
    );
    result.push(mapPurchaseOrder(r, items));
  }
  res.json(result);
}));

api.post('/purchases', ok(async (req, res) => {
  const b = req.body; // { supplierId, invoiceNumber, items: [{productId, quantity, unitCost}], notes, employeeId }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const subtotal = b.items.reduce((acc: number, i: any) => acc + i.quantity * i.unitCost, 0);
    let idUsuario: number | null = null;
    if (b.employeeId) {
      const { rows } = await client.query('SELECT id_usuario FROM usuarios WHERE id_empleado = $1 LIMIT 1', [Number(b.employeeId)]);
      idUsuario = rows[0]?.id_usuario ?? null;
    }
    const { rows: compraRows } = await client.query(
      `INSERT INTO compras (factura_proveedor, id_proveedor, subtotal, total, id_usuario, observaciones)
       VALUES ($1,$2,$3,$3,$4,$5) RETURNING id_compra`,
      [b.invoiceNumber || null, Number(b.supplierId), subtotal, idUsuario, b.notes || null]
    );
    const idCompra = compraRows[0].id_compra;
    for (const item of b.items) {
      await client.query(
        `INSERT INTO detalle_compras (id_compra, id_producto, cantidad, costo_unitario, subtotal)
         VALUES ($1,$2,$3,$4,$5)`,
        [idCompra, Number(item.productId), item.quantity, item.unitCost, item.quantity * item.unitCost]
      );
    }
    await client.query('COMMIT');

    const { rows: full } = await client.query(
      `SELECT c.*, p.razon_social AS proveedor_nombre FROM compras c JOIN proveedores p ON p.id_proveedor = c.id_proveedor WHERE c.id_compra = $1`,
      [idCompra]
    );
    const { rows: items } = await client.query(
      `SELECT dc.*, pr.nombre AS producto_nombre FROM detalle_compras dc
       JOIN productos pr ON pr.id_producto = dc.id_producto WHERE dc.id_compra = $1`,
      [idCompra]
    );
    res.json(mapPurchaseOrder(full[0], items));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

// ---------- bootstrap ----------

api.get('/bootstrap', ok(async (_req, res) => {
  const [config, categories, products, tables, customers, employees, suppliers, expenses, stockMovements, purchaseOrders, invoicesRes, cashRes] =
    await Promise.all([
      q('SELECT clave, valor FROM configuracion'),
      q('SELECT * FROM categorias WHERE estado=$1 ORDER BY id_categoria', ['Activo']),
      q('SELECT * FROM productos WHERE estado=$1 ORDER BY id_producto', ['Activo']),
      q(`${TABLE_SELECT} ORDER BY m.zona_orden, m.id_mesa`),
      q(`SELECT * FROM clientes WHERE estado='Activo' ORDER BY id_cliente DESC`),
      q(`SELECT * FROM empleados ORDER BY id_empleado`),
      q(`SELECT * FROM proveedores WHERE estado='Activo' ORDER BY id_proveedor`),
      q(
        `SELECT g.*, e.nombre AS usuario_nombre, fp.nombre AS forma_pago_nombre FROM gastos g
         LEFT JOIN usuarios u ON u.id_usuario = g.id_usuario LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
         LEFT JOIN formas_pago fp ON fp.id_forma_pago = g.id_forma_pago ORDER BY g.id_gasto DESC LIMIT 200`
      ),
      q(`${STOCK_MOVEMENT_SELECT} ORDER BY mi.id_movimiento DESC LIMIT 200`),
      q(
        `SELECT c.*, p.razon_social AS proveedor_nombre FROM compras c JOIN proveedores p ON p.id_proveedor = c.id_proveedor
         ORDER BY c.id_compra DESC LIMIT 100`
      ),
      q(`${INVOICE_SELECT} ORDER BY f.id_factura DESC LIMIT 100`),
      q(`${CASH_SESSION_SELECT} WHERE s.estado = 'Abierta' ORDER BY s.id_sesion DESC LIMIT 1`)
    ]);

  const cfgMap: Record<string, string> = {};
  config.rows.forEach((r: any) => (cfgMap[r.clave] = r.valor));

  const orders = await q(`${ORDER_SELECT} WHERE p.estado NOT IN ('Facturado','Cancelado') ORDER BY p.id_pedido DESC`);
  const ordersFull = [];
  for (const r of orders.rows) {
    ordersFull.push(mapOrder(r, await loadOrderItems(r.id_pedido)));
  }

  const invoicesFull = [];
  for (const r of invoicesRes.rows) {
    const { rows: items } = await q(
      `SELECT df.*, pr.nombre AS producto_nombre, true AS preparado FROM detalle_facturas df
       JOIN productos pr ON pr.id_producto = df.id_producto WHERE df.id_factura = $1`,
      [r.id_factura]
    );
    invoicesFull.push(mapInvoice(r, items));
  }

  const purchaseOrdersFull = [];
  for (const r of purchaseOrders.rows) {
    const { rows: items } = await q(
      `SELECT dc.*, pr.nombre AS producto_nombre FROM detalle_compras dc
       JOIN productos pr ON pr.id_producto = dc.id_producto WHERE dc.id_compra = $1`,
      [r.id_compra]
    );
    purchaseOrdersFull.push(mapPurchaseOrder(r, items));
  }

  let cashMovements: any[] = [];
  if (cashRes.rows[0]) {
    const { rows: movs } = await q(
      `SELECT cm.*, e.nombre AS usuario_nombre FROM caja_movimientos cm
       LEFT JOIN usuarios u ON u.id_usuario = cm.id_usuario LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
       WHERE cm.id_sesion = $1 ORDER BY cm.id_movimiento DESC`,
      [cashRes.rows[0].id_sesion]
    );
    cashMovements = movs.map(mapCashMovement);
  }

  res.json({
    config: {
      businessName: cfgMap.empresa || '',
      taxId: cfgMap.nit || '',
      address: cfgMap.direccion || '',
      phone: cfgMap.telefono || '',
      email: cfgMap.correo || '',
      currencySymbol: cfgMap.moneda_simbolo || '$',
      taxRatePercent: Number(cfgMap.iva || 8),
      defaultTipPercent: Number(cfgMap.propina_por_defecto || 10),
      pointsPerPurchase: cfgMap.puntos_por_compra ? Math.round(1000 / Number(cfgMap.puntos_por_compra)) : 10,
      currencyPointValue: Number(cfgMap.valor_punto || 50),
      receiptFooterText: cfgMap.pie_recibo || ''
    },
    categories: categories.rows.map(mapCategory),
    products: products.rows.map(mapProduct),
    tables: tables.rows.map(mapTable),
    orders: ordersFull,
    customers: customers.rows.map(mapCustomer),
    employees: employees.rows.map(mapEmployee),
    suppliers: suppliers.rows.map(mapSupplier),
    expenses: expenses.rows.map(mapExpense),
    stockMovements: stockMovements.rows.map(mapStockMovement),
    purchaseOrders: purchaseOrdersFull,
    invoices: invoicesFull,
    cashSession: cashRes.rows[0] ? mapCashSession(cashRes.rows[0]) : null,
    cashMovements
  });
}));

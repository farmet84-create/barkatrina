import {
  Category,
  Product,
  Table,
  Customer,
  Employee,
  Supplier,
  Expense,
  SystemConfig,
  CashRegisterSession,
  Order,
  Invoice
} from '../types/pos';

export const initialSystemConfig: SystemConfig = {
  businessName: 'Bar & Restaurante La Terraza',
  taxId: '900.123.456-7',
  address: 'Av. Principal #45-12, Zona Rosa',
  phone: '+57 (300) 987-6543',
  email: 'contacto@laterraza.com',
  currencySymbol: '$',
  taxRatePercent: 8, // Impoconsumo / IVA restaurante
  defaultTipPercent: 10,
  pointsPerPurchase: 10, // 10 puntos por cada $1,000 en ventas
  currencyPointValue: 50, // Cada punto vale $50
  receiptFooterText: '¡Gracias por su preferencia! Síguenos en IG @laterrazabar'
};

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Cócteles & Tragos', icon: 'Wine', description: 'Cócteles de autor, clásicos y destilados' },
  { id: 'cat-2', name: 'Cervezas Artesanales', icon: 'Beer', description: 'Nacionales e importadas de barril y botella' },
  { id: 'cat-3', name: 'Entradas & Tapas', icon: 'UtensilsCrossed', description: 'Para compartir en grupo' },
  { id: 'cat-4', name: 'Platos Fuertes', icon: 'Beef', description: 'Cortes premium, hamburguesas y especialidades' },
  { id: 'cat-5', name: 'Postres', icon: 'Cake', description: 'Delicias dulces para terminar' },
  { id: 'cat-6', name: 'Bebidas Sin Alcohol', icon: 'Coffee', description: 'Sodas saborizadas, jugos y cafés' }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    code: 'COC-001',
    name: 'Mojito Cubano Tradicional',
    categoryId: 'cat-1',
    price: 28000,
    cost: 8500,
    stock: 120,
    minStock: 25,
    unit: 'Copas',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60',
    description: 'Ron blanco, hierbabuena fresca, azúcar de caña, lima y soda.',
    isKitchenItem: false
  },
  {
    id: 'prod-2',
    code: 'COC-002',
    name: 'Margarita Smoked Passion',
    categoryId: 'cat-1',
    price: 32000,
    cost: 10200,
    stock: 85,
    minStock: 20,
    unit: 'Copas',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=60',
    description: 'Tequila reposado, triple sec, maracuyá y sal ahumada de gusano.',
    isKitchenItem: false
  },
  {
    id: 'prod-3',
    code: 'CER-001',
    name: 'Cerveza IPA Artesanal (Draft 500ml)',
    categoryId: 'cat-2',
    price: 18000,
    cost: 6000,
    stock: 200,
    minStock: 40,
    unit: 'Vasos',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=60',
    description: 'Cerveza lupulada intensa con notas cítricas y resinosas.',
    isKitchenItem: false
  },
  {
    id: 'prod-4',
    code: 'ENT-001',
    name: 'Nachos Supremos con Queso & Carne',
    categoryId: 'cat-3',
    price: 34000,
    cost: 12000,
    stock: 45,
    minStock: 10,
    unit: 'Porción',
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60',
    description: 'Totopos crujientes, queso fundido, guacamole, pico de gallo y frijoles.',
    isKitchenItem: true
  },
  {
    id: 'prod-5',
    code: 'ENT-002',
    name: 'Alitas Búfalo & BBQ (12 uds)',
    categoryId: 'cat-3',
    price: 38000,
    cost: 14000,
    stock: 30,
    minStock: 8,
    unit: 'Plato',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60',
    description: 'Acompañadas de bastones de apio, zanahoria y aderezo blue cheese.',
    isKitchenItem: true
  },
  {
    id: 'prod-6',
    code: 'PLA-001',
    name: 'Hamburguesa Angus Trufada',
    categoryId: 'cat-4',
    price: 45000,
    cost: 16500,
    stock: 40,
    minStock: 12,
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
    description: '200g carne Angus, queso gouda ahumado, mayonesa de trufa y papas rústicas.',
    isKitchenItem: true
  },
  {
    id: 'prod-7',
    code: 'PLA-002',
    name: 'Corte Ribeye 350g Madurado',
    categoryId: 'cat-4',
    price: 78000,
    cost: 32000,
    stock: 15,
    minStock: 5,
    unit: 'Plato',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=60',
    description: 'Acompañado de papas a la francesa y vegetales salteados a la mantequilla.',
    isKitchenItem: true
  },
  {
    id: 'prod-8',
    code: 'POS-001',
    name: 'Volcán de Chocolate con Helado',
    categoryId: 'cat-5',
    price: 22000,
    cost: 6500,
    stock: 25,
    minStock: 5,
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60',
    description: 'Bizcocho tibio de cacao con centro fluido y bola de helado de vainilla.',
    isKitchenItem: true
  },
  {
    id: 'prod-9',
    code: 'BEB-001',
    name: 'Limonada de Coco Artesanal',
    categoryId: 'cat-6',
    price: 14000,
    cost: 3500,
    stock: 150,
    minStock: 30,
    unit: 'Vaso',
    image: 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=500&auto=format&fit=crop&q=60',
    description: 'Zumo de limón recién exprimido, crema de coco natural y hielo frappé.',
    isKitchenItem: false
  }
];

export const initialTables: Table[] = [
  { id: 'tbl-1', number: 1, name: 'Mesa 01', zone: 'Salón Principal', capacity: 2, status: 'ocupada', activeOrderId: 'ord-101' },
  { id: 'tbl-2', number: 2, name: 'Mesa 02', zone: 'Salón Principal', capacity: 4, status: 'libre' },
  { id: 'tbl-3', number: 3, name: 'Mesa 03', zone: 'Salón Principal', capacity: 4, status: 'por_pagar', activeOrderId: 'ord-102' },
  { id: 'tbl-4', number: 4, name: 'Mesa 04', zone: 'Salón Principal', capacity: 6, status: 'libre' },
  { id: 'tbl-5', number: 5, name: 'Mesa 05 (Terraza)', zone: 'Terraza', capacity: 4, status: 'ocupada', activeOrderId: 'ord-103' },
  { id: 'tbl-6', number: 6, name: 'Mesa 06 (Terraza)', zone: 'Terraza', capacity: 2, status: 'libre' },
  { id: 'tbl-7', number: 7, name: 'Mesa 07 (Terraza)', zone: 'Terraza', capacity: 8, status: 'reservada' },
  { id: 'tbl-8', number: 8, name: 'Barra 01', zone: 'Barra', capacity: 1, status: 'libre' },
  { id: 'tbl-9', number: 9, name: 'Barra 02', zone: 'Barra', capacity: 1, status: 'libre' },
  { id: 'tbl-10', number: 10, name: 'Mesa VIP 01', zone: 'VIP', capacity: 10, status: 'libre' }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Carlos Mendoza',
    docNumber: '1098765432',
    email: 'carlos.m@example.com',
    phone: '+57 311 456 7890',
    loyaltyPoints: 340,
    totalVisits: 12,
    totalSpent: 680000,
    createdAt: '2026-01-15'
  },
  {
    id: 'cust-2',
    name: 'Sofía Restrepo',
    docNumber: '52345678',
    email: 'sofia.r@example.com',
    phone: '+57 300 123 4567',
    loyaltyPoints: 890,
    totalVisits: 24,
    totalSpent: 1450000,
    createdAt: '2025-11-20'
  },
  {
    id: 'cust-3',
    name: 'Empresa TechCorp S.A.S.',
    docNumber: '901.445.892-1',
    email: 'eventos@techcorp.com',
    phone: '+57 601 234 5678',
    loyaltyPoints: 2150,
    totalVisits: 8,
    totalSpent: 3200000,
    createdAt: '2026-03-01'
  }
];

export const initialEmployees: Employee[] = [
  { id: 'emp-1', name: 'Administrador General', role: 'admin', email: 'admin@laterraza.com', phone: '+57 310 000 0001', active: true },
  { id: 'emp-2', name: 'Laura Gómez (Caja)', role: 'cajero', email: 'laura.g@laterraza.com', phone: '+57 310 000 0002', active: true },
  { id: 'emp-3', name: 'Mateo Morales (Mesero)', role: 'mesero', email: 'mateo.m@laterraza.com', phone: '+57 310 000 0003', active: true },
  { id: 'emp-4', name: 'Chef Antonio (Cocina)', role: 'cocinero', email: 'antonio.c@laterraza.com', phone: '+57 310 000 0004', active: true }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Licores y Destilados del Valle',
    taxId: '800.555.123-4',
    contactName: 'Ricardo Silva',
    phone: '+57 315 888 9900',
    email: 'ventas@licoresdelvalle.com',
    address: 'Zona Industrial Lote 14',
    category: 'Licores'
  },
  {
    id: 'sup-2',
    name: 'Distribuidora Carnes Premium',
    taxId: '800.777.456-1',
    contactName: 'Marta Delgado',
    phone: '+57 318 444 2211',
    email: 'pedidos@carnespremium.com',
    address: 'Plaza Mayor Modulo B',
    category: 'Alimentos'
  }
];

export const initialExpenses: Expense[] = [
  { id: 'exp-1', category: 'Insumos', description: 'Compra urgente de hielos y limones', amount: 45000, date: '2026-08-04', registeredBy: 'Laura Gómez', paymentMethod: 'efectivo' },
  { id: 'exp-2', category: 'Servicios', description: 'Pago parcial de gas propano industrial', amount: 120000, date: '2026-08-03', registeredBy: 'Administrador General', paymentMethod: 'transferencia' }
];

export const initialActiveCashSession: CashRegisterSession = {
  id: 'session-20260804-1',
  openedAt: new Date().toISOString(),
  openedBy: 'Laura Gómez (Caja)',
  initialAmount: 200000,
  expectedCash: 200000 + 138000,
  totalCashSales: 138000,
  totalCardSales: 210000,
  totalTransferSales: 60000,
  totalPointsSales: 0,
  totalExpenses: 45000,
  totalIncomes: 0,
  status: 'abierta',
  notes: 'Apertura de turno tarde sin novedades'
};

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    code: 'PED-101',
    tableId: 'tbl-1',
    tableName: 'Mesa 01',
    waiterId: 'emp-3',
    waiterName: 'Mateo Morales',
    items: [
      { id: 'item-1', productId: 'prod-1', productName: 'Mojito Cubano Tradicional', unitPrice: 28000, quantity: 2, isPrepared: true },
      { id: 'item-2', productId: 'prod-4', productName: 'Nachos Supremos con Queso & Carne', unitPrice: 34000, quantity: 1, notes: 'Sin jalapeños por favor', isPrepared: true }
    ],
    status: 'servido',
    subtotal: 90000,
    taxAmount: 7200,
    tipAmount: 9000,
    discountAmount: 0,
    total: 106200,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    type: 'mesa'
  },
  {
    id: 'ord-102',
    code: 'PED-102',
    tableId: 'tbl-3',
    tableName: 'Mesa 03',
    customerId: 'cust-1',
    customerName: 'Carlos Mendoza',
    waiterId: 'emp-3',
    waiterName: 'Mateo Morales',
    items: [
      { id: 'item-3', productId: 'prod-6', productName: 'Hamburguesa Angus Trufada', unitPrice: 45000, quantity: 2, isPrepared: true },
      { id: 'item-4', productId: 'prod-3', productName: 'Cerveza IPA Artesanal (Draft 500ml)', unitPrice: 18000, quantity: 2, isPrepared: true }
    ],
    status: 'en_cocina',
    subtotal: 126000,
    taxAmount: 10080,
    tipAmount: 12600,
    discountAmount: 0,
    total: 148680,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    type: 'mesa'
  },
  {
    id: 'ord-103',
    code: 'PED-103',
    tableId: 'tbl-5',
    tableName: 'Mesa 05 (Terraza)',
    waiterId: 'emp-3',
    waiterName: 'Mateo Morales',
    items: [
      { id: 'item-5', productId: 'prod-2', productName: 'Margarita Smoked Passion', unitPrice: 32000, quantity: 3, isPrepared: false },
      { id: 'item-6', productId: 'prod-7', productName: 'Corte Ribeye 350g Madurado', unitPrice: 78000, quantity: 1, notes: 'Término medio 3/4', isPrepared: false }
    ],
    status: 'en_cocina',
    subtotal: 174000,
    taxAmount: 13920,
    tipAmount: 17400,
    discountAmount: 0,
    total: 205320,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    type: 'mesa'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1001',
    number: 'FAC-001001',
    orderId: 'ord-099',
    customerId: 'cust-2',
    customerName: 'Sofía Restrepo',
    customerDoc: '52345678',
    waiterName: 'Mateo Morales',
    items: [
      { id: 'i1', productId: 'prod-2', productName: 'Margarita Smoked Passion', unitPrice: 32000, quantity: 2, isPrepared: true },
      { id: 'i2', productId: 'prod-5', productName: 'Alitas Búfalo & BBQ (12 uds)', unitPrice: 38000, quantity: 1, isPrepared: true }
    ],
    subtotal: 102000,
    taxAmount: 8160,
    tipAmount: 10200,
    discountAmount: 0,
    total: 120360,
    paymentMethod: 'tarjeta',
    amountPaid: 120360,
    changeDue: 0,
    cashierId: 'emp-2',
    cashierName: 'Laura Gómez',
    createdAt: '2026-08-04T13:30:00'
  },
  {
    id: 'inv-1002',
    number: 'FAC-001002',
    orderId: 'ord-100',
    customerId: 'cust-1',
    customerName: 'Carlos Mendoza',
    customerDoc: '1098765432',
    waiterName: 'Mateo Morales',
    items: [
      { id: 'i3', productId: 'prod-1', productName: 'Mojito Cubano Tradicional', unitPrice: 28000, quantity: 3, isPrepared: true }
    ],
    subtotal: 84000,
    taxAmount: 6720,
    tipAmount: 8400,
    discountAmount: 0,
    total: 99120,
    paymentMethod: 'efectivo',
    amountPaid: 100000,
    changeDue: 880,
    cashierId: 'emp-2',
    cashierName: 'Laura Gómez',
    createdAt: '2026-08-04T14:15:00'
  }
];

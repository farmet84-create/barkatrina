export type Role = 'admin' | 'cajero' | 'mesero' | 'cocinero';

export interface UserPermissions {
  canManageProducts: boolean;
  canManageInventory: boolean;
  canManageUsers: boolean;
  canOpenCloseCash: boolean;
  canViewReports: boolean;
  canDiscountOrder: boolean;
  canTakeOrder: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  image?: string;
  description?: string;
  isKitchenItem: boolean; // Needs preparation in kitchen
}

export type TableStatus = 'libre' | 'ocupada' | 'por_pagar' | 'reservada';

export interface Table {
  id: string;
  number: number;
  name: string;
  zone: 'Salón Principal' | 'Terraza' | 'Barra' | 'VIP';
  capacity: number;
  status: TableStatus;
  activeOrderId?: string;
}

export type OrderStatus = 'pendiente' | 'en_cocina' | 'servido' | 'facturado' | 'cancelado';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  isPrepared: boolean;
}

export interface Order {
  id: string;
  code: string;
  tableId?: string;
  tableName?: string;
  customerId?: string;
  customerName?: string;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  notes?: string;
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  type: 'mesa' | 'llevar' | 'domicilio';
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto' | 'puntos';

export interface Invoice {
  id: string;
  number: string;
  orderId: string;
  customerId?: string;
  customerName?: string;
  customerDoc?: string;
  waiterName: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  cashierId: string;
  cashierName: string;
  createdAt: string;
}

export interface CashRegisterSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  initialAmount: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalCashSales: number;
  totalCardSales: number;
  totalTransferSales: number;
  totalPointsSales: number;
  totalExpenses: number;
  totalIncomes: number;
  status: 'abierta' | 'cerrada';
  notes?: string;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: 'ingreso' | 'egreso';
  amount: number;
  reason: string;
  user: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  docNumber: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  taxId: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  category: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  items: PurchaseItem[];
  total: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  category: 'Servicios' | 'Nómina' | 'Mantenimiento' | 'Arriendo' | 'Insumos' | 'Otros';
  description: string;
  amount: number;
  date: string;
  registeredBy: string;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  reason: string;
  date: string;
  registeredBy: string;
}

export interface SystemConfig {
  businessName: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  currencySymbol: string;
  taxRatePercent: number; // e.g. 19% or 8%
  defaultTipPercent: number; // e.g. 10%
  pointsPerPurchase: number; // e.g. 1 point per $1,000 spent
  currencyPointValue: number; // e.g. 1 point = $50
  receiptFooterText: string;
}

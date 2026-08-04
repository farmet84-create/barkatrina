import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Table,
  Order,
  OrderItem,
  Invoice,
  CashRegisterSession,
  CashMovement,
  Customer,
  Employee,
  Supplier,
  PurchaseOrder,
  Expense,
  StockMovement,
  SystemConfig,
  Role,
  PaymentMethod
} from '../types/pos';
import {
  initialCategories,
  initialProducts,
  initialTables,
  initialCustomers,
  initialEmployees,
  initialSuppliers,
  initialExpenses,
  initialActiveCashSession,
  initialOrders,
  initialInvoices,
  initialSystemConfig
} from '../data/initialData';

interface POSContextType {
  // Current user / role
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  rolePermissions: Record<Role, any>;

  // System Config
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;

  // Categories & Products
  categories: Category[];
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Tables
  tables: Table[];
  updateTableStatus: (tableId: string, status: Table['status'], activeOrderId?: string) => void;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  createOrder: (tableId?: string, type?: 'mesa' | 'llevar' | 'domicilio', customerId?: string) => Order;
  addItemToOrder: (orderId: string, product: Product, quantity: number, notes?: string) => void;
  removeItemFromOrder: (orderId: string, itemId: string) => void;
  updateOrderItemQuantity: (orderId: string, itemId: string, delta: number) => void;
  updateOrderNotes: (orderId: string, notes: string) => void;
  sendOrderToKitchen: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => void;

  // Kitchen
  toggleItemPrepared: (orderId: string, itemId: string) => void;

  // Cash Register
  cashSession: CashRegisterSession | null;
  cashMovements: CashMovement[];
  openCashSession: (initialAmount: number, notes?: string) => void;
  closeCashSession: (actualCash: number, notes?: string) => void;
  addCashMovement: (type: 'ingreso' | 'egreso', amount: number, reason: string) => void;

  // Invoices & Checkout
  invoices: Invoice[];
  checkoutOrder: (
    orderId: string,
    paymentMethod: PaymentMethod,
    amountPaid: number,
    tipAmount: number,
    discountAmount: number,
    customer?: Customer
  ) => Invoice | null;

  // Customers & Loyalty
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalVisits' | 'totalSpent' | 'createdAt'>) => Customer;
  updateCustomerPoints: (customerId: string, pointsDelta: number) => void;

  // Employees & Staff
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;

  // Inventory, Purchases & Expenses
  suppliers: Supplier[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  addExpense: (expense: Omit<Expense, 'id' | 'date' | 'registeredBy'>) => void;
  addStockMovement: (productId: string, type: 'entrada' | 'salida' | 'ajuste', quantity: number, reason: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'date'>) => void;

  // Search filter query
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (catId: string | null) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('pos_config');
    return saved ? JSON.parse(saved) : initialSystemConfig;
  });

  const [categories] = useState<Category[]>(initialCategories);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('pos_tables');
    return saved ? JSON.parse(saved) : initialTables;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pos_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('pos_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [cashSession, setCashSession] = useState<CashRegisterSession | null>(() => {
    const saved = localStorage.getItem('pos_cash_session');
    return saved ? JSON.parse(saved) : initialActiveCashSession;
  });

  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pos_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('pos_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [currentUser, setCurrentUser] = useState<Employee>(employees[0]);

  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => { localStorage.setItem('pos_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('pos_tables', JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem('pos_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('pos_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('pos_cash_session', JSON.stringify(cashSession)); }, [cashSession]);
  useEffect(() => { localStorage.setItem('pos_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('pos_config', JSON.stringify(config)); }, [config]);

  const rolePermissions = {
    admin: { canManageProducts: true, canManageInventory: true, canManageUsers: true, canOpenCloseCash: true, canViewReports: true, canDiscountOrder: true, canTakeOrder: true },
    cajero: { canManageProducts: false, canManageInventory: true, canManageUsers: false, canOpenCloseCash: true, canViewReports: true, canDiscountOrder: true, canTakeOrder: true },
    mesero: { canManageProducts: false, canManageInventory: false, canManageUsers: false, canOpenCloseCash: false, canViewReports: false, canDiscountOrder: false, canTakeOrder: true },
    cocinero: { canManageProducts: false, canManageInventory: false, canManageUsers: false, canOpenCloseCash: false, canViewReports: false, canDiscountOrder: false, canTakeOrder: false }
  };

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Table status
  const updateTableStatus = (tableId: string, status: Table['status'], activeOrderId?: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status,
          activeOrderId: status === 'libre' ? undefined : (activeOrderId ?? t.activeOrderId)
        };
      }
      return t;
    }));
  };

  // Calculations helper for orders
  const calculateTotals = (items: OrderItem[], discount: number = 0) => {
    const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const taxAmount = Math.round(subtotal * (config.taxRatePercent / 100));
    const tipAmount = Math.round(subtotal * (config.defaultTipPercent / 100));
    const total = Math.max(0, subtotal + taxAmount + tipAmount - discount);
    return { subtotal, taxAmount, tipAmount, total };
  };

  // Order CRUD
  const createOrder = (tableId?: string, type: 'mesa' | 'llevar' | 'domicilio' = 'mesa', customerId?: string) => {
    const table = tables.find(t => t.id === tableId);
    const customer = customers.find(c => c.id === customerId);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: `PED-${Math.floor(100 + Math.random() * 900)}`,
      tableId,
      tableName: table ? table.name : (type === 'llevar' ? 'Para Llevar' : 'Domicilio'),
      customerId,
      customerName: customer?.name,
      waiterId: currentUser.id,
      waiterName: currentUser.name,
      items: [],
      status: 'pendiente',
      subtotal: 0,
      taxAmount: 0,
      tipAmount: 0,
      discountAmount: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      type
    };

    setOrders(prev => [newOrder, ...prev]);

    if (tableId) {
      updateTableStatus(tableId, 'ocupada', newOrder.id);
    }

    setActiveOrder(newOrder);
    return newOrder;
  };

  const addItemToOrder = (orderId: string, product: Product, quantity: number = 1, notes?: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;

      const existingIndex = ord.items.findIndex(i => i.productId === product.id && i.notes === notes);
      let updatedItems: OrderItem[];

      if (existingIndex >= 0) {
        updatedItems = ord.items.map((item, idx) => {
          if (idx === existingIndex) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
      } else {
        const newItem: OrderItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity,
          notes,
          isPrepared: !product.isKitchenItem // Auto prepared if not kitchen item
        };
        updatedItems = [...ord.items, newItem];
      }

      const totals = calculateTotals(updatedItems, ord.discountAmount);
      const updatedOrder: Order = { ...ord, items: updatedItems, ...totals };

      if (activeOrder?.id === orderId) {
        setActiveOrder(updatedOrder);
      }
      return updatedOrder;
    }));
  };

  const removeItemFromOrder = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;

      const updatedItems = ord.items.filter(i => i.id !== itemId);
      const totals = calculateTotals(updatedItems, ord.discountAmount);
      const updatedOrder = { ...ord, items: updatedItems, ...totals };

      if (activeOrder?.id === orderId) {
        setActiveOrder(updatedOrder);
      }
      return updatedOrder;
    }));
  };

  const updateOrderItemQuantity = (orderId: string, itemId: string, delta: number) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;

      const updatedItems = ord.items.map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });

      const totals = calculateTotals(updatedItems, ord.discountAmount);
      const updatedOrder = { ...ord, items: updatedItems, ...totals };

      if (activeOrder?.id === orderId) {
        setActiveOrder(updatedOrder);
      }
      return updatedOrder;
    }));
  };

  const updateOrderNotes = (orderId: string, notes: string) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, notes } : ord));
  };

  const sendOrderToKitchen = (orderId: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const updated = { ...ord, status: 'en_cocina' as Order['status'] };
        if (activeOrder?.id === orderId) setActiveOrder(updated);
        return updated;
      }
      return ord;
    }));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const updated = { ...ord, status };
        if (activeOrder?.id === orderId) setActiveOrder(updated);

        // Update table if order billed or cancelled
        if (ord.tableId && (status === 'facturado' || status === 'cancelado')) {
          updateTableStatus(ord.tableId, 'libre');
        }
        return updated;
      }
      return ord;
    }));
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelado');
  };

  // Kitchen Preparation
  const toggleItemPrepared = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;

      const updatedItems = ord.items.map(item => {
        if (item.id === itemId) {
          return { ...item, isPrepared: !item.isPrepared };
        }
        return item;
      });

      const allPrepared = updatedItems.every(i => i.isPrepared);
      const newStatus = allPrepared ? 'servido' : 'en_cocina';

      return {
        ...ord,
        items: updatedItems,
        status: newStatus
      };
    }));
  };

  // Cash Register
  const openCashSession = (initialAmount: number, notes?: string) => {
    const newSession: CashRegisterSession = {
      id: `session-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy: currentUser.name,
      initialAmount,
      expectedCash: initialAmount,
      totalCashSales: 0,
      totalCardSales: 0,
      totalTransferSales: 0,
      totalPointsSales: 0,
      totalExpenses: 0,
      totalIncomes: 0,
      status: 'abierta',
      notes
    };
    setCashSession(newSession);
  };

  const closeCashSession = (actualCash: number, notes?: string) => {
    if (!cashSession) return;

    const diff = actualCash - cashSession.expectedCash;
    const closedSession: CashRegisterSession = {
      ...cashSession,
      closedAt: new Date().toISOString(),
      closedBy: currentUser.name,
      actualCash,
      cashDifference: diff,
      status: 'cerrada',
      notes: notes ? `${cashSession.notes || ''} | Cierre: ${notes}` : cashSession.notes
    };

    setCashSession(closedSession);
  };

  const addCashMovement = (type: 'ingreso' | 'egreso', amount: number, reason: string) => {
    if (!cashSession) return;

    const movement: CashMovement = {
      id: `mov-${Date.now()}`,
      sessionId: cashSession.id,
      type,
      amount,
      reason,
      user: currentUser.name,
      createdAt: new Date().toISOString()
    };

    setCashMovements(prev => [movement, ...prev]);

    setCashSession(prev => {
      if (!prev) return null;
      const expectedCash = type === 'ingreso' ? prev.expectedCash + amount : prev.expectedCash - amount;
      const totalIncomes = type === 'ingreso' ? prev.totalIncomes + amount : prev.totalIncomes;
      const totalExpenses = type === 'egreso' ? prev.totalExpenses + amount : prev.totalExpenses;

      return {
        ...prev,
        expectedCash,
        totalIncomes,
        totalExpenses
      };
    });
  };

  // Checkout & Invoicing
  const checkoutOrder = (
    orderId: string,
    paymentMethod: PaymentMethod,
    amountPaid: number,
    tipAmount: number,
    discountAmount: number,
    customer?: Customer
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const subtotal = order.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
    const taxAmount = Math.round(subtotal * (config.taxRatePercent / 100));
    const grandTotal = Math.max(0, subtotal + taxAmount + tipAmount - discountAmount);
    const changeDue = Math.max(0, amountPaid - grandTotal);

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: `FAC-${Math.floor(100000 + Math.random() * 900000)}`,
      orderId: order.id,
      customerId: customer?.id,
      customerName: customer?.name || order.customerName || 'Cliente General',
      customerDoc: customer?.docNumber,
      waiterName: order.waiterName,
      items: order.items,
      subtotal,
      taxAmount,
      tipAmount,
      discountAmount,
      total: grandTotal,
      paymentMethod,
      amountPaid,
      changeDue,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      createdAt: new Date().toISOString()
    };

    // Save invoice
    setInvoices(prev => [invoice, ...prev]);

    // Update order status
    updateOrderStatus(orderId, 'facturado');

    // Deduct inventory stock for items
    order.items.forEach(item => {
      setProducts(prevProds => prevProds.map(p => {
        if (p.id === item.productId) {
          const newStock = Math.max(0, p.stock - item.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      }));
    });

    // Update cash register totals
    if (cashSession && cashSession.status === 'abierta') {
      setCashSession(prev => {
        if (!prev) return null;
        let expectedCash = prev.expectedCash;
        let totalCashSales = prev.totalCashSales;
        let totalCardSales = prev.totalCardSales;
        let totalTransferSales = prev.totalTransferSales;
        let totalPointsSales = prev.totalPointsSales;

        if (paymentMethod === 'efectivo') {
          totalCashSales += grandTotal;
          expectedCash += grandTotal;
        } else if (paymentMethod === 'tarjeta') {
          totalCardSales += grandTotal;
        } else if (paymentMethod === 'transferencia') {
          totalTransferSales += grandTotal;
        } else if (paymentMethod === 'puntos') {
          totalPointsSales += grandTotal;
        }

        return {
          ...prev,
          expectedCash,
          totalCashSales,
          totalCardSales,
          totalTransferSales,
          totalPointsSales
        };
      });
    }

    // Award loyalty points to customer if attached
    if (customer) {
      const pointsEarned = Math.floor((grandTotal / 1000) * config.pointsPerPurchase);
      updateCustomerPoints(customer.id, pointsEarned);
    }

    return invoice;
  };

  // Customers & Loyalty
  const addCustomer = (custData: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalVisits' | 'totalSpent' | 'createdAt'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      loyaltyPoints: 0,
      totalVisits: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomerPoints = (customerId: string, pointsDelta: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          loyaltyPoints: Math.max(0, c.loyaltyPoints + pointsDelta),
          totalVisits: c.totalVisits + 1
        };
      }
      return c;
    }));
  };

  // Staff
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...empData, id: `emp-${Date.now()}` };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...empData } : e));
  };

  // Inventory & Purchases
  const addExpense = (expData: Omit<Expense, 'id' | 'date' | 'registeredBy'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      registeredBy: currentUser.name
    };
    setExpenses(prev => [newExp, ...prev]);

    // If paid in cash, add to cash register
    if (expData.paymentMethod === 'efectivo' && cashSession) {
      addCashMovement('egreso', expData.amount, `Gasto: ${expData.description}`);
    }
  };

  const addStockMovement = (productId: string, type: 'entrada' | 'salida' | 'ajuste', quantity: number, reason: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const movement: StockMovement = {
      id: `sm-${Date.now()}`,
      productId,
      productName: prod.name,
      type,
      quantity,
      reason,
      date: new Date().toISOString(),
      registeredBy: currentUser.name
    };

    setStockMovements(prev => [movement, ...prev]);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        let newStock = p.stock;
        if (type === 'entrada') newStock += quantity;
        else if (type === 'salida') newStock = Math.max(0, newStock - quantity);
        else if (type === 'ajuste') newStock = quantity;
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...supplierData, id: `sup-${Date.now()}` };
    setSuppliers(prev => [...prev, newSup]);
  };

  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'date'>) => {
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setPurchaseOrders(prev => [newPO, ...prev]);

    // Update stock for purchased items
    poData.items.forEach(item => {
      addStockMovement(item.productId, 'entrada', item.quantity, `Compra Factura ${poData.invoiceNumber}`);
    });
  };

  return (
    <POSContext.Provider value={{
      currentUser,
      setCurrentUser,
      rolePermissions,
      config,
      updateConfig,
      categories,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      tables,
      updateTableStatus,
      orders,
      activeOrder,
      setActiveOrder,
      createOrder,
      addItemToOrder,
      removeItemFromOrder,
      updateOrderItemQuantity,
      updateOrderNotes,
      sendOrderToKitchen,
      updateOrderStatus,
      cancelOrder,
      toggleItemPrepared,
      cashSession,
      cashMovements,
      openCashSession,
      closeCashSession,
      addCashMovement,
      invoices,
      checkoutOrder,
      customers,
      addCustomer,
      updateCustomerPoints,
      employees,
      addEmployee,
      updateEmployee,
      suppliers,
      expenses,
      stockMovements,
      purchaseOrders,
      addExpense,
      addStockMovement,
      addSupplier,
      addPurchaseOrder,
      searchTerm,
      setSearchTerm,
      selectedCategoryId,
      setSelectedCategoryId
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

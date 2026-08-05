import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Table,
  Order,
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
import { api, getAuthToken, setAuthToken } from '../api/client';
import { LoginScreen } from '../components/LoginScreen';

interface POSContextType {
  // Current user / role
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  logout: () => void;
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
  createOrder: (tableId?: string, type?: 'mesa' | 'llevar' | 'domicilio', customerId?: string) => Promise<Order | null>;
  addItemToOrder: (orderId: string, product: Product, quantity: number, notes?: string) => Promise<void>;
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
  ) => Promise<Invoice | null>;

  // Customers & Loyalty
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalVisits' | 'totalSpent' | 'createdAt'>) => Promise<Customer | null>;
  updateCustomerPoints: (customerId: string, pointsDelta: number) => void;

  // Employees & Staff
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  changeEmployeePassword: (id: string, newPassword: string) => Promise<boolean>;

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

const rolePermissions = {
  admin: { canManageProducts: true, canManageInventory: true, canManageUsers: true, canOpenCloseCash: true, canViewReports: true, canDiscountOrder: true, canTakeOrder: true },
  cajero: { canManageProducts: false, canManageInventory: true, canManageUsers: false, canOpenCloseCash: true, canViewReports: true, canDiscountOrder: true, canTakeOrder: true },
  mesero: { canManageProducts: false, canManageInventory: false, canManageUsers: false, canOpenCloseCash: false, canViewReports: false, canDiscountOrder: false, canTakeOrder: true },
  cocinero: { canManageProducts: false, canManageInventory: false, canManageUsers: false, canOpenCloseCash: false, canViewReports: false, canDiscountOrder: false, canTakeOrder: false }
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cashSession, setCashSession] = useState<CashRegisterSession | null>(null);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = getAuthToken();
      if (!token) {
        setAuthChecked(true);
        return;
      }
      try {
        const me: Employee = await api.get('/auth/me');
        setCurrentUser(me);
        setAuthed(true);
      } catch (err) {
        setAuthToken(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const data = await api.get('/bootstrap');
        setConfig(data.config);
        setCategories(data.categories);
        setProducts(data.products);
        setTables(data.tables);
        setOrders(data.orders);
        setCustomers(data.customers);
        setEmployees(data.employees);
        setSuppliers(data.suppliers);
        setExpenses(data.expenses);
        setStockMovements(data.stockMovements);
        setPurchaseOrders(data.purchaseOrders);
        setInvoices(data.invoices);
        setCashSession(data.cashSession);
        setCashMovements(data.cashMovements);
        setLoaded(true);
      } catch (err: any) {
        console.error('Error loading bootstrap data', err);
        setLoadError(err.message || 'No se pudo conectar con el servidor');
      }
    })();
  }, [authed]);

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    setAuthToken(null);
    window.location.reload();
  };

  const handleLoginSuccess = async () => {
    try {
      const me: Employee = await api.get('/auth/me');
      setCurrentUser(me);
      setAuthed(true);
    } catch (err) {
      console.error('Error fetching current user after login', err);
    }
  };

  const refreshTables = async () => setTables(await api.get('/tables'));
  const refreshProducts = async () => setProducts(await api.get('/products'));
  const refreshCustomers = async () => setCustomers(await api.get('/customers'));
  const refreshCash = async () => {
    const data = await api.get('/cash/current');
    setCashSession(data.session);
    setCashMovements(data.movements);
  };

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig(prev => (prev ? { ...prev, ...newConfig } : prev));
    api.patch('/config', newConfig).catch(err => console.error('Error updating config', err));
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    api.post('/products', prodData)
      .then(created => setProducts(prev => [created, ...prev]))
      .catch(err => console.error('Error creating product', err));
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    api.put(`/products/${id}`, updated).catch(err => console.error('Error updating product', err));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    api.del(`/products/${id}`).catch(err => console.error('Error deleting product', err));
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
    api.patch(`/tables/${tableId}/status`, { status }).catch(err => console.error('Error updating table', err));
  };

  // Orders
  const createOrder = async (tableId?: string, type: 'mesa' | 'llevar' | 'domicilio' = 'mesa', customerId?: string): Promise<Order | null> => {
    try {
      const newOrder: Order = await api.post('/orders', { tableId, type, customerId, waiterEmployeeId: currentUser?.id });
      setOrders(prev => [newOrder, ...prev]);
      if (tableId) {
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'ocupada', activeOrderId: newOrder.id } : t));
      }
      setActiveOrder(newOrder);
      return newOrder;
    } catch (err) {
      console.error('Error creating order', err);
      return null;
    }
  };

  const applyOrderUpdate = (updated: Order) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    setActiveOrder(prev => (prev?.id === updated.id ? updated : prev));
  };

  const addItemToOrder = async (orderId: string, product: Product, quantity: number = 1, notes?: string) => {
    try {
      const updated: Order = await api.post(`/orders/${orderId}/items`, { productId: product.id, quantity, notes });
      applyOrderUpdate(updated);
    } catch (err) {
      console.error('Error adding item to order', err);
    }
  };

  const removeItemFromOrder = (orderId: string, itemId: string) => {
    api.del(`/orders/${orderId}/items/${itemId}`)
      .then(applyOrderUpdate)
      .catch(err => console.error('Error removing item', err));
  };

  const updateOrderItemQuantity = (orderId: string, itemId: string, delta: number) => {
    api.patch(`/orders/${orderId}/items/${itemId}/quantity`, { delta })
      .then(applyOrderUpdate)
      .catch(err => console.error('Error updating item quantity', err));
  };

  const updateOrderNotes = (orderId: string, notes: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, notes } : o));
    api.patch(`/orders/${orderId}/notes`, { notes }).catch(err => console.error('Error updating notes', err));
  };

  const sendOrderToKitchen = (orderId: string) => {
    api.patch(`/orders/${orderId}/send-to-kitchen`)
      .then(applyOrderUpdate)
      .catch(err => console.error('Error sending order to kitchen', err));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    api.patch(`/orders/${orderId}/status`, { status })
      .then(updated => {
        applyOrderUpdate(updated);
        refreshTables().catch(() => {});
      })
      .catch(err => console.error('Error updating order status', err));
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelado');
  };

  const toggleItemPrepared = (orderId: string, itemId: string) => {
    api.patch(`/orders/${orderId}/items/${itemId}/toggle-prepared`)
      .then(applyOrderUpdate)
      .catch(err => console.error('Error toggling item prepared', err));
  };

  // Cash Register
  const openCashSession = (initialAmount: number, notes?: string) => {
    api.post('/cash/open', { initialAmount, notes, employeeId: currentUser?.id })
      .then(session => setCashSession(session))
      .catch(err => console.error('Error opening cash session', err));
  };

  const closeCashSession = (actualCash: number, notes?: string) => {
    api.post('/cash/close', { actualCash, notes, employeeId: currentUser?.id })
      .then(session => setCashSession(session))
      .catch(err => console.error('Error closing cash session', err));
  };

  const addCashMovement = (type: 'ingreso' | 'egreso', amount: number, reason: string) => {
    api.post('/cash/movement', { type, amount, reason, employeeId: currentUser?.id })
      .then(() => refreshCash())
      .catch(err => console.error('Error adding cash movement', err));
  };

  // Checkout & Invoicing
  const checkoutOrder = async (
    orderId: string,
    paymentMethod: PaymentMethod,
    amountPaid: number,
    tipAmount: number,
    discountAmount: number,
    customer?: Customer
  ): Promise<Invoice | null> => {
    try {
      const invoice: Invoice = await api.post('/checkout', {
        orderId, paymentMethod, amountPaid, tipAmount, discountAmount, customerId: customer?.id
      });
      setInvoices(prev => [invoice, ...prev]);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setActiveOrder(prev => (prev?.id === orderId ? null : prev));
      await Promise.all([refreshTables(), refreshProducts(), refreshCash(), refreshCustomers()]);
      return invoice;
    } catch (err) {
      console.error('Error checking out order', err);
      return null;
    }
  };

  // Customers & Loyalty
  const addCustomer = async (custData: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalVisits' | 'totalSpent' | 'createdAt'>): Promise<Customer | null> => {
    try {
      const newCust: Customer = await api.post('/customers', custData);
      setCustomers(prev => [newCust, ...prev]);
      return newCust;
    } catch (err) {
      console.error('Error creating customer', err);
      return null;
    }
  };

  const updateCustomerPoints = (customerId: string, pointsDelta: number) => {
    api.patch(`/customers/${customerId}/points`, { pointsDelta })
      .then(updated => setCustomers(prev => prev.map(c => c.id === customerId ? updated : c)))
      .catch(err => console.error('Error updating customer points', err));
  };

  // Staff
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    api.post('/employees', empData)
      .then(created => setEmployees(prev => [...prev, created]))
      .catch(err => console.error('Error creating employee', err));
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...empData } : e));
    api.patch(`/employees/${id}`, empData).catch(err => console.error('Error updating employee', err));
  };

  const changeEmployeePassword = async (id: string, newPassword: string): Promise<boolean> => {
    try {
      await api.patch(`/employees/${id}/password`, { newPassword });
      return true;
    } catch (err) {
      console.error('Error changing employee password', err);
      return false;
    }
  };

  // Inventory & Purchases
  const addExpense = (expData: Omit<Expense, 'id' | 'date' | 'registeredBy'>) => {
    api.post('/expenses', { ...expData, employeeId: currentUser?.id })
      .then(created => {
        setExpenses(prev => [created, ...prev]);
        if (expData.paymentMethod === 'efectivo') refreshCash().catch(() => {});
      })
      .catch(err => console.error('Error creating expense', err));
  };

  const addStockMovement = (productId: string, type: 'entrada' | 'salida' | 'ajuste', quantity: number, reason: string) => {
    api.post('/stock-movements', { productId, type, quantity, reason, employeeId: currentUser?.id })
      .then(created => {
        setStockMovements(prev => [created, ...prev]);
        refreshProducts().catch(() => {});
      })
      .catch(err => console.error('Error creating stock movement', err));
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    api.post('/suppliers', supplierData)
      .then(created => setSuppliers(prev => [...prev, created]))
      .catch(err => console.error('Error creating supplier', err));
  };

  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'date'>) => {
    api.post('/purchases', { ...poData, employeeId: currentUser?.id })
      .then(created => {
        setPurchaseOrders(prev => [created, ...prev]);
        refreshProducts().catch(() => {});
      })
      .catch(err => console.error('Error creating purchase order', err));
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-neutral-400 tracking-wide">Cargando ERP POS…</p>
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-rose-400">No se pudo cargar el ERP</p>
          <p className="text-sm text-neutral-400">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!loaded || !config || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-neutral-400 tracking-wide">Cargando ERP POS…</p>
      </div>
    );
  }

  return (
    <POSContext.Provider value={{
      currentUser,
      setCurrentUser,
      logout,
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
      changeEmployeePassword,
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

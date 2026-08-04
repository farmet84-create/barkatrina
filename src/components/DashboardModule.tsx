import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  DollarSign,
  ShoppingBag,
  Utensils,
  TrendingUp,
  AlertTriangle,
  Receipt,
  PlusCircle,
  ChefHat,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  setActiveTab: (tab: any) => void;
}

export const DashboardModule: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const {
    invoices,
    tables,
    orders,
    products,
    cashSession,
    config,
    createOrder
  } = usePOS();

  // Metrics
  const totalSalesToday = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalInvoicesCount = invoices.length;
  const averageTicket = totalInvoicesCount > 0 ? Math.round(totalSalesToday / totalInvoicesCount) : 0;

  const occupiedTables = tables.filter(t => t.status === 'ocupada' || t.status === 'por_pagar').length;
  const occupancyRate = Math.round((occupiedTables / tables.length) * 100);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Chart 1 Data: Sales by Category
  const categorySalesMap: Record<string, number> = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const catName = prod ? prod.categoryId : 'Otros';
      categorySalesMap[catName] = (categorySalesMap[catName] || 0) + (item.unitPrice * item.quantity);
    });
  });

  const categoryChartData = [
    { name: 'Cócteles', total: 185000 },
    { name: 'Cervezas', total: 96000 },
    { name: 'Entradas', total: 142000 },
    { name: 'Platos Fuertes', total: 289000 },
    { name: 'Postres', total: 44000 }
  ];

  const COLORS = ['#D4AF37', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

  return (
    <div id="dashboard-module" className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      {/* Top Banner & Quick Actions */}
      <div id="dashboard-header-banner" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-1">Resumen General</span>
          <h2 id="dashboard-title" className="text-xl font-bold text-[#E5E5E5]">
            Panel de Control & Resumen Operativo
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Gestión en tiempo real de ventas, comandas, disponibilidad de mesas y estado de caja.
          </p>
        </div>

        <div id="dashboard-quick-actions" className="flex flex-wrap gap-2.5">
          <button
            id="quick-new-order-btn"
            onClick={() => {
              createOrder(undefined, 'llevar');
              setActiveTab('pos');
            }}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/10 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span>Nuevo Pedido</span>
          </button>

          <button
            id="quick-tables-btn"
            onClick={() => setActiveTab('tables')}
            className="flex items-center gap-2 bg-[#161616] hover:bg-[#202020] text-neutral-200 border border-[#262626] hover:border-[#D4AF37]/40 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-[#D4AF37]" />
            <span>Mapa de Mesas</span>
          </button>

          <button
            id="quick-kitchen-btn"
            onClick={() => setActiveTab('kitchen')}
            className="flex items-center gap-2 bg-[#161616] hover:bg-[#202020] text-neutral-200 border border-[#262626] hover:border-rose-500/40 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
          >
            <ChefHat className="w-4 h-4 text-rose-400" />
            <span>Ver Cocina</span>
          </button>

          <button
            id="quick-cash-btn"
            onClick={() => setActiveTab('cash')}
            className="flex items-center gap-2 bg-[#161616] hover:bg-[#202020] text-neutral-200 border border-[#262626] hover:border-emerald-500/40 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Gestión Caja</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div id="dashboard-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas Hoy */}
        <div id="kpi-sales-today" className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="uppercase tracking-wider text-[11px] font-semibold">Ventas del Día</span>
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#E5E5E5] font-mono tracking-tight">
            ${totalSalesToday.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{totalInvoicesCount} facturas emitidas</span>
          </div>
        </div>

        {/* KPI 2: Ticket Promedio */}
        <div id="kpi-avg-ticket" className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="uppercase tracking-wider text-[11px] font-semibold">Ticket Promedio</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#E5E5E5] font-mono tracking-tight">
            ${averageTicket.toLocaleString('es-CO')}
          </div>
          <p className="text-[11px] text-neutral-400">
            Promedio por mesa/pedido cobrado
          </p>
        </div>

        {/* KPI 3: Ocupación Mesas */}
        <div id="kpi-occupancy" className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="uppercase tracking-wider text-[11px] font-semibold">Ocupación Salón</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#E5E5E5] font-mono tracking-tight">
            {occupancyRate}%
          </div>
          <p className="text-[11px] text-neutral-400">
            {occupiedTables} de {tables.length} mesas ocupadas
          </p>
        </div>

        {/* KPI 4: Estado Caja */}
        <div id="kpi-cash-state" className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="uppercase tracking-wider text-[11px] font-semibold">Saldo en Caja</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#E5E5E5] font-mono tracking-tight">
            ${cashSession ? cashSession.expectedCash.toLocaleString('es-CO') : '0'}
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">
            STATUS: {cashSession?.status === 'abierta' ? 'Caja Abierta' : 'Caja Cerrada'}
          </p>
        </div>
      </div>

      {/* Charts & Table Section */}
      <div id="dashboard-charts-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Category Chart */}
        <div id="chart-sales-category" className="lg:col-span-2 bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
            <div>
              <h3 className="font-bold text-[#E5E5E5] text-sm">Ventas por Categoría de Producto</h3>
              <p className="text-xs text-neutral-400">Distribución de ingresos en la jornada actual</p>
            </div>
            <span className="text-[10px] uppercase tracking-widest bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full font-mono font-bold border border-[#D4AF37]/20">
              HOY
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#525252" fontSize={12} />
                <YAxis stroke="#525252" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#262626', borderRadius: '12px', color: '#E5E5E5' }}
                  formatter={(value: any) => [`$${value.toLocaleString('es-CO')}`, 'Total Ventas']}
                />
                <Bar dataKey="total" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock & Inventory Warning Panel */}
        <div id="panel-low-stock" className="bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 border-b border-[#262626] pb-3.5 text-[#D4AF37] font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <h3>Alertas de Inventario Bajo</h3>
            </div>

            <div className="mt-4 space-y-2.5">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-6 text-center">
                  Todos los insumos se encuentran dentro de los niveles normales de stock.
                </p>
              ) : (
                lowStockProducts.map(prod => (
                  <div key={prod.id} className="bg-[#161616] p-3.5 rounded-xl border border-[#262626] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#E5E5E5]">{prod.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">Mínimo: {prod.minStock} {prod.unit}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-400 text-sm font-mono">{prod.stock}</span>
                      <span className="text-[10px] text-neutral-500 block">{prod.unit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('inventory')}
            className="w-full mt-4 bg-[#161616] hover:bg-[#202020] border border-[#262626] hover:border-[#D4AF37]/30 text-neutral-200 text-xs py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Ir a Gestión de Inventario</span>
            <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div id="dashboard-recent-invoices" className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
          <h3 className="font-bold text-[#E5E5E5] text-sm">Últimas Facturas Emitidas</h3>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs text-[#D4AF37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Reportes Financieros</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-[#0A0A0A] border-b border-[#262626]">
              <tr>
                <th className="py-3 px-4">Nº Factura</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Atendido por</th>
                <th className="py-3 px-4">Forma de Pago</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {invoices.slice(0, 5).map(inv => (
                <tr key={inv.id} className="hover:bg-[#161616] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">{inv.number}</td>
                  <td className="py-3 px-4 text-neutral-200 font-medium">{inv.customerName}</td>
                  <td className="py-3 px-4 text-neutral-400">{inv.waiterName}</td>
                  <td className="py-3 px-4">
                    <span className="capitalize px-2.5 py-1 rounded-full bg-[#161616] border border-[#262626] text-[10px] font-mono text-neutral-300">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#E5E5E5] text-right">
                    ${inv.total.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 px-4 text-center text-neutral-500 font-mono">
                    {new Date(inv.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Printer,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const ReportsModule: React.FC = () => {
  const { invoices, expenses, products } = usePOS();

  const totalSales = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalTax = invoices.reduce((acc, inv) => acc + inv.taxAmount, 0);
  const totalTips = invoices.reduce((acc, inv) => acc + inv.tipAmount, 0);
  const totalExpensesAmount = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Estimate cost of goods sold (COGS)
  let estimatedCOGS = 0;
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        estimatedCOGS += p.cost * item.quantity;
      }
    });
  });

  const netProfit = totalSales - totalTax - totalTips - estimatedCOGS - totalExpensesAmount;

  // Payment method breakdown chart data
  const paymentMethodCounts: Record<string, number> = {};
  invoices.forEach(inv => {
    paymentMethodCounts[inv.paymentMethod] = (paymentMethodCounts[inv.paymentMethod] || 0) + inv.total;
  });

  const pieData = Object.entries(paymentMethodCounts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  }));

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div id="reports-module" className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      {/* Header */}
      <div id="reports-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-[#E5E5E5] flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            <span>Reportes Financieros & Análisis de Rentabilidad</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Cálculo en tiempo real de ingresos, IVA, costo de insumos, gastos y utilidad neta.</p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
        >
          <Printer className="w-4 h-4 text-black" />
          <span>Exportar / Imprimir Reporte</span>
        </button>
      </div>

      {/* Financial Statement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-1 shadow-xl">
          <span className="text-neutral-400 text-xs block font-medium">Ventas Brutas Totales</span>
          <span className="text-2xl font-black font-mono text-[#E5E5E5]">${totalSales.toLocaleString('es-CO')}</span>
          <p className="text-[10px] text-neutral-500">Incluye impoconsumo y propinas</p>
        </div>

        <div className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-1 shadow-xl">
          <span className="text-neutral-400 text-xs block font-medium">Costo de Insumos (COGS)</span>
          <span className="text-2xl font-black font-mono text-[#D4AF37]">${estimatedCOGS.toLocaleString('es-CO')}</span>
          <p className="text-[10px] text-neutral-500">Costo directo de ingredientes vendibles</p>
        </div>

        <div className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-1 shadow-xl">
          <span className="text-neutral-400 text-xs block font-medium">Gastos Operacionales</span>
          <span className="text-2xl font-black font-mono text-rose-400">${totalExpensesAmount.toLocaleString('es-CO')}</span>
          <p className="text-[10px] text-neutral-500">Nómina, servicios y egresos generales</p>
        </div>

        <div className="bg-[#0F0F0F] border border-emerald-500/30 bg-emerald-500/5 p-5 rounded-2xl space-y-1 shadow-xl">
          <span className="text-emerald-400 text-xs font-bold block">Utilidad Neta Estimada</span>
          <span className="text-2xl font-black font-mono text-emerald-400">${netProfit.toLocaleString('es-CO')}</span>
          <p className="text-[10px] text-neutral-400">Margen neto operativo disponible</p>
        </div>
      </div>

      {/* Payment Methods Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-bold text-[#E5E5E5] text-sm flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#D4AF37]" />
            <span>Distribución de Ingresos por Método de Pago</span>
          </h3>

          <div className="h-60 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-neutral-500 text-xs italic">No hay ventas registradas aún.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161616', borderColor: '#262626', borderRadius: '12px', color: '#E5E5E5' }}
                    formatter={(v: any) => [`$${v.toLocaleString('es-CO')}`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tax and Tip Summary */}
        <div className="bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="font-bold text-[#E5E5E5] text-sm border-b border-[#262626] pb-3">
              Desglose de Impuestos & Propinas
            </h3>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="bg-[#161616] p-3.5 rounded-xl border border-[#262626] flex justify-between items-center">
                <span className="text-neutral-400">Impoconsumo / IVA Recaudado:</span>
                <span className="font-bold text-[#E5E5E5] font-mono">${totalTax.toLocaleString('es-CO')}</span>
              </div>

              <div className="bg-[#161616] p-3.5 rounded-xl border border-[#262626] flex justify-between items-center">
                <span className="text-neutral-400">Propinas Recaudadas para Personal:</span>
                <span className="font-bold text-[#D4AF37] font-mono">${totalTips.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 italic bg-[#161616] p-3.5 rounded-xl border border-[#262626]">
            * Nota: Los valores recaudados de propina son distribuidos entre el equipo de meseros y cocina según las políticas del establecimiento.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Table, Order } from '../types/pos';
import {
  Utensils,
  Users,
  Plus,
  Receipt,
  ChefHat,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface TablesModuleProps {
  setActiveTab: (tab: any) => void;
}

export const TablesModule: React.FC<TablesModuleProps> = ({ setActiveTab }) => {
  const {
    tables,
    orders,
    updateTableStatus,
    createOrder,
    setActiveOrder,
    updateOrderStatus
  } = usePOS();

  const [selectedZone, setSelectedZone] = useState<string>('Todas');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const zones = ['Todas', 'Salón Principal', 'Terraza', 'Barra', 'VIP'];

  const filteredTables = selectedZone === 'Todas'
    ? tables
    : tables.filter(t => t.zone === selectedZone);

  // Helper to find order for a table
  const getTableOrder = (table: Table): Order | undefined => {
    if (!table.activeOrderId) return undefined;
    return orders.find(o => o.id === table.activeOrderId);
  };

  const handleOpenPOSForTable = (table: Table) => {
    let order = getTableOrder(table);
    if (!order) {
      order = createOrder(table.id, 'mesa');
    }
    setActiveOrder(order);
    setActiveTab('pos');
  };

  const handleRequestBill = (table: Table) => {
    updateTableStatus(table.id, 'por_pagar');
    setSelectedTable(prev => prev ? { ...prev, status: 'por_pagar' } : null);
  };

  const handleFreeTable = (table: Table) => {
    const order = getTableOrder(table);
    if (order && order.status !== 'facturado') {
      updateOrderStatus(order.id, 'cancelado');
    }
    updateTableStatus(table.id, 'libre');
    setSelectedTable(null);
  };

  return (
    <div id="tables-module" className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      {/* Header & Zone Selector */}
      <div id="tables-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block mb-1">Mapa de Salón</span>
          <h2 id="tables-title" className="text-xl font-bold text-[#E5E5E5] flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#D4AF37]" />
            <span>Mapa de Salón & Control de Mesas</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Visualiza el estado de las mesas en tiempo real, asigna comandas y pasa a cobro en caja.
          </p>
        </div>

        {/* Zone Pills */}
        <div id="zone-filter-container" className="flex flex-wrap gap-1.5 bg-[#161616] p-1.5 rounded-2xl border border-[#262626]">
          {zones.map(zone => (
            <button
              key={zone}
              id={`zone-btn-${zone.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedZone(zone)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedZone === zone
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-neutral-400 hover:text-[#E5E5E5] hover:bg-[#202020]'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Badges */}
      <div id="table-status-legend" className="flex flex-wrap items-center gap-5 text-xs bg-[#0F0F0F] p-3.5 rounded-2xl border border-[#262626] shadow-md">
        <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-[0.15em]">Estados:</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-neutral-300 font-medium">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] inline-block"></span>
          <span className="text-neutral-300 font-medium">Ocupada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <span className="text-neutral-300 font-medium">Por Pagar</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
          <span className="text-neutral-300 font-medium">Reservada</span>
        </div>
      </div>

      {/* Tables Grid Layout */}
      <div id="tables-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTables.map(table => {
          const activeOrd = getTableOrder(table);

          // Status colors
          const statusStyles = {
            libre: 'border-[#262626] bg-[#0F0F0F] hover:border-emerald-500/50 hover:bg-[#161616]',
            ocupada: 'border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/15',
            por_pagar: 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/15',
            reservada: 'border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/15'
          }[table.status];

          const badgeStyles = {
            libre: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
            ocupada: 'bg-[#D4AF37] text-black font-extrabold',
            por_pagar: 'bg-blue-500 text-black font-extrabold animate-pulse',
            reservada: 'bg-purple-950/60 text-purple-300 border-purple-500/30'
          }[table.status];

          return (
            <div
              key={table.id}
              id={`table-card-${table.number}`}
              onClick={() => setSelectedTable(table)}
              className={`border-2 rounded-2xl p-4 transition-all cursor-pointer relative group flex flex-col justify-between h-44 shadow-xl ${statusStyles}`}
            >
              {/* Top Card Info */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">{table.zone}</span>
                  <h3 className="font-bold text-[#E5E5E5] text-base">{table.name}</h3>
                </div>
                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${badgeStyles}`}>
                  {table.status.replace('_', ' ')}
                </span>
              </div>

              {/* Middle Capacity / Order info */}
              <div className="my-auto">
                {activeOrd ? (
                  <div className="space-y-1">
                    <div className="text-lg font-black font-mono text-[#D4AF37]">
                      ${activeOrd.total.toLocaleString('es-CO')}
                    </div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      <span>{activeOrd.items.length} ítems registrados</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                    <Users className="w-4 h-4 text-neutral-500" />
                    <span>Capacidad: {table.capacity} personas</span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs font-bold">
                {table.status === 'libre' ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Abrir Pedido
                  </span>
                ) : (
                  <span className="text-[#D4AF37] flex items-center gap-1">
                    Ver Comanda <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Table Drawer / Detail Modal */}
      {selectedTable && (
        <div id="table-detail-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#262626] pb-4">
              <div>
                <span className="text-xs text-[#D4AF37] font-mono font-bold uppercase tracking-wider">{selectedTable.zone}</span>
                <h3 className="text-xl font-bold text-[#E5E5E5]">{selectedTable.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-neutral-400 hover:text-[#E5E5E5] p-1.5 rounded-full bg-[#161616] border border-[#262626] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Active Order Details */}
            {getTableOrder(selectedTable) ? (
              <div className="space-y-4">
                <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Comanda Nº: <strong className="text-[#D4AF37] font-mono">{getTableOrder(selectedTable)?.code}</strong></span>
                    <span>Atendido por: <strong className="text-neutral-200">{getTableOrder(selectedTable)?.waiterName}</strong></span>
                  </div>

                  {/* Item List */}
                  <div className="divide-y divide-[#262626] max-h-48 overflow-y-auto pt-2">
                    {getTableOrder(selectedTable)?.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-neutral-200">{item.quantity}x {item.productName}</span>
                          {item.notes && <span className="block text-[10px] text-[#D4AF37] italic">Nota: {item.notes}</span>}
                        </div>
                        <span className="font-mono text-neutral-300 font-semibold">${(item.unitPrice * item.quantity).toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotals & Total */}
                  <div className="border-t border-[#262626] pt-2 space-y-1 text-right font-mono">
                    <div className="text-neutral-400 text-[11px]">Subtotal: ${getTableOrder(selectedTable)?.subtotal.toLocaleString('es-CO')}</div>
                    <div className="text-neutral-400 text-[11px]">Impuesto ({usePOS().config.taxRatePercent}%): ${getTableOrder(selectedTable)?.taxAmount.toLocaleString('es-CO')}</div>
                    <div className="text-neutral-400 text-[11px]">Propina Sugerida ({usePOS().config.defaultTipPercent}%): ${getTableOrder(selectedTable)?.tipAmount.toLocaleString('es-CO')}</div>
                    <div className="text-sm font-bold text-[#D4AF37] text-base pt-1">Total: ${getTableOrder(selectedTable)?.total.toLocaleString('es-CO')}</div>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleOpenPOSForTable(selectedTable)}
                    className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Agregar Ítems / Editar</span>
                  </button>

                  <button
                    onClick={() => handleRequestBill(selectedTable)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Marcar Por Pagar</span>
                  </button>
                </div>

                <button
                  onClick={() => handleFreeTable(selectedTable)}
                  className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Liberar Mesa / Cancelar Comanda
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <p className="text-xs text-neutral-400">Esta mesa se encuentra disponible actualmente.</p>
                <button
                  onClick={() => handleOpenPOSForTable(selectedTable)}
                  className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Abrir Nueva Comanda</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

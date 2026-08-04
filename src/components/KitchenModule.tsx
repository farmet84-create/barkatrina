import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  UtensilsCrossed,
  CheckCheck
} from 'lucide-react';

export const KitchenModule: React.FC = () => {
  const { orders, toggleItemPrepared, updateOrderStatus } = usePOS();

  // Filter orders that are in kitchen or pending preparation
  const kitchenOrders = orders.filter(o => o.status === 'en_cocina' || o.status === 'pendiente');

  return (
    <div id="kitchen-module" className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      {/* Header */}
      <div id="kitchen-header" className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Pantalla de Cocina & Barra (KDS)</h2>
            <p className="text-xs text-slate-400">Comandas activas en preparación para cocineros y bartenders.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Comandas Pendientes: <strong className="text-rose-400 font-bold">{kitchenOrders.length}</strong>
          </span>
        </div>
      </div>

      {/* Orders Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-slate-700" />
          <h3 className="text-base font-bold text-slate-300">No hay comandas pendientes en cocina</h3>
          <p className="text-xs max-w-sm mx-auto">
            Todas las órdenes anteriores han sido preparadas y servidas.
          </p>
        </div>
      ) : (
        <div id="kitchen-orders-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchenOrders.map(order => {
            const minutesElapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            const isLate = minutesElapsed > 15;

            return (
              <div
                key={order.id}
                id={`kitchen-card-${order.id}`}
                className={`bg-slate-900 border-2 rounded-2xl p-5 space-y-4 shadow-xl relative flex flex-col justify-between ${
                  isLate ? 'border-rose-500/60 bg-rose-950/10' : 'border-amber-500/40'
                }`}
              >
                {/* Order Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{order.tableName}</span>
                      <h3 className="font-bold text-slate-100 text-lg">{order.code}</h3>
                    </div>

                    <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                      isLate ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-amber-400'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{minutesElapsed} min</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 flex justify-between font-mono">
                    <span>Atendió: {order.waiterName}</span>
                    <span>Hora: {new Date(order.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Item List */}
                  <div className="mt-3 space-y-2 divide-y divide-slate-800/80">
                    {order.items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemPrepared(order.id, item.id)}
                        className={`pt-2 flex items-start justify-between cursor-pointer p-2 rounded-lg transition-colors ${
                          item.isPrepared ? 'bg-emerald-500/10 text-emerald-400 line-through opacity-60' : 'hover:bg-slate-800/60 text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm">
                            {item.quantity}x {item.productName}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-amber-400 font-semibold italic bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
                              Nota: {item.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {item.isPrepared ? (
                            <CheckCheck className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-amber-400"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mark All Ready Button */}
                <button
                  onClick={() => updateOrderStatus(order.id, 'servido')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Comanda Servida / Finalizar</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

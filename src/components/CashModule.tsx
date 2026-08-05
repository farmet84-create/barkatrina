import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { api } from '../api/client';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  CreditCard,
  Smartphone,
  Lock,
  Unlock,
  AlertTriangle,
  History,
  PlusCircle,
  UserCheck
} from 'lucide-react';

interface WaiterCashSummary {
  employeeId: string | null;
  employeeName: string;
  efectivo: number;
  tarjeta: number;
  transferencia: number;
  puntos: number;
  mixto: number;
  total: number;
}

export const CashModule: React.FC = () => {
  const {
    cashSession,
    cashMovements,
    openCashSession,
    closeCashSession,
    addCashMovement,
    currentUser,
    invoices
  } = usePOS();

  const [openAmount, setOpenAmount] = useState<number>(200000);
  const [actualCashInput, setActualCashInput] = useState<number>(
    cashSession ? cashSession.expectedCash : 0
  );
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

  const findInvoiceForMovement = (reason: string) => {
    const match = reason.match(/^Venta (.+)$/);
    if (!match) return null;
    return invoices.find(inv => inv.number === match[1]) || null;
  };

  const [waiterSummaries, setWaiterSummaries] = useState<WaiterCashSummary[]>([]);
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>('');

  useEffect(() => {
    if (cashSession?.status !== 'abierta') return;
    api.get('/cash/current/by-waiter')
      .then((data: WaiterCashSummary[]) => {
        setWaiterSummaries(data);
        if (data.length > 0) setSelectedWaiterId(prev => prev || (data[0].employeeId ?? 'sin-mesero'));
      })
      .catch(err => console.error('Error loading cash by waiter', err));
  }, [cashSession?.status, cashMovements.length]);

  const selectedWaiter = waiterSummaries.find(w => (w.employeeId ?? 'sin-mesero') === selectedWaiterId);

  const [movType, setMovType] = useState<'ingreso' | 'egreso'>('ingreso');
  const [movAmount, setMovAmount] = useState<number>(0);
  const [movReason, setMovReason] = useState<string>('');

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (movAmount <= 0 || !movReason) return;
    addCashMovement(movType, movAmount, movReason);
    setShowMovementModal(false);
    setMovAmount(0);
    setMovReason('');
  };

  const handleCloseCash = () => {
    closeCashSession(actualCashInput);
    setShowCloseModal(false);
  };

  return (
    <div id="cash-module" className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      {/* Header */}
      <div id="cash-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Control de Caja, Arqueo & Flujo de Efectivo</h2>
            <p className="text-xs text-slate-400">Apertura, cierres de turno, arqueo físico y registro de egresos/ingresos.</p>
          </div>
        </div>

        {cashSession?.status === 'abierta' ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowMovementModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Registrar Ingreso / Egreso</span>
            </button>

            <button
              onClick={() => {
                setActualCashInput(cashSession.expectedCash);
                setShowCloseModal(true);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Lock className="w-4 h-4" />
              <span>Cerrar Turno de Caja</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => openCashSession(openAmount)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Unlock className="w-4 h-4" />
            <span>Abrir Nueva Caja</span>
          </button>
        )}
      </div>

      {/* Main Cash Cards Grid */}
      {cashSession?.status === 'abierta' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Initial Amount */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 text-xs block">Fondo Inicial Base</span>
              <span className="text-2xl font-black font-mono text-slate-100">
                ${cashSession.initialAmount.toLocaleString('es-CO')}
              </span>
              <p className="text-[10px] text-slate-500">Apertura: {cashSession.openedBy}</p>
            </div>

            {/* Cash Sales */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 text-xs block">Ventas en Efectivo</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                +${cashSession.totalCashSales.toLocaleString('es-CO')}
              </span>
              <p className="text-[10px] text-slate-500">Recibido físicamente en caja</p>
            </div>

            {/* Card & Digital Sales */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-slate-400 text-xs block">Tarjeta & Transferencias</span>
              <span className="text-2xl font-black font-mono text-blue-400">
                ${(cashSession.totalCardSales + cashSession.totalTransferSales).toLocaleString('es-CO')}
              </span>
              <p className="text-[10px] text-slate-500">Cobro digital en datáfono/banco</p>
            </div>

            {/* Expected Cash in Drawer */}
            <div className="bg-slate-900 border border-amber-500/40 bg-amber-500/5 p-4 rounded-xl space-y-1">
              <span className="text-amber-400 text-xs font-semibold block">Efectivo Esperado en Cajón</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                ${cashSession.expectedCash.toLocaleString('es-CO')}
              </span>
              <p className="text-[10px] text-slate-400">Base + Ventas Efectivo + Ingresos - Egresos</p>
            </div>
          </div>

          {/* Sales by Waiter */}
          {waiterSummaries.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Ventas por Mesero (Turno Actual)</span>
                </h3>
                <select
                  value={selectedWaiterId}
                  onChange={(e) => setSelectedWaiterId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none"
                >
                  {waiterSummaries.map(w => (
                    <option key={w.employeeId ?? 'sin-mesero'} value={w.employeeId ?? 'sin-mesero'}>
                      {w.employeeName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedWaiter && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl space-y-1">
                    <span className="text-slate-400 text-xs block">Efectivo</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      ${selectedWaiter.efectivo.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-blue-500/30 p-4 rounded-xl space-y-1">
                    <span className="text-slate-400 text-xs block">Transferencias</span>
                    <span className="text-xl font-black font-mono text-blue-400">
                      ${selectedWaiter.transferencia.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                    <span className="text-slate-400 text-xs block">Tarjeta / Otros</span>
                    <span className="text-xl font-black font-mono text-slate-300">
                      ${(selectedWaiter.tarjeta + selectedWaiter.puntos + selectedWaiter.mixto).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-xl space-y-1">
                    <span className="text-amber-400 text-xs font-semibold block">Total Vendido</span>
                    <span className="text-xl font-black font-mono text-amber-400">
                      ${selectedWaiter.total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cash Movement Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Movimientos Directos de Caja (Ingresos / Egresos)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] font-bold text-slate-500 uppercase bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Concepto / Motivo</th>
                    <th className="py-2.5 px-3">Registrado Por</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                    <th className="py-2.5 px-3 text-center">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cashMovements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 italic">
                        No hay movimientos manuales registrados en la sesión actual.
                      </td>
                    </tr>
                  ) : (
                    cashMovements.map(mov => {
                      const relatedInvoice = findInvoiceForMovement(mov.reason);
                      return (
                        <tr
                          key={mov.id}
                          onClick={() => relatedInvoice && setViewInvoiceId(relatedInvoice.id)}
                          className={relatedInvoice ? 'cursor-pointer hover:bg-slate-800/60' : ''}
                        >
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              mov.type === 'ingreso' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                              {mov.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-200">
                            {mov.reason}
                            {relatedInvoice && <span className="ml-2 text-[10px] text-amber-400 underline">Ver factura</span>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{mov.user}</td>
                          <td className={`py-2.5 px-3 text-right font-mono font-bold ${mov.type === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {mov.type === 'ingreso' ? '+' : '-'}${mov.amount.toLocaleString('es-CO')}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                            {new Date(mov.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Cash Closed view */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">La Caja se encuentra Cerrada</h3>
          <p className="text-xs text-slate-400">Ingresa el monto de fondo base inicial para aperturar el turno.</p>

          <div className="text-left space-y-1">
            <label className="text-xs text-slate-400 font-semibold">Monto Base Inicial ($)</label>
            <input
              type="number"
              value={openAmount}
              onChange={(e) => setOpenAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-lg font-bold text-emerald-400"
            />
          </div>

          <button
            onClick={() => openCashSession(openAmount)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            Aperturar Turno de Caja
          </button>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddMovement} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Registrar Movimiento de Caja</h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovType('ingreso')}
                className={`p-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  movType === 'ingreso' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                + Ingreso Extra
              </button>
              <button
                type="button"
                onClick={() => setMovType('egreso')}
                className={`p-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  movType === 'egreso' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                - Egreso / Salida
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Monto ($)</label>
              <input
                type="number"
                value={movAmount}
                onChange={(e) => setMovAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-100 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Concepto / Motivo</label>
              <input
                type="text"
                placeholder="Ej: Pago de hielo, cambio sencillo..."
                value={movReason}
                onChange={(e) => setMovReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-100 text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 text-xs rounded-xl font-bold">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Close Cash Modal (Arqueo) */}
      {showCloseModal && cashSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <span>Arqueo & Cierre de Caja</span>
            </h3>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400"><span>Efectivo Esperado:</span><span>${cashSession.expectedCash.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between text-slate-400"><span>Ventas Tarjetas:</span><span>${cashSession.totalCardSales.toLocaleString('es-CO')}</span></div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Efectivo Contado Físicamente en Cajón ($)
              </label>
              <input
                type="number"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xl font-black text-amber-400"
              />
            </div>

            {/* Difference / Descuadre */}
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between font-mono font-bold ${
              actualCashInput - cashSession.expectedCash === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <span>Diferencia / Arqueo:</span>
              <span>${(actualCashInput - cashSession.expectedCash).toLocaleString('es-CO')}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCloseModal(false)}
                className="w-1/2 py-2.5 bg-slate-800 text-slate-300 text-xs rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseCash}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-xl font-bold"
              >
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {viewInvoiceId && (() => {
        const inv = invoices.find(i => i.id === viewInvoiceId);
        return inv ? <InvoiceReceiptModal invoice={inv} onClose={() => setViewInvoiceId(null)} /> : null;
      })()}
    </div>
  );
};

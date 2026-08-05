import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Order, Customer, PaymentMethod, Invoice } from '../types/pos';
import {
  Receipt,
  CreditCard,
  DollarSign,
  Smartphone,
  Gift,
  Printer,
  CheckCircle2,
  X,
  User,
  Plus
} from 'lucide-react';

interface BillingModalProps {
  order: Order;
  onClose: () => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({ order, onClose }) => {
  const {
    customers,
    addCustomer,
    checkoutOrder,
    config,
    cashSession
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(
    customers.find(c => c.id === order.customerId)
  );
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustDoc, setNewCustDoc] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const [customTip, setCustomTip] = useState<number>(order.tipAmount);
  const [customDiscount, setCustomDiscount] = useState<number>(order.discountAmount);

  const subtotal = order.subtotal;
  const taxAmount = Math.round(subtotal * (config.taxRatePercent / 100));
  const grandTotal = Math.max(0, subtotal + taxAmount + customTip - customDiscount);

  const [amountPaid, setAmountPaid] = useState<number>(grandTotal);
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  const changeDue = Math.max(0, amountPaid - grandTotal);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;
    const created = await addCustomer({
      name: newCustName,
      docNumber: newCustDoc || '12345678',
      email: '',
      phone: newCustPhone
    });
    if (created) setSelectedCustomer(created);
    setShowAddCustomer(false);
  };

  const handleConfirmCheckout = async () => {
    const inv = await checkoutOrder(
      order.id,
      paymentMethod,
      amountPaid,
      customTip,
      customDiscount,
      selectedCustomer
    );
    if (inv) {
      setCompletedInvoice(inv);
    }
  };

  return (
    <div id="billing-modal" className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#E5E5E5]">Facturación & Procesamiento de Pago</h3>
              <p className="text-xs text-neutral-400">Comanda <span className="font-mono text-[#D4AF37] font-bold">{order.code}</span> • Mesa {order.tableName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-[#E5E5E5] p-1.5 rounded-full bg-[#161616] border border-[#262626] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Invoice completed -> Show Receipt Print View */}
        {completedInvoice ? (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-[#E5E5E5]">¡Pago Registrado Exitosamente!</h4>
              <p className="text-xs text-neutral-400 mt-1">Factura Electrónica <strong className="text-[#D4AF37] font-mono">{completedInvoice.number}</strong></p>
            </div>

            {/* Ticket Thermal View Simulation */}
            <div id="printable-receipt" className="bg-white text-slate-900 p-6 rounded-xl font-mono text-left text-xs max-w-sm mx-auto shadow-xl space-y-3">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h2 className="font-bold text-sm uppercase">{config.businessName}</h2>
                <p className="text-[10px]">{config.address}</p>
                <p className="text-[10px]">NIT: {config.taxId} • Tel: {config.phone}</p>
                <p className="text-[10px] font-bold mt-1">FACTURA DE VENTA: {completedInvoice.number}</p>
                <p className="text-[10px] text-slate-600">{new Date(completedInvoice.createdAt).toLocaleString('es-CO')}</p>
              </div>

              <div className="text-[11px] space-y-0.5">
                <p>Cliente: <strong>{completedInvoice.customerName}</strong></p>
                <p>Cajero: {completedInvoice.cashierName}</p>
                <p>Atendió: {completedInvoice.waiterName}</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
                {completedInvoice.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span>{i.quantity}x {i.productName}</span>
                    <span>${(i.unitPrice * i.quantity).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right text-[11px]">
                <div className="flex justify-between"><span>Subtotal:</span><span>${completedInvoice.subtotal.toLocaleString('es-CO')}</span></div>
                <div className="flex justify-between"><span>IVA ({config.taxRatePercent}%):</span><span>${completedInvoice.taxAmount.toLocaleString('es-CO')}</span></div>
                <div className="flex justify-between"><span>Propina:</span><span>${completedInvoice.tipAmount.toLocaleString('es-CO')}</span></div>
                {completedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600"><span>Descuento:</span><span>-${completedInvoice.discountAmount.toLocaleString('es-CO')}</span></div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-1"><span>TOTAL:</span><span>${completedInvoice.total.toLocaleString('es-CO')}</span></div>
                <div className="flex justify-between text-[10px] text-slate-600"><span>Pagado ({completedInvoice.paymentMethod}):</span><span>${completedInvoice.amountPaid.toLocaleString('es-CO')}</span></div>
                <div className="flex justify-between text-[10px] text-slate-600"><span>Cambio/Devuelta:</span><span>${completedInvoice.changeDue.toLocaleString('es-CO')}</span></div>
              </div>

              <div className="text-center text-[9px] text-slate-500 border-t border-dashed border-slate-300 pt-3">
                {config.receiptFooterText}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="bg-[#161616] hover:bg-[#202020] text-[#E5E5E5] px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border border-[#262626]"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={onClose}
                className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black px-6 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Cerrar & Volver
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="space-y-5">
            {/* Customer Picker */}
            <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  <span>Cliente para Puntos & Facturación</span>
                </span>
                <button
                  onClick={() => setShowAddCustomer(!showAddCustomer)}
                  className="text-[#D4AF37] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Cliente</span>
                </button>
              </div>

              {showAddCustomer ? (
                <form onSubmit={handleCreateCustomer} className="grid grid-cols-3 gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Nombre Cliente"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="bg-[#0F0F0F] border border-[#262626] p-2 rounded-lg text-xs text-[#E5E5E5]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nº Documento / NIT"
                    value={newCustDoc}
                    onChange={(e) => setNewCustDoc(e.target.value)}
                    className="bg-[#0F0F0F] border border-[#262626] p-2 rounded-lg text-xs text-[#E5E5E5]"
                  />
                  <button type="submit" className="bg-[#D4AF37] text-black font-extrabold p-2 rounded-lg text-xs">
                    Guardar
                  </button>
                </form>
              ) : (
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value))}
                  className="w-full bg-[#0F0F0F] border border-[#262626] text-neutral-200 p-2.5 rounded-xl text-xs focus:outline-none"
                >
                  <option value="">-- Cliente General / Ocasional --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.docNumber}) - Puntos: {c.loyaltyPoints}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Payment Method Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">Selecciona Forma de Pago</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'efectivo', label: 'Efectivo', icon: DollarSign, color: 'text-emerald-400' },
                  { id: 'tarjeta', label: 'Tarjeta (POS)', icon: CreditCard, color: 'text-blue-400' },
                  { id: 'transferencia', label: 'Transferencia', icon: Smartphone, color: 'text-purple-400' },
                  { id: 'puntos', label: 'Puntos Fidelidad', icon: Gift, color: 'text-[#D4AF37]' }
                ].map(pm => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#E5E5E5]'
                          : 'bg-[#161616] border-[#262626] text-neutral-400 hover:bg-[#202020]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${pm.color}`} />
                      <span className="text-xs font-bold">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tip & Discount Inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 font-semibold block mb-1">Propina Voluntaria ($)</label>
                <input
                  type="number"
                  value={customTip}
                  onChange={(e) => setCustomTip(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-semibold block mb-1">Descuento Especial ($)</label>
                <input
                  type="number"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                />
              </div>
            </div>

            {/* Cash Calculation */}
            {paymentMethod === 'efectivo' && (
              <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-neutral-400 font-semibold block mb-1">Monto Recibido ($)</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full bg-[#0F0F0F] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono text-base font-bold text-emerald-400"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-neutral-400 font-semibold text-[11px]">Cambio / Devuelta:</span>
                  <span className="text-xl font-black font-mono text-[#D4AF37]">${changeDue.toLocaleString('es-CO')}</span>
                </div>
              </div>
            )}

            {/* Grand Total Summary */}
            <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] space-y-1 font-mono text-xs">
              <div className="flex justify-between text-neutral-400"><span>Subtotal:</span><span>${subtotal.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between text-neutral-400"><span>Impuestos ({config.taxRatePercent}%):</span><span>${taxAmount.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between text-neutral-400"><span>Propina:</span><span>${customTip.toLocaleString('es-CO')}</span></div>
              {customDiscount > 0 && <div className="flex justify-between text-rose-400"><span>Descuento:</span><span>-${customDiscount.toLocaleString('es-CO')}</span></div>}
              <div className="flex justify-between text-base font-black text-[#D4AF37] border-t border-[#262626] pt-2">
                <span>TOTAL A COBRAR:</span>
                <span>${grandTotal.toLocaleString('es-CO')}</span>
              </div>
            </div>

            {/* Confirm Payment Action */}
            <button
              id="confirm-checkout-btn"
              onClick={handleConfirmCheckout}
              className="w-full bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span>Confirmar Cobro y Generar Factura</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

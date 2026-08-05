import React from 'react';
import { usePOS } from '../context/POSContext';
import { Invoice } from '../types/pos';
import { X, Printer } from 'lucide-react';

interface InvoiceReceiptModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({ invoice, onClose }) => {
  const { config } = usePOS();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#E5E5E5]">Factura {invoice.number}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-[#E5E5E5] p-1.5 rounded-full bg-[#161616] border border-[#262626] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div id="printable-receipt" className="bg-white text-slate-900 p-6 rounded-xl font-mono text-left text-xs space-y-3">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-bold text-sm uppercase">{config.businessName}</h2>
            <p className="text-[10px]">{config.address}</p>
            <p className="text-[10px]">NIT: {config.taxId} • Tel: {config.phone}</p>
            <p className="text-[10px] font-bold mt-1">FACTURA DE VENTA: {invoice.number}</p>
            <p className="text-[10px] text-slate-600">{new Date(invoice.createdAt).toLocaleString('es-CO')}</p>
          </div>

          <div className="text-[11px] space-y-0.5">
            <p>Cliente: <strong>{invoice.customerName}</strong></p>
            <p>Cajero: {invoice.cashierName}</p>
            {invoice.waiterName && <p>Atendió: {invoice.waiterName}</p>}
          </div>

          <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
            {invoice.items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span>{i.quantity}x {i.productName}</span>
                <span>${(i.unitPrice * i.quantity).toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-right text-[11px]">
            <div className="flex justify-between"><span>Subtotal:</span><span>${invoice.subtotal.toLocaleString('es-CO')}</span></div>
            <div className="flex justify-between"><span>IVA ({config.taxRatePercent}%):</span><span>${invoice.taxAmount.toLocaleString('es-CO')}</span></div>
            <div className="flex justify-between"><span>Propina:</span><span>${invoice.tipAmount.toLocaleString('es-CO')}</span></div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600"><span>Descuento:</span><span>-${invoice.discountAmount.toLocaleString('es-CO')}</span></div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-1"><span>TOTAL:</span><span>${invoice.total.toLocaleString('es-CO')}</span></div>
            <div className="flex justify-between text-[10px] text-slate-600"><span>Pagado ({invoice.paymentMethod}):</span><span>${invoice.amountPaid.toLocaleString('es-CO')}</span></div>
            <div className="flex justify-between text-[10px] text-slate-600"><span>Cambio/Devuelta:</span><span>${invoice.changeDue.toLocaleString('es-CO')}</span></div>
          </div>

          <div className="text-center text-[9px] text-slate-500 border-t border-dashed border-slate-300 pt-3">
            {config.receiptFooterText}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
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
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

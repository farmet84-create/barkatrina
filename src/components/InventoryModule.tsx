import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Package,
  Truck,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  FileText
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const {
    products,
    suppliers,
    expenses,
    stockMovements,
    addStockMovement,
    addSupplier,
    addExpense
  } = usePOS();

  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'movements' | 'suppliers' | 'expenses'>('stock');

  // Modals
  const [showStockModal, setShowStockModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Stock Movement Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [movementType, setMovementType] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
  const [movementQty, setMovementQty] = useState<number>(10);
  const [movementReason, setMovementReason] = useState<string>('');

  // Expense Form State
  const [expCategory, setExpCategory] = useState<'Servicios' | 'Nómina' | 'Mantenimiento' | 'Arriendo' | 'Insumos' | 'Otros'>('Insumos');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expPayMethod, setExpPayMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');

  // Supplier Form State
  const [supName, setSupName] = useState('');
  const [supTaxId, setSupTaxId] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supCategory, setSupCategory] = useState('Licores & Bebidas');

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || movementQty <= 0) return;
    addStockMovement(selectedProductId, movementType, movementQty, movementReason || 'Ajuste manual de inventario');
    setShowStockModal(false);
    setMovementReason('');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0 || !expDesc) return;
    addExpense({
      category: expCategory,
      description: expDesc,
      amount: expAmount,
      paymentMethod: expPayMethod
    });
    setShowExpenseModal(false);
    setExpDesc('');
    setExpAmount(0);
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;
    addSupplier({
      name: supName,
      taxId: supTaxId,
      contactName: supContact,
      phone: supPhone,
      email: supEmail,
      address: 'Sede Principal',
      category: supCategory
    });
    setShowSupplierModal(false);
    setSupName('');
  };

  return (
    <div id="inventory-module" className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      {/* Header & Sub-Tabs */}
      <div id="inventory-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-[#E5E5E5] flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            <span>Inventario, Compras, Proveedores & Gastos</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Control de insumos, rotación de stock y egresos operacionales del establecimiento.</p>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-1 bg-[#161616] p-1.5 rounded-xl border border-[#262626] text-xs">
          {[
            { id: 'stock', label: 'Stock Insumos' },
            { id: 'movements', label: 'Kardex Movimientos' },
            { id: 'suppliers', label: 'Proveedores' },
            { id: 'expenses', label: 'Gastos Operativos' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-neutral-400 hover:text-[#E5E5E5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SubTab 1: Stock View */}
      {activeSubTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowStockModal(true)}
              className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Registrar Movimiento de Stock</span>
            </button>
          </div>

          <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="text-[11px] font-bold text-neutral-400 uppercase bg-[#161616] border-b border-[#262626]">
                <tr>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Insumo / Producto</th>
                  <th className="py-3.5 px-4 text-center">Unidad</th>
                  <th className="py-3.5 px-4 text-center">Stock Mínimo</th>
                  <th className="py-3.5 px-4 text-center">Stock Actual</th>
                  <th className="py-3.5 px-4 text-right">Valoración Insumo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {products.map(p => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-[#161616]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37]">{p.code}</td>
                      <td className="py-3.5 px-4 font-bold text-[#E5E5E5]">{p.name}</td>
                      <td className="py-3.5 px-4 text-center text-neutral-400">{p.unit}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-neutral-400">{p.minStock}</td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isLow ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-neutral-200">
                        ${(p.stock * p.cost).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Kardex Movements */}
      {activeSubTab === 'movements' && (
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="text-[11px] font-bold text-neutral-400 uppercase bg-[#161616] border-b border-[#262626]">
              <tr>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Motivo / Factura</th>
                <th className="py-3.5 px-4">Registrado Por</th>
                <th className="py-3.5 px-4 text-center">Cantidad</th>
                <th className="py-3.5 px-4 text-center">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {stockMovements.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-neutral-500 italic">No hay historial de movimientos grabado.</td></tr>
              ) : (
                stockMovements.map(m => (
                  <tr key={m.id} className="hover:bg-[#161616]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        m.type === 'entrada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#E5E5E5]">{m.productName}</td>
                    <td className="py-3.5 px-4 text-neutral-400">{m.reason}</td>
                    <td className="py-3.5 px-4 text-neutral-400">{m.registeredBy}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#E5E5E5]">{m.quantity}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-neutral-500">
                      {new Date(m.date).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SubTab 3: Suppliers */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSupplierModal(true)}
              className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
            >
              <Truck className="w-4 h-4 text-black" />
              <span>Nuevo Proveedor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#E5E5E5] text-base">{sup.name}</h3>
                  <span className="text-[10px] bg-[#161616] text-[#D4AF37] px-2.5 py-1 rounded-full border border-[#262626] font-mono font-bold">
                    {sup.category}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 space-y-1">
                  <p>NIT: <strong className="text-neutral-200 font-mono">{sup.taxId}</strong></p>
                  <p>Contacto: <strong className="text-neutral-200">{sup.contactName}</strong></p>
                  <p>Teléfono: <strong className="text-neutral-200">{sup.phone}</strong></p>
                  <p>Email: <strong className="text-neutral-200">{sup.email}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 4: Expenses */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
            >
              <DollarSign className="w-4 h-4 text-black" />
              <span>Registrar Gasto Operativo</span>
            </button>
          </div>

          <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="text-[11px] font-bold text-neutral-400 uppercase bg-[#161616] border-b border-[#262626]">
                <tr>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Descripción del Gasto</th>
                  <th className="py-3.5 px-4">Forma de Pago</th>
                  <th className="py-3.5 px-4">Registrado Por</th>
                  <th className="py-3.5 px-4 text-right">Monto</th>
                  <th className="py-3.5 px-4 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-[#161616]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#161616] border border-[#262626] text-[#D4AF37] font-bold text-[10px] uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#E5E5E5]">{exp.description}</td>
                    <td className="py-3.5 px-4 capitalize text-neutral-400">{exp.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-neutral-400">{exp.registeredBy}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400">${exp.amount.toLocaleString('es-CO')}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-neutral-500">{exp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleStockSubmit} className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#E5E5E5] text-sm">Ajuste Manual de Inventario</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Tipo Movimiento</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                >
                  <option value="entrada">+ Entrada de Stock</option>
                  <option value="salida">- Salida / Mermas</option>
                  <option value="ajuste">Ajuste Directo Conteo</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Cantidad</label>
                <input
                  type="number"
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Motivo / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Compra directa, rotura, merma de cocina..."
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 bg-[#161616] text-neutral-300 text-xs rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black text-xs rounded-xl font-extrabold cursor-pointer">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleExpenseSubmit} className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#E5E5E5] text-sm">Registrar Gasto Operacional</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Categoría Gasto</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                >
                  <option value="Insumos">Insumos & Compras</option>
                  <option value="Servicios">Servicios Públicos</option>
                  <option value="Nómina">Nómina / Turnos</option>
                  <option value="Arriendo">Arriendo</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej: Compra urgente de limones y hielo..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Monto ($)</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 bg-[#161616] text-neutral-300 text-xs rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black text-xs rounded-xl font-extrabold cursor-pointer">
                Guardar Gasto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSupplierSubmit} className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#E5E5E5] text-sm">Registrar Nuevo Proveedor</h3>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Nombre Proveedor / Empresa"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                required
              />
              <input
                type="text"
                placeholder="NIT / Doc"
                value={supTaxId}
                onChange={(e) => setSupTaxId(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
              />
              <input
                type="text"
                placeholder="Nombre Contacto"
                value={supContact}
                onChange={(e) => setSupContact(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={supPhone}
                onChange={(e) => setSupPhone(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="px-4 py-2 bg-[#161616] text-neutral-300 text-xs rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black text-xs rounded-xl font-extrabold cursor-pointer">
                Guardar Proveedor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

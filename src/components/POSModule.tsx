import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import { BillingModal } from './BillingModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Receipt,
  Utensils,
  Tag,
  AlertCircle,
  FileText,
  ShoppingBag
} from 'lucide-react';

export const POSModule: React.FC = () => {
  const {
    products,
    categories,
    tables,
    orders,
    activeOrder,
    setActiveOrder,
    createOrder,
    addItemToOrder,
    removeItemFromOrder,
    updateOrderItemQuantity,
    updateOrderNotes,
    sendOrderToKitchen,
    config,
    searchTerm,
    setSearchTerm,
    selectedCategoryId,
    setSelectedCategoryId
  } = usePOS();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [itemNoteModal, setItemNoteModal] = useState<{ productId: string; productName: string } | null>(null);
  const [customNoteText, setCustomNoteText] = useState('');

  // Filter products by category and search term
  const filteredProducts = products.filter(p => {
    const matchesCat = !selectedCategoryId || p.categoryId === selectedCategoryId;
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Ensure an active order exists or create one
  const currentOrder = activeOrder || (orders.find(o => o.status === 'pendiente') || null);

  const handleCreateNewOrder = (type: 'mesa' | 'llevar' = 'llevar') => {
    const newOrd = createOrder(undefined, type);
    setActiveOrder(newOrd);
  };

  const handleAddItem = (prod: Product) => {
    let orderToUse = currentOrder;
    if (!orderToUse) {
      orderToUse = createOrder(undefined, 'llevar');
    }
    addItemToOrder(orderToUse.id, prod, 1);
  };

  const handleSaveNote = () => {
    if (itemNoteModal && currentOrder) {
      const prod = products.find(p => p.id === itemNoteModal.productId);
      if (prod) {
        addItemToOrder(currentOrder.id, prod, 1, customNoteText);
      }
      setItemNoteModal(null);
      setCustomNoteText('');
    }
  };

  return (
    <div id="pos-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      {/* Left Column: Product Catalog & Search (7 Cols) */}
      <div id="pos-catalog-column" className="lg:col-span-7 space-y-4">
        {/* Search & Category Filter Header */}
        <div className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl space-y-3.5 shadow-xl">
          <div className="flex items-center gap-2 bg-[#161616] border border-[#262626] px-4 py-2.5 rounded-xl text-xs text-[#E5E5E5] focus-within:border-[#D4AF37]">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              id="product-search-input"
              type="text"
              placeholder="Buscar producto por nombre o código (ej: Mojito, Hamburguesa)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-xs text-[#E5E5E5]"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-neutral-500 hover:text-neutral-300">
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div id="category-tabs" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              id="cat-tab-all"
              onClick={() => setSelectedCategoryId(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryId === null
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'bg-[#161616] text-neutral-400 hover:text-[#E5E5E5] hover:bg-[#202020]'
              }`}
            >
              Todos los Menús
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-[#161616] text-neutral-400 hover:text-[#E5E5E5] hover:bg-[#202020]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div id="product-cards-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              onClick={() => handleAddItem(product)}
              className="bg-[#0F0F0F] border border-[#262626] hover:border-[#D4AF37]/60 rounded-2xl p-3.5 flex flex-col justify-between transition-all cursor-pointer group hover:shadow-xl hover:shadow-[#D4AF37]/5 relative overflow-hidden"
            >
              {/* Product Image */}
              {product.image && (
                <div className="w-full h-28 rounded-xl overflow-hidden mb-2.5 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-[9px] font-mono px-2 py-0.5 rounded-full text-[#D4AF37] font-bold border border-[#262626]">
                    {product.code}
                  </span>
                </div>
              )}

              <div>
                <h4 className="font-bold text-[#E5E5E5] text-xs line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                  {product.name}
                </h4>
                <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">
                  {product.description}
                </p>
              </div>

              {/* Price & Add button */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#262626]">
                <span className="font-mono font-black text-[#D4AF37] text-sm">
                  ${product.price.toLocaleString('es-CO')}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemNoteModal({ productId: product.id, productName: product.name });
                  }}
                  className="p-1 px-2 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#262626] text-neutral-300 hover:text-[#D4AF37] text-[10px] font-bold transition-colors"
                  title="Agregar con nota especial"
                >
                  + Nota
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Order Cart & Comandero Drawer (5 Cols) */}
      <div id="pos-cart-column" className="lg:col-span-5 bg-[#0F0F0F] border border-[#262626] rounded-2xl p-5 flex flex-col justify-between h-[calc(100vh-100px)] sticky top-20 shadow-2xl">
        {/* Cart Header */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3.5">
            <div>
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-widest block">Comandera en Vivo</span>
              <h3 className="font-bold text-[#E5E5E5] text-base flex items-center gap-2">
                <span>{currentOrder?.tableName || 'Seleccionar Mesa'}</span>
                <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20 font-mono font-bold">
                  {currentOrder?.code || 'SIN PEDIDO'}
                </span>
              </h3>
            </div>

            <button
              id="btn-new-order"
              onClick={() => handleCreateNewOrder('llevar')}
              className="text-xs bg-[#161616] hover:bg-[#202020] border border-[#262626] text-neutral-200 px-3.5 py-2 rounded-xl font-bold cursor-pointer transition-colors"
            >
              + Para Llevar
            </button>
          </div>

          {/* Table / Customer Picker */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={currentOrder?.tableId || ''}
              onChange={(e) => {
                if (currentOrder) {
                  const tbl = tables.find(t => t.id === e.target.value);
                  setActiveOrder({
                    ...currentOrder,
                    tableId: e.target.value,
                    tableName: tbl ? tbl.name : 'Para Llevar'
                  });
                }
              }}
              className="bg-[#161616] border border-[#262626] text-neutral-200 p-2.5 rounded-xl focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">-- Asignar Mesa --</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.zone}) - {t.status}</option>
              ))}
            </select>

            <div className="bg-[#161616] border border-[#262626] text-neutral-400 p-2.5 rounded-xl text-[11px] flex items-center justify-between">
              <span>Mesero:</span>
              <strong className="text-neutral-200">{currentOrder?.waiterName || 'General'}</strong>
            </div>
          </div>
        </div>

        {/* Cart Item List */}
        <div id="cart-item-list" className="flex-1 my-4 overflow-y-auto space-y-2 pr-1 divide-y divide-[#262626]">
          {!currentOrder || currentOrder.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs py-12 space-y-2">
              <ShoppingBag className="w-8 h-8 text-neutral-600" />
              <p>No hay productos en esta comanda.</p>
              <p className="text-[10px] text-neutral-500">Haz clic en cualquier producto del catálogo para agregarlo.</p>
            </div>
          ) : (
            currentOrder.items.map((item) => (
              <div key={item.id} className="pt-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5 max-w-[60%]">
                  <span className="font-bold text-neutral-200">{item.productName}</span>
                  {item.notes && <span className="block text-[10px] text-[#D4AF37] italic">Nota: {item.notes}</span>}
                  <span className="text-[10px] text-neutral-500 font-mono block">
                    ${item.unitPrice.toLocaleString('es-CO')} c/u
                  </span>
                </div>

                {/* Qty Controls & Total */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#161616] border border-[#262626] rounded-xl">
                    <button
                      onClick={() => updateOrderItemQuantity(currentOrder.id, item.id, -1)}
                      className="p-1.5 text-neutral-400 hover:text-[#E5E5E5]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-mono font-bold text-[#E5E5E5]">{item.quantity}</span>
                    <button
                      onClick={() => updateOrderItemQuantity(currentOrder.id, item.id, 1)}
                      className="p-1.5 text-neutral-400 hover:text-[#E5E5E5]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono font-bold text-[#E5E5E5] min-w-[70px] text-right">
                    ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
                  </span>

                  <button
                    onClick={() => removeItemFromOrder(currentOrder.id, item.id)}
                    className="text-neutral-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Totals & Action Buttons */}
        <div className="space-y-3.5 border-t border-[#262626] pt-3.5">
          <div className="space-y-1.5 text-xs font-mono text-neutral-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${(currentOrder?.subtotal || 0).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuesto ({config.taxRatePercent}%):</span>
              <span>${(currentOrder?.taxAmount || 0).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span>Propina Sugerida ({config.defaultTipPercent}%):</span>
              <span>${(currentOrder?.tipAmount || 0).toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#E5E5E5] pt-1.5 border-t border-[#262626]">
              <span>Total Comanda:</span>
              <span className="text-[#D4AF37] font-black">${(currentOrder?.total || 0).toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="btn-send-kitchen"
              disabled={!currentOrder || currentOrder.items.length === 0}
              onClick={() => currentOrder && sendOrderToKitchen(currentOrder.id)}
              className="bg-[#161616] hover:bg-[#202020] disabled:opacity-50 text-neutral-100 border border-[#262626] font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ChefHat className="w-4 h-4 text-rose-400" />
              <span>Enviar a Cocina</span>
            </button>

            <button
              id="btn-checkout-pay"
              disabled={!currentOrder || currentOrder.items.length === 0}
              onClick={() => setShowCheckoutModal(true)}
              className="bg-[#D4AF37] hover:bg-[#c29f2e] disabled:opacity-50 text-black font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#D4AF37]/10"
            >
              <Receipt className="w-4 h-4 text-black" />
              <span>Facturar / Cobrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Item Note Modal */}
      {itemNoteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#E5E5E5] text-sm">
              Nota para {itemNoteModal.productName}
            </h3>
            <input
              type="text"
              placeholder="Ej: Sin cebolla, término medio, hielo extra..."
              value={customNoteText}
              onChange={(e) => setCustomNoteText(e.target.value)}
              className="w-full bg-[#161616] border border-[#262626] text-[#E5E5E5] text-xs p-3 rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setItemNoteModal(null)}
                className="px-4 py-2 bg-[#161616] text-neutral-300 text-xs rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black text-xs rounded-xl font-extrabold cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout & Invoicing Modal */}
      {showCheckoutModal && currentOrder && (
        <BillingModal
          order={currentOrder}
          onClose={() => setShowCheckoutModal(false)}
        />
      )}
    </div>
  );
};

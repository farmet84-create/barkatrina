import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  ChefHat
} from 'lucide-react';

export const ProductsModule: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Product, 'id'>>({
    code: '',
    name: '',
    categoryId: categories[0]?.id || 'cat-1',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 10,
    unit: 'Unidad',
    image: '',
    description: '',
    isKitchenItem: true
  });

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === 'Todas' || p.categoryId === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({
      code: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      categoryId: categories[0]?.id || 'cat-1',
      price: 15000,
      cost: 5000,
      stock: 50,
      minStock: 10,
      unit: 'Unidad',
      image: '',
      description: '',
      isKitchenItem: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      name: p.name,
      categoryId: p.categoryId,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
      image: p.image || '',
      description: p.description || '',
      isKitchenItem: p.isKitchenItem
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, form);
    } else {
      addProduct(form);
    }
    setShowModal(false);
  };

  return (
    <div id="products-module" className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      {/* Header */}
      <div id="products-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-[#E5E5E5] flex items-center gap-2.5">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            <span>Gestión de Productos & Catálogo de Menú</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Configura productos, precios de venta, costos e insumos de cocina.</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#0F0F0F] border border-[#262626] p-4 rounded-2xl shadow-md">
        <div className="flex-1 flex items-center gap-2 bg-[#161616] border border-[#262626] px-3.5 py-2.5 rounded-xl text-xs text-[#E5E5E5]">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Filtrar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full focus:outline-none text-[#E5E5E5]"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-[#161616] border border-[#262626] text-[#E5E5E5] text-xs px-3.5 py-2.5 rounded-xl focus:outline-none"
        >
          <option value="Todas">Todas las Categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="text-[11px] font-bold text-neutral-400 uppercase bg-[#161616] border-b border-[#262626]">
            <tr>
              <th className="py-3.5 px-4">Código</th>
              <th className="py-3.5 px-4">Producto</th>
              <th className="py-3.5 px-4">Categoría</th>
              <th className="py-3.5 px-4 text-right">Costo Insumo</th>
              <th className="py-3.5 px-4 text-right">Precio Venta</th>
              <th className="py-3.5 px-4 text-center">Stock Actual</th>
              <th className="py-3.5 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {filteredProducts.map(p => {
              const cat = categories.find(c => c.id === p.categoryId);
              const isLowStock = p.stock <= p.minStock;

              return (
                <tr key={p.id} className="hover:bg-[#161616]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37]">{p.code}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      {p.image && <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />}
                      <div>
                        <div className="font-bold text-[#E5E5E5]">{p.name}</div>
                        <div className="text-[10px] text-neutral-500">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">{cat?.name || 'General'}</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-400 text-right">${p.cost.toLocaleString('es-CO')}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#E5E5E5] text-right">${p.price.toLocaleString('es-CO')}</td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isLowStock ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-[#161616] border border-[#262626] text-neutral-200'
                    }`}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#262626] text-neutral-300 hover:text-[#D4AF37]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#262626] text-neutral-300 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#E5E5E5] text-base">
              {editingId ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Código Interno</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Categoría</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-neutral-400 block mb-1 font-semibold">Nombre del Producto</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Precio de Venta ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono font-bold text-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Costo Estimado ($)</label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Stock Inicial</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Stock Mínimo Alerta</label>
                <input
                  type="number"
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="text-neutral-400 block mb-1 font-semibold">URL Imagen (Opcional)</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#161616] text-neutral-300 text-xs rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button type="submit" className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-black text-xs rounded-xl font-extrabold cursor-pointer">
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

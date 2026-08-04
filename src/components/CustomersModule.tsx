import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Users, Gift, Plus, Search, Award } from 'lucide-react';

export const CustomersModule: React.FC = () => {
  const { customers, addCustomer, updateCustomerPoints, config } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.docNumber.includes(searchTerm) ||
    c.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addCustomer({ name, docNumber, phone, email });
    setShowModal(false);
    setName('');
    setDocNumber('');
    setPhone('');
    setEmail('');
  };

  return (
    <div id="customers-module" className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-[#E5E5E5] flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <span>Fidelización & Base de Datos de Clientes</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Programa de puntos acumulables por consumo para promociones y descuentos.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Registrar Cliente</span>
        </button>
      </div>

      {/* Program Summary Card */}
      <div className="bg-[#0F0F0F] border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5 rounded-2xl flex items-center justify-between text-xs shadow-xl">
        <div className="flex items-center gap-3.5">
          <Award className="w-8 h-8 text-[#D4AF37]" />
          <div>
            <h4 className="font-bold text-[#E5E5E5] text-sm">Regla de Puntos Activa</h4>
            <p className="text-neutral-400 mt-0.5">Acumula <strong className="text-[#D4AF37]">{config.pointsPerPurchase} puntos</strong> por cada $1,000 en compras. Cada punto equivale a <strong className="text-[#D4AF37]">${config.currencyPointValue}</strong> en caja.</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-[#0F0F0F] border border-[#262626] px-4 py-3 rounded-xl text-xs text-[#E5E5E5]">
        <Search className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, cédula/NIT o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent w-full focus:outline-none placeholder:text-neutral-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="text-[11px] font-bold text-neutral-400 uppercase bg-[#161616] border-b border-[#262626]">
            <tr>
              <th className="py-3.5 px-4">Nombre Completo</th>
              <th className="py-3.5 px-4">Doc / NIT</th>
              <th className="py-3.5 px-4">Teléfono</th>
              <th className="py-3.5 px-4 text-center">Visitas Total</th>
              <th className="py-3.5 px-4 text-right">Acumulado Compras</th>
              <th className="py-3.5 px-4 text-center">Puntos Fidelidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-[#161616]/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#E5E5E5]">{c.name}</td>
                <td className="py-3.5 px-4 font-mono text-neutral-400">{c.docNumber}</td>
                <td className="py-3.5 px-4 text-neutral-400">{c.phone || '-'}</td>
                <td className="py-3.5 px-4 text-center font-mono">{c.totalVisits}</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">${c.totalSpent.toLocaleString('es-CO')}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] font-bold font-mono border border-[#D4AF37]/30 inline-flex items-center gap-1.5 text-[11px]">
                    <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {c.loyaltyPoints} pts
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#E5E5E5] text-sm">Registrar Nuevo Cliente</h3>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Nombre Completo *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] placeholder:text-neutral-500"
                required
              />
              <input
                type="text"
                placeholder="Documento Identidad / NIT"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] placeholder:text-neutral-500"
              />
              <input
                type="text"
                placeholder="Teléfono Móvil"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] placeholder:text-neutral-500"
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] placeholder:text-neutral-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
    </div>
  );
};

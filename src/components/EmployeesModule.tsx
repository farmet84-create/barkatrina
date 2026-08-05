import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { UserCheck, ShieldCheck, Plus, Check, X, Edit2 } from 'lucide-react';
import { Role, Employee } from '../types/pos';

export const EmployeesModule: React.FC = () => {
  const { employees, addEmployee, updateEmployee, rolePermissions } = usePOS();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('mesero');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [active, setActive] = useState(true);

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setRole('mesero');
    setEmail('');
    setPhone('');
    setActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setName(emp.name);
    setRole(emp.role);
    setEmail(emp.email);
    setPhone(emp.phone);
    setActive(emp.active);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (editingId) {
      updateEmployee(editingId, { name, role, email, phone, active });
    } else {
      addEmployee({ name, role, email, phone, active: true });
    }
    setShowModal(false);
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('');
  };

  const permissionLabels: Record<string, string> = {
    canManageProducts: 'Administrar Productos & Precios',
    canManageInventory: 'Gestión Insumos & Compras',
    canManageUsers: 'Gestión Usuarios & Personal',
    canOpenCloseCash: 'Apertura & Cierre de Caja',
    canViewReports: 'Ver Reportes Financieros',
    canDiscountOrder: 'Aplicar Descuentos Especiales',
    canTakeOrder: 'Tomar Pedidos en Comandera'
  };

  return (
    <div id="employees-module" className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-[#E5E5E5] flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-[#D4AF37]" />
            <span>Gestión de Personal, Empleados & Permisos de Seguridad</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">Control de roles de usuario (Administrador, Cajero, Mesero, Cocinero) y accesos.</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Nuevo Colaborador</span>
        </button>
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="bg-[#0F0F0F] border border-[#262626] p-5 rounded-2xl flex items-center justify-between shadow-xl">
            <div>
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold">{emp.role}</span>
              <h3 className="font-bold text-[#E5E5E5] text-base">{emp.name}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{emp.email} • {emp.phone}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                emp.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {emp.active ? 'Activo' : 'Inactivo'}
              </span>
              <button
                onClick={() => handleOpenEdit(emp)}
                className="p-1.5 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#262626] text-neutral-300 hover:text-[#D4AF37] cursor-pointer"
                title="Editar colaborador"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-[#E5E5E5] text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Matriz de Permisos por Rol de Usuario</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="text-[11px] font-bold text-neutral-400 uppercase bg-[#161616] border-b border-[#262626]">
              <tr>
                <th className="py-3.5 px-4">Módulo / Permiso Operativo</th>
                <th className="py-3.5 px-4 text-center">Admin</th>
                <th className="py-3.5 px-4 text-center">Cajero</th>
                <th className="py-3.5 px-4 text-center">Mesero</th>
                <th className="py-3.5 px-4 text-center">Cocinero</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <tr key={key} className="hover:bg-[#161616]/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#E5E5E5]">{label}</td>
                  {(['admin', 'cajero', 'mesero', 'cocinero'] as Role[]).map(r => {
                    const allowed = rolePermissions[r][key];
                    return (
                      <td key={r} className="py-3.5 px-4 text-center">
                        {allowed ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-[#161616] border border-[#262626] text-neutral-600 inline-flex items-center justify-center mx-auto">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-[#0F0F0F] border border-[#262626] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-[#E5E5E5] text-sm">{editingId ? 'Editar Colaborador' : 'Registrar Colaborador'}</h3>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Nombre Completo *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] placeholder:text-neutral-500"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
              >
                <option value="mesero">Mesero</option>
                <option value="cajero">Cajero</option>
                <option value="cocinero">Cocinero / Bartender</option>
                <option value="admin">Administrador</option>
              </select>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] placeholder:text-neutral-500"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] placeholder:text-neutral-500"
              />
              {editingId && (
                <label className="flex items-center gap-2.5 bg-[#161616] border border-[#262626] p-2.5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <span className="text-neutral-300 font-semibold">Colaborador activo</span>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => { setShowModal(false); setEditingId(null); }}
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

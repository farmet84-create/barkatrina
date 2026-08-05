import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  ChefHat,
  Wallet,
  Package,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  AlertCircle,
  X
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'tables'
  | 'pos'
  | 'kitchen'
  | 'cash'
  | 'inventory'
  | 'customers'
  | 'employees'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { orders, products, cashSession } = usePOS();

  // Active badges
  const pendingKitchenCount = orders.filter(o => o.status === 'en_cocina').length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const activeOrdersCount = orders.filter(o => o.status === 'pendiente' || o.status === 'en_cocina' || o.status === 'servido').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tables',
      label: 'Salón & Mesas',
      icon: Utensils,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: 'bg-[#D4AF37] text-black font-bold'
    },
    {
      id: 'pos',
      label: 'Comandero / POS',
      icon: ShoppingBag,
      badge: null
    },
    {
      id: 'kitchen',
      label: 'Cocina (KDS)',
      icon: ChefHat,
      badge: pendingKitchenCount > 0 ? pendingKitchenCount : null,
      badgeColor: 'bg-rose-500 text-white font-bold animate-pulse'
    },
    {
      id: 'cash',
      label: 'Caja & Arqueo',
      icon: Wallet,
      badge: cashSession?.status === 'abierta' ? 'OK' : 'CERRADA',
      badgeColor: cashSession?.status === 'abierta' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold' : 'bg-rose-950/60 text-rose-400 border border-rose-500/30 font-semibold'
    },
    {
      id: 'inventory',
      label: 'Inventario & Compras',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold'
    },
    {
      id: 'customers',
      label: 'Clientes & Puntos',
      icon: Users,
      badge: null
    },
    {
      id: 'employees',
      label: 'Personal & Roles',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'reports',
      label: 'Reportes & Finanzas',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings',
      label: 'Config & Reglas IA',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`w-64 bg-[#0F0F0F] border-r border-[#262626] text-neutral-300 flex flex-col justify-between flex-shrink-0
          fixed inset-y-0 left-0 z-40 overflow-y-auto transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:min-h-[calc(100vh-61px)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
      {/* Navigation Links */}
      <nav id="sidebar-nav" className="p-3.5 space-y-1.5">
        <div className="flex items-center justify-between px-3.5 py-2">
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
            Módulos ERP POS
          </span>
          <button
            id="sidebar-close-btn"
            onClick={onClose}
            className="lg:hidden text-neutral-400 hover:text-white p-1"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#D4AF37] text-black font-extrabold shadow-lg shadow-[#D4AF37]/10'
                  : 'text-neutral-400 hover:text-[#E5E5E5] hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge !== null && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-[#1a1a1a] text-neutral-300 border border-[#262626]'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Low Stock Footer Warning */}
      {lowStockCount > 0 && (
        <div id="sidebar-low-stock-alert" className="p-3.5 m-3.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold">{lowStockCount} insumo(s)</span> con stock bajo el mínimo.
          </div>
        </div>
      )}
      </aside>
    </>
  );
};

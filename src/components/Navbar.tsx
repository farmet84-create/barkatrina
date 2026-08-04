import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  Store,
  Wallet,
  User,
  Shield,
  Bell,
  Clock,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { config, cashSession, currentUser, setCurrentUser, employees } = usePOS();

  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header id="app-header" className="bg-[#0C0C0C] border-b border-[#262626] text-[#E5E5E5] px-5 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xl">
      {/* Brand & Store Name */}
      <div id="brand-container" className="flex items-center gap-3.5">
        <div id="brand-logo" className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#AA8B28] flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#D4AF37]/20">
          <Store className="w-5 h-5 text-black" />
        </div>
        <div>
          <h1 id="app-title" className="font-bold text-[#E5E5E5] text-base leading-tight tracking-wide">
            {config.businessName}
          </h1>
          <p id="app-subtitle" className="text-[11px] text-[#D4AF37] font-medium flex items-center gap-1.5 tracking-wider">
            <span className="uppercase tracking-[0.15em] text-[10px] font-semibold">ERP POS Bar & Restaurante</span>
            <span className="text-[#444]">•</span>
            <span className="text-neutral-400 font-mono">NIT: {config.taxId}</span>
          </p>
        </div>
      </div>

      {/* Middle Status Indicators */}
      <div id="header-status-indicators" className="hidden md:flex items-center gap-4 text-xs">
        {/* Cash Status Pill */}
        <div id="cash-status-badge" className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide ${
          cashSession?.status === 'abierta'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
        }`}>
          <Wallet className="w-3.5 h-3.5" />
          <span>
            CAJA: {cashSession?.status === 'abierta' ? 'ABIERTA' : 'CERRADA'}
          </span>
          {cashSession?.status === 'abierta' && (
            <span className="font-mono bg-[#161616] border border-[#333] px-2 py-0.5 rounded-full text-emerald-300">
              ${cashSession.expectedCash.toLocaleString('es-CO')}
            </span>
          )}
        </div>

        {/* Date Time Badge */}
        <div id="datetime-badge" className="flex items-center gap-1.5 text-neutral-400 bg-[#161616] px-3.5 py-1.5 rounded-full border border-[#262626]">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="capitalize text-xs tracking-wider">{formattedDate}</span>
        </div>
      </div>

      {/* User & Role Switcher */}
      <div id="header-user-actions" className="flex items-center gap-3">
        <div id="role-selector" className="relative group">
          <div className="flex items-center gap-2.5 bg-[#161616] hover:bg-[#1f1f1f] border border-[#262626] hover:border-[#D4AF37]/50 text-[#E5E5E5] px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all">
            <User className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <div className="font-bold text-[#E5E5E5] leading-none">{currentUser.name}</div>
              <div className="text-[9px] text-[#D4AF37] uppercase font-mono tracking-widest mt-0.5">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 ml-1" />
          </div>

          {/* User Select Dropdown */}
          <div id="user-dropdown-menu" className="absolute right-0 top-full mt-2 w-56 bg-[#0F0F0F] border border-[#262626] rounded-2xl shadow-2xl py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
            <div className="px-4 py-2 border-b border-[#262626] text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
              Cambiar Usuario / Rol
            </div>
            {employees.map(emp => (
              <button
                key={emp.id}
                id={`switch-user-${emp.id}`}
                onClick={() => setCurrentUser(emp)}
                className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[#1a1a1a] transition-colors ${
                  emp.id === currentUser.id ? 'bg-[#1a1a1a] text-[#D4AF37] font-bold' : 'text-neutral-300'
                }`}
              >
                <span>{emp.name}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#0A0A0A] border border-[#262626] text-neutral-400 uppercase tracking-wider font-mono">
                  {emp.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

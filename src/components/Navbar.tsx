import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  Wallet,
  User,
  Clock,
  LogOut,
  Menu
} from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { cashSession, currentUser, logout } = usePOS();

  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header id="app-header" className="bg-[#0C0C0C] border-b border-[#262626] text-[#E5E5E5] px-3 sm:px-5 py-3 flex items-center justify-between gap-2 sticky top-0 z-30 shadow-2xl">
      {/* Brand & Store Name */}
      <div id="brand-container" className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          id="sidebar-open-btn"
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 text-neutral-300 hover:text-white p-1.5 -ml-1 rounded-lg hover:bg-[#1a1a1a]"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div id="brand-logo" className="h-11 sm:h-14 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src="https://waappbusiness.com/wp-content/uploads/2026/01/cropped-walogo-blanco.png"
            alt="Logo"
            className="h-full w-auto object-contain"
          />
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

      {/* Current User & Logout */}
      <div id="header-user-actions" className="flex items-center gap-3 flex-shrink-0">
        <div id="current-user-badge" className="flex items-center gap-2 sm:gap-2.5 bg-[#161616] border border-[#262626] text-[#E5E5E5] px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium">
          <User className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          <div className="text-left hidden sm:block">
            <div className="font-bold text-[#E5E5E5] leading-none">{currentUser.name}</div>
            <div className="text-[9px] text-[#D4AF37] uppercase font-mono tracking-widest mt-0.5">
              {currentUser.role}
            </div>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={logout}
          className="flex items-center gap-1.5 bg-[#161616] hover:bg-rose-950/40 border border-[#262626] hover:border-rose-500/40 text-neutral-300 hover:text-rose-400 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};

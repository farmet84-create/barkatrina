import React, { useState } from 'react';
import { LogIn, Lock, User } from 'lucide-react';
import { api, setAuthToken } from '../api/client';
import { Footer } from './Footer';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { usuario, contrasena });
      setAuthToken(data.token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#0F0F0F] border border-[#262626] rounded-2xl p-7 space-y-5 shadow-2xl">
        <div className="text-center space-y-2">
          <img
            src="https://waappbusiness.com/wp-content/uploads/2026/01/cropped-walogo-blanco.png"
            alt="Logo"
            className="h-12 w-auto mx-auto"
          />
          <p className="text-xs text-neutral-400 uppercase tracking-[0.15em]">ERP POS Bar & Restaurante</p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2.5 bg-[#161616] border border-[#262626] px-3.5 py-2.5 rounded-xl">
            <User className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="bg-transparent w-full text-sm focus:outline-none text-[#E5E5E5]"
              autoFocus
              required
            />
          </div>
          <div className="flex items-center gap-2.5 bg-[#161616] border border-[#262626] px-3.5 py-2.5 rounded-xl">
            <Lock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="bg-transparent w-full text-sm focus:outline-none text-[#E5E5E5]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c29f2e] disabled:opacity-60 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Ingresando...' : 'Ingresar'}</span>
        </button>
      </form>
      </div>
      <Footer />
    </div>
  );
};

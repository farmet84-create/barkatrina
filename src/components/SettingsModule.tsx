import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Settings,
  Sparkles,
  Database,
  GitMerge,
  Save,
  Bot,
  Send,
  Loader2
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { config, updateConfig, invoices, products, orders, cashSession } = usePOS();

  const [formConfig, setFormConfig] = useState(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Gemini AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;

    setLoadingAi(true);
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          contextData: {
            businessName: config.businessName,
            totalInvoicesCount: invoices.length,
            totalSalesToday: invoices.reduce((acc, i) => acc + i.total, 0),
            topProducts: products.slice(0, 5).map(p => ({ name: p.name, stock: p.stock, price: p.price })),
            cashState: cashSession?.status
          }
        })
      });

      const data = await response.json();
      setAiResponse(data.reply || 'Sin respuesta del modelo.');
    } catch (err: any) {
      setAiResponse('Error al consultar al Asistente IA. Asegúrate de tener conexión.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div id="settings-module" className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen text-[#E5E5E5]">
      {/* Header */}
      <div id="settings-header" className="bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-[#E5E5E5] flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-[#D4AF37]" />
          <span>Configuración del Sistema, Reglas, Flujo & Asistente IA</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Ajustes generales, diccionario de datos, flujo operativo y consultor inteligente impulsado por Gemini AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Business Configuration */}
        <div className="bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="font-bold text-[#E5E5E5] text-sm border-b border-[#262626] pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#D4AF37]" />
            <span>Parámetros Generales del Establecimiento</span>
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
            <div>
              <label className="text-neutral-400 block mb-1 font-semibold">Nombre Comercial</label>
              <input
                type="text"
                value={formConfig.businessName}
                onChange={(e) => setFormConfig({ ...formConfig, businessName: e.target.value })}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">NIT / Documento</label>
                <input
                  type="text"
                  value={formConfig.taxId}
                  onChange={(e) => setFormConfig({ ...formConfig, taxId: e.target.value })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Teléfono</label>
                <input
                  type="text"
                  value={formConfig.phone}
                  onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1 font-semibold">Dirección Física</label>
              <input
                type="text"
                value={formConfig.address}
                onChange={(e) => setFormConfig({ ...formConfig, address: e.target.value })}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Impuesto Restaurante (% Tax)</label>
                <input
                  type="number"
                  value={formConfig.taxRatePercent}
                  onChange={(e) => setFormConfig({ ...formConfig, taxRatePercent: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Propina Sugerida (%)</label>
                <input
                  type="number"
                  value={formConfig.defaultTipPercent}
                  onChange={(e) => setFormConfig({ ...formConfig, defaultTipPercent: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1 font-semibold">Pie de Página Factura / Ticket</label>
              <input
                type="text"
                value={formConfig.receiptFooterText}
                onChange={(e) => setFormConfig({ ...formConfig, receiptFooterText: e.target.value })}
                className="w-full bg-[#161616] border border-[#262626] p-2.5 rounded-xl text-[#E5E5E5]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
            >
              <Save className="w-4 h-4 text-black" />
              <span>Guardar Cambios</span>
            </button>

            {savedSuccess && (
              <p className="text-emerald-400 text-center font-bold text-xs pt-1">¡Configuración actualizada con éxito!</p>
            )}
          </form>
        </div>

        {/* Right Column: AI Prompt Assistant */}
        <div className="bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="font-bold text-[#E5E5E5] text-sm border-b border-[#262626] pb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#D4AF37]" />
              <span>Prompt & Consultor IA para Bares y Restaurantes</span>
            </h3>

            <p className="text-xs text-neutral-400 mt-2">
              Haz preguntas o pide recomendaciones sobre cómo mejorar tus ventas, sugerir combos de bebidas, u optimizar inventario.
            </p>

            <form onSubmit={handleAskAI} className="mt-4 space-y-3">
              <textarea
                rows={3}
                placeholder="Ej: ¿Qué estrategia de combos o promociones me recomiendas para aumentar las ventas de cócteles hoy?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-[#161616] border border-[#262626] p-3 rounded-xl text-xs text-[#E5E5E5] focus:outline-none focus:border-[#D4AF37] placeholder:text-neutral-500"
              />

              <button
                type="submit"
                disabled={loadingAi}
                className="w-full bg-[#D4AF37] hover:bg-[#c29f2e] text-black font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10 transition-all"
              >
                {loadingAi ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4 text-black" />}
                <span>Consultar con Asistente Gemini IA</span>
              </button>
            </form>

            {aiResponse && (
              <div className="mt-4 bg-[#161616] border border-[#262626] p-4 rounded-xl text-xs text-neutral-200 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operating Flow & Data Dictionary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operating Flow */}
        <div className="bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl space-y-3 shadow-xl">
          <h3 className="font-bold text-[#E5E5E5] text-sm flex items-center gap-2 border-b border-[#262626] pb-3">
            <GitMerge className="w-4 h-4 text-[#D4AF37]" />
            <span>Flujo Operativo del ERP POS</span>
          </h3>

          <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] text-xs text-neutral-300 font-mono space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[10px]">1</span>
              <span><strong>Login / Rol:</strong> Selección de Cajero / Mesero / Admin</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[10px]">2</span>
              <span><strong>Apertura de Caja:</strong> Conteo de fondo base inicial en efectivo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[10px]">3</span>
              <span><strong>Salón & Mesas:</strong> Toma de comandas y envío a Cocina/Barra (KDS)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[10px]">4</span>
              <span><strong>Facturación & Cobro:</strong> Múltiples pagos (Efectivo/Tarjeta/Puntos)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[10px]">5</span>
              <span><strong>Descuento Inventario:</strong> Deducción automática de stock de insumos</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[10px]">6</span>
              <span><strong>Arqueo & Reportes:</strong> Cierre de turno y estados financieros</span>
            </div>
          </div>
        </div>

        {/* Data Dictionary */}
        <div className="bg-[#0F0F0F] border border-[#262626] p-6 rounded-2xl space-y-3 shadow-xl">
          <h3 className="font-bold text-[#E5E5E5] text-sm flex items-center gap-2 border-b border-[#262626] pb-3">
            <Database className="w-4 h-4 text-[#D4AF37]" />
            <span>Diccionario de Datos & Entidades</span>
          </h3>

          <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] text-xs text-neutral-300 space-y-2 max-h-52 overflow-y-auto font-mono">
            <div><strong className="text-[#D4AF37]">Products:</strong> id, code, name, categoryId, price, cost, stock, minStock, isKitchenItem</div>
            <div><strong className="text-[#D4AF37]">Tables:</strong> id, number, name, zone, capacity, status ('libre', 'ocupada', 'por_pagar')</div>
            <div><strong className="text-[#D4AF37]">Orders:</strong> id, code, tableId, waiterId, items[], status, subtotal, taxAmount, tipAmount, total</div>
            <div><strong className="text-[#D4AF37]">Invoices:</strong> id, number, orderId, customerId, paymentMethod, amountPaid, changeDue, cashierId</div>
            <div><strong className="text-[#D4AF37]">CashRegisterSession:</strong> id, openedAt, initialAmount, expectedCash, totalCashSales, totalCardSales, status</div>
            <div><strong className="text-[#D4AF37]">Customers:</strong> id, name, docNumber, loyaltyPoints, totalVisits, totalSpent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

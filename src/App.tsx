import React, { useState } from 'react';
import { POSProvider } from './context/POSContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardModule } from './components/DashboardModule';
import { TablesModule } from './components/TablesModule';
import { POSModule } from './components/POSModule';
import { KitchenModule } from './components/KitchenModule';
import { CashModule } from './components/CashModule';
import { InventoryModule } from './components/InventoryModule';
import { CustomersModule } from './components/CustomersModule';
import { EmployeesModule } from './components/EmployeesModule';
import { ReportsModule } from './components/ReportsModule';
import { SettingsModule } from './components/SettingsModule';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  return (
    <POSProvider>
      <div id="pos-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <Navbar />

        <div id="main-layout-container" className="flex flex-1 overflow-hidden">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main id="main-content-viewport" className="flex-1 overflow-y-auto min-w-0 bg-slate-950">
            {activeTab === 'dashboard' && <DashboardModule setActiveTab={setActiveTab} />}
            {activeTab === 'tables' && <TablesModule setActiveTab={setActiveTab} />}
            {activeTab === 'pos' && <POSModule />}
            {activeTab === 'kitchen' && <KitchenModule />}
            {activeTab === 'cash' && <CashModule />}
            {activeTab === 'inventory' && <InventoryModule />}
            {activeTab === 'customers' && <CustomersModule />}
            {activeTab === 'employees' && <EmployeesModule />}
            {activeTab === 'reports' && <ReportsModule />}
            {activeTab === 'settings' && <SettingsModule />}
          </main>
        </div>
      </div>
    </POSProvider>
  );
}

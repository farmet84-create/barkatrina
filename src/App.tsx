import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardModule } from './components/DashboardModule';
import { TablesModule } from './components/TablesModule';
import { POSModule } from './components/POSModule';
import { ProductsModule } from './components/ProductsModule';
import { KitchenModule } from './components/KitchenModule';
import { CashModule } from './components/CashModule';
import { InventoryModule } from './components/InventoryModule';
import { CustomersModule } from './components/CustomersModule';
import { EmployeesModule } from './components/EmployeesModule';
import { ReportsModule } from './components/ReportsModule';
import { SettingsModule } from './components/SettingsModule';
import { Footer } from './components/Footer';
import { TAB_ACCESS, canAccessTab } from './access';

const AppShell: React.FC = () => {
  const { currentUser } = usePOS();
  const [activeTab, setActiveTab] = useState<ActiveTab>(TAB_ACCESS[currentUser.role][0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!canAccessTab(currentUser.role, activeTab)) {
      setActiveTab(TAB_ACCESS[currentUser.role][0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.role]);

  const handleSetActiveTab = (tab: ActiveTab) => {
    if (!canAccessTab(currentUser.role, tab)) return;
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div id="pos-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div id="main-layout-container" className="flex flex-1 overflow-hidden relative">
        <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main id="main-content-viewport" className="flex-1 overflow-y-auto min-w-0 bg-slate-950 w-full">
          {activeTab === 'dashboard' && <DashboardModule setActiveTab={handleSetActiveTab} />}
          {activeTab === 'tables' && <TablesModule setActiveTab={handleSetActiveTab} />}
          {activeTab === 'pos' && <POSModule />}
          {activeTab === 'products' && <ProductsModule />}
          {activeTab === 'kitchen' && <KitchenModule />}
          {activeTab === 'cash' && <CashModule />}
          {activeTab === 'inventory' && <InventoryModule />}
          {activeTab === 'customers' && <CustomersModule />}
          {activeTab === 'employees' && <EmployeesModule />}
          {activeTab === 'reports' && <ReportsModule />}
          {activeTab === 'settings' && <SettingsModule />}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <AppShell />
    </POSProvider>
  );
}

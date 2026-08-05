import { Role } from './types/pos';

export type ActiveTab =
  | 'dashboard'
  | 'tables'
  | 'pos'
  | 'products'
  | 'kitchen'
  | 'cash'
  | 'inventory'
  | 'customers'
  | 'employees'
  | 'reports'
  | 'settings';

export const TAB_ACCESS: Record<Role, ActiveTab[]> = {
  admin: ['dashboard', 'tables', 'pos', 'products', 'kitchen', 'cash', 'inventory', 'customers', 'employees', 'reports', 'settings'],
  cajero: ['dashboard', 'tables', 'pos', 'cash', 'inventory', 'customers', 'reports'],
  mesero: ['tables', 'pos', 'customers'],
  cocinero: ['kitchen']
};

export const canAccessTab = (role: Role, tab: ActiveTab) => TAB_ACCESS[role].includes(tab);

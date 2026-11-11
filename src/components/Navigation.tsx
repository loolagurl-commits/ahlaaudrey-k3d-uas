import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarCheck, 
  Banknote, 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'employees' 
  | 'attendance' 
  | 'leaves' 
  | 'payroll' 
  | 'recruitment' 
  | 'performance' 
  | 'audit';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Super Admin (HR)';
      case 'manager':
        return 'Manajer Divisi';
      default:
        return 'Karyawan (ESS)';
    }
  };

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean; managerAllowed?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Absensi', icon: Clock },
    { id: 'leaves', label: 'Cuti & Izin', icon: CalendarCheck },
    { id: 'employees', label: 'Karyawan', icon: Users, managerAllowed: true },
    { id: 'payroll', label: 'Penggajian', icon: Banknote },
    { id: 'performance', label: 'KPI Target', icon: TrendingUp },
    { id: 'recruitment', label: 'Rekrutmen', icon: Briefcase, adminOnly: true },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleNav = navItems.filter(item => {
    if (item.adminOnly) return isAdmin;
    if (item.managerAllowed) return isAdmin || isManager;
    return true;
  });

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-16">
            
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div 
                onClick={() => onTabChange('dashboard')}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
                  Nusantara HRIS
                </span>
              </div>
            </div>

            {/* Zone 2: 4–8 clean single-line text navigation links */}
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-2">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: 1 primary action / User profile & Logout */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                  {user?.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {getRoleLabel(user?.role)}
                </span>
              </div>

              <div className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase overflow-hidden">
                {user?.name ? user.name.slice(0, 2) : 'US'}
              </div>

              <button
                onClick={logout}
                title="Keluar (Logout)"
                className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <div className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{getRoleLabel(user?.role)} · {user?.department}</p>
              </div>
            </div>

            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={logout}
              className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Keluar dari Aplikasi</span>
            </button>
          </div>
        )}
      </header>
    </>
  );
};

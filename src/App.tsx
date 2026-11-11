import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardOverview } from './components/DashboardOverview';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { AttendanceManager } from './components/AttendanceManager';
import { LeaveManager } from './components/LeaveManager';
import { PayrollManager } from './components/PayrollManager';
import { RecruitmentATS } from './components/RecruitmentATS';
import { PerformanceKPI } from './components/PerformanceKPI';
import { AuditTrailView } from './components/AuditTrailView';
import { ShieldCheck, Server, Smartphone, Laptop } from 'lucide-react';

const MainApplication: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Memuat Sistem Nusantara HRIS...</span>
        </div>
      </div>
    );
  }

  // Mandatory authentication gate: employee must log in before accessing app
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top 3-Zone Navigation */}
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && <DashboardOverview onNavigate={setCurrentTab} />}
        {currentTab === 'employees' && <EmployeeDirectory />}
        {currentTab === 'attendance' && <AttendanceManager />}
        {currentTab === 'leaves' && <LeaveManager />}
        {currentTab === 'payroll' && <PayrollManager />}
        {currentTab === 'recruitment' && <RecruitmentATS />}
        {currentTab === 'performance' && <PerformanceKPI />}
        {currentTab === 'audit' && <AuditTrailView />}
      </main>

      {/* Enterprise Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Nusantara HRIS</span>
            <span aria-hidden="true">·</span>
            <span>Versi Produksi Multi-Device v1.0</span>
            <span aria-hidden="true">·</span>
            <span>Konsistensi Data Real-Time</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Database Online Server Sinkron
            </span>
            <span aria-hidden="true">·</span>
            <span>Kepatuhan PP 58/2023 (PPh 21 TER) & BPJS RI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}

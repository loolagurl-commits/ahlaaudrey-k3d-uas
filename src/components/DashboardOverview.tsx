import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users, 
  Clock, 
  CalendarCheck, 
  Banknote, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight, 
  MapPin, 
  TrendingUp, 
  Smartphone,
  Laptop
} from 'lucide-react';
import { NavTab } from './Navigation';
import { AttendanceRecord, LeaveRequest, AuditLog } from '../types/hrm';
import { formatIDR } from '../lib/indonesianPayroll';

interface DashboardOverviewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const [metrics, setMetrics] = useState({
    activeEmployees: 5,
    todayAttendance: 4,
    pendingLeaves: 2,
    openJobs: 3
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [todayAttendanceList, setTodayAttendanceList] = useState<AttendanceRecord[]>([]);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadDashboard = async () => {
      try {
        const [sys, att, leaves, logs] = await Promise.all([
          api.getSystemStatus().catch(() => null),
          api.getAttendance(user, { date: new Date().toISOString().split('T')[0] }).catch(() => []),
          api.getLeaves(user, isEmployee ? user.id : undefined).catch(() => []),
          isAdmin ? api.getAuditLogs(user).catch(() => []) : Promise.resolve([])
        ]);

        if (sys?.metrics) {
          setMetrics(sys.metrics);
        }
        setTodayAttendanceList(att);
        setMyLeaves(leaves);
        if (logs) setRecentLogs(logs.slice(0, 5));
      } catch (e) {
        console.error('Failed loading dashboard', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, isAdmin, isEmployee]);

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>{todayStr}</span>
            <span aria-hidden="true">·</span>
            <span>Waktu Indonesia Barat (WIB)</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Sinkronisasi Cloud Aktif
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Selamat Datang, {user?.name}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {user?.position} · {user?.department} ({user?.employeeId})
          </p>
        </div>

        {/* Multi-device sync highlight */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex -space-x-1">
            <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Dukungan Multi-Device Konsisten</div>
            <div className="text-[11px] text-slate-500">Data tersimpan di server terpusat & selalu real-time</div>
          </div>
        </div>
      </div>

      {/* KPI & Core HR Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('employees')}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Karyawan Aktif</span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {metrics.activeEmployees} Orang
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>PKWTT & PKWT</span>
            <span className="text-indigo-600 dark:text-indigo-400 hover:underline">Kelola Data →</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Kehadiran Hari Ini</span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {todayAttendanceList.length} / {metrics.activeEmployees}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Tepat Waktu & Terlambat</span>
            <span className="text-emerald-600 dark:text-emerald-400 hover:underline">Presensi Live →</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('leaves')}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Cuti & Izin</span>
            <CalendarCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {metrics.pendingLeaves} Pengajuan
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Menunggu Review</span>
            <span className="text-amber-600 dark:text-amber-400 hover:underline">Lihat Pengajuan →</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('payroll')}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Payroll & PPh 21 TER</span>
            <Banknote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            November 2026
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>BPJS & Pajak PP 58</span>
            <span className="text-blue-600 dark:text-blue-400 hover:underline">Rincian Slip →</span>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Quick Actions & Recent Attendance / Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Actions & ESS Portal */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Aksi Cepat Karyawan (ESS)
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('attendance')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Presensi Kehadiran</div>
                    <div className="text-[11px] text-indigo-700/70 dark:text-indigo-300/70">Clock-in GPS & WFH/WFO</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('leaves')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Pengajuan Cuti / Izin Sakit</div>
                    <div className="text-[11px] text-slate-500">Cek kuota & lampirkan surat</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('payroll')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Lihat Slip Gaji Resmi</div>
                    <div className="text-[11px] text-slate-500">Rincian BPJS & PPh 21 TER</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('performance')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Target & Evaluasi KPI</div>
                    <div className="text-[11px] text-slate-500">Review performa kuartal</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* HR Compliance Note */}
          <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Kepatuhan Regulasi Ketenagakerjaan</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Sistem ini telah terintegrasi dengan regulasi ketenagakerjaan Indonesia: formula PPh 21 TER (PP 58/2023), BPJS Ketenagakerjaan (JHT 2%, JP 1% cap Rp 10.042.300), BPJS Kesehatan (1% cap Rp 12.000.000), serta perhitungan lembur standar UU Cipta Kerja.
            </p>
          </div>
        </div>

        {/* Right Column: Attendance Records & Audit Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today attendance table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Presensi Masuk Hari Ini
                </h2>
                <p className="text-xs text-slate-500">Log kehadiran terverifikasi per {todayStr}</p>
              </div>
              <button 
                onClick={() => onNavigate('attendance')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Lihat Semua ({todayAttendanceList.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-medium">
                    <th className="py-2.5 pr-3">Karyawan</th>
                    <th className="py-2.5 px-3">Divisi</th>
                    <th className="py-2.5 px-3">Jam Masuk</th>
                    <th className="py-2.5 px-3">Mode</th>
                    <th className="py-2.5 pl-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {todayAttendanceList.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                      <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-white">
                        {att.employeeName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {att.department}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {att.clockInTime} WIB
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {att.workMode}
                      </td>
                      <td className="py-3 pl-3">
                        <span className={`font-medium ${
                          att.status === 'Hadir Tepat Waktu' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {att.status} {att.lateMinutes > 0 ? `(+${att.lateMinutes}m)` : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {todayAttendanceList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Belum ada karyawan yang absen masuk hari ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Preview (for HR Admin) */}
          {isAdmin && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Audit Trail & Keamanan HR (Terbaru)
                  </h2>
                  <p className="text-xs text-slate-500">Pencatatan riwayat perubahan data sensitif & otorisasi</p>
                </div>
                <button 
                  onClick={() => onNavigate('audit')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Buka Audit Log Lengkap →
                </button>
              </div>

              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 text-xs flex items-start justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{log.action}</span>
                        <span className="text-[11px] text-slate-400">· {log.resource}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                        {log.details}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Oleh: {log.userName} ({log.userRole}) · IP: {log.ipAddress}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 whitespace-nowrap font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

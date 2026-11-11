import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AuditLog } from '../types/hrm';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Filter, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Database,
  Calendar
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getAuditLogs(user);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    const headers = ['ID,Timestamp,User,Role,Action,Resource,Details,IP Address'];
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.resource}","${l.details}","${l.ipAddress || '-'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>Audit Trail & Kepatuhan Keamanan HR</span>
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan mutlak seluruh aktivitas perubahan data sensitif gaji, NIK, status kerja, dan persetujuan
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor Bukti Audit CSV</span>
        </button>
      </div>

      {/* Security Principles Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Isolasi Hak Akses Bertingkat</div>
          <p className="text-[11px] text-slate-500 mt-1">Super Admin, Manajer Divisi, dan Karyawan Self-Service dipisahkan secara ketat.</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-indigo-500" />
            <span>Masking Data Finansial & KTP</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Perlindungan Data Pribadi (PDP)</div>
          <p className="text-[11px] text-slate-500 mt-1">Nomor Rekening, NIK 16 digit, dan NPWP disensor default untuk mencegah kebocoran.</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Immutable Audit Logging</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Pencatatan Waktu & IP Address</div>
          <p className="text-[11px] text-slate-500 mt-1">Setiap mutasi gaji, persetujuan cuti, dan perubahan status terdata permanen.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari log audit berdasarkan user, aksi, rincian, atau IP..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full sm:w-56 py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">Semua Jenis Aksi (Action)</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="SALARY_CHANGE">SALARY_CHANGE (Perubahan Gaji)</option>
          <option value="CREATE_EMPLOYEE">CREATE_EMPLOYEE</option>
          <option value="UPDATE_EMPLOYEE">UPDATE_EMPLOYEE</option>
          <option value="LEAVE_APPROVAL">LEAVE_APPROVAL (Persetujuan Cuti)</option>
          <option value="GENERATE_PAYROLL">GENERATE_PAYROLL (Proses Gaji)</option>
          <option value="HIRE_CANDIDATE">HIRE_CANDIDATE (Onboarding)</option>
          <option value="CLOCK_IN">CLOCK_IN</option>
          <option value="CLOCK_OUT">CLOCK_OUT</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Waktu (WIB)</th>
                <th className="py-3 px-4 font-semibold">User & Role</th>
                <th className="py-3 px-4 font-semibold">Aksi (Action)</th>
                <th className="py-3 px-4 font-semibold">Target Sumber Daya</th>
                <th className="py-3 px-4 font-semibold">Rincian Perubahan (Details)</th>
                <th className="py-3 px-4 font-semibold font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div>{timeStr} WIB</div>
                      <div className="text-[10px] text-slate-400">{dateStr}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                        [{log.userRole}]
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-mono text-[11px] font-semibold ${
                        log.action.includes('SALARY')
                          ? 'text-red-600 dark:text-red-400'
                          : log.action.includes('PAYROLL')
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : log.action.includes('LEAVE')
                          ? 'text-amber-600 dark:text-amber-400'
                          : log.action.includes('HIRE')
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {log.resource}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-sm">
                      {log.details}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada catatan audit yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AttendanceRecord } from '../types/hrm';
import { 
  Clock, 
  MapPin, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Download, 
  Search,
  Building,
  Home
} from 'lucide-react';

export const AttendanceManager: React.FC = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workMode, setWorkMode] = useState<'WFO (Kantor)' | 'WFH (Remote)'>('WFO (Kantor)');
  const [notes, setNotes] = useState('');
  const [processingClock, setProcessingClock] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendance = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getAttendance(user, isEmployee ? { employeeId: user.id } : undefined);
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [user, isEmployee]);

  // Check today's record for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayRecord = records.find(r => r.employeeId === user?.id && r.date === todayStr);

  const handleClock = async (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    if (!user) return;
    setProcessingClock(true);
    setMessage(null);

    try {
      const locationName = workMode === 'WFO (Kantor)' 
        ? 'Kantor Pusat SCBD Sudirman, Jakarta Selatan (-6.2255, 106.8095)'
        : 'Bandung Home Hub / IP Remote Terenkripsi (-6.9175, 107.6191)';

      const res = await api.clockAttendance(user, type, workMode, locationName, notes);
      setMessage({ text: res.message, type: 'success' });
      setNotes('');
      await loadAttendance();
    } catch (err: any) {
      setMessage({ text: err.message || 'Presensi gagal.', type: 'error' });
    } finally {
      setProcessingClock(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID,Tanggal,Karyawan,Divisi,Jam Masuk,Jam Pulang,Status,Mode Kerja,Keterlambatan (Menit),Lokasi'];
    const rows = records.map(r => 
      `"${r.id}","${r.date}","${r.employeeName}","${r.department}","${r.clockInTime}","${r.clockOutTime || '-'}","${r.status}","${r.workMode}","${r.lateMinutes}","${r.locationName}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Presensi_HRM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentTime);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Absensi & Presensi Multi-Device
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan jam kerja digital dengan deteksi keterlambatan otomatis dan geolokasi
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Log Presensi</span>
        </button>
      </div>

      {/* Clock-in Punch Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider">Punch Clock Digital</span>
              <span className="font-mono">{formattedDate}</span>
            </div>

            {/* Live Clock */}
            <div className="py-4 text-center border-y border-slate-100 dark:border-slate-700/60 my-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
                {formattedTime} <span className="text-xs font-sans text-slate-400 font-normal">WIB</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Jam masuk operasional standar: <span className="font-semibold text-slate-700 dark:text-slate-300">08:30 WIB</span>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-200 border border-red-200 dark:border-red-800'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Mode Kerja */}
            <div className="space-y-3 mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mode Bekerja Hari Ini:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkMode('WFO (Kantor)')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    workMode === 'WFO (Kantor)'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>WFO (Kantor)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkMode('WFH (Remote)')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    workMode === 'WFH (Remote)'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>WFH (Remote)</span>
                </button>
              </div>

              {/* Location Verification Tag */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Lokasi GPS Terverifikasi: </span>
                  {workMode === 'WFO (Kantor)' ? 'Gedung SCBD Sudirman Lantai 18' : 'Home Network Terenkripsi'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Catatan Kehadiran (Opsional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Bertugas ke client, rapat lapangan..."
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            {!myTodayRecord ? (
              <button
                onClick={() => handleClock('CLOCK_IN')}
                disabled={processingClock}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>{processingClock ? 'Mencatat...' : 'Absen Masuk (Clock In)'}</span>
              </button>
            ) : !myTodayRecord.clockOutTime ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>Masuk: {myTodayRecord.clockInTime} WIB</span>
                  <span className="font-semibold">{myTodayRecord.status}</span>
                </div>
                <button
                  onClick={() => handleClock('CLOCK_OUT')}
                  disabled={processingClock}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  <span>{processingClock ? 'Mencatat...' : 'Absen Pulang (Clock Out)'}</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-center text-xs text-slate-700 dark:text-slate-300 font-medium">
                Presensi hari ini telah lengkap (Masuk: {myTodayRecord.clockInTime} · Pulang: {myTodayRecord.clockOutTime})
              </div>
            )}
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Riwayat Presensi & Log Jam Kerja
              </h2>
              <p className="text-xs text-slate-500">
                {isEmployee ? 'Rekap kehadiran pribadi Anda' : 'Seluruh data absensi karyawan terpusat'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-3 font-semibold">Karyawan</th>
                  <th className="py-2.5 px-3 font-semibold">Masuk</th>
                  <th className="py-2.5 px-3 font-semibold">Pulang</th>
                  <th className="py-2.5 px-3 font-semibold">Mode</th>
                  <th className="py-2.5 px-3 font-semibold">Status Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-mono text-slate-900 dark:text-white font-medium">
                      {r.date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{r.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{r.department}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {r.clockInTime} WIB
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {r.clockOutTime ? `${r.clockOutTime} WIB` : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {r.workMode}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        r.status === 'Hadir Tepat Waktu'
                          ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {r.status} {r.lateMinutes > 0 ? `(+${r.lateMinutes}m)` : ''}
                      </span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada rekaman presensi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LeaveRequest, LeaveType } from '../types/hrm';
import { 
  CalendarCheck, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  X,
  ShieldAlert
} from 'lucide-react';

export const LeaveManager: React.FC = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeaveForAction, setSelectedLeaveForAction] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('Cuti Tahunan');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [daysCount, setDaysCount] = useState(1);
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const loadLeaves = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getLeaves(user, isEmployee ? user.id : undefined);
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [user, isEmployee]);

  // Auto-calculate days difference
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDaysCount(Math.max(1, isNaN(diffDays) ? 1 : diffDays));
    }
  }, [startDate, endDate]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await api.applyLeave(user, {
        leaveType,
        startDate,
        endDate,
        daysCount,
        reason,
        attachmentName: attachmentName || undefined
      });
      setIsApplyModalOpen(false);
      setReason('');
      setAttachmentName('');
      await loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Pengajuan cuti gagal.');
    }
  };

  const handleReview = async (leaveId: string, status: 'Disetujui' | 'Ditolak') => {
    if (!user) return;
    try {
      await api.updateLeaveStatus(user, leaveId, status, rejectionReason || undefined);
      setSelectedLeaveForAction(null);
      setRejectionReason('');
      await loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status cuti.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Manajemen Cuti & Izin Karyawan
          </h1>
          <p className="text-xs text-slate-500">
            Pengajuan cuti terintegrasi dengan kuota tahunan dan pemotongan gaji (Unpaid Leave)
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajukan Cuti / Izin</span>
        </button>
      </div>

      {/* Quota Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Hak Cuti Tahunan UU No. 13
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            12 Hari / Tahun
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Standar regulasi ketenagakerjaan RI</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Pengajuan Menunggu Review
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {leaves.filter(l => l.status === 'Menunggu Persetujuan').length} Pengajuan
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Persetujuan Manajer & HR</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Cuti Disetujui Bulan Ini
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {leaves.filter(l => l.status === 'Disetujui').length} Pengajuan
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Terdata pada sistem presensi & payroll</div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Daftar Pengajuan Cuti & Izin
          </h2>
          <span className="text-xs text-slate-500 font-mono">Total: {leaves.length} Data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Karyawan</th>
                <th className="py-3 px-4 font-semibold">Tipe Cuti</th>
                <th className="py-3 px-4 font-semibold">Rentang Waktu</th>
                <th className="py-3 px-4 font-semibold">Durasi</th>
                <th className="py-3 px-4 font-semibold">Alasan</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                {(isAdmin || isManager) && <th className="py-3 px-4 font-semibold text-right">Tindakan</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{l.employeeName}</div>
                    <div className="text-[11px] text-slate-500">{l.department}</div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                    <div>{l.leaveType}</div>
                    {l.impactsSalaryDeduction && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        Potong Gaji Pokok (Unpaid)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                    {l.startDate} s/d {l.endDate}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white font-mono">
                    {l.daysCount} Hari
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={l.reason}>
                    <div>{l.reason}</div>
                    {l.attachmentName && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3" />
                        {l.attachmentName}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      l.status === 'Disetujui'
                        ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : l.status === 'Ditolak'
                        ? 'text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400'
                        : 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {l.status}
                    </span>
                  </td>

                  {(isAdmin || isManager) && (
                    <td className="py-3.5 px-4 text-right">
                      {l.status === 'Menunggu Persetujuan' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReview(l.id, 'Disetujui')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                            title="Setujui Cuti"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLeaveForAction(l);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                            title="Tolak Cuti"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {l.reviewedBy ? `Oleh: ${l.reviewedBy}` : 'Selesai'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {leaves.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada pengajuan cuti dalam daftar ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                <span>Form Pengajuan Cuti / Izin</span>
              </h2>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Cuti / Izin *
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Mengurangi Kuota 12 Hari)</option>
                  <option value="Izin Sakit (Surat Dokter)">Izin Sakit (Wajib Lampirkan Surat Dokter)</option>
                  <option value="Cuti Khusus (Melahirkan / Menikah)">Cuti Khusus (Melahirkan / Menikah)</option>
                  <option value="Cuti Tanpa Bayar (Unpaid Leave)">Cuti Tanpa Bayar (Unpaid Leave)</option>
                </select>
              </div>

              {leaveType === 'Cuti Tanpa Bayar (Unpaid Leave)' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Integrasi Payroll Otomatis:</strong> Cuti Tanpa Bayar akan memotong gaji pokok bulanan secara proporsional sesuai jumlah hari kerja (Gaji Pokok / 22 x Hari Cuti).
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-mono text-[11px] flex justify-between">
                <span>Total Durasi Hari Kerja:</span>
                <span className="font-bold">{daysCount} Hari</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan / Keterangan Cuti *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan kebutuhan pengajuan cuti Anda secara jelas..."
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Dokumen Lampiran (Opsional / Wajib untuk Sakit)
                </label>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Contoh: Surat_Keterangan_Dokter_RS.pdf"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Leave Reason Modal */}
      {selectedLeaveForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Tolak Pengajuan Cuti
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Pengajuan dari <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLeaveForAction.employeeName}</span> ({selectedLeaveForAction.leaveType}).
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Penolakan:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Contoh: Kebutuhan deadline rilis proyek Q4, silakan jadwalkan ulang..."
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedLeaveForAction(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(selectedLeaveForAction.id, 'Ditolak')}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg"
                >
                  Konfirmasi Penolakan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

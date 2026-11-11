import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PayrollRecord } from '../types/hrm';
import { formatIDR } from '../lib/indonesianPayroll';
import { 
  Banknote, 
  Printer, 
  Download, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  CheckCircle, 
  X, 
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const PayrollManager: React.FC = () => {
  const { user, isAdmin, isEmployee } = useAuth();
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('November 2026');
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);

  const loadPayroll = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getPayroll(user, {
        period: selectedPeriod,
        employeeId: isEmployee ? user.id : undefined,
      });
      setPayrollList(data);
      if (isEmployee && data.length > 0 && !selectedSlip) {
        setSelectedSlip(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [user, selectedPeriod, isEmployee]);

  const handleRecalculateBatch = async () => {
    if (!user) return;
    try {
      setRecalculating(true);
      const res = await api.generatePayrollBatch(user, selectedPeriod);
      alert(`Berhasil memproses payroll untuk ${res.count} karyawan dengan formula BPJS & PPh 21 TER terintegrasi.`);
      await loadPayroll();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses penggajian.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'NIP,Nama Karyawan,Divisi,Status PTKP,Kategori TER,Gaji Pokok,Tunjangan Tetap,Tunjangan Makan,Lembur,Potongan Terlambat,Potongan Unpaid,BPJS Kes Karyawan,BPJS JHT,BPJS JP,PPh 21 TER %,PPh 21 Nominal,Take Home Pay'
    ];
    const rows = payrollList.map(p => 
      `"${p.nip}","${p.employeeName}","${p.department}","${p.ptkpStatus}","${p.terCategory}","${p.baseSalary}","${p.fixedAllowance}","${p.dailyAllowance}","${p.overtimePay}","${p.latePenaltyDeduction}","${p.unpaidLeaveDeduction}","${p.bpjsKesehatanEmployee}","${p.bpjsJhtEmployee}","${p.bpjsJpEmployee}","${p.pph21TERPercentage}%","${p.pph21Amount}","${p.netSalary}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payroll_Report_${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Grand totals
  const totalGross = payrollList.reduce((acc, curr) => acc + (curr.baseSalary + curr.fixedAllowance + curr.dailyAllowance + curr.overtimePay), 0);
  const totalTax = payrollList.reduce((acc, curr) => acc + curr.pph21Amount, 0);
  const totalNet = payrollList.reduce((acc, curr) => acc + curr.netSalary, 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Penggajian Otomatis (Payroll Indonesia)
          </h1>
          <p className="text-xs text-slate-500">
            Kepatuhan UU Cipta Kerja, BPJS Kesehatan & Ketenagakerjaan, serta PPh 21 TER (PP 58/2023)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="November 2026">November 2026</option>
            <option value="Desember 2026">Desember 2026</option>
            <option value="Januari 2027">Januari 2027</option>
          </select>

          {isAdmin && (
            <>
              <button
                onClick={handleRecalculateBatch}
                disabled={recalculating}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                <span>{recalculating ? 'Memproses...' : 'Kalkulasi Ulang Batch'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekap</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Financial Summary Strip */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Total Pengeluaran Gaji Bruto
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {formatIDR(totalGross)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{payrollList.length} Karyawan diproses</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              PPh 21 TER Terpotong (PP 58/2023)
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
              {formatIDR(totalTax)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Siap setor e-Bupot Unifikasi</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Total Take Home Pay (Net Transfer)
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {formatIDR(totalNet)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Payroll Bank BCA / Mandiri</div>
          </div>
        </div>
      )}

      {/* Table of Employee Payroll or Direct ESS Payslip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Payroll Table (for Admin/Manager) or Compact list */}
        <div className={`${selectedSlip ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isAdmin ? `Daftar Penggajian ${selectedPeriod}` : 'Slip Gaji Anda'}
            </h2>
            <span className="text-xs text-slate-500 font-mono">{payrollList.length} Rekord</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Karyawan</th>
                  <th className="py-3 px-3 font-semibold">PTKP & TER</th>
                  <th className="py-3 px-3 font-semibold text-right">Gaji Pokok</th>
                  <th className="py-3 px-3 font-semibold text-right">Potongan</th>
                  <th className="py-3 px-3 font-semibold text-right">Take Home Pay</th>
                  <th className="py-3 px-4 font-semibold text-center">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payrollList.map((p) => {
                  const isSelected = selectedSlip?.id === p.id;
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedSlip(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40' 
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{p.employeeName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.nip} · {p.position}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{p.ptkpStatus}</div>
                        <div className="text-[10px] text-slate-500">TER {p.terCategory} ({p.pph21TERPercentage}%)</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatIDR(p.baseSalary)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400 tabular-nums">
                        -{formatIDR(p.totalDeductions)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatIDR(p.netSalary)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlip(p);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded hover:bg-indigo-100 transition-colors"
                        >
                          Lihat Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {payrollList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada data payroll untuk periode ini. Klik "Kalkulasi Ulang Batch" untuk generate otomatis.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Indonesian Official Payslip Document */}
        {selectedSlip && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 p-6 shadow-md print:m-0 print:border-none print:shadow-none">
            {/* Payslip Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900 dark:border-slate-600 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                    PT NUSANTARA DIGITAL TEKNOLOGI
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Gedung SCBD Sudirman Kav. 52-53, Jakarta Selatan · NPWP: 01.234.567.8-012.000
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1"
                  title="Cetak Slip Gaji"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white underline">
                SLIP PEMBAYARAN GAJI (PAYSLIP)
              </h4>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Periode: {selectedSlip.period} · Status: RAHASIA / CONFIDENTIAL
              </p>
            </div>

            {/* Employee Identifiers Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400">NIP:</span> <span className="font-mono font-semibold">{selectedSlip.nip}</span>
              </div>
              <div>
                <span className="text-slate-400">Divisi:</span> <span className="font-semibold">{selectedSlip.department}</span>
              </div>
              <div>
                <span className="text-slate-400">Nama:</span> <span className="font-semibold">{selectedSlip.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400">Jabatan:</span> <span className="font-semibold">{selectedSlip.position}</span>
              </div>
              <div>
                <span className="text-slate-400">Status PTKP:</span> <span className="font-mono font-semibold">{selectedSlip.ptkpStatus}</span>
              </div>
              <div>
                <span className="text-slate-400">Tarif Pajak:</span> <span className="font-mono font-semibold">TER {selectedSlip.terCategory} ({selectedSlip.pph21TERPercentage}%)</span>
              </div>
            </div>

            {/* Incomes & Deductions Two Columns */}
            <div className="space-y-3 text-xs">
              {/* Earnings */}
              <div>
                <div className="font-bold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  A. Penerimaan (Earnings)
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                    <span>Gaji Pokok (Base Salary)</span>
                    <span className="font-mono tabular-nums">{formatIDR(selectedSlip.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                    <span>Tunjangan Tetap (Jabatan/Transport)</span>
                    <span className="font-mono tabular-nums">{formatIDR(selectedSlip.fixedAllowance)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                    <span>Tunjangan Kehadiran Makan ({selectedSlip.attendanceDays} hari)</span>
                    <span className="font-mono tabular-nums">{formatIDR(selectedSlip.dailyAllowance)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                    <span>Uang Lembur ({selectedSlip.overtimeHours} jam UU Ciptaker)</span>
                    <span className="font-mono tabular-nums">{formatIDR(selectedSlip.overtimePay)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <div className="font-bold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  B. Potongan Karyawan (Deductions)
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {selectedSlip.latePenaltyDeduction > 0 && (
                    <div className="flex justify-between py-1 text-red-600 dark:text-red-400">
                      <span>Penalti Keterlambatan Absensi</span>
                      <span className="font-mono tabular-nums">-{formatIDR(selectedSlip.latePenaltyDeduction)}</span>
                    </div>
                  )}
                  {selectedSlip.unpaidLeaveDeduction > 0 && (
                    <div className="flex justify-between py-1 text-red-600 dark:text-red-400">
                      <span>Potongan Cuti Tanpa Bayar (Unpaid)</span>
                      <span className="font-mono tabular-nums">-{formatIDR(selectedSlip.unpaidLeaveDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                    <span>BPJS Kesehatan (1% Karyawan - Cap 12jt)</span>
                    <span className="font-mono tabular-nums">-{formatIDR(selectedSlip.bpjsKesehatanEmployee)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                    <span>BPJS Ketenagakerjaan JHT (2%)</span>
                    <span className="font-mono tabular-nums">-{formatIDR(selectedSlip.bpjsJhtEmployee)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                    <span>BPJS Ketenagakerjaan JP (1% - Cap 10jt)</span>
                    <span className="font-mono tabular-nums">-{formatIDR(selectedSlip.bpjsJpEmployee)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-indigo-700 dark:text-indigo-400 font-semibold">
                    <span>Pajak Penghasilan PPh 21 TER ({selectedSlip.pph21TERPercentage}%)</span>
                    <span className="font-mono tabular-nums">-{formatIDR(selectedSlip.pph21Amount)}</span>
                  </div>
                </div>
              </div>

              {/* Company BPJS Contribution Note */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Kontribusi BPJS Ditanggung Perusahaan (Non-Potongan):
                </div>
                <div>BPJS Kesehatan 4%: {formatIDR(selectedSlip.bpjsKesehatanCompany)} · JKK: {formatIDR(selectedSlip.bpjsJkkCompany)} · JKM: {formatIDR(selectedSlip.bpjsJkmCompany)}</div>
              </div>

              {/* Net Salary Total */}
              <div className="pt-3 border-t-2 border-slate-900 dark:border-slate-700 flex justify-between items-center text-sm">
                <div>
                  <span className="font-extrabold uppercase text-slate-900 dark:text-white">
                    Gaji Bersih Diterima (THP)
                  </span>
                  <div className="text-[10px] text-slate-500">Ditransfer ke rekening terdaftar</div>
                </div>
                <div className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatIDR(selectedSlip.netSalary)}
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div>Diterima Oleh Karyawan,</div>
                <div className="h-10" />
                <div className="font-semibold text-slate-900 dark:text-white underline">{selectedSlip.employeeName}</div>
              </div>
              <div>
                <div>Jakarta, {selectedSlip.paymentDate}</div>
                <div>Human Resources & Finance Dept,</div>
                <div className="h-8" />
                <div className="font-semibold text-slate-900 dark:text-white underline">Hendra Wijaya, S.Psi, M.M.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

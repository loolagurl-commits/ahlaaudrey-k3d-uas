import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Employee, PTKPStatus, UserRole } from '../types/hrm';
import { formatIDR } from '../lib/indonesianPayroll';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit3, 
  Download, 
  ShieldCheck, 
  X, 
  Check, 
  Lock,
  Building,
  CreditCard
} from 'lucide-react';

export const EmployeeDirectory: React.FC = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Semua Divisi');
  const [showMasked, setShowMasked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<Employee>>({
    fullName: '',
    email: '',
    phone: '',
    department: 'Teknologi & Engineering',
    position: '',
    employmentType: 'PKWTT (Tetap)',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Aktif',
    nik: '',
    npwp: '',
    bankName: 'BCA (Bank Central Asia)',
    bankAccount: '',
    ptkpStatus: 'TK/0',
    baseSalary: 12000000,
    fixedAllowance: 1500000,
    dailyAllowance: 50000,
    annualLeaveBalance: 12,
    role: 'employee',
    password: 'Password123!'
  });

  const loadEmployees = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getEmployees(user);
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [user]);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.nip.toLowerCase().includes(search.toLowerCase()) ||
      emp.position.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesDept = departmentFilter === 'Semua Divisi' || emp.department === departmentFilter;

    // If manager, only their department or all if admin
    if (isManager && !isAdmin && user) {
      return matchesSearch && matchesDept && emp.department === user.department;
    }

    return matchesSearch && matchesDept;
  });

  const departments = ['Semua Divisi', 'Teknologi & Engineering', 'Operasional & SDM', 'Keuangan & Pajak', 'Pemasaran & Bisnis'];

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      department: 'Teknologi & Engineering',
      position: '',
      employmentType: 'PKWTT (Tetap)',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Aktif',
      nik: '',
      npwp: '',
      bankName: 'BCA (Bank Central Asia)',
      bankAccount: '',
      ptkpStatus: 'TK/0',
      baseSalary: 12000000,
      fixedAllowance: 1500000,
      dailyAllowance: 50000,
      annualLeaveBalance: 12,
      role: 'employee',
      password: 'Password123!'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setIsEditMode(true);
    setSelectedEmployee(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isEditMode && selectedEmployee) {
        await api.updateEmployee(user, selectedEmployee.id, formData);
      } else {
        await api.createEmployee(user, formData);
      }
      setIsModalOpen(false);
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data karyawan.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['NIP,Nama Lengkap,Email,Telepon,Divisi,Jabatan,Status Kerja,Tanggal Gabung,PTKP,Gaji Pokok'];
    const rows = filteredEmployees.map(emp => 
      `"${emp.nip}","${emp.fullName}","${emp.email}","${emp.phone}","${emp.department}","${emp.position}","${emp.employmentType}","${emp.joinDate}","${emp.ptkpStatus}","${emp.baseSalary}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Karyawan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Basis Data Karyawan (Employee Directory)
          </h1>
          <p className="text-xs text-slate-500">
            Pusat data SDM dengan kontrol privasi RBAC dan perlindungan data sensitif
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowMasked(!showMasked)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {showMasked ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{showMasked ? 'Sensor Data Pribadi' : 'Buka Masking NIK/Bank'}</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Karyawan</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, NIP, jabatan, atau email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Karyawan & NIP</th>
                <th className="py-3 px-4 font-semibold">Divisi & Posisi</th>
                <th className="py-3 px-4 font-semibold">Tipe Kontrak</th>
                <th className="py-3 px-4 font-semibold">NIK & Pajak (PTKP)</th>
                <th className="py-3 px-4 font-semibold">Rekening Bank</th>
                {isAdmin && <th className="py-3 px-4 font-semibold text-right">Gaji Pokok</th>}
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                {isAdmin && <th className="py-3 px-4 font-semibold text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {emp.fullName.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{emp.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{emp.nip} · {emp.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 dark:text-white font-medium">{emp.position}</div>
                    <div className="text-[11px] text-slate-500">{emp.department}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <div>{emp.employmentType}</div>
                    <div className="text-[10px] text-slate-500">Sejak {emp.joinDate}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                    <div>
                      {showMasked ? emp.nik : `${emp.nik.slice(0, 6)}**********`}
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      PTKP: <span className="font-semibold">{emp.ptkpStatus}</span> · NPWP: {showMasked ? emp.npwp : `${emp.npwp.slice(0, 4)}***`}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <div className="font-medium text-slate-900 dark:text-white">{emp.bankName}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {showMasked ? emp.bankAccount : `*****${emp.bankAccount.slice(-4)}`}
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      {formatIDR(emp.baseSalary)}
                    </td>
                  )}

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      emp.status === 'Aktif'
                        ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'text-slate-600 bg-slate-100 dark:bg-slate-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                        title="Edit Data Karyawan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data karyawan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>{isEditMode ? 'Perbarui Profil Karyawan' : 'Registrasi Karyawan Baru'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Kantor *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Divisi / Departemen *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Teknologi & Engineering">Teknologi & Engineering</option>
                    <option value="Operasional & SDM">Operasional & SDM</option>
                    <option value="Keuangan & Pajak">Keuangan & Pajak</option>
                    <option value="Pemasaran & Bisnis">Pemasaran & Bisnis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan (Position) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Ikatan Kerja *
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="PKWTT (Tetap)">PKWTT (Tetap)</option>
                    <option value="PKWT (Kontrak)">PKWT (Kontrak)</option>
                    <option value="Probation">Probation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Hak Akses (RBAC) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="employee">Karyawan Biasa (ESS)</option>
                    <option value="manager">Manajer Divisi</option>
                    <option value="admin">Super Admin / HR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Pajak (PTKP) *
                  </label>
                  <select
                    value={formData.ptkpStatus}
                    onChange={(e) => setFormData({ ...formData, ptkpStatus: e.target.value as PTKPStatus })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="TK/0">TK/0 (Tidak Kawin, 0 Tanggungan - TER A)</option>
                    <option value="TK/1">TK/1 (Tidak Kawin, 1 Tanggungan - TER A)</option>
                    <option value="K/0">K/0 (Kawin, 0 Tanggungan - TER A)</option>
                    <option value="K/1">K/1 (Kawin, 1 Tanggungan - TER B)</option>
                    <option value="K/2">K/2 (Kawin, 2 Tanggungan - TER B)</option>
                    <option value="TK/2">TK/2 (Tidak Kawin, 2 Tanggungan - TER B)</option>
                    <option value="TK/3">TK/3 (Tidak Kawin, 3 Tanggungan - TER B)</option>
                    <option value="K/3">K/3 (Kawin, 3 Tanggungan - TER C)</option>
                  </select>
                </div>
              </div>

              {/* Sensitive Financial & ID Fields */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Data Identitas Resmi & Rekening Bank (Terenkripsi)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      NIK KTP (16 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      placeholder="3201xxxxxxxxxxxx"
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      NPWP (16 Digit)
                    </label>
                    <input
                      type="text"
                      value={formData.npwp}
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                      placeholder="09.xxx.xxx.x-xxx.xxx"
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Nama Bank Penyalur
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="BCA / Mandiri / BNI / BRI"
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Remuneration */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="font-semibold text-slate-900 dark:text-white mb-2">
                  Struktur Kompensasi & Gaji (IDR)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Gaji Pokok (Base)
                    </label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Tunjangan Tetap
                    </label>
                    <input
                      type="number"
                      value={formData.fixedAllowance}
                      onChange={(e) => setFormData({ ...formData, fixedAllowance: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Tunjangan Harian
                    </label>
                    <input
                      type="number"
                      value={formData.dailyAllowance}
                      onChange={(e) => setFormData({ ...formData, dailyAllowance: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  {isEditMode ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Building2, User, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types/hrm';

export const LoginForm: React.FC = () => {
  const { login, quickLoginAs } = useAuth();
  const [identifier, setIdentifier] = useState('hr.admin@nusantara.co.id');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali NIP/Email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (role: UserRole) => {
    if (role === 'admin') {
      setIdentifier('hr.admin@nusantara.co.id');
      setPassword('Password123!');
    } else if (role === 'manager') {
      setIdentifier('budi.santoso@nusantara.co.id');
      setPassword('Password123!');
    } else {
      setIdentifier('siti.aminah@nusantara.co.id');
      setPassword('Password123!');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-950/40 via-blue-950/20 to-transparent pointer-events-none blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-white font-sans">
          Nusantara HRIS
        </h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          Sistem Informasi Sumber Daya Manusia & Penggajian Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-2xl border border-slate-700/70 shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 flex items-start gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                NIP atau Email Karyawan
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="EMP001 atau hr.admin@nusantara.co.id"
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Kata Sandi (Password)
                </label>
                <span className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  Lupa password?
                </span>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun..."
                  className="block w-full pl-11 pr-11 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <div className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL 256-bit Terenkripsi</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </div>
              ) : (
                'Masuk ke Sistem HRM'
              )}
            </button>
          </form>

          {/* Quick Role Tester Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              Pilih Akun Demo untuk Pengujian Cepat:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('admin')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  identifier.includes('hr.admin')
                    ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200'
                    : 'bg-slate-900/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">1. Super Admin / HR (Akses Penuh)</div>
                  <div className="text-[11px] text-slate-400 font-mono">hr.admin@nusantara.co.id · Password123!</div>
                </div>
                {identifier.includes('hr.admin') && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('manager')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  identifier.includes('budi.santoso')
                    ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200'
                    : 'bg-slate-900/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">2. Manajer Divisi (Engineering VP)</div>
                  <div className="text-[11px] text-slate-400 font-mono">budi.santoso@nusantara.co.id · Password123!</div>
                </div>
                {identifier.includes('budi.santoso') && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('employee')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  identifier.includes('siti.aminah')
                    ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200'
                    : 'bg-slate-900/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">3. Karyawan Biasa (ESS Portal)</div>
                  <div className="text-[11px] text-slate-400 font-mono">siti.aminah@nusantara.co.id · Password123!</div>
                </div>
                {identifier.includes('siti.aminah') && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
              </button>
            </div>
          </div>
        </div>

        {/* Security & Multi-device indicator */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>Dukungan Multi-Device & Data Terpusat Realtime</p>
          <p className="text-[11px] text-slate-600">
            Kepatuhan Regulasi Ketenagakerjaan UU No. 13/2003 · PP 35/2021 · PMK 168/2023 (PPh 21 TER)
          </p>
        </div>
      </div>
    </div>
  );
};

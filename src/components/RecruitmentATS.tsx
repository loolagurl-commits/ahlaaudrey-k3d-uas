import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { JobPosting, Candidate, CandidateStage } from '../types/hrm';
import { formatIDR } from '../lib/indonesianPayroll';
import { 
  Briefcase, 
  UserPlus, 
  Star, 
  CheckCircle, 
  Plus, 
  X, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Building
} from 'lucide-react';

export const RecruitmentATS: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('Teknologi & Engineering');
  const [newJobOpenings, setNewJobOpenings] = useState(1);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [jobsData, candsData] = await Promise.all([
        api.getJobs(user),
        api.getCandidates(user)
      ]);
      setJobs(jobsData);
      setCandidates(candsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const stages: CandidateStage[] = [
    'Lamaran Baru',
    'Screening HR',
    'Interview Teknis',
    'Interview Direksi',
    'Offering Letter',
    'Diterima'
  ];

  const handleStageChange = async (candidateId: string, newStage: CandidateStage) => {
    if (!user) return;
    try {
      await api.updateCandidateStage(user, candidateId, newStage);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah stage.');
    }
  };

  const handleHireCandidate = async (candidate: Candidate) => {
    if (!user || !isAdmin) return;
    const confirmHire = window.confirm(
      `Apakah Anda yakin ingin menyelesaikan proses rekrutmen untuk "${candidate.fullName}" dan langsung menambahkannya ke Basis Data Karyawan Aktif?`
    );
    if (!confirmHire) return;

    try {
      const res = await api.hireCandidate(user, candidate.id);
      setActionMessage(`Selamat! ${res.employee.fullName} berhasil resmi bergabung sebagai karyawan (${res.employee.nip}).`);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal merekrut kandidat.');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await api.createJob(user, {
        title: newJobTitle,
        department: newJobDept,
        openingsCount: newJobOpenings,
        location: 'Jakarta (Hybrid)',
        type: 'Penuh Waktu (Full-Time)'
      });
      setIsAddJobOpen(false);
      setNewJobTitle('');
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Gagal menambah lowongan kerja.');
    }
  };

  const filteredCandidates = candidates.filter(c => 
    selectedJobId === 'all' || c.jobId === selectedJobId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Rekrutmen & ATS (Applicant Tracking System)
          </h1>
          <p className="text-xs text-slate-500">
            Pipeline akuisisi talenta terintegrasi onboarding ke data karyawan aktif dengan 1 klik
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddJobOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Lowongan Baru</span>
          </button>
        )}
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* Active Jobs Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Filter Posisi:
        </span>
        <button
          onClick={() => setSelectedJobId('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedJobId === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Semua Posisi ({candidates.length})
        </button>
        {jobs.map(j => (
          <button
            key={j.id}
            onClick={() => setSelectedJobId(j.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedJobId === j.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {j.title} ({candidates.filter(c => c.jobId === j.id).length})
          </button>
        ))}
      </div>

      {/* Candidate Pipeline Kanban / Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageCandidates = filteredCandidates.filter(c => c.stage === stage);
          return (
            <div 
              key={stage}
              className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col min-h-[420px]"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {stage}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {cand.fullName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {cand.experienceYears} thn exp · {cand.appliedDate}
                        </div>
                      </div>
                      {cand.rating && (
                        <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{cand.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Gaji Diharapkan: <span className="font-mono font-semibold">{formatIDR(cand.expectedSalary)}</span>
                    </div>

                    {cand.interviewNotes && (
                      <p className="text-[10px] text-slate-500 line-clamp-2 bg-slate-50 dark:bg-slate-900/40 p-1.5 rounded">
                        {cand.interviewNotes}
                      </p>
                    )}

                    {/* Stage mover buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1">
                      <select
                        value={cand.stage}
                        onChange={(e) => handleStageChange(cand.id, e.target.value as CandidateStage)}
                        className="w-full text-[10px] py-1 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                      >
                        {stages.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Direct Onboard Action for Offering/Hired */}
                    {(cand.stage === 'Offering Letter' || cand.stage === 'Diterima') && isAdmin && (
                      <button
                        onClick={() => handleHireCandidate(cand)}
                        className="w-full mt-1.5 py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Onboard ke Karyawan</span>
                      </button>
                    )}
                  </div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-[11px]">
                    Belum ada kandidat
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Job Modal */}
      {isAddJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Buat Lowongan Pekerjaan Baru</span>
              </h2>
              <button onClick={() => setIsAddJobOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Posisi / Pekerjaan *
                </label>
                <input
                  type="text"
                  required
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="Contoh: Senior Backend Engineer"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Divisi *
                </label>
                <select
                  value={newJobDept}
                  onChange={(e) => setNewJobDept(e.target.value)}
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
                  Jumlah Kuota Terbuka
                </label>
                <input
                  type="number"
                  min={1}
                  value={newJobOpenings}
                  onChange={(e) => setNewJobOpenings(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddJobOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
                >
                  Publikasikan Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

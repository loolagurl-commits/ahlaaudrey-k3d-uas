import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { KPIGoal } from '../types/hrm';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Star, 
  MessageSquare, 
  Plus, 
  X,
  Award
} from 'lucide-react';

export const PerformanceKPI: React.FC = () => {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const [kpis, setKpis] = useState<KPIGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKpi, setSelectedKpi] = useState<KPIGoal | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewActual, setReviewActual] = useState<number>(100);

  const loadKpis = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getKPIs(user, isEmployee ? user.id : undefined);
      setKpis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, [user, isEmployee]);

  const handleOpenReview = (kpi: KPIGoal) => {
    setSelectedKpi(kpi);
    setReviewRating(kpi.managerRating || kpi.selfRating || 4);
    setReviewFeedback(kpi.feedback || '');
    setReviewActual(kpi.actualValue);
    setReviewModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedKpi) return;

    try {
      const updatePayload: Partial<KPIGoal> = {
        actualValue: Number(reviewActual),
        feedback: reviewFeedback,
        status: isEmployee ? 'Menunggu Review' : 'Selesai'
      };

      if (isEmployee) {
        updatePayload.selfRating = reviewRating;
      } else {
        updatePayload.managerRating = reviewRating;
      }

      await api.updateKPI(user, selectedKpi.id, updatePayload);
      setReviewModalOpen(false);
      setSelectedKpi(null);
      await loadKpis();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan evaluasi KPI.');
    }
  };

  const totalWeight = kpis.reduce((acc, curr) => acc + curr.weight, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Penilaian Kinerja Karyawan (KPI & OKR)
          </h1>
          <p className="text-xs text-slate-500">
            Penetapan sasaran kuantitatif, evaluasi mandiri (Self-Assessment) dan review berkala manajer
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <span>Periode Evaluasi: Q4 2026</span>
          <span aria-hidden="true">·</span>
          <span>Bobot Terdaftar: {totalWeight}%</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.map((kpi) => {
          const progressPercent = Math.min(100, Math.round((kpi.actualValue / kpi.targetValue) * 100));
          return (
            <div
              key={kpi.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white">{kpi.employeeName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{kpi.department}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">Bobot {kpi.weight}%</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {kpi.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {kpi.description}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${
                  kpi.status === 'Selesai'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : kpi.status === 'Menunggu Review'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {kpi.status}
                </span>
              </div>

              {/* Progress Bar & Values */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Capaian Target:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {kpi.actualValue} / {kpi.targetValue} {kpi.unit} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercent >= 100 ? 'bg-emerald-500' : progressPercent >= 75 ? 'bg-indigo-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Ratings and Feedback */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {kpi.selfRating && (
                    <div className="text-[11px] text-slate-500">
                      Self: <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{kpi.selfRating}/5 ★</span>
                    </div>
                  )}
                  {kpi.managerRating && (
                    <div className="text-[11px] text-slate-500">
                      Manager: <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{kpi.managerRating}/5 ★</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleOpenReview(kpi)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isEmployee ? 'Evaluasi Mandiri' : 'Review & Beri Nilai'}</span>
                </button>
              </div>

              {kpi.feedback && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 italic">
                  "{kpi.feedback}"
                </div>
              )}
            </div>
          );
        })}

        {kpis.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            Belum ada target KPI yang ditugaskan pada periode ini.
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedKpi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>{isEmployee ? 'Input Capaian & Self Assessment' : 'Review Kinerja Manajer'}</span>
              </h2>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">{selectedKpi.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Target: {selectedKpi.targetValue} {selectedKpi.unit} · Bobot: {selectedKpi.weight}%
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Realisasi Nilai Aktual ({selectedKpi.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={reviewActual}
                  onChange={(e) => setReviewActual(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skor Nilai Kinerja (Skala 1 - 5) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setReviewRating(score)}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                        reviewRating === score
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {score} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Evaluasi & Umpan Balik (Feedback)
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Berikan apresiasi dan poin perbaikan kinerja secara konstruktif..."
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

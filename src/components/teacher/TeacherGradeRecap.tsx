import React, { useState, useMemo } from 'react';
import { ExamPackage, StudentSubmission } from '../../types/exam';
import {
  Users,
  Award,
  TrendingUp,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  BarChart3,
  Calendar,
  X,
} from 'lucide-react';

interface TeacherGradeRecapProps {
  exams: ExamPackage[];
  submissions: StudentSubmission[];
  onDeleteSubmission: (id: string) => void;
}

export const TeacherGradeRecap: React.FC<TeacherGradeRecapProps> = ({
  exams,
  submissions,
  onDeleteSubmission,
}) => {
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Lulus' | 'Remedial'>('all');
  const [activeSubmissionDetail, setActiveSubmissionDetail] = useState<StudentSubmission | null>(null);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchExam = selectedExamFilter === 'all' || sub.examId === selectedExamFilter;
      const matchStatus = statusFilter === 'all' || sub.gradeStatus === statusFilter;
      const matchSearch =
        sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.className.toLowerCase().includes(searchQuery.toLowerCase());
      return matchExam && matchStatus && matchSearch;
    });
  }, [submissions, selectedExamFilter, statusFilter, searchQuery]);

  // Analytics KPI
  const stats = useMemo(() => {
    if (filteredSubmissions.length === 0) {
      return { count: 0, average: 0, highest: 0, lowest: 0, passedCount: 0, passRate: 0 };
    }
    const scores = filteredSubmissions.map((s) => s.totalScore);
    const count = scores.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / count);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passedCount = filteredSubmissions.filter((s) => s.gradeStatus === 'Lulus').length;
    const passRate = Math.round((passedCount / count) * 100);

    return { count, average, highest, lowest, passedCount, passRate };
  }, [filteredSubmissions]);

  // Score distribution breakdown (0-59, 60-74, 75-84, 85-100)
  const scoreBuckets = useMemo(() => {
    const buckets = [
      { label: '< 60 (Perlu Bimbingan)', count: 0, color: '#ef4444' },
      { label: '60 - 74 (Cukup)', count: 0, color: '#f59e0b' },
      { label: '75 - 84 (Baik)', count: 0, color: '#3b82f6' },
      { label: '85 - 100 (Sangat Baik)', count: 0, color: '#10b981' },
    ];
    filteredSubmissions.forEach((s) => {
      if (s.totalScore < 60) buckets[0].count++;
      else if (s.totalScore < 75) buckets[1].count++;
      else if (s.totalScore < 85) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [filteredSubmissions]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) return;

    const headers = [
      'No',
      'Nama Siswa',
      'NIS/Absen',
      'Kelas',
      'Paket Ujian',
      'Mata Pelajaran',
      'Nilai Akhir',
      'Poin Mentah',
      'Total Maks',
      'KKM',
      'Status',
      'Waktu Kumpul',
    ];

    const rows = filteredSubmissions.map((sub, idx) => [
      idx + 1,
      `"${sub.studentName}"`,
      `"${sub.studentNumber}"`,
      `"${sub.className}"`,
      `"${sub.examTitle}"`,
      `"${sub.subject}"`,
      sub.totalScore,
      sub.rawScore,
      sub.totalMaxPoints,
      sub.passingGrade,
      `"${sub.gradeStatus}"`,
      `"${new Date(sub.submittedAt).toLocaleString('id-ID')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Nilai_Essay_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Rekapitulasi Nilai Siswa Real-Time
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hasil evaluasi instan berbasis rubrik analitis AI dan rekap nilai otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Rekap</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredSubmissions.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Siswa
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.count}</span>
            <span className="text-xs text-slate-400">peserta</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Rata-rata Kelas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{stats.average}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Nilai Tertinggi
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{stats.highest}</span>
            <span className="text-xs text-emerald-600 font-semibold">Max</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Nilai Terendah
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{stats.lowest}</span>
            <span className="text-xs text-amber-600 font-semibold">Min</span>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Kelulusan KKM
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-600">{stats.passRate}%</span>
            <span className="text-xs text-slate-400">
              ({stats.passedCount}/{stats.count})
            </span>
          </div>
        </div>
      </div>

      {/* Distribution Mini Chart */}
      {stats.count > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            Distribusi Rentang Nilai Siswa
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {scoreBuckets.map((bucket, idx) => (
              <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700">{bucket.label}</span>
                  <span className="font-bold text-slate-900">{bucket.count} Siswa</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.count > 0 ? (bucket.count / stats.count) * 100 : 0}%`,
                      backgroundColor: bucket.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Exam Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Paket Ujian ({submissions.length})</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'Lulus', 'Remedial'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'Semua Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIS, kelas..."
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table of Submissions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">Rank</th>
                <th className="px-4 py-3.5">Nama Siswa</th>
                <th className="px-4 py-3.5">NIS & Kelas</th>
                <th className="px-4 py-3.5">Paket Ujian</th>
                <th className="px-4 py-3.5 text-center">Nilai Akhir</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Waktu Kumpul</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{sub.studentName}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span>{sub.studentNumber}</span> • <span className="font-medium">{sub.className}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <span className="truncate max-w-[200px] block font-medium">{sub.examTitle}</span>
                      <span className="text-[10px] text-slate-400">{sub.subject}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-sm font-black font-mono px-2.5 py-1 rounded-lg ${
                          sub.totalScore >= sub.passingGrade
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {sub.totalScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          sub.gradeStatus === 'Lulus'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.gradeStatus === 'Lulus' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {sub.gradeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(sub.submittedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveSubmissionDetail(sub)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold transition-colors"
                          title="Lihat lembar jawaban dan evaluasi AI"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSubmission(sub.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"
                          title="Hapus data submisi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 italic">
                    Belum ada siswa yang mengumpulkan ujian untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT SUBMISSION DETAIL MODAL */}
      {activeSubmissionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
              <div>
                <h3 className="text-base font-bold">
                  Lembar Evaluasi Siswa: {activeSubmissionDetail.studentName}
                </h3>
                <p className="text-xs text-slate-300">
                  {activeSubmissionDetail.examTitle} • Nilai:{' '}
                  <strong className="text-emerald-400 font-mono text-sm">
                    {activeSubmissionDetail.totalScore}/100
                  </strong>{' '}
                  ({activeSubmissionDetail.gradeStatus})
                </p>
              </div>
              <button
                onClick={() => setActiveSubmissionDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Overall AI Feedback */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Kesimpulan Evaluator AI:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {activeSubmissionDetail.overallFeedback}
                </p>
              </div>

              {/* Per Question Answers */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Jawaban & Penilaian Rubrik per Butir Soal:
                </h4>

                {activeSubmissionDetail.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        Nomor Soal {idx + 1}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-indigo-700 font-mono">
                        Skor: {ans.aiScore} / {ans.maxScore} Poin
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">
                        Jawaban Siswa:
                      </span>
                      <p className="text-slate-800 whitespace-pre-line leading-relaxed font-mono">
                        {ans.studentAnswer}
                      </p>
                    </div>

                    <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 text-xs">
                      <span className="text-[11px] font-bold text-indigo-900 block mb-1">
                        Feedback Analitis:
                      </span>
                      <p className="text-slate-700 leading-relaxed">{ans.feedback}</p>

                      {ans.criteriaBreakdown && ans.criteriaBreakdown.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                          {ans.criteriaBreakdown.map((c, cIdx) => (
                            <div key={cIdx} className="bg-white p-2 rounded border border-indigo-100">
                              <div className="flex justify-between font-semibold text-slate-800">
                                <span>{c.criteria}</span>
                                <span className="text-indigo-600 font-mono">
                                  {c.scoreAwarded}/{c.maxPoints}
                                </span>
                              </div>
                              <span className="text-slate-500 text-[10px] block mt-0.5">{c.notes}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveSubmissionDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Tutup Lembar Jawaban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

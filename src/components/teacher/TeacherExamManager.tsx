import React, { useState } from 'react';
import { ExamPackage, Question } from '../../types/exam';
import { QuestionEditorModal } from './QuestionEditorModal';
import { DocumentImporterModal } from './DocumentImporterModal';
import {
  FolderPlus,
  FileText,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Table as TableIcon,
  BarChart3,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  ChevronDown,
  ArrowRight,
  Eye,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  QrCode,
  Share2,
} from 'lucide-react';

interface TeacherExamManagerProps {
  exams: ExamPackage[];
  onSaveExam: (exam: ExamPackage) => void;
  onDeleteExam: (examId: string) => void;
  onToggleActive: (examId: string) => void;
  onOpenStudentAccess?: () => void;
}

export const TeacherExamManager: React.FC<TeacherExamManagerProps> = ({
  exams,
  onSaveExam,
  onDeleteExam,
  onToggleActive,
  onOpenStudentAccess,
}) => {
  const [editingExam, setEditingExam] = useState<ExamPackage | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    question: Question | null;
    idx: number;
  } | null>(null);

  // Start new exam form
  const handleStartCreateNew = () => {
    const newTemplate: ExamPackage = {
      id: `exam_${Date.now()}`,
      code: `EXAM-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      subject: 'Biologi',
      classGrade: 'Kelas X MIPA',
      durationMinutes: 60,
      passingGrade: 75,
      instructions: 'Jawablah setiap pertanyaan essay dengan teliti dan sistematis.',
      isActive: true,
      showResultsImmediately: true,
      createdAt: new Date().toISOString(),
      questions: [],
    };
    setEditingExam(newTemplate);
    setIsCreatingNew(true);
  };

  // Duplicate an exam
  const handleDuplicateExam = (exam: ExamPackage) => {
    const duplicated: ExamPackage = {
      ...exam,
      id: `exam_${Date.now()}`,
      code: `${exam.subject.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      title: `${exam.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      questions: exam.questions.map((q, idx) => ({
        ...q,
        id: `q_${Date.now()}_${idx}`,
      })),
    };
    onSaveExam(duplicated);
  };

  // Save question into currently editing exam
  const handleSaveQuestion = (savedQuestion: Question) => {
    if (!editingExam) return;
    const currentQuestions = [...editingExam.questions];
    if (editingQuestion && editingQuestion.idx >= 0 && editingQuestion.idx < currentQuestions.length) {
      currentQuestions[editingQuestion.idx] = savedQuestion;
    } else {
      currentQuestions.push(savedQuestion);
    }
    setEditingExam({
      ...editingExam,
      questions: currentQuestions,
    });
    setEditingQuestion(null);
  };

  // Delete question from editing exam
  const handleDeleteQuestion = (idx: number) => {
    if (!editingExam) return;
    const updated = editingExam.questions.filter((_, i) => i !== idx).map((q, i) => ({
      ...q,
      questionNumber: i + 1,
    }));
    setEditingExam({
      ...editingExam,
      questions: updated,
    });
  };

  // Save current editing exam to main exam bank
  const handleSaveExamForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;
    if (!editingExam.title.trim()) {
      alert('Judul paket ujian wajib diisi!');
      return;
    }
    if (editingExam.questions.length === 0) {
      alert('Paket ujian harus memiliki minimal 1 butir soal!');
      return;
    }

    onSaveExam(editingExam);
    setEditingExam(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            Bank Soal & Manajemen Paket Ujian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Buat soal baru dengan mapel/tema apa saja kapan pun. Soal lama tetap tersimpan rapi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenStudentAccess && (
            <button
              type="button"
              onClick={onOpenStudentAccess}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Smartphone className="h-4 w-4 text-amber-300" />
              <span>Bagikan ke HP Siswa (QR)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDocModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 shadow-2xs transition-all"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Import Word / PDF (AI)</span>
          </button>

          <button
            type="button"
            onClick={handleStartCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Paket Baru</span>
          </button>
        </div>
      </div>

      {/* EXAM EDITOR VIEW */}
      {editingExam ? (
        <form onSubmit={handleSaveExamForm} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isCreatingNew ? 'Buat Paket Ujian Baru' : `Edit: ${editingExam.title}`}
              </h3>
              <p className="text-xs text-slate-500">
                Atur informasi mata pelajaran, durasi, dan kelola butir soal essay
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingExam(null);
                  setIsCreatingNew(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Simpan Paket Ujian</span>
              </button>
            </div>
          </div>

          {/* Form Meta Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Judul Paket Ujian / Bab
              </label>
              <input
                type="text"
                required
                value={editingExam.title}
                onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                placeholder="Contoh: Penilaian Harian: Struktur dan Fungsi Sel"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kode Ujian Siswa
              </label>
              <input
                type="text"
                required
                value={editingExam.code}
                onChange={(e) => setEditingExam({ ...editingExam, code: e.target.value.toUpperCase() })}
                placeholder="BIO-101"
                className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mata Pelajaran (Mapel)
              </label>
              <input
                type="text"
                required
                value={editingExam.subject}
                onChange={(e) => setEditingExam({ ...editingExam, subject: e.target.value })}
                placeholder="Biologi, Ekonomi, Bahasa Indonesia, dll"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sasaran Kelas
              </label>
              <input
                type="text"
                value={editingExam.classGrade}
                onChange={(e) => setEditingExam({ ...editingExam, classGrade: e.target.value })}
                placeholder="Kelas XII IPA"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Durasi (Menit)
                </label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={editingExam.durationMinutes}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, durationMinutes: Number(e.target.value) })
                  }
                  className="w-full text-xs font-bold text-center px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  KKM Nilai
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editingExam.passingGrade}
                  onChange={(e) =>
                    setEditingExam({ ...editingExam, passingGrade: Number(e.target.value) })
                  }
                  className="w-full text-xs font-bold text-center px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Petunjuk Pengerjaan Ujian untuk Siswa
            </label>
            <input
              type="text"
              value={editingExam.instructions}
              onChange={(e) => setEditingExam({ ...editingExam, instructions: e.target.value })}
              placeholder="Contoh: Bacalah stimulus data dengan cermat sebelum menjawab essay..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50"
            />
          </div>

          {/* QUESTIONS LIST SECTION */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Daftar Butir Soal Essay ({editingExam.questions.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Setiap butir soal dapat dilengkapi tabel, grafik interaktif, gambar, kunci model, dan rubrik
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Import dari Word/PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingQuestion({
                      question: null,
                      idx: editingExam.questions.length,
                    })
                  }
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Soal Essay</span>
                </button>
              </div>
            </div>

            {/* Question cards */}
            <div className="space-y-3">
              {editingExam.questions.length > 0 ? (
                editingExam.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Soal Essay #{idx + 1}
                        </span>
                        {q.mediaType === 'table' && (
                          <span className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-medium">
                            <TableIcon className="h-3 w-3" /> Tabel Data
                          </span>
                        )}
                        {q.mediaType === 'chart' && (
                          <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                            <BarChart3 className="h-3 w-3" /> Grafik {q.chartData?.type}
                          </span>
                        )}
                        {q.mediaType === 'image' && (
                          <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                            <ImageIcon className="h-3 w-3" /> Gambar
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          Maks: {q.maxScore} Poin
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {q.prompt}
                      </p>
                      <div className="text-[11px] text-slate-400">
                        {q.rubric?.length || 0} Kriteria Rubrik Ditetapkan
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingQuestion({
                            question: q,
                            idx,
                          })
                        }
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Belum ada butir soal di paket ini.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Klik tombol "Tambah Soal Essay" untuk menulis manual, atau gunakan "Import Word/PDF" untuk mengekstrak 10 soal otomatis!
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      ) : (
        /* EXAM PACKAGES LIST CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                exam.isActive ? 'border-slate-200' : 'border-slate-200 opacity-75 bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                {/* Badge Subject & Code */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {exam.subject}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleActive(exam.id)}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        exam.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                      title={exam.isActive ? 'Klik untuk tutup ujian' : 'Klik untuk buka ujian'}
                    >
                      {exam.isActive ? 'Ujian Aktif' : 'Ditutup'}
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {exam.code}
                    </span>
                  </div>
                </div>

                {/* Exam Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{exam.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{exam.classGrade}</p>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{exam.questions.length} Soal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>{exam.durationMinutes} Menit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-emerald-500" />
                    <span>KKM {exam.passingGrade}</span>
                  </div>
                </div>

                {/* Media indicators */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>Elemen Media:</span>
                  {exam.questions.some((q) => q.mediaType === 'table') && (
                    <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                      <TableIcon className="h-3 w-3" /> Tabel
                    </span>
                  )}
                  {exam.questions.some((q) => q.mediaType === 'chart') && (
                    <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                      <BarChart3 className="h-3 w-3" /> Grafik
                    </span>
                  )}
                  {exam.questions.some((q) => q.mediaType === 'image') && (
                    <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                      <ImageIcon className="h-3 w-3" /> Gambar
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  {onOpenStudentAccess && (
                    <button
                      type="button"
                      onClick={onOpenStudentAccess}
                      className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg text-xs"
                      title="Scan QR Code / Bagikan Link ke HP Siswa"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDuplicateExam(exam)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs"
                    title="Duplikat paket soal ini"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {exams.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs"
                      title="Hapus paket soal ini"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingExam(exam);
                    setIsCreatingNew(false);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Kelola Soal</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUESTION EDITOR MODAL */}
      {editingQuestion && editingExam && (
        <QuestionEditorModal
          isOpen={true}
          questionNumber={editingQuestion.idx + 1}
          subject={editingExam.subject}
          initialQuestion={editingQuestion.question}
          onSave={handleSaveQuestion}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {/* DOCUMENT IMPORTER MODAL */}
      <DocumentImporterModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onImportComplete={(imported) => {
          onSaveExam(imported);
          setEditingExam(imported);
        }}
      />
    </div>
  );
};

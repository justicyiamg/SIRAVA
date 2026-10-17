import React, { useState, useEffect, useMemo } from 'react';
import { ExamPackage, Question, StudentSubmission, AnswerEvaluation } from '../../types/exam';
import { TableView } from '../visual/TableView';
import { InteractiveChart } from '../visual/InteractiveChart';
import { ImageView } from '../visual/ImageView';
import { addStudentSubmission, getStoredExams, fetchExamsFromServer } from '../../services/storage';
import {
  FileText,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
  GraduationCap,
  Sparkles,
  Award,
  ArrowRight,
  Printer,
  RotateCcw,
  Loader2,
  Smartphone,
  Wifi,
} from 'lucide-react';

interface StudentExamPortalProps {
  onSwitchToTeacher: () => void;
}

export const StudentExamPortal: React.FC<StudentExamPortalProps> = ({ onSwitchToTeacher }) => {
  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [examCodeInput, setExamCodeInput] = useState<string>('');

  // Student Info
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [studentClass, setStudentClass] = useState('XII IPA 1');

  // Exam Progress State
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<StudentSubmission | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load available exams from local cache and sync with server
  useEffect(() => {
    const applyExams = (loadedExams: ExamPackage[]) => {
      setExams(loadedExams);
      
      // Check if URL has direct exam or code parameter (from QR code scan or shared link)
      const searchParams = new URLSearchParams(window.location.search);
      const urlCodeOrId = searchParams.get('code') || searchParams.get('exam');
      
      if (urlCodeOrId) {
        const directMatch = loadedExams.find(
          (e) =>
            e.code.toUpperCase() === urlCodeOrId.trim().toUpperCase() ||
            e.id === urlCodeOrId.trim()
        );
        if (directMatch) {
          setSelectedExamId(directMatch.id);
          setExamCodeInput(directMatch.code);
          return;
        }
      }

      // Default selection
      if (!selectedExamId) {
        const active = loadedExams.find((e) => e.isActive) || loadedExams[0];
        if (active) {
          setSelectedExamId(active.id);
          setExamCodeInput(active.code);
        }
      }
    };

    // 1. Initial local load
    applyExams(getStoredExams());

    // 2. Fetch fresh live data from server (all student phones receive newest exams)
    fetchExamsFromServer().then((serverExams) => {
      if (serverExams && serverExams.length > 0) {
        applyExams(serverExams);
      }
    });

    // 3. Listen to data updates
    const onDataUpdated = () => {
      applyExams(getStoredExams());
    };
    window.addEventListener('sirava:data-updated', onDataUpdated);
    window.addEventListener('storage', onDataUpdated);
    return () => {
      window.removeEventListener('sirava:data-updated', onDataUpdated);
      window.removeEventListener('storage', onDataUpdated);
    };
  }, []);

  const activeExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // Handle Exam Selection via Code or Dropdown
  const handleSelectExamByCode = (code: string) => {
    setExamCodeInput(code);
    const match = exams.find((e) => e.code.toUpperCase() === code.trim().toUpperCase());
    if (match) {
      setSelectedExamId(match.id);
      setErrorMessage(null);
    }
  };

  // Timer Countdown
  useEffect(() => {
    if (!isExamStarted || timeLeftSeconds <= 0 || submissionResult) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, timeLeftSeconds, submissionResult]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Exam
  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentName.trim()) {
      setErrorMessage('Harap isi Nama Lengkap Siswa.');
      return;
    }
    if (!studentNumber.trim()) {
      setErrorMessage('Harap isi Nomor Induk / NIS / No. Absen.');
      return;
    }

    const matched = exams.find(
      (e) => e.id === selectedExamId || e.code.toUpperCase() === examCodeInput.trim().toUpperCase()
    );

    if (!matched) {
      setErrorMessage('Paket soal tidak ditemukan. Periksa kembali Kode Ujian.');
      return;
    }

    if (!matched.isActive) {
      setErrorMessage('Ujian ini saat ini sedang dinonaktifkan / ditutup oleh Guru.');
      return;
    }

    if (!matched.questions || matched.questions.length === 0) {
      setErrorMessage('Paket ujian ini belum memiliki butir soal.');
      return;
    }

    setSelectedExamId(matched.id);
    setTimeLeftSeconds(matched.durationMinutes * 60);
    setActiveQuestionIdx(0);
    setIsExamStarted(true);
  };

  // Submit and Grade with AI
  const handleSubmitExam = async () => {
    if (!activeExam) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    setErrorMessage(null);

    try {
      const answersPayload = activeExam.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id]?.trim() || '',
      }));

      // Call Gemini grading endpoint
      const response = await fetch('/api/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: activeExam.questions,
          answers: answersPayload,
          studentName,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Gagal memproses penilaian AI');
      }

      const { result } = await response.json();

      // Compile evaluated answers
      let totalRawScore = 0;
      let totalMaxPoints = 0;

      const evaluatedAnswers: AnswerEvaluation[] = activeExam.questions.map((q) => {
        const evalItem = result.evaluations?.find((ev: any) => ev.questionId === q.id);
        const awarded = evalItem ? Math.min(q.maxScore, Math.max(0, evalItem.scoreAwarded)) : 0;
        totalRawScore += awarded;
        totalMaxPoints += q.maxScore;

        return {
          questionId: q.id,
          studentAnswer: answers[q.id]?.trim() || '(Tidak ada jawaban)',
          aiScore: awarded,
          maxScore: q.maxScore,
          feedback: evalItem?.feedback || 'Jawaban telah dinilai.',
          criteriaBreakdown: evalItem?.criteriaBreakdown || [],
        };
      });

      const finalScaledScore = totalMaxPoints > 0 ? Math.round((totalRawScore / totalMaxPoints) * 100) : 0;
      const isPassed = finalScaledScore >= (activeExam.passingGrade || 75);

      const submission: StudentSubmission = {
        id: `sub_${Date.now()}`,
        examId: activeExam.id,
        examTitle: activeExam.title,
        subject: activeExam.subject,
        studentName: studentName.trim(),
        studentNumber: studentNumber.trim(),
        className: studentClass.trim(),
        submittedAt: new Date().toISOString(),
        answers: evaluatedAnswers,
        rawScore: totalRawScore,
        totalMaxPoints,
        totalScore: finalScaledScore,
        passingGrade: activeExam.passingGrade || 75,
        gradeStatus: isPassed ? 'Lulus' : 'Remedial',
        overallFeedback:
          result.overallFeedback ||
          `Hasil evaluasi essay siswa ${studentName} menunjukkan capaian skor ${finalScaledScore}/100.`,
      };

      // Save to persistent storage
      addStudentSubmission(submission);
      setSubmissionResult(submission);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi gangguan koneksi saat menilai jawaban essay.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to take another exam
  const handleResetPortal = () => {
    setIsExamStarted(false);
    setSubmissionResult(null);
    setAnswers({});
    setActiveQuestionIdx(0);
    setErrorMessage(null);
  };

  const answeredCount = activeExam
    ? activeExam.questions.filter((q) => answers[q.id]?.trim().length > 0).length
    : 0;
  const totalQuestions = activeExam?.questions.length || 0;
  const currentQ = activeExam?.questions[activeQuestionIdx];

  // 1. RESULT CARD VIEW (After submission)
  if (submissionResult && activeExam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        {/* Score Hero Banner */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div
            className={`p-8 text-white text-center relative ${
              submissionResult.gradeStatus === 'Lulus'
                ? 'bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-800'
                : 'bg-linear-to-r from-amber-700 via-orange-700 to-amber-800'
            }`}
          >
            <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
              <Award className="h-8 w-8 text-amber-300" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {submissionResult.gradeStatus === 'Lulus' ? 'Selamat! Anda Tuntas' : 'Ujian Telah Dinilai'}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-lg mx-auto">
              {submissionResult.examTitle} • {submissionResult.subject}
            </p>

            {/* Score Circle */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white text-slate-900 shadow-2xl flex flex-col items-center justify-center border-4 border-white/40">
                <span className="text-4xl font-black text-indigo-900 tracking-tight">
                  {submissionResult.totalScore}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Skor / 100</span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                  Status: {submissionResult.gradeStatus} (KKM {submissionResult.passingGrade})
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                  Poin Mentah: {submissionResult.rawScore} / {submissionResult.totalMaxPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Student Meta Info */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400 block font-medium">Nama Siswa:</span>
                <strong className="text-slate-800 text-sm">{submissionResult.studentName}</strong>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block font-medium">NIS / No Absen:</span>
                <strong className="text-slate-800 text-sm">{submissionResult.studentNumber}</strong>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block font-medium">Kelas:</span>
                <strong className="text-slate-800 text-sm">{submissionResult.className}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold shadow-2xs"
              >
                <Printer className="h-3.5 w-3.5" /> Cetak Hasil
              </button>
              <button
                onClick={handleResetPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold shadow-2xs"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Ujian Lainnya
              </button>
            </div>
          </div>

          {/* Overall AI Feedback */}
          <div className="p-6 border-b border-slate-200 bg-indigo-50/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Catatan Evaluasi Pedagogis AI
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {submissionResult.overallFeedback}
            </p>
          </div>

          {/* Detailed Question Review */}
          <div className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Rincian Penilaian Essay per Butir Soal:
            </h3>

            {submissionResult.answers.map((ans, idx) => {
              const originalQ = activeExam.questions.find((q) => q.id === ans.questionId);
              const isFullScore = ans.aiScore === ans.maxScore;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">Soal Nomor {idx + 1}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isFullScore
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : ans.aiScore >= ans.maxScore * 0.7
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        Skor: {ans.aiScore} / {ans.maxScore} Poin
                      </span>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  {originalQ && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-500 block mb-1">Pertanyaan:</span>
                      <p className="font-medium text-slate-900">{originalQ.prompt}</p>
                    </div>
                  )}

                  {/* Student Answer */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-500 block mb-1">Jawaban Anda:</span>
                    <p className="text-slate-800 whitespace-pre-line leading-relaxed font-mono">
                      {ans.studentAnswer}
                    </p>
                  </div>

                  {/* Feedback & Criteria Breakdown */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2">
                    <div className="text-xs text-indigo-950">
                      <span className="font-bold block mb-1">Ulasan Evaluator AI:</span>
                      <p className="leading-relaxed">{ans.feedback}</p>
                    </div>

                    {ans.criteriaBreakdown && ans.criteriaBreakdown.length > 0 && (
                      <div className="pt-2 border-t border-indigo-100/70">
                        <span className="text-[11px] font-bold text-indigo-900 block mb-1.5">
                          Poin Berdasarkan Rubrik:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ans.criteriaBreakdown.map((cr, cIdx) => (
                            <div
                              key={cIdx}
                              className="bg-white p-2.5 rounded-lg border border-indigo-100 text-[11px] flex items-start justify-between gap-2"
                            >
                              <div>
                                <span className="font-semibold text-slate-800 block">{cr.criteria}</span>
                                <span className="text-slate-500 text-[10px]">{cr.notes}</span>
                              </div>
                              <span className="font-bold text-indigo-700 shrink-0 font-mono">
                                {cr.scoreAwarded}/{cr.maxPoints}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. EXAM ROOM IN PROGRESS VIEW
  if (isExamStarted && activeExam && currentQ) {
    return (
      <div className="min-h-screen bg-slate-100 pb-12">
        {/* Sticky Exam Room Header */}
        <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold leading-tight truncate max-w-xs sm:max-w-md">
                  {activeExam.title}
                </h1>
                <p className="text-[11px] text-slate-400">
                  {activeExam.subject} • {studentName} ({studentNumber})
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-xs ${
                  timeLeftSeconds < 300
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kumpulkan Ujian</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Active Question Panel (Order 1 on mobile for instant visibility) */}
          <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
            {/* Quick Mobile Question Pill Scroller (Visible on mobile screens) */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Soal:
              </span>
              {activeExam.questions.map((q, idx) => {
                const isAnswered = (answers[q.id] || '').trim().length > 0;
                const isCurrent = idx === activeQuestionIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all border ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    #{idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                    {activeQuestionIdx + 1}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Soal Essay #{activeQuestionIdx + 1} dari {totalQuestions}
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      Bobot Maksimal: {currentQ.maxScore} Poin
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {answers[currentQ.id]?.trim() ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Tersimpan</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[11px]">
                      Belum Dijawab
                    </span>
                  )}
                </div>
              </div>

              {/* Prompt Text */}
              <div className="text-sm text-slate-900 leading-relaxed font-medium bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {currentQ.prompt}
              </div>

              {/* Question Media if exists */}
              {currentQ.mediaType === 'table' && currentQ.tableData && (
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <TableView data={currentQ.tableData} />
                </div>
              )}
              {currentQ.mediaType === 'chart' && currentQ.chartData && (
                <InteractiveChart data={currentQ.chartData} />
              )}
              {currentQ.mediaType === 'image' && currentQ.imageData && (
                <ImageView data={currentQ.imageData} />
              )}

              {/* Student Essay Input Box */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ketik Jawaban Essay Anda di Sini:
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {(answers[currentQ.id] || '').trim().split(/\s+/).filter(Boolean).length} kata •{' '}
                    {(answers[currentQ.id] || '').length} karakter
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={answers[currentQ.id] || ''}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQ.id]: e.target.value,
                    })
                  }
                  placeholder="Uraikan jawaban Anda secara komprehensif, terstruktur, dan didukung argumen ilmiah..."
                  className="w-full text-base sm:text-sm p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 leading-relaxed bg-white shadow-2xs font-sans min-h-[160px]"
                />
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  disabled={activeQuestionIdx === 0}
                  onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Soal Sebelumnya</span><span className="sm:hidden">Sebelumnya</span>
                </button>

                {activeQuestionIdx < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveQuestionIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="flex items-center gap-1 px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all"
                  >
                    <span>Soal Berikutnya</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>Selesai & Kumpulkan Ujian</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator Side Panel (Sidebar on desktop, below on mobile) */}
          <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                <span>Daftar Butir Soal</span>
                <span className="text-[11px] font-medium text-slate-500">
                  {answeredCount}/{totalQuestions} Terjawab
                </span>
              </h3>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-5 gap-2">
                {activeExam.questions.map((q, idx) => {
                  const isAnswered = (answers[q.id] || '').trim().length > 0;
                  const isCurrent = idx === activeQuestionIdx;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`h-10 rounded-xl font-bold text-xs transition-all border flex items-center justify-center ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                          : isAnswered
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-indigo-600" />
                  <span>Sedang Dibuka</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                  <span>Sudah Dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
                  <span>Belum Dijawab</span>
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-indigo-950">
                <HelpCircle className="h-4 w-4 text-indigo-600" /> Petunjuk Guru
              </span>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                {activeExam.instructions}
              </p>
            </div>
          </div>
        </main>

        {/* Submit Confirmation Dialog */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kumpulkan Jawaban Ujian?</h3>
                  <p className="text-xs text-slate-500">
                    Periksa kembali sebelum mengirimkan ujian ke evaluator AI
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Soal:</span>
                  <span className="font-bold text-slate-900">{totalQuestions} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sudah Dijawab:</span>
                  <span className="font-bold text-emerald-600">{answeredCount} Soal</span>
                </div>
                {totalQuestions - answeredCount > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold pt-1 border-t border-slate-200">
                    <span>Belum Dijawab:</span>
                    <span>{totalQuestions - answeredCount} Soal Kosong</span>
                  </div>
                )}
              </div>

              {isSubmitting ? (
                <div className="text-center py-4 space-y-2">
                  <Loader2 className="h-7 w-7 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    Evaluator AI sedang mengoreksi & menganalisis jawaban essay Anda...
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Lanjutkan Menjawab
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Ya, Kumpulkan Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. STUDENT PORTAL WELCOME & EXAM PICKER SCREEN
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fadeIn">
      {/* Hero Welcome Card */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
            Portal Ujian Siswa
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ruang Pengerjaan Ujian Essay & Penilaian Instan
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-2 leading-relaxed">
            Pilih paket soal yang dibuka oleh guru Anda atau masukkan kode ujian untuk mulai mengerjakan.
            Jawaban Anda akan langsung dikoreksi oleh AI sesuai rubrik penilaian guru!
          </p>
        </div>
      </div>

      {/* Login & Exam Entry Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Identitas Peserta Ujian
          </h2>

          <form onSubmit={handleStartExam} className="space-y-4">
            {/* Live Server Sync Badge */}
            <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/80 px-3.5 py-2 rounded-xl text-[11px] text-emerald-800">
              <span className="flex items-center gap-1.5 font-semibold">
                <Wifi className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span>Terhubung ke Server Ujian Cloud</span>
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-300 font-bold text-emerald-700">
                Akses HP Siap
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full text-base sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  NIS / No. Absen
                </label>
                <input
                  type="text"
                  required
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="Contoh: 10423 atau No. Absen 18"
                  className="w-full text-base sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 min-h-[42px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kelas
              </label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full text-base sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 min-h-[42px]"
              >
                <option value="X MIPA 1">X MIPA 1</option>
                <option value="X MIPA 2">X MIPA 2</option>
                <option value="XI MIPA 1">XI MIPA 1</option>
                <option value="XI IPS 1">XI IPS 1</option>
                <option value="XII IPA 1">XII IPA 1</option>
                <option value="XII IPS 1">XII IPS 1</option>
                <option value="Kelas Umum">Kelas Umum</option>
              </select>
            </div>

            {/* Exam Selector */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Pilih Paket Ujian yang Aktif
              </label>

              <div className="space-y-2">
                {exams.filter((e) => e.isActive).length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                    Belum ada paket ujian yang diaktifkan guru. Silakan hubungi guru pengajar atau buka Dashboard Guru untuk mengaktifkan paket ujian.
                  </div>
                ) : (
                  exams.filter((e) => e.isActive).map((exam) => (
                    <label
                      key={exam.id}
                      className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedExamId === exam.id
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="examSelection"
                          checked={selectedExamId === exam.id}
                          onChange={() => {
                            setSelectedExamId(exam.id);
                            setExamCodeInput(exam.code);
                          }}
                          className="mt-1 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{exam.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="font-semibold text-indigo-700">{exam.subject}</span>
                            <span>•</span>
                            <span>{exam.questions.length} Butir Soal</span>
                            <span>•</span>
                            <span>Durasi {exam.durationMinutes} Menit</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shrink-0 ml-2">
                        {exam.code}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Or enter code manually */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-slate-500 font-medium">Atau cari kode:</span>
              <input
                type="text"
                value={examCodeInput}
                onChange={(e) => handleSelectExamByCode(e.target.value)}
                placeholder="cth: BIO-101"
                className="w-36 text-base sm:text-xs font-mono uppercase px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all mt-4 cursor-pointer"
            >
              <span>Mulai Pengerjaan Ujian</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Info Card */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-indigo-600" />
              Kompatibilitas HP Siswa
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Bisa dibuka langsung di Android & iPhone via Chrome atau Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Tanpa perlu login akun Google dan tanpa perlu menginstal aplikasi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Jawaban essay otomatis dikoreksi instan dengan evaluator AI.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs space-y-2 text-xs">
            <span className="font-bold block text-slate-200">Akses Pengajar / Guru</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Guru dapat mengedit soal, import soal dari Word/PDF, dan melihat rekapitulasi nilai siswa di Dashboard Guru.
            </p>
            <button
              type="button"
              onClick={onSwitchToTeacher}
              className="w-full mt-2 py-2 px-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              Masuk ke Dashboard Guru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

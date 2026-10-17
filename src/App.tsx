import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { StudentExamPortal } from './components/student/StudentExamPortal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherPinModal } from './components/teacher/TeacherPinModal';
import { StudentAccessModal } from './components/common/StudentAccessModal';
import {
  getStoredExams,
  getStoredSubmissions,
  fetchExamsFromServer,
  fetchSubmissionsFromServer,
  saveExamToServer,
  deleteExamFromServer,
  toggleExamActiveServer,
  deleteSubmissionFromServer,
  resetAllToDefault,
} from './services/storage';
import { ExamPackage, StudentSubmission } from './types/exam';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'student' | 'teacher'>('student');
  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isStudentAccessModalOpen, setIsStudentAccessModalOpen] = useState(false);

  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // Function to reload data from server and local storage
  const syncData = useCallback(async () => {
    // 1. Instant local read
    setExams(getStoredExams());
    setSubmissions(getStoredSubmissions());

    // 2. Fresh server sync
    try {
      const [serverExams, serverSubs] = await Promise.all([
        fetchExamsFromServer(),
        fetchSubmissionsFromServer(),
      ]);
      if (serverExams) setExams(serverExams);
      if (serverSubs) setSubmissions(serverSubs);
    } catch (e) {
      // ignore
    }
  }, []);

  // Check URL parameters on mount (?view=student or ?code=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'student' || params.has('code') || params.has('exam')) {
      setCurrentView('student');
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    syncData();
  }, [syncData]);

  // Periodic polling (every 6 seconds) so teacher sees real-time student submissions from mobile phones
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubmissionsFromServer().then((subs) => {
        if (subs) setSubmissions(subs);
      });
      fetchExamsFromServer().then((exs) => {
        if (exs) setExams(exs);
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Listen to custom data updated events
  useEffect(() => {
    const handleUpdated = () => {
      setExams(getStoredExams());
      setSubmissions(getStoredSubmissions());
    };
    window.addEventListener('sirava:data-updated', handleUpdated);
    window.addEventListener('storage', handleUpdated);
    window.addEventListener('focus', syncData);
    return () => {
      window.removeEventListener('sirava:data-updated', handleUpdated);
      window.removeEventListener('storage', handleUpdated);
      window.removeEventListener('focus', syncData);
    };
  }, [syncData]);

  // Handle switching to Teacher View
  const handleSelectTeacherView = () => {
    if (isTeacherUnlocked) {
      setCurrentView('teacher');
    } else {
      setIsPinModalOpen(true);
    }
  };

  const handlePinSuccess = () => {
    setIsTeacherUnlocked(true);
    setIsPinModalOpen(false);
    setCurrentView('teacher');
  };

  // Lock teacher dashboard
  const handleLockTeacher = () => {
    setIsTeacherUnlocked(false);
    setCurrentView('student');
  };

  // Save updated or new exam (persists to server & local)
  const handleSaveExam = async (savedExam: ExamPackage) => {
    const existingIdx = exams.findIndex((e) => e.id === savedExam.id);
    let updated: ExamPackage[];
    if (existingIdx >= 0) {
      updated = [...exams];
      updated[existingIdx] = savedExam;
    } else {
      updated = [savedExam, ...exams];
    }
    setExams(updated);
    await saveExamToServer(savedExam);
  };

  // Delete an exam
  const handleDeleteExam = async (examId: string) => {
    if (window.confirm('Yakin ingin menghapus paket soal ini? Submisi terkait akan tetap tersimpan di rekapitulasi.')) {
      const updated = exams.filter((e) => e.id !== examId);
      setExams(updated);
      await deleteExamFromServer(examId);
    }
  };

  // Toggle active status of exam
  const handleToggleActive = async (examId: string) => {
    const updated = exams.map((e) => (e.id === examId ? { ...e, isActive: !e.isActive } : e));
    setExams(updated);
    await toggleExamActiveServer(examId);
  };

  // Delete a student submission
  const handleDeleteSubmission = async (submissionId: string) => {
    if (window.confirm('Hapus data nilai siswa ini dari rekapitulasi?')) {
      const updated = submissions.filter((s) => s.id !== submissionId);
      setSubmissions(updated);
      await deleteSubmissionFromServer(submissionId);
    }
  };

  // Reset sample demo data
  const handleResetData = async () => {
    if (window.confirm('Muat ulang data contoh soal (Biologi, Ekonomi, dll) beserta rekapitulasi nilai bawaan?')) {
      await resetAllToDefault();
      setExams(getStoredExams());
      setSubmissions(getStoredSubmissions());
      setIsTeacherUnlocked(false);
      setCurrentView('student');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-indigo-600 selection:text-white">
      <div>
        {/* Main Header */}
        <Header
          currentView={currentView}
          isTeacherUnlocked={isTeacherUnlocked}
          onSelectStudent={() => setCurrentView('student')}
          onSelectTeacher={handleSelectTeacherView}
          onOpenStudentAccess={() => setIsStudentAccessModalOpen(true)}
          examCount={exams.length}
          submissionCount={submissions.length}
        />

        {/* View Switcher Container */}
        {currentView === 'student' ? (
          <StudentExamPortal onSwitchToTeacher={handleSelectTeacherView} />
        ) : (
          <TeacherDashboard
            exams={exams}
            submissions={submissions}
            onSaveExam={handleSaveExam}
            onDeleteExam={handleDeleteExam}
            onToggleActive={handleToggleActive}
            onDeleteSubmission={handleDeleteSubmission}
            onLockTeacher={handleLockTeacher}
            onSwitchToStudent={() => setCurrentView('student')}
            onOpenStudentAccess={() => setIsStudentAccessModalOpen(true)}
          />
        )}
      </div>

      {/* Teacher PIN Modal */}
      <TeacherPinModal
        isOpen={isPinModalOpen}
        onSuccess={handlePinSuccess}
        onCancel={() => setIsPinModalOpen(false)}
      />

      {/* Student HP Access & QR Modal */}
      <StudentAccessModal
        isOpen={isStudentAccessModalOpen}
        onClose={() => setIsStudentAccessModalOpen(false)}
        exams={exams}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SIRAVA • Platform Evaluasi Ujian Essay Interaktif Guru & Siswa</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              title="Reset contoh soal & rekapitulasi ke awal"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Data Contoh</span>
            </button>
            <span className="text-slate-300">•</span>
            <span>Didukung Evaluator Gemini Flash AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

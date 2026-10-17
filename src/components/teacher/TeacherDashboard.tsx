import React, { useState } from 'react';
import { ExamPackage, StudentSubmission } from '../../types/exam';
import { TeacherExamManager } from './TeacherExamManager';
import { TeacherGradeRecap } from './TeacherGradeRecap';
import { ChangePinModal } from './ChangePinModal';
import {
  Users,
  Layers,
  KeyRound,
  Lock,
  LogOut,
  GraduationCap,
  ShieldCheck,
  Settings,
  Sparkles,
  Smartphone,
  QrCode,
} from 'lucide-react';

interface TeacherDashboardProps {
  exams: ExamPackage[];
  submissions: StudentSubmission[];
  onSaveExam: (exam: ExamPackage) => void;
  onDeleteExam: (examId: string) => void;
  onToggleActive: (examId: string) => void;
  onDeleteSubmission: (submissionId: string) => void;
  onLockTeacher: () => void;
  onSwitchToStudent: () => void;
  onOpenStudentAccess?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  exams,
  submissions,
  onSaveExam,
  onDeleteExam,
  onToggleActive,
  onDeleteSubmission,
  onLockTeacher,
  onSwitchToStudent,
  onOpenStudentAccess,
}) => {
  const [activeTab, setActiveTab] = useState<'recap' | 'exams' | 'settings'>('recap');
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Teacher Navigation & Sub-header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold">Dashboard Guru</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Terautentikasi (PIN Aktif)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pengelolaan Bank Soal Essay, Evaluasi AI Otomatis, dan Rekap Nilai Siswa
            </p>
          </div>
        </div>

        {/* Tab Controls & Lock */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('recap')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'recap'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Rekap Nilai Siswa ({submissions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'exams'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Bank Soal ({exams.length})</span>
            </button>
          </div>

          {onOpenStudentAccess && (
            <button
              type="button"
              onClick={onOpenStudentAccess}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Tampilkan QR Code & Bagikan Link Ujian ke HP Siswa"
            >
              <Smartphone className="h-3.5 w-3.5 text-amber-300" />
              <span>Akses HP Siswa</span>
              <span className="text-[10px] bg-indigo-800/80 text-indigo-200 px-1.5 py-0.5 rounded-md font-mono">
                QR
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsChangePinOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            title="Ubah PIN Guru"
          >
            <KeyRound className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ubah PIN</span>
          </button>

          <button
            type="button"
            onClick={onLockTeacher}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 rounded-xl text-xs font-semibold border border-red-800/40 transition-colors"
            title="Kunci Dashboard Guru"
          >
            <Lock className="h-3.5 w-3.5 text-red-400" />
            <span>Kunci</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToStudent}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 rounded-xl text-xs font-semibold border border-indigo-400/30 transition-colors"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Ke Portal Siswa</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'recap' && (
        <TeacherGradeRecap
          exams={exams}
          submissions={submissions}
          onDeleteSubmission={onDeleteSubmission}
        />
      )}

      {activeTab === 'exams' && (
        <TeacherExamManager
          exams={exams}
          onSaveExam={onSaveExam}
          onDeleteExam={onDeleteExam}
          onToggleActive={onToggleActive}
          onOpenStudentAccess={onOpenStudentAccess}
        />
      )}

      {/* Change PIN Modal */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
      />
    </div>
  );
};

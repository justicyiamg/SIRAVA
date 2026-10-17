import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  BookOpen,
  Smartphone,
  QrCode,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'student' | 'teacher';
  isTeacherUnlocked: boolean;
  onSelectStudent: () => void;
  onSelectTeacher: () => void;
  onOpenStudentAccess?: () => void;
  examCount: number;
  submissionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  isTeacherUnlocked,
  onSelectStudent,
  onSelectTeacher,
  onOpenStudentAccess,
  examCount,
  submissionCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                SI<span className="text-indigo-600">RAVA</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI Essay Evaluation
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Ujian Essay • Rubrik Analitis • Rekapitulasi Real-Time
            </p>
          </div>
        </div>

        {/* Right side controls: Access HP button & View Switcher */}
        <div className="flex items-center gap-2">
          {onOpenStudentAccess && (
            <button
              type="button"
              onClick={onOpenStudentAccess}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all shadow-2xs cursor-pointer"
              title="Bagikan Link / QR Code Ujian ke HP Siswa"
            >
              <Smartphone className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">Akses HP Siswa</span>
              <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-1.5 py-0.5 rounded-md font-mono">
                QR
              </span>
            </button>
          )}

          {/* View Switcher (Siswa vs Guru) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={onSelectStudent}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'student'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              <span className="hidden xs:inline">Siswa</span>
              <span className="hidden md:inline">Portal</span>
            </button>

            <button
              type="button"
              onClick={onSelectTeacher}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'teacher'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {isTeacherUnlocked ? (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <Lock className="h-4 w-4 text-slate-400" />
              )}
              <span className="hidden xs:inline">Guru</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

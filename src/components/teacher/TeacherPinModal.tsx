import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getTeacherSettings } from '../../services/storage';

interface TeacherPinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TeacherPinModal: React.FC<TeacherPinModalProps> = ({ isOpen, onSuccess, onCancel }) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = getTeacherSettings();
    if (pinInput.trim() === settings.pin) {
      setErrorMsg(null);
      setPinInput('');
      onSuccess();
    } else {
      setErrorMsg('PIN yang Anda masukkan salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white text-center relative">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-3 text-indigo-300">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">Verifikasi Akses Guru</h2>
          <p className="text-xs text-slate-300 mt-1">
            Masukkan PIN pengaman untuk mengelola bank soal & rekapitulasi nilai
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleVerifyPin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              PIN Guru
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg(null);
                }}
                autoFocus
                placeholder="Masukkan PIN (Default: 1234)"
                className="w-full text-center text-lg tracking-widest font-mono py-2.5 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 flex items-start gap-2">
            <KeyRound className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Petunjuk:</span>
              <span>PIN bawaan pertama kali adalah <strong className="font-mono text-indigo-700">1234</strong>. Anda dapat mengubah PIN ini kapan saja di menu Pengaturan Guru.</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Kembali ke Siswa
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Buka Dashboard Guru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

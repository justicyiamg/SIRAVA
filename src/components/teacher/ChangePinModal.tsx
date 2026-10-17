import React, { useState } from 'react';
import { KeyRound, ShieldCheck, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTeacherSettings, saveTeacherSettings } from '../../services/storage';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPinChanged?: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose, onPinChanged }) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const currentSettings = getTeacherSettings();

    if (oldPin !== currentSettings.pin) {
      setErrorMsg('PIN Lama tidak sesuai dengan data tersimpan.');
      return;
    }

    if (newPin.trim().length < 4) {
      setErrorMsg('PIN Baru minimal 4 karakter (angka/kombinasi).');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN Baru tidak cocok.');
      return;
    }

    // Save updated PIN
    saveTeacherSettings({
      ...currentSettings,
      pin: newPin.trim(),
    });

    setSuccessMsg('PIN Guru berhasil diubah! Gunakan PIN baru ini untuk login berikutnya.');
    setTimeout(() => {
      onPinChanged?.();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Ubah PIN Pengaman Guru</h3>
              <p className="text-xs text-slate-400">Amankan akses bank soal dan rekapitulasi nilai Anda</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              PIN Lama Saat Ini
            </label>
            <input
              type="password"
              maxLength={8}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="Masukkan PIN saat ini (cth: 1234)"
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              PIN Baru
            </label>
            <input
              type="password"
              maxLength={8}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Masukkan PIN baru (min 4 digit)"
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ulangi / Konfirmasi PIN Baru
            </label>
            <input
              type="password"
              maxLength={8}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Ulangi PIN baru"
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50"
              required
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Simpan PIN Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

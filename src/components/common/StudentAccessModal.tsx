import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  X,
  QrCode,
  Share2,
  Info,
  ShieldCheck,
  Sparkles,
  Download,
} from 'lucide-react';
import { ExamPackage } from '../../types/exam';
import { getPublicStudentUrl } from '../../services/storage';

interface StudentAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: ExamPackage[];
  selectedExamId?: string;
}

export const StudentAccessModal: React.FC<StudentAccessModalProps> = ({
  isOpen,
  onClose,
  exams,
  selectedExamId,
}) => {
  const [activeExamId, setActiveExamId] = useState<string>(selectedExamId || '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isDevEnvironment, setIsDevEnvironment] = useState(false);

  // Set default active exam
  useEffect(() => {
    if (selectedExamId) {
      setActiveExamId(selectedExamId);
    } else if (exams.length > 0 && !activeExamId) {
      const active = exams.find((e) => e.isActive) || exams[0];
      if (active) setActiveExamId(active.id);
    }
  }, [selectedExamId, exams]);

  // Check if current host is dev
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDevEnvironment(window.location.hostname.includes('ais-dev-'));
    }
  }, []);

  // Compute public student URL
  const selectedExam = exams.find((e) => e.id === activeExamId);
  const examCode = selectedExam?.code;
  const studentUrl = getPublicStudentUrl(examCode);

  // Generate QR code whenever studentUrl changes
  useEffect(() => {
    if (!isOpen || !studentUrl) return;

    QRCode.toDataURL(studentUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e1b4b', // deep indigo
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [isOpen, studentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(studentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Ujian-SIRAVA-${examCode || 'Portal'}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-indigo-700 via-indigo-800 to-purple-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Akses Ujian di HP Siswa</h2>
              <p className="text-xs text-indigo-200">
                Scan QR Code atau bagikan link untuk pengerjaan ujian di smartphone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Environment alert if dev URL was detected */}
          {isDevEnvironment && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-emerald-900">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950">
                  Mode Publik Aktif untuk Siswa
                </p>
                <p className="mt-0.5 text-emerald-800 leading-relaxed text-[11px]">
                  Link & QR Code di bawah menggunakan URL Publik (<span className="font-mono font-semibold">ais-pre-</span>). HP siswa <strong>TIDAK PERLU login Google</strong> dan bisa langsung mengerjakan soal di browser (Chrome/Safari).
                </p>
              </div>
            </div>
          )}

          {/* Exam Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Paket Ujian yang Dibagikan:
            </label>
            <select
              value={activeExamId}
              onChange={(e) => setActiveExamId(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  [{exam.code}] {exam.title} ({exam.subject} - {exam.classGrade}) {exam.isActive ? '• AKTIF' : '• NONAKTIF'}
                </option>
              ))}
            </select>
          </div>

          {/* QR Code Container */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-indigo-600" /> Arahkan Kamera HP Siswa ke Sini
            </span>

            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block mb-3">
                <img
                  src={qrDataUrl}
                  alt="QR Code Ujian Siswa"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-400 text-xs">
                Membuat QR Code...
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600" />
                <span>Unduh Gambar QR</span>
              </button>
              <a
                href={studentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Tes Buka Tab</span>
              </a>
            </div>
          </div>

          {/* Link Box & Copy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Atau Bagikan Link Langsung ke WhatsApp / Grup Kelas:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={studentUrl}
                className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions for students */}
          <div className="bg-slate-100/70 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-indigo-600" />
              Petunjuk untuk Siswa di HP:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-600">
              <li>Buka kamera smartphone atau aplikasi pembaca QR, lalu scan barcode di atas.</li>
              <li>Atau ketik/klik link ujian yang dibagikan guru ke browser HP (Chrome, Safari, dll).</li>
              <li>Masukkan <strong>Nama Lengkap</strong> dan <strong>NIS / Nomor Absen</strong>.</li>
              <li>Kerjakan soal essay interaktif dan tekan tombol <strong>Kumpulkan</strong> jika sudah selesai.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

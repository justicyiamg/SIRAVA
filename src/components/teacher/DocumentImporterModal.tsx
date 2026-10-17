import React, { useState } from 'react';
import { ExamPackage, Question } from '../../types/exam';
import { TableView } from '../visual/TableView';
import { InteractiveChart } from '../visual/InteractiveChart';
import { ImageView } from '../visual/ImageView';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  Table as TableIcon,
  BarChart3,
  Image as ImageIcon,
  Loader2,
  Copy,
} from 'lucide-react';

interface DocumentImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedExam: ExamPackage) => void;
}

export const DocumentImporterModal: React.FC<DocumentImporterModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedExam, setParsedExam] = useState<ExamPackage | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  // Preset sample text with 5 full essay questions containing a Table, a Chart, and a Diagram for quick instant testing!
  const loadSampleDocText = () => {
    setPastedText(`UJIAN PENILAIAN HARIAN BERSAMA
Mata Pelajaran: Ilmu Pengetahuan Alam (Fisika & Lingkungan)
Kelas: XI MIPA
Waktu: 60 Menit

SOAL ESSAY:

1. Perhatikan data efisiensi panel surya berdasarkan sudut kemiringan terhadap matahari pada tabel berikut:
Tabel: Efisiensi Daya Panel Surya Fotovoltaik
Sudut Kemiringan (derajat) | Jam 09.00 (Watt) | Jam 12.00 (Watt) | Jam 15.00 (Watt)
15 Derajat | 120 | 250 | 140
30 Derajat | 160 | 320 | 190
45 Derajat | 140 | 290 | 170
Berdasarkan data tabel di atas, analisislah pada sudut kemiringan berapa penyerapan daya panel surya paling optimal di wilayah Indonesia dan jelaskan mengapa sudut tersebut menghasilkan daya tertinggi!

2. Grafik Pertumbuhan Emisi Karbon Sektor Industri (Tahun 2019-2024):
Tahun: 2019, 2020, 2021, 2022, 2023, 2024
Emisi (Juta Ton CO2): 140, 115, 130, 155, 175, 190
Analisislah tren grafik emisi karbon tersebut. Mengapa pada tahun 2020 terjadi penurunan emisi yang signifikan, dan apa solusi teknologi ramah lingkungan yang paling efektif untuk menekan lonjakan emisi di tahun 2024?

3. Jelaskan prinsip kerja efek rumah kaca alami bagi kelangsungan suhu bumi dan bandingkan perbedaannya dengan pemanasan global akibat aktivitas antropogenik manusia!

4. Jelaskan hukum Termodinamika I (Kekekalan Energi) dalam konteks siklus mesin pendingin (refrigerator) beserta pelepasan kalor ke lingkungan sekitar!

5. Berdasarkan konsep energi terbarukan, buatlah analisis komparasi antara PLTA (Pembangkit Listrik Tenaga Air) dan PLTB (Pembangkit Listrik Tenaga Bayu/Angin) ditinjau dari aspek keandalan pasokan energi dan dampak ekologis habitat sungai!`);
  };

  const handleProcessDocument = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Membaca berkas dokumen...');

    try {
      let payload: any = {};

      if (activeTab === 'upload' && selectedFile) {
        setLoadingStep(`Mengekstrak data dari file: ${selectedFile.name}...`);
        const reader = new FileReader();

        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // Strip data:prefix;base64,
            const base64 = result.split(',')[1] || result;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        payload = {
          fileBase64: base64Data,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
        };
      } else if (activeTab === 'paste' && pastedText.trim()) {
        payload = {
          textContent: pastedText.trim(),
        };
      } else {
        throw new Error('Silakan pilih file Word/PDF atau tempelkan teks naskah soal.');
      }

      setLoadingStep('AI menganalisis butir soal, tabel, grafik & rubrik...');

      const response = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Gagal memproses dokumen');
      }

      setLoadingStep('Menyusun struktur paket ujian & rubrik...');
      const result = await response.json();
      const docData = result.data;

      // Transform into ExamPackage format
      const newExam: ExamPackage = {
        id: `exam_${Date.now()}`,
        code: `${(docData.subject || 'SOAL').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        title: docData.examTitle || 'Paket Ujian Hasil Import',
        subject: docData.subject || 'Mata Pelajaran',
        classGrade: docData.gradeLevel || 'Kelas Umum',
        durationMinutes: docData.durationMinutes || 60,
        passingGrade: 75,
        instructions:
          'Jawablah pertanyaan-pertanyaan essay berikut secara komprehensif, logis, dan teliti berdasarkan stimulus data yang disediakan.',
        isActive: true,
        showResultsImmediately: true,
        createdAt: new Date().toISOString(),
        questions: (docData.questions || []).map((q: any, idx: number) => ({
          id: `q_${Date.now()}_${idx + 1}`,
          questionNumber: q.questionNumber || idx + 1,
          prompt: q.prompt,
          maxScore: q.maxScore || 10,
          mediaType: q.mediaType || (q.tableData ? 'table' : q.chartData ? 'chart' : q.imageData ? 'image' : 'none'),
          tableData: q.tableData,
          chartData: q.chartData,
          imageData: q.imageData,
          modelAnswer: q.modelAnswer || 'Kunci jawaban belum diset.',
          rubric: q.rubric || [
            {
              criteria: 'Ketepatan Konsep Dasar',
              points: Math.floor((q.maxScore || 10) * 0.5),
              description: 'Memahami teori dan prinsip utama.',
            },
            {
              criteria: 'Analisis & Argumen Logis',
              points: Math.ceil((q.maxScore || 10) * 0.5),
              description: 'Menyajikan data dan kesimpulan yang kuat.',
            },
          ],
        })),
      };

      setParsedExam(newExam);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses dokumen.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSaveToExamBank = () => {
    if (parsedExam) {
      onImportComplete(parsedExam);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-indigo-900 to-indigo-800 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-700/60 rounded-xl border border-indigo-400/30">
              <Sparkles className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import Soal Otomatis via AI</h2>
              <p className="text-xs text-indigo-200">
                Otomatis konversi file PDF / Word (.docx) menjadi soal essay lengkap dengan tabel, grafik, dan rubrik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {!parsedExam ? (
            <>
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'upload'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Upload Berkas (Word .docx / PDF)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'paste'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileCode className="h-4 w-4" />
                  Salin & Tempel Teks Naskah Soal
                </button>
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl bg-indigo-50/30 p-8 text-center transition-all">
                    <input
                      type="file"
                      id="docFileInput"
                      accept=".docx,.doc,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="docFileInput"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                    >
                      <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-600">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800">
                          {selectedFile ? selectedFile.name : 'Pilih atau Tarik File Word (.docx) / PDF ke sini'}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          Mendukung dokumen naskah soal lengkap (semua butir soal, tabel data, dan grafik diekstrak)
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700">
                        <Upload className="h-3.5 w-3.5" />
                        Pilih Berkas Komputer
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span>💡 Ingin mencoba tanpa upload file sekarang?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('paste');
                        loadSampleDocText();
                      }}
                      className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      Muat Contoh Teks Soal (5 Butir + Tabel & Grafik)
                    </button>
                  </div>
                </div>
              )}

              {/* Paste Text Tab */}
              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Tempelkan Teks Soal Lengkap di Sini
                    </label>
                    <button
                      type="button"
                      onClick={loadSampleDocText}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Gunakan Naskah Uji Coba Otomatis
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Tempelkan naskah ujian atau kuis Anda di sini. Termasuk nomor soal 1 sampai 10, data tabel, atau data angka grafik..."
                    className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                  <p className="text-[11px] text-slate-500">
                    AI kami otomatis mendeteksi setiap nomor soal, tabel data, kurva/grafik, menyusun kunci jawaban ideal, serta merumuskan rubrik penilaian analitis.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Gagal Memproses</span>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isLoading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'paste' && !pastedText.trim())}
                  onClick={handleProcessDocument}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{loadingStep || 'Sedang Memproses...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>Mulai Ekstraksi Soal dengan AI</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* PREVIEW OF EXTRACTED QUESTIONS */
            <div className="space-y-6">
              {/* Exam Info Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Berhasil Mengekstrak {parsedExam.questions.length} Butir Soal Essay!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Judul: <span className="font-semibold">{parsedExam.title}</span> • Mapel:{' '}
                      <span className="font-semibold">{parsedExam.subject}</span> • Kelas:{' '}
                      <span className="font-semibold">{parsedExam.classGrade}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-white text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                    Kode: {parsedExam.code}
                  </span>
                </div>
              </div>

              {/* Questions List Accordion */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Daftar Soal yang Terdeteksi & Rubrik Terbentuk:
                </h4>

                {parsedExam.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                          {q.questionNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          Soal Essay {q.questionNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {q.mediaType === 'table' && (
                          <span className="flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium border border-indigo-100">
                            <TableIcon className="h-3 w-3" /> Tabel Terdeteksi
                          </span>
                        )}
                        {q.mediaType === 'chart' && (
                          <span className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium border border-emerald-100">
                            <BarChart3 className="h-3 w-3" /> Grafik Terdeteksi
                          </span>
                        )}
                        {q.mediaType === 'image' && (
                          <span className="flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-100">
                            <ImageIcon className="h-3 w-3" /> Gambar Terdeteksi
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Maks: {q.maxScore} Poin
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {q.prompt}
                    </p>

                    {/* Media Render Preview */}
                    {q.mediaType === 'table' && q.tableData && <TableView data={q.tableData} />}
                    {q.mediaType === 'chart' && q.chartData && <InteractiveChart data={q.chartData} />}
                    {q.mediaType === 'image' && q.imageData && <ImageView data={q.imageData} />}

                    {/* Model Answer & Rubric */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">
                          Kunci Jawaban Model Guru:
                        </span>
                        <p className="text-slate-600 whitespace-pre-line text-[11px] leading-relaxed">
                          {q.modelAnswer}
                        </p>
                      </div>

                      <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                        <span className="font-bold text-indigo-900 block mb-1">
                          Rubrik Penilaian Analitis:
                        </span>
                        <ul className="space-y-1.5 text-[11px]">
                          {q.rubric.map((r, rIdx) => (
                            <li key={rIdx} className="flex items-start justify-between gap-2">
                              <span className="text-slate-700">• {r.criteria}</span>
                              <span className="font-bold text-indigo-600 shrink-0">
                                {r.points} Poin
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setParsedExam(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Upload / Masukkan Dokumen Lain
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToExamBank}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Simpan ke Bank Soal & Buka Ujian</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

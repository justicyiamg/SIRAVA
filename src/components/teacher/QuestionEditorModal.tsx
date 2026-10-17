import React, { useState } from 'react';
import { Question, RubricCriterion } from '../../types/exam';
import { QuestionMediaEditor } from './QuestionMediaEditor';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Save,
} from 'lucide-react';

interface QuestionEditorModalProps {
  isOpen: boolean;
  questionNumber: number;
  subject: string;
  initialQuestion?: Question | null;
  onSave: (question: Question) => void;
  onClose: () => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  questionNumber,
  subject,
  initialQuestion,
  onSave,
  onClose,
}) => {
  const [prompt, setPrompt] = useState(initialQuestion?.prompt || '');
  const [maxScore, setMaxScore] = useState<number>(initialQuestion?.maxScore || 10);
  const [mediaType, setMediaType] = useState<'none' | 'table' | 'chart' | 'image'>(
    initialQuestion?.mediaType || 'none'
  );
  const [tableData, setTableData] = useState(initialQuestion?.tableData);
  const [chartData, setChartData] = useState(initialQuestion?.chartData);
  const [imageData, setImageData] = useState(initialQuestion?.imageData);
  const [modelAnswer, setModelAnswer] = useState(initialQuestion?.modelAnswer || '');
  const [rubric, setRubric] = useState<RubricCriterion[]>(
    initialQuestion?.rubric || [
      {
        criteria: 'Ketepatan Konsep Utama',
        points: Math.floor((initialQuestion?.maxScore || 10) * 0.5),
        description: 'Menjelaskan definisi, prinsip, dan teori dengan benar.',
      },
      {
        criteria: 'Analisis & Logika Argumentasi',
        points: Math.ceil((initialQuestion?.maxScore || 10) * 0.5),
        description: 'Menganalisis data pendukung dan menarik kesimpulan tepat.',
      },
    ]
  );

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate Model Answer & Rubric with AI
  const handleAiAssist = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Tuliskan pertanyaan essay terlebih dahulu sebelum meminta bantuan AI.');
      return;
    }
    setIsAiGenerating(true);
    setErrorMsg(null);

    try {
      let mediaInfo = null;
      if (mediaType === 'table' && tableData) mediaInfo = { table: tableData };
      if (mediaType === 'chart' && chartData) mediaInfo = { chart: chartData };
      if (mediaType === 'image' && imageData) mediaInfo = { imageCaption: imageData.caption };

      const res = await fetch('/api/generate-rubric-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          subject,
          maxScore,
          mediaInfo,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi AI');
      }

      const { data } = await res.json();
      if (data.modelAnswer) {
        setModelAnswer(data.modelAnswer);
      }
      if (data.rubric && Array.isArray(data.rubric)) {
        setRubric(data.rubric);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal menyusun kunci & rubrik via AI.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleAddCriterion = () => {
    setRubric([
      ...rubric,
      {
        criteria: 'Kriteria Penilaian Baru',
        points: 2,
        description: 'Indikator capaian jawaban siswa.',
      },
    ]);
  };

  const handleRemoveCriterion = (index: number) => {
    setRubric(rubric.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    if (!prompt.trim()) {
      setErrorMsg('Pertanyaan essay tidak boleh kosong.');
      return;
    }
    if (!modelAnswer.trim()) {
      setErrorMsg('Kunci jawaban model guru tidak boleh kosong.');
      return;
    }
    if (rubric.length === 0) {
      setErrorMsg('Rubrik penilaian minimal harus memiliki 1 kriteria.');
      return;
    }

    const compiledQuestion: Question = {
      id: initialQuestion?.id || `q_${Date.now()}`,
      questionNumber,
      prompt: prompt.trim(),
      maxScore: Number(maxScore) || 10,
      mediaType,
      tableData: mediaType === 'table' ? tableData : undefined,
      chartData: mediaType === 'chart' ? chartData : undefined,
      imageData: mediaType === 'image' ? imageData : undefined,
      modelAnswer: modelAnswer.trim(),
      rubric,
    };

    onSave(compiledQuestion);
    onClose();
  };

  const totalRubricPoints = rubric.reduce((sum, r) => sum + (Number(r.points) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-sm">
              {questionNumber}
            </span>
            <div>
              <h3 className="text-base font-bold">
                {initialQuestion ? `Edit Soal Essay #${questionNumber}` : `Tambah Soal Essay #${questionNumber}`}
              </h3>
              <p className="text-xs text-indigo-200">
                Lengkapi pertanyaan, media (tabel/grafik/gambar), kunci jawaban, dan rubrik penilaian
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Prompt & Max Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Pertanyaan Essay
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Tuliskan pertanyaan essay dengan jelas dan terarah..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Skor Maksimal
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full text-sm font-bold text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-center"
              />
              <span className="text-[11px] text-slate-400 block mt-1 text-center">
                Total rubrik: {totalRubricPoints} Poin
              </span>
            </div>
          </div>

          {/* Media Editor (Table, Chart, Image) */}
          <QuestionMediaEditor
            mediaType={mediaType}
            setMediaType={setMediaType}
            tableData={tableData}
            setTableData={setTableData}
            chartData={chartData}
            setChartData={setChartData}
            imageData={imageData}
            setImageData={setImageData}
          />

          {/* AI Helper Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-indigo-950 font-medium">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                Ingin bantuan AI merumuskan <strong>Kunci Jawaban Model</strong> dan{' '}
                <strong>Rubrik Penilaian Analitis</strong> untuk soal di atas?
              </span>
            </div>
            <button
              type="button"
              disabled={isAiGenerating}
              onClick={handleAiAssist}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs shrink-0 transition-all disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyusun...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Susun Otomatis via AI</span>
                </>
              )}
            </button>
          </div>

          {/* Model Answer (Pedoman Koreksi) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Kunci Jawaban Model Guru (Pedoman AI)
              </label>
              <span className="text-[11px] text-slate-400">
                AI akan mencocokkan substansi jawaban siswa dengan kunci ini
              </span>
            </div>
            <textarea
              rows={4}
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
              placeholder="Tuliskan poin-poin jawaban yang ideal dan komprehensif..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50/50 leading-relaxed"
            />
          </div>

          {/* Rubric Criteria Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Rubrik Penilaian Analitis
                </label>
                <p className="text-[11px] text-slate-500">
                  Rincian aspek penilaian per soal yang akan dievaluasi dan diberi feedback oleh AI
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCriterion}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Kriteria
              </button>
            </div>

            <div className="space-y-2">
              {rubric.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <span className="text-xs font-mono font-bold text-slate-400 w-5">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      value={item.criteria}
                      onChange={(e) => {
                        const newR = [...rubric];
                        newR[idx].criteria = e.target.value;
                        setRubric(newR);
                      }}
                      placeholder="Nama Aspek / Kriteria"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newR = [...rubric];
                        newR[idx].description = e.target.value;
                        setRubric(newR);
                      }}
                      placeholder="Deskripsi indikator capaian..."
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500 font-medium">Poin:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={item.points}
                        onChange={(e) => {
                          const newR = [...rubric];
                          newR[idx].points = Number(e.target.value) || 0;
                          setRubric(newR);
                        }}
                        className="w-14 text-xs font-bold text-center px-1.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    {rubric.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Soal Essay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

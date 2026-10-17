import React, { useState } from 'react';
import { TableData, ChartData, ImageData } from '../../types/exam';
import { TableView } from '../visual/TableView';
import { InteractiveChart } from '../visual/InteractiveChart';
import { ImageView } from '../visual/ImageView';
import {
  Table as TableIcon,
  BarChart3,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  Upload,
} from 'lucide-react';

interface QuestionMediaEditorProps {
  mediaType: 'none' | 'table' | 'chart' | 'image';
  setMediaType: (type: 'none' | 'table' | 'chart' | 'image') => void;
  tableData?: TableData;
  setTableData: (data?: TableData) => void;
  chartData?: ChartData;
  setChartData: (data?: ChartData) => void;
  imageData?: ImageData;
  setImageData: (data?: ImageData) => void;
}

export const QuestionMediaEditor: React.FC<QuestionMediaEditorProps> = ({
  mediaType,
  setMediaType,
  tableData,
  setTableData,
  chartData,
  setChartData,
  imageData,
  setImageData,
}) => {
  const [previewActive, setPreviewActive] = useState(false);

  // Initialize table data if switched to table and empty
  const handleSelectTable = () => {
    setMediaType('table');
    if (!tableData) {
      setTableData({
        title: 'Tabel Data Pengamatan',
        headers: ['Variabel / Sampel', 'Perlakuan 1', 'Perlakuan 2', 'Hasil Akhir'],
        rows: [
          ['Sampel A', '10 mg', '25°C', 'Positif (Reaksi Cepat)'],
          ['Sampel B', '20 mg', '25°C', 'Positif (Reaksi Sangat Cepat)'],
          ['Sampel C', '10 mg', '5°C', 'Negatif (Tidak Ada Reaksi)'],
        ],
      });
    }
  };

  // Initialize chart data if switched to chart and empty
  const handleSelectChart = () => {
    setMediaType('chart');
    if (!chartData) {
      setChartData({
        type: 'bar',
        title: 'Grafik Tren Data Eksperimen',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
        datasets: [
          {
            label: 'Kelompok Kontrol',
            data: [45, 52, 58, 62, 69, 75],
            color: '#4f46e5',
          },
          {
            label: 'Kelompok Uji Coba',
            data: [35, 48, 65, 80, 92, 98],
            color: '#10b981',
          },
        ],
      });
    }
  };

  // Initialize image data
  const handleSelectImage = () => {
    setMediaType('image');
    if (!imageData) {
      setImageData({
        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
        caption: 'Ilustrasi peralatan laboratorium & reaksi kimia',
        alt: 'Peralatan sains laboratorium',
      });
    }
  };

  // Local image file uploader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageData({
          url: reader.result as string,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          alt: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
      {/* Media Type Selector Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Tambahkan Elemen Media Pendukung Soal
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setMediaType('none')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
              mediaType === 'none'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Tanpa Media</span>
          </button>

          <button
            type="button"
            onClick={handleSelectTable}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
              mediaType === 'table'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <TableIcon className="h-4 w-4" />
            <span>Tabel Data</span>
          </button>

          <button
            type="button"
            onClick={handleSelectChart}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
              mediaType === 'chart'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Grafik / Chart</span>
          </button>

          <button
            type="button"
            onClick={handleSelectImage}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
              mediaType === 'image'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-600'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Gambar / Foto</span>
          </button>
        </div>
      </div>

      {/* TABLE EDITOR */}
      {mediaType === 'table' && tableData && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <TableIcon className="h-4 w-4 text-indigo-600" />
              Editor Tabel Interaktif
            </span>
            <button
              type="button"
              onClick={() => setPreviewActive(!previewActive)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              {previewActive ? 'Sembunyikan Preview' : 'Lihat Preview'}
            </button>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Judul / Caption Tabel</label>
            <input
              type="text"
              value={tableData.title || ''}
              onChange={(e) => setTableData({ ...tableData, title: e.target.value })}
              placeholder="Contoh: Tabel 1. Hasil Percobaan Fotosintesis"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Headers Editor */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Kolom Header (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={tableData.headers.join(', ')}
              onChange={(e) => {
                const headers = e.target.value.split(',').map((s) => s.trim());
                setTableData({ ...tableData, headers });
              }}
              className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* Rows Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600">Baris Data ({tableData.rows.length})</label>
              <button
                type="button"
                onClick={() => {
                  const emptyRow = new Array(tableData.headers.length).fill('-');
                  setTableData({ ...tableData, rows: [...tableData.rows, emptyRow] });
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1 font-medium"
              >
                <Plus className="h-3 w-3" /> Tambah Baris
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {tableData.rows.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-200">
                  <span className="text-[11px] font-mono text-slate-400 w-5">{rIdx + 1}.</span>
                  <input
                    type="text"
                    value={row.join(' | ')}
                    onChange={(e) => {
                      const newRows = [...tableData.rows];
                      newRows[rIdx] = e.target.value.split('|').map((s) => s.trim());
                      setTableData({ ...tableData, rows: newRows });
                    }}
                    placeholder="Nilai kolom 1 | Nilai kolom 2 | Nilai kolom 3"
                    className="flex-1 text-xs px-2.5 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newRows = tableData.rows.filter((_, idx) => idx !== rIdx);
                      setTableData({ ...tableData, rows: newRows });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Hapus baris"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Tips: Gunakan tanda pipa (|) untuk memisahkan isi masing-masing kolom pada satu baris.
            </p>
          </div>

          {/* Table Preview */}
          {previewActive && <TableView data={tableData} />}
        </div>
      )}

      {/* CHART EDITOR */}
      {mediaType === 'chart' && chartData && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Editor Grafik / Chart
            </span>
            <button
              type="button"
              onClick={() => setPreviewActive(!previewActive)}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              {previewActive ? 'Sembunyikan Preview' : 'Lihat Preview'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tipe Grafik</label>
              <select
                value={chartData.type}
                onChange={(e) => setChartData({ ...chartData, type: e.target.value as any })}
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="bar">Bar Chart (Diagram Batang)</option>
                <option value="line">Line Chart (Diagram Garis Tren)</option>
                <option value="pie">Pie Chart (Diagram Lingkaran)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Judul Grafik</label>
              <input
                type="text"
                value={chartData.title}
                onChange={(e) => setChartData({ ...chartData, title: e.target.value })}
                placeholder="Contoh: Pertumbuhan Populasi Bakteri"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Label Kategori / Sumbu X (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={chartData.labels.join(', ')}
              onChange={(e) => {
                const labels = e.target.value.split(',').map((s) => s.trim());
                setChartData({ ...chartData, labels });
              }}
              className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Datasets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-600">
                Data Seri ({chartData.datasets.length})
              </label>
              <button
                type="button"
                onClick={() => {
                  setChartData({
                    ...chartData,
                    datasets: [
                      ...chartData.datasets,
                      {
                        label: `Seri ${chartData.datasets.length + 1}`,
                        data: new Array(chartData.labels.length).fill(10),
                        color: '#f59e0b',
                      },
                    ],
                  });
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1 font-medium"
              >
                <Plus className="h-3 w-3" /> Tambah Seri Data
              </button>
            </div>

            {chartData.datasets.map((ds, dsIdx) => (
              <div key={dsIdx} className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={ds.color || '#4f46e5'}
                    onChange={(e) => {
                      const newDs = [...chartData.datasets];
                      newDs[dsIdx].color = e.target.value;
                      setChartData({ ...chartData, datasets: newDs });
                    }}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                    title="Pilih warna seri"
                  />
                  <input
                    type="text"
                    value={ds.label}
                    onChange={(e) => {
                      const newDs = [...chartData.datasets];
                      newDs[dsIdx].label = e.target.value;
                      setChartData({ ...chartData, datasets: newDs });
                    }}
                    placeholder="Nama Seri (misal: Kelompok A)"
                    className="flex-1 text-xs px-2.5 py-1 rounded border border-slate-300 bg-white"
                  />
                  {chartData.datasets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newDs = chartData.datasets.filter((_, idx) => idx !== dsIdx);
                        setChartData({ ...chartData, datasets: newDs });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-0.5">
                    Angka Nilai (pisahkan dengan koma sesuai jumlah label):
                  </label>
                  <input
                    type="text"
                    value={ds.data.join(', ')}
                    onChange={(e) => {
                      const newDs = [...chartData.datasets];
                      newDs[dsIdx].data = e.target.value
                        .split(',')
                        .map((s) => parseFloat(s.trim()) || 0);
                      setChartData({ ...chartData, datasets: newDs });
                    }}
                    className="w-full text-xs px-2.5 py-1 rounded border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Chart Preview */}
          {previewActive && <InteractiveChart data={chartData} />}
        </div>
      )}

      {/* IMAGE EDITOR */}
      {mediaType === 'image' && imageData && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-amber-600" />
              Editor Gambar / Diagram
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Upload File Gambar dari Komputer / HP
              </label>
              <label className="flex items-center justify-center gap-2 w-full py-2 px-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 rounded-lg cursor-pointer transition-colors text-xs font-medium text-slate-700">
                <Upload className="h-4 w-4 text-indigo-600" />
                <span>Pilih File Gambar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Atau Tempelkan URL Gambar Web
              </label>
              <input
                type="text"
                value={imageData.url.startsWith('data:') ? '(Gambar Lokal Terunggah)' : imageData.url}
                onChange={(e) => {
                  if (!e.target.value.startsWith('(')) {
                    setImageData({ ...imageData, url: e.target.value });
                  }
                }}
                placeholder="https://contoh.com/gambar-diagram.png"
                className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Caption / Keterangan Gambar untuk Siswa
            </label>
            <input
              type="text"
              value={imageData.caption || ''}
              onChange={(e) => setImageData({ ...imageData, caption: e.target.value })}
              placeholder="Contoh: Gambar 1. Skema Reaksi Terang dan Reaksi Gelap"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Image Preview */}
          <ImageView data={imageData} />
        </div>
      )}
    </div>
  );
};

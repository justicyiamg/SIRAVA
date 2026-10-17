import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';
import { dataStore } from './src/server/dataStore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

// Support large payloads for document & image base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// App configuration and public student URL
app.get('/api/app-config', (req: Request, res: Response) => {
  const host = req.headers.host || '';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const currentOrigin = `${proto}://${host}`;
  const envAppUrl = process.env.APP_URL || '';
  
  // Detect public URL by converting ais-dev- to ais-pre-
  let sharedStudentUrl = envAppUrl;
  if (!sharedStudentUrl && host) {
    sharedStudentUrl = currentOrigin;
  }
  if (sharedStudentUrl.includes('ais-dev-')) {
    sharedStudentUrl = sharedStudentUrl.replace('ais-dev-', 'ais-pre-');
  }

  res.json({
    currentOrigin,
    sharedStudentUrl: sharedStudentUrl || currentOrigin,
    isDevUrl: host.includes('ais-dev-'),
  });
});

// Exam CRUD endpoints (persisted across all student phones & teacher devices)
app.get('/api/exams', (_req: Request, res: Response) => {
  try {
    const exams = dataStore.getExams();
    res.json(exams);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengambil data ujian' });
  }
});

app.post('/api/exams', (req: Request, res: Response) => {
  try {
    const exam = req.body;
    if (!exam || !exam.id) {
      return res.status(400).json({ error: 'Data paket ujian tidak lengkap' });
    }
    const saved = dataStore.saveExam(exam);
    res.json({ success: true, exam: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menyimpan paket ujian' });
  }
});

app.delete('/api/exams/:id', (req: Request, res: Response) => {
  try {
    const success = dataStore.deleteExam(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menghapus paket ujian' });
  }
});

app.patch('/api/exams/:id/toggle-active', (req: Request, res: Response) => {
  try {
    const exam = dataStore.toggleExamActive(req.params.id);
    if (!exam) {
      return res.status(404).json({ error: 'Paket ujian tidak ditemukan' });
    }
    res.json({ success: true, exam });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengubah status aktif ujian' });
  }
});

// Student Submissions CRUD (persisted across all student phones & teacher dashboard)
app.get('/api/submissions', (_req: Request, res: Response) => {
  try {
    const submissions = dataStore.getSubmissions();
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengambil rekapitulasi nilai' });
  }
});

app.post('/api/submissions', (req: Request, res: Response) => {
  try {
    const sub = req.body;
    if (!sub || !sub.id || !sub.studentName) {
      return res.status(400).json({ error: 'Data submisi siswa tidak lengkap' });
    }
    const saved = dataStore.addSubmission(sub);
    res.json({ success: true, submission: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menyimpan hasil ujian siswa' });
  }
});

app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  try {
    const success = dataStore.deleteSubmission(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menghapus data submisi' });
  }
});

// Teacher Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  try {
    res.json(dataStore.getSettings());
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengambil pengaturan guru' });
  }
});

app.post('/api/settings', (req: Request, res: Response) => {
  try {
    const updated = dataStore.saveSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menyimpan pengaturan guru' });
  }
});

// Reset demo data
app.post('/api/reset-data', (_req: Request, res: Response) => {
  try {
    dataStore.resetAll();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mereset data' });
  }
});

// Endpoint: AI-assisted Essay Evaluation based on teacher's model answer and rubric
app.post('/api/grade-essay', async (req: Request, res: Response) => {
  try {
    const { questions, answers, studentName } = req.body;

    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Data soal dan jawaban tidak valid.' });
    }

    const ai = getAiClient();

    // Prepare evaluation prompt payload
    const evaluationData = questions.map((q: any) => {
      const studentAnsObj = answers.find((a: any) => a.questionId === q.id);
      return {
        questionId: q.id,
        questionNumber: q.questionNumber,
        prompt: q.prompt,
        maxScore: q.maxScore || 10,
        modelAnswer: q.modelAnswer || 'Tidak ada kunci jawaban spesifik.',
        rubric: q.rubric || [],
        mediaDescription: q.tableData
          ? `Tabel terlampir: ${JSON.stringify(q.tableData)}`
          : q.chartData
          ? `Grafik terlampir: ${JSON.stringify(q.chartData)}`
          : q.imageData
          ? `Gambar terlampir: ${q.imageData.caption || 'Gambar stimulus'}`
          : 'Tidak ada media',
        studentAnswer: studentAnsObj ? studentAnsObj.answer : '(Tidak dijawab)',
      };
    });

    const systemInstruction = `Anda adalah asisten penilai ujian essay profesional dan objektif untuk guru di Indonesia.
Tugas Anda adalah menilai jawaban essay siswa berdasarkan:
1. Pertanyaan dan stimulus media (tabel/grafik/gambar jika ada).
2. Kunci Jawaban Model (Pedoman Jawaban) yang dibuat guru.
3. Rubrik Penilaian dan alokasi skor maksimal.

Prinsip penilaian:
- Berikan penilaian yang adil, teliti, dan konstruktif dalam Bahasa Indonesia.
- Jangan hanya mencari kesamaan kata demi kata, melainkan pemahaman konsep, argumen logika, analisis data (jika ada tabel/grafik), dan kelengkapan poin rubrik.
- Berikan rincian nilai per kriteria rubrik yang ditetapkan guru, ditambah feedback positif dan saran perbaikan yang jelas.
- aiScore untuk setiap soal tidak boleh melebihi maxScore soal tersebut dan tidak boleh kurang dari 0.
- Berikan overallFeedback untuk keseluruhan hasil pengerjaan siswa bernama "${studentName || 'Siswa'}".`;

    const prompt = `Silakan koreksi jawaban essay berikut:\n${JSON.stringify(evaluationData, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallFeedback: {
              type: Type.STRING,
              description: 'Ulasan komprehensif atas pengerjaan siswa secara umum',
            },
            evaluations: {
              type: Type.ARRAY,
              description: 'Daftar hasil penilaian per nomor soal',
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.STRING },
                  scoreAwarded: {
                    type: Type.NUMBER,
                    description: 'Skor yang diperoleh siswa untuk soal ini (0 hingga maxScore)',
                  },
                  maxScore: { type: Type.NUMBER },
                  feedback: {
                    type: Type.STRING,
                    description: 'Penjelasan rinci mengapa siswa mendapat skor tersebut dan apa yang kurang/bagus',
                  },
                  criteriaBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criteria: { type: Type.STRING },
                        scoreAwarded: { type: Type.NUMBER },
                        maxPoints: { type: Type.NUMBER },
                        notes: { type: Type.STRING },
                      },
                      required: ['criteria', 'scoreAwarded', 'maxPoints', 'notes'],
                    },
                  },
                },
                required: ['questionId', 'scoreAwarded', 'maxScore', 'feedback'],
              },
            },
          },
          required: ['overallFeedback', 'evaluations'],
        },
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    const result = JSON.parse(jsonStr);

    return res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error in /api/grade-essay:', err);
    return res.status(500).json({
      error: 'Gagal memproses penilaian AI: ' + (err.message || 'Terjadi kesalahan internal'),
    });
  }
});

// Endpoint: Parse Word (.docx) or PDF or pasted text into structured exam questions
app.post('/api/parse-document', async (req: Request, res: Response) => {
  try {
    const { fileBase64, mimeType, fileName, textContent } = req.body;

    const ai = getAiClient();
    let docExtractedText = '';
    let contentsPayload: any = null;

    // Check if it's a docx file (convert via mammoth)
    if (fileBase64 && (mimeType?.includes('wordprocessingml') || fileName?.endsWith('.docx') || fileName?.endsWith('.doc'))) {
      const buffer = Buffer.from(fileBase64, 'base64');
      const mammothResult = await mammoth.extractRawText({ buffer });
      docExtractedText = mammothResult.value;
      contentsPayload = `Berikut isi dokumen soal yang diunggah guru (Word/Docx):\n\n${docExtractedText}`;
    } else if (fileBase64 && (mimeType === 'application/pdf' || fileName?.endsWith('.pdf'))) {
      // PDF can be sent directly to Gemini 3.8 Flash via inlineData
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: fileBase64,
            },
          },
          {
            text: `Ekstraksi dan parsing seluruh butir soal essay dari file PDF ini secara lengkap. Jika ada 10 soal, keluarkan semua 10 soal.`,
          },
        ],
      };
    } else if (textContent) {
      contentsPayload = `Berikut teks soal yang ditempelkan/dimasukkan oleh guru:\n\n${textContent}`;
    } else {
      return res.status(400).json({ error: 'Tidak ada dokumen atau teks yang disertakan.' });
    }

    const systemInstruction = `Anda adalah pakar pembuat instrumen evaluasi pendidikan kurikulum di Indonesia.
Tugas Anda adalah membaca dokumen atau teks soal yang diberikan guru, lalu mengekstrak SEMUA butir soal essay yang ada secara presisi.
Ketentuan penting:
1. Hitung dan keluarkan SEMUA butir soal tanpa terlewat. Jika di dokumen ada 10 soal, Anda WAJIB mengeluarkan 10 soal.
2. Identifikasi apakah setiap soal memiliki atau memerlukan elemen visual/media:
   - Jika ada TABEL data di soal (atau data terstruktur tabular), ubah ke format objek tableData: { headers: [...], rows: [[...]], title: string }.
   - Jika ada GRAFIK / DATA PERKEMBANGAN / STATISTIK di soal, jadikan objek chartData: { type: 'bar'|'line'|'pie', title: string, labels: [...], datasets: [{ label: string, data: [...] }] }.
   - Jika ada GAMBAR/DIAGRAM disebutkan (atau gambar grafik di PDF), buat deskripsi/placeholder atau imageData yang representatif.
3. Kunci Jawaban Model (modelAnswer): Jika dokumen sudah mencantumkan kunci/pembahasan, gunakan itu. Jika belum ada di dokumen, buatkan Kunci Jawaban Model yang ideal, akurat, dan komprehensif.
4. Rubrik Penilaian (rubric): Susun kriteria penilaian analitis dengan pembagian skor yang jelas (misalnya: definisi konsep 30%, analisis 40%, kesimpulan 30%). Total skor per soal umumnya bernilai 10 hingga 20 poin.
5. Deteksi Judul Ujian (examTitle), Mata Pelajaran (subject), dan Perkiraan Durasi (durationMinutes, default 60).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPayload,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examTitle: { type: Type.STRING, description: 'Judul ujian atau bab, misal: Ujian Harian Ekosistem' },
            subject: { type: Type.STRING, description: 'Mata pelajaran, misal: Biologi' },
            gradeLevel: { type: Type.STRING, description: 'Tingkat kelas jika ada, misal: Kelas X SMA' },
            durationMinutes: { type: Type.NUMBER, description: 'Durasi pengerjaan dalam menit' },
            questions: {
              type: Type.ARRAY,
              description: 'Daftar butir soal essay yang diekstrak',
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.NUMBER },
                  prompt: { type: Type.STRING, description: 'Bunyi pertanyaan essay lengkap' },
                  maxScore: { type: Type.NUMBER, description: 'Bobot nilai maksimal untuk soal ini (misal 10 atau 20)' },
                  mediaType: {
                    type: Type.STRING,
                    description: 'Jenis media jika ada: "none", "table", "chart", atau "image"',
                  },
                  tableData: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                      rows: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                    },
                  },
                  chartData: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'bar, line, atau pie' },
                      title: { type: Type.STRING },
                      labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                      datasets: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            data: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            color: { type: Type.STRING },
                          },
                          required: ['label', 'data'],
                        },
                      },
                    },
                  },
                  imageData: {
                    type: Type.OBJECT,
                    properties: {
                      url: { type: Type.STRING },
                      caption: { type: Type.STRING },
                      alt: { type: Type.STRING },
                    },
                  },
                  modelAnswer: {
                    type: Type.STRING,
                    description: 'Kunci jawaban model ideal untuk pedoman koreksi',
                  },
                  rubric: {
                    type: Type.ARRAY,
                    description: 'Kriteria rubrik penilaian dengan rincian poin',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criteria: { type: Type.STRING },
                        points: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                      },
                      required: ['criteria', 'points', 'description'],
                    },
                  },
                },
                required: ['questionNumber', 'prompt', 'maxScore', 'mediaType', 'modelAnswer', 'rubric'],
              },
            },
          },
          required: ['examTitle', 'subject', 'questions'],
        },
      },
    });

    const parsedData = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error('Error in /api/parse-document:', err);
    return res.status(500).json({
      error: 'Gagal memproses dokumen dengan AI: ' + (err.message || 'Format dokumen tidak didukung'),
    });
  }
});

// Endpoint: Auto-generate Model Answer & Rubric for a manual teacher question
app.post('/api/generate-rubric-model', async (req: Request, res: Response) => {
  try {
    const { prompt, subject, maxScore, mediaInfo } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
    }

    const ai = getAiClient();
    const systemInstruction = `Anda adalah ahli kurikulum dan penyusun rubrik penilaian essay sekolah di Indonesia.
Buat kunci jawaban model yang komprehensif dan rubrik penilaian analitis terperinci untuk pertanyaan yang diberikan.
Total skor maksimal adalah ${maxScore || 10} poin.`;

    const userPrompt = `Mata pelajaran: ${subject || 'Umum'}
Pertanyaan: ${prompt}
Media pendukung: ${mediaInfo ? JSON.stringify(mediaInfo) : 'Tidak ada'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modelAnswer: { type: Type.STRING, description: 'Kunci jawaban ideal dan lengkap' },
            rubric: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criteria: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                },
                required: ['criteria', 'points', 'description'],
              },
            },
          },
          required: ['modelAnswer', 'rubric'],
        },
      },
    });

    const result = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Error in /api/generate-rubric-model:', err);
    return res.status(500).json({
      error: 'Gagal membuat kunci & rubrik otomatis: ' + (err.message || 'Kesalahan internal'),
    });
  }
});

// Serve frontend: Vite dev server or static dist
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

import { ExamPackage, StudentSubmission, TeacherSettings } from '../types/exam';

const STORAGE_KEYS = {
  EXAMS: 'koreksi_pintar_exams_v1',
  SUBMISSIONS: 'koreksi_pintar_submissions_v1',
  TEACHER_SETTINGS: 'koreksi_pintar_teacher_settings_v1',
};

export const DEFAULT_TEACHER_SETTINGS: TeacherSettings = {
  pin: '1234',
  schoolName: 'SMA Negeri 1 Indonesia',
  teacherName: 'Bapak/Ibu Guru',
};

// Rich initial sample exams so the user has immediate working examples
export const INITIAL_EXAMS: ExamPackage[] = [
  {
    id: 'exam_bio_01',
    code: 'BIO-101',
    title: 'Penilaian Harian: Metabolisme & Fotosintesis',
    subject: 'Biologi',
    classGrade: 'Kelas XII IPA',
    durationMinutes: 45,
    passingGrade: 75,
    instructions: 'Bacalah setiap stimulus data (tabel, grafik, atau gambar) dengan seksama sebelum menyusun argumentasi essay Anda. Jawaban harus sistematis dan ilmiah.',
    isActive: true,
    showResultsImmediately: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q_bio_1',
        questionNumber: 1,
        prompt: 'Berdasarkan tabel data hasil percobaan fotosintesis Ingenhousz di samping, analisislah pengaruh intensitas cahaya dan penambahan natrium bikarbonat (NaHCO3) terhadap laju pembentukan oksigen (gelembung udara). Mengapa penambahan NaHCO3 dapat melipatgandakan jumlah gelembung?',
        maxScore: 20,
        mediaType: 'table',
        tableData: {
          title: 'Hasil Pengamatan Laju Fotosintesis Hydrilla verticillata',
          headers: ['Perlakuan Uji', 'Kondisi Cahaya', 'Zat Tambahan', 'Jumlah Gelembung / 5 Menit'],
          rows: [
            ['Tabung A', 'Tempat Teduh (100 lux)', 'Air Kolam murni', '14'],
            ['Tabung B', 'Cahaya Langsung (800 lux)', 'Air Kolam murni', '58'],
            ['Tabung C', 'Cahaya Langsung (800 lux)', 'Ditambah NaHCO3 0.5%', '132'],
            ['Tabung D', 'Cahaya Langsung (800 lux)', 'Ditambah Es Batu (10°C)', '21'],
          ],
        },
        modelAnswer: '1. Intensitas cahaya berbanding lurus dengan laju fotosintesis: Pada Tabung B jumlah gelembung (58) meningkat signifikan dibanding Tabung A (14) karena foton cahaya mengaktivasi klorofil pada reaksi terang untuk fotolisis air menghasilkan O2.\n2. Penambahan NaHCO3 melipatgandakan gelembung menjadi 132 karena NaHCO3 terurai menjadi CO2 terlarut dalam air (NaHCO3 -> NaOH + CO2). CO2 merupakan substrat utama reaksi gelap (Siklus Calvin). Kelimpahan CO2 menghilangkan faktor pembatas sehingga fiksasi karbon dan laju keseluruhan fotosintesis memuncak.\n3. Tabung D menunjukkan penurunan laju akibat suhu rendah yang menghambat kerja enzim rubisco.',
        rubric: [
          {
            criteria: 'Analisis Pengaruh Intensitas Cahaya (Tabung A vs B)',
            points: 6,
            description: 'Menjelaskan peran cahaya dalam fotolisis air dan reaksi terang dengan perbandingan kuantitatif gelembung.',
          },
          {
            criteria: 'Analisis Peran NaHCO3 sebagai Sumber CO2',
            points: 8,
            description: 'Menjelaskan dekomposisi NaHCO3 menjadi CO2 bebas yang memicu akselerasi reaksi gelap / siklus Calvin.',
          },
          {
            criteria: 'Sistematika Argumen dan Pemahaman Ilmiah',
            points: 6,
            description: 'Menghubungkan data perlakuan dengan konsep fotosintesis secara logis dan runtut.',
          },
        ],
      },
      {
        id: 'q_bio_2',
        questionNumber: 2,
        prompt: 'Perhatikan grafik spektrum penyerapan cahaya oleh pigmen klorofil a dan b berikut. Jelaskan mengapa daun tanaman umumnya terlihat berwarna hijau, dan prediksikan apa yang terjadi pada laju fotosintesis jika tanaman hanya disinari dengan spektrum cahaya hijau (panjang gelombang 500-550 nm)!',
        maxScore: 20,
        mediaType: 'chart',
        chartData: {
          type: 'line',
          title: 'Spektrum Absorpsi Cahaya oleh Klorofil',
          labels: ['400nm (Ungu)', '450nm (Biru)', '500nm (Cyan)', '550nm (Hijau)', '600nm (Kuning)', '650nm (Oranye)', '700nm (Merah)'],
          datasets: [
            {
              label: 'Absorpsi Klorofil a (%)',
              data: [85, 92, 28, 6, 18, 54, 78],
              color: '#10b981',
            },
            {
              label: 'Absorpsi Klorofil b (%)',
              data: [65, 88, 35, 8, 12, 60, 40],
              color: '#06b6d4',
            },
          ],
        },
        modelAnswer: 'Daun terlihat hijau karena klorofil a dan b memiliki daya serap (absorpsi) yang sangat rendah pada panjang gelombang spektrum hijau (500-550 nm, hanya berkisar 6-8%). Cahaya hijau tidak diserap melainkan dipantulkan (refleksi) dan diteruskan ke mata pengamat.\nJika tanaman hanya disinari spektrum cahaya hijau, laju fotosintesis akan anjlok drastis ke tingkat minimum karena foton cahaya tidak mampu diserap oleh fotosistem I dan II untuk mengeksitasi elektron pada reaksi terang.',
        rubric: [
          {
            criteria: 'Penjelasan Mengapa Daun Berwarna Hijau',
            points: 8,
            description: 'Menyebutkan konsep refleksi/transmisi cahaya hijau karena daya serap klorofil minim pada 500-550 nm.',
          },
          {
            criteria: 'Prediksi & Dampak Penyinaran Cahaya Hijau Tunggal',
            points: 8,
            description: 'Memprediksi penurunan drastis laju fotosintesis dan ketiadaan eksitasi elektron di fotosistem.',
          },
          {
            criteria: 'Ketepatan Hubungan Data Grafik dan Teori',
            points: 4,
            description: 'Mengutip data absorpsi rendah dari grafik secara tepat.',
          },
        ],
      },
      {
        id: 'q_bio_3',
        questionNumber: 3,
        prompt: 'Perhatikan ilustrasi diagram struktur sel tumbuhan berikut. Identifikasi organel bertanda nomor X (Kloroplas) dan nomor Y (Mitokondria), lalu bandingkan peran transformatif energi antara kedua organel tersebut dalam metabolisme seluler!',
        maxScore: 20,
        mediaType: 'image',
        imageData: {
          url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
          caption: 'Struktur Seluler Tumbuhan: Konversi Energi Surya menjadi Senyawa Kimia',
          alt: 'Diagram Sel Tumbuhan',
        },
        modelAnswer: 'Organel X adalah Kloroplas dan Organel Y adalah Mitokondria.\nPerbandingan peran transformasi energi:\n1. Kloroplas berperan dalam reaksi Anabolisme (Endergonik), yaitu mengonversi energi foton matahari menjadi energi kimia dalam ikatan glukosa melalui fotosintesis.\n2. Mitokondria berperan dalam reaksi Katabolisme (Eksergonik), yaitu mengoksidasi glukosa melalui respirasi seluler (glikolisis, siklus krebs, transpor elektron) untuk menghasilkan ATP sebagai energi siap pakai bagi sel.',
        rubric: [
          {
            criteria: 'Identifikasi Organel X dan Y',
            points: 6,
            description: 'Menyebutkan kloroplas dan mitokondria secara akurat.',
          },
          {
            criteria: 'Analisis Peran Transformasi Energi Kloroplas',
            points: 7,
            description: 'Menjelaskan pengubahan energi radiasi cahaya menjadi energi kimia tersimpan (anabolisme/glukosa).',
          },
          {
            criteria: 'Analisis Peran Transformasi Energi Mitokondria',
            points: 7,
            description: 'Menjelaskan pelepasan energi ikatan kimia menjadi ATP melalui respirasi seluler (katabolisme).',
          },
        ],
      },
    ],
  },
  {
    id: 'exam_eko_02',
    code: 'EKO-202',
    title: 'Analisis Pasar: Elastisitas & Keseimbangan Harga',
    subject: 'Ekonomi',
    classGrade: 'Kelas XI IPS',
    durationMinutes: 60,
    passingGrade: 75,
    instructions: 'Jawablah dengan uraian essay komprehensif, hitungan ringkas, dan interpretasi grafik pasar modal.',
    isActive: true,
    showResultsImmediately: true,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q_eko_1',
        questionNumber: 1,
        prompt: 'Berdasarkan tabel pergeseran jumlah permintaan beras di pasar tradisional berikut, hitunglah koefisien elastisitas permintaan harga ketika harga naik dari Rp 12.000 ke Rp 15.000. Termasuk jenis elastisitas apakah komoditas tersebut, dan berikan alasan ekonomi mengapa beras memiliki sifat elastisitas demikian!',
        maxScore: 25,
        mediaType: 'table',
        tableData: {
          title: 'Daftar Harga dan Permintaan Beras Premium per Kg',
          headers: ['Titik Pasar', 'Harga per Kg (P)', 'Jumlah Permintaan (Q / ton)', 'Perubahan Permintaan'],
          rows: [
            ['Titik A', 'Rp 10.000', '100 ton', 'Basis'],
            ['Titik B', 'Rp 12.000', '95 ton', '-5%'],
            ['Titik C', 'Rp 15.000', '88 ton', '-7.3%'],
            ['Titik D', 'Rp 18.000', '78 ton', '-11.3%'],
          ],
        },
        modelAnswer: '1. Perhitungan Elastisitas (Titik B ke C):\nΔP = Rp 15.000 - Rp 12.000 = Rp 3.000 (%ΔP = 3000/12000 = 25%)\nΔQ = 88 - 95 = -7 ton (%ΔQ = -7/95 = -7.37%)\nEd = |%ΔQ / %ΔP| = 7.37% / 25% = 0.29\n2. Jenis Elastisitas: Inelastis (karena Ed < 1).\n3. Alasan ekonomi: Beras adalah makanan pokok primer bagi masyarakat Indonesia dengan sedikit barang substitusi yang sepadan. Kenaikan harga tidak membuat konsumen secara signifikan mengurangi konsumsi nasi.',
        rubric: [
          {
            criteria: 'Ketepatan Rumus dan Perhitungan Ed',
            points: 10,
            description: 'Menuliskan rumus elastisitas dan menghitung nilai koefisien sekitar 0.29 - 0.3.',
          },
          {
            criteria: 'Klasifikasi Sifat Elastisitas',
            points: 5,
            description: 'Mengidentifikasi bahwa nilai Ed < 1 berarti sifat inelastis.',
          },
          {
            criteria: 'Justifikasi Ekonomi Komoditas Primer',
            points: 10,
            description: 'Menjelaskan status beras sebagai kebutuhan pokok primer tanpa substitusi pengganti langsung.',
          },
        ],
      },
      {
        id: 'q_eko_2',
        questionNumber: 2,
        prompt: 'Perhatikan grafik kurva permintaan (D) dan penawaran (S) komoditas kopi lokal berikut. Jelaskan titik ekuilibrium (keseimbangan pasar) yang tercapai, dan analisislah apa yang akan terjadi jika pemerintah menetapkan harga eceran tertinggi (Price Ceiling) di angka Rp 20.000 per kg!',
        maxScore: 25,
        mediaType: 'chart',
        chartData: {
          type: 'bar',
          title: 'Keseimbangan Permintaan dan Penawaran pada Berbagai Level Harga',
          labels: ['Rp 15.000', 'Rp 20.000', 'Rp 25.000 (Ekuilibrium)', 'Rp 30.000', 'Rp 35.000'],
          datasets: [
            {
              label: 'Jumlah Permintaan (Unit)',
              data: [500, 420, 300, 210, 120],
              color: '#3b82f6',
            },
            {
              label: 'Jumlah Penawaran (Unit)',
              data: [110, 190, 300, 410, 520],
              color: '#f59e0b',
            },
          ],
        },
        modelAnswer: '1. Titik ekuilibrium tercapai pada harga Rp 25.000 di mana jumlah yang diminta sama persis dengan jumlah yang ditawarkan yaitu 300 unit (Qd = Qs).\n2. Jika pemerintah menerapkan Price Ceiling di harga Rp 20.000 (di bawah harga keseimbangan):\n- Pada harga Rp 20.000, jumlah permintaan konsumen naik menjadi 420 unit, sedangkan produsen hanya bersedia memasok 190 unit.\n- Akibatnya terjadi kekurangan pasokan (Excess Demand / Shortage) sebesar 230 unit (420 - 190).\n- Hal ini dapat memicu antrean panjang, pasar gelap (black market), dan penjatahan barang.',
        rubric: [
          {
            criteria: 'Penetapan Titik Ekuilibrium',
            points: 8,
            description: 'Menyebutkan harga Rp 25.000 dan kuantitas 300 unit dengan tepat.',
          },
          {
            criteria: 'Analisis Dampak Price Ceiling Rp 20.000',
            points: 10,
            description: 'Menjelaskan terjadinya kelebihan permintaan (shortage) sebesar 230 unit.',
          },
          {
            criteria: 'Konsekuensi Ekonomi Lanjutan',
            points: 7,
            description: 'Menyebutkan fenomena antrean, penurunan margin produsen, atau potensi pasar gelap.',
          },
        ],
      },
    ],
  },
];

// Initial mock submissions for instant recapitulation showcase
export const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub_001',
    examId: 'exam_bio_01',
    examTitle: 'Penilaian Harian: Metabolisme & Fotosintesis',
    subject: 'Biologi',
    studentName: 'Ahmad Rizky Pratama',
    studentNumber: '10291',
    className: 'XII IPA 1',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    rawScore: 54,
    totalMaxPoints: 60,
    totalScore: 90,
    passingGrade: 75,
    gradeStatus: 'Lulus',
    overallFeedback: 'Pemahaman konsep fotosintesis sangat mendalam dan sistematis. Analisis data eksperimen dan grafik klorofil sangat tajam.',
    answers: [
      {
        questionId: 'q_bio_1',
        studentAnswer: 'Dari tabel terlihat jelas bahwa pada Tabung B cahaya langsung menghasilkan 58 gelembung dibandingkan Tabung A (14 gelembung). Hal ini membuktikan cahaya mempercepat fotolisis air. Ketika ditambahkan NaHCO3 pada Tabung C, gelembung melonjak menjadi 132 karena NaHCO3 menghasilkan CO2 terlarut yang merupakan bahan baku reaksi gelap siklus Calvin.',
        aiScore: 19,
        maxScore: 20,
        feedback: 'Analisis sangat lengkap dan menguraikan peran NaHCO3 sebagai donor CO2 dengan jelas.',
        criteriaBreakdown: [
          { criteria: 'Analisis Pengaruh Intensitas Cahaya', scoreAwarded: 6, maxPoints: 6, notes: 'Tepat membandingkan A dan B.' },
          { criteria: 'Analisis Peran NaHCO3 sebagai Sumber CO2', scoreAwarded: 7, maxPoints: 8, notes: 'Penjelasan dekomposisi CO2 sangat baik.' },
          { criteria: 'Sistematika Argumen dan Pemahaman Ilmiah', scoreAwarded: 6, maxPoints: 6, notes: 'Sangat runtut dan saintifik.' },
        ],
      },
      {
        questionId: 'q_bio_2',
        studentAnswer: 'Daun berwarna hijau karena klorofil memantulkan spektrum hijau. Berdasarkan grafik, serapan klorofil di 550nm hanya 6-8%, sangat rendah. Jika hanya diberi lampu hijau, fotosintesis akan macet karena tidak ada energi yang diserap fotosistem.',
        aiScore: 18,
        maxScore: 20,
        feedback: 'Penggunaan data grafik tepat dan logika refleksi cahaya akurat.',
        criteriaBreakdown: [
          { criteria: 'Penjelasan Mengapa Daun Berwarna Hijau', scoreAwarded: 7, maxPoints: 8, notes: 'Menjelaskan refleksi spektrum hijau.' },
          { criteria: 'Prediksi & Dampak Penyinaran Cahaya Hijau', scoreAwarded: 7, maxPoints: 8, notes: 'Memprediksi terhentinya fotosistem.' },
          { criteria: 'Ketepatan Hubungan Data Grafik dan Teori', scoreAwarded: 4, maxPoints: 4, notes: 'Mengutip data 6-8% dari grafik.' },
        ],
      },
      {
        questionId: 'q_bio_3',
        studentAnswer: 'Organel X adalah Kloroplas dan Organel Y adalah Mitokondria. Kloroplas menyerap energi matahari untuk membuat glukosa (anabolisme), sedangkan mitokondria memecah glukosa tersebut menjadi ATP untuk energi sel (katabolisme).',
        aiScore: 17,
        maxScore: 20,
        feedback: 'Jawaban ringkas namun esensi anabolisme dan katabolisme tertangkap dengan sangat baik.',
        criteriaBreakdown: [
          { criteria: 'Identifikasi Organel X dan Y', scoreAwarded: 6, maxPoints: 6, notes: 'Akurat.' },
          { criteria: 'Analisis Transformasi Kloroplas', scoreAwarded: 6, maxPoints: 7, notes: 'Bagus, pembentukan glukosa.' },
          { criteria: 'Analisis Transformasi Mitokondria', scoreAwarded: 5, maxPoints: 7, notes: 'Perlu sedikit rincian siklus krebs/transpor elektron.' },
        ],
      },
    ],
  },
  {
    id: 'sub_002',
    examId: 'exam_bio_01',
    examTitle: 'Penilaian Harian: Metabolisme & Fotosintesis',
    subject: 'Biologi',
    studentName: 'Siti Nurhaliza Putri',
    studentNumber: '10298',
    className: 'XII IPA 1',
    submittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    rawScore: 46,
    totalMaxPoints: 60,
    totalScore: 77,
    passingGrade: 75,
    gradeStatus: 'Lulus',
    overallFeedback: 'Memahami dasar fotosintesis dan organel seluler. Perlu memperkuat kalkulasi kuantitatif dan istilah ilmiah pada klorofil.',
    answers: [
      {
        questionId: 'q_bio_1',
        studentAnswer: 'Cahaya bikin fotosintesis lebih cepat, buktinya di tempat teduh cuma dapat 14 gelembung dan tempat terang 58 gelembung. NaHCO3 membuat gelembung jadi banyak banget (132) karena memberi karbon dioksida tambahan untuk tumbuhan.',
        aiScore: 16,
        maxScore: 20,
        feedback: 'Konsep dasarnya benar, namun bahasa ilmiah dan pengaitan dengan siklus calvin dapat diperdalam.',
        criteriaBreakdown: [
          { criteria: 'Analisis Pengaruh Intensitas Cahaya', scoreAwarded: 5, maxPoints: 6, notes: 'Menyebutkan angka data.' },
          { criteria: 'Analisis Peran NaHCO3 sebagai Sumber CO2', scoreAwarded: 6, maxPoints: 8, notes: 'Menyebutkan CO2 tapi belum mengaitkan siklus calvin.' },
          { criteria: 'Sistematika Argumen dan Pemahaman Ilmiah', scoreAwarded: 5, maxPoints: 6, notes: 'Cukup komunikatif.' },
        ],
      },
      {
        questionId: 'q_bio_2',
        studentAnswer: 'Daun hijau karena klorofil itu warnanya hijau. Di grafik kelihatan yang diserap warna biru dan merah, hijau tidak diserap. Kalau disinar hijau saja ya tanamannya tidak bisa fotosintesis maksimal.',
        aiScore: 14,
        maxScore: 20,
        feedback: 'Kurang menjelaskan konsep pemantulan/refleksi gelombang cahaya dan keterkaitannya dengan fotosistem.',
        criteriaBreakdown: [
          { criteria: 'Penjelasan Mengapa Daun Berwarna Hijau', scoreAwarded: 5, maxPoints: 8, notes: 'Belum tegas menyebutkan kata refleksi.' },
          { criteria: 'Prediksi & Dampak Penyinaran Cahaya Hijau', scoreAwarded: 6, maxPoints: 8, notes: 'Prediksi tepat.' },
          { criteria: 'Ketepatan Hubungan Data Grafik dan Teori', scoreAwarded: 3, maxPoints: 4, notes: 'Menyebutkan serapan biru merah.' },
        ],
      },
      {
        questionId: 'q_bio_3',
        studentAnswer: 'X kloroplas, Y mitokondria. Kloroplas untuk fotosintesis membuat makanan dan oksigen, mitokondria untuk respirasi membakar makanan menghasilkan energi.',
        aiScore: 16,
        maxScore: 20,
        feedback: 'Identifikasi organel dan fungsi respirasi/fotosintesis sudah tepat.',
        criteriaBreakdown: [
          { criteria: 'Identifikasi Organel X dan Y', scoreAwarded: 6, maxPoints: 6, notes: 'Tepat.' },
          { criteria: 'Analisis Transformasi Kloroplas', scoreAwarded: 5, maxPoints: 7, notes: 'Benar, fotosintesis.' },
          { criteria: 'Analisis Transformasi Mitokondria', scoreAwarded: 5, maxPoints: 7, notes: 'Benar, pembakaran energi.' },
        ],
      },
    ],
  },
  {
    id: 'sub_003',
    examId: 'exam_bio_01',
    examTitle: 'Penilaian Harian: Metabolisme & Fotosintesis',
    subject: 'Biologi',
    studentName: 'Budi Santoso',
    studentNumber: '10275',
    className: 'XII IPA 1',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    rawScore: 36,
    totalMaxPoints: 60,
    totalScore: 60,
    passingGrade: 75,
    gradeStatus: 'Remedial',
    overallFeedback: 'Masih perlu pengayaan materi pada reaksi terang-gelap fotosintesis dan peran kimiawi NaHCO3.',
    answers: [
      {
        questionId: 'q_bio_1',
        studentAnswer: 'Cahaya matahari bikin gelembung banyak. Tabung C paling banyak gelembungnya 132 karena ada zat NaHCO3.',
        aiScore: 11,
        maxScore: 20,
        feedback: 'Hanya membaca data tanpa menjelaskan mekanisme sains di baliknya.',
        criteriaBreakdown: [
          { criteria: 'Analisis Pengaruh Intensitas Cahaya', scoreAwarded: 4, maxPoints: 6, notes: 'Minimal.' },
          { criteria: 'Analisis Peran NaHCO3 sebagai Sumber CO2', scoreAwarded: 4, maxPoints: 8, notes: 'Tidak menyebutkan CO2.' },
          { criteria: 'Sistematika Argumen dan Pemahaman Ilmiah', scoreAwarded: 3, maxPoints: 6, notes: 'Singkat sekali.' },
        ],
      },
      {
        questionId: 'q_bio_2',
        studentAnswer: 'Klorofil warnanya hijau jadi daunnya hijau. Kalau dikasih warna hijau ya biasa saja daunnya tetap hidup.',
        aiScore: 10,
        maxScore: 20,
        feedback: 'Miskonsepsi: Cahaya hijau justru tidak diserap klorofil sehingga laju fotosintesis terhambat.',
        criteriaBreakdown: [
          { criteria: 'Penjelasan Mengapa Daun Berwarna Hijau', scoreAwarded: 4, maxPoints: 8, notes: 'Penjelasan sirkular.' },
          { criteria: 'Prediksi & Dampak Penyinaran Cahaya Hijau', scoreAwarded: 4, maxPoints: 8, notes: 'Prediksi keliru.' },
          { criteria: 'Ketepatan Hubungan Data Grafik dan Teori', scoreAwarded: 2, maxPoints: 4, notes: 'Grafik diabaikan.' },
        ],
      },
      {
        questionId: 'q_bio_3',
        studentAnswer: 'X klorofil daun, Y inti sel. Fungsinya sama-sama menjaga tanaman.',
        aiScore: 15,
        maxScore: 20,
        feedback: 'Organel Y adalah mitokondria, bukan inti sel. Perhatikan perbedaan konversi energi.',
        criteriaBreakdown: [
          { criteria: 'Identifikasi Organel X dan Y', scoreAwarded: 3, maxPoints: 6, notes: 'Salah pada Y.' },
          { criteria: 'Analisis Transformasi Kloroplas', scoreAwarded: 4, maxPoints: 7, notes: 'Kurang jelas.' },
          { criteria: 'Analisis Transformasi Mitokondria', scoreAwarded: 4, maxPoints: 7, notes: 'Belum spesifik ATP.' },
        ],
      },
    ],
  },
];

// LocalStorage helpers with server synchronization
export const getStoredExams = (): ExamPackage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      return INITIAL_EXAMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read exams from storage', e);
    return INITIAL_EXAMS;
  }
};

export const saveStoredExams = (exams: ExamPackage[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    window.dispatchEvent(new Event('sirava:data-updated'));
  } catch (e) {
    console.error('Failed to save exams', e);
  }
};

export const fetchExamsFromServer = async (): Promise<ExamPackage[]> => {
  try {
    const res = await fetch('/api/exams');
    if (res.ok) {
      const data: ExamPackage[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveStoredExams(data);
        return data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch exams from server, using local data', e);
  }
  return getStoredExams();
};

export const saveExamToServer = async (exam: ExamPackage): Promise<void> => {
  // Optimistic local update
  const current = getStoredExams();
  const idx = current.findIndex((e) => e.id === exam.id);
  const updated = idx >= 0 ? [...current] : [exam, ...current];
  if (idx >= 0) updated[idx] = exam;
  saveStoredExams(updated);

  try {
    await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });
  } catch (e) {
    console.error('Failed to sync exam to server', e);
  }
};

export const deleteExamFromServer = async (examId: string): Promise<void> => {
  // Optimistic local update
  const updated = getStoredExams().filter((e) => e.id !== examId);
  saveStoredExams(updated);

  try {
    await fetch(`/api/exams/${examId}`, { method: 'DELETE' });
  } catch (e) {
    console.error('Failed to delete exam from server', e);
  }
};

export const toggleExamActiveServer = async (examId: string): Promise<void> => {
  const updated = getStoredExams().map((e) => (e.id === examId ? { ...e, isActive: !e.isActive } : e));
  saveStoredExams(updated);

  try {
    await fetch(`/api/exams/${examId}/toggle-active`, { method: 'PATCH' });
  } catch (e) {
    console.error('Failed to toggle exam active on server', e);
  }
};

export const getStoredSubmissions = (): StudentSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read submissions from storage', e);
    return INITIAL_SUBMISSIONS;
  }
};

export const saveStoredSubmissions = (submissions: StudentSubmission[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    window.dispatchEvent(new Event('sirava:data-updated'));
  } catch (e) {
    console.error('Failed to save submissions', e);
  }
};

export const fetchSubmissionsFromServer = async (): Promise<StudentSubmission[]> => {
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      const data: StudentSubmission[] = await res.json();
      if (Array.isArray(data)) {
        saveStoredSubmissions(data);
        return data;
      }
    }
  } catch (e) {
    console.warn('Could not fetch submissions from server, using local data', e);
  }
  return getStoredSubmissions();
};

export const addStudentSubmission = async (submission: StudentSubmission): Promise<void> => {
  const current = getStoredSubmissions();
  const updated = [submission, ...current.filter((s) => s.id !== submission.id)];
  saveStoredSubmissions(updated);

  try {
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
  } catch (e) {
    console.error('Failed to sync student submission to server', e);
  }
};

export const deleteSubmissionFromServer = async (submissionId: string): Promise<void> => {
  const updated = getStoredSubmissions().filter((s) => s.id !== submissionId);
  saveStoredSubmissions(updated);

  try {
    await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' });
  } catch (e) {
    console.error('Failed to delete submission from server', e);
  }
};

export const getTeacherSettings = (): TeacherSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEACHER_SETTINGS, JSON.stringify(DEFAULT_TEACHER_SETTINGS));
      return DEFAULT_TEACHER_SETTINGS;
    }
    return { ...DEFAULT_TEACHER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_TEACHER_SETTINGS;
  }
};

export const saveTeacherSettings = async (settings: TeacherSettings): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHER_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('sirava:data-updated'));
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  } catch (e) {
    console.error('Failed to save teacher settings', e);
  }
};

export const fetchTeacherSettingsFromServer = async (): Promise<TeacherSettings> => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && data.pin) {
        localStorage.setItem(STORAGE_KEYS.TEACHER_SETTINGS, JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    // fallback
  }
  return getTeacherSettings();
};

export const getPublicStudentUrl = (examIdOrCode?: string): string => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  // If running in development (ais-dev-), rewrite to public shared URL (ais-pre-)
  const publicBase = origin.includes('ais-dev-') ? origin.replace('ais-dev-', 'ais-pre-') : origin;
  
  if (!examIdOrCode) {
    return `${publicBase}?view=student`;
  }
  return `${publicBase}?view=student&code=${encodeURIComponent(examIdOrCode)}`;
};

export const fetchAppConfig = async (): Promise<{ currentOrigin: string; sharedStudentUrl: string; isDevUrl: boolean }> => {
  try {
    const res = await fetch('/api/app-config');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // ignore
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const sharedUrl = origin.includes('ais-dev-') ? origin.replace('ais-dev-', 'ais-pre-') : origin;
  return {
    currentOrigin: origin,
    sharedStudentUrl: sharedUrl,
    isDevUrl: origin.includes('ais-dev-'),
  };
};

// Reset to sample state if needed
export const resetAllToDefault = async (): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
  localStorage.setItem(STORAGE_KEYS.TEACHER_SETTINGS, JSON.stringify(DEFAULT_TEACHER_SETTINGS));
  window.dispatchEvent(new Event('sirava:data-updated'));
  try {
    await fetch('/api/reset-data', { method: 'POST' });
  } catch (e) {
    console.error('Failed to reset data on server', e);
  }
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ExamPackage, StudentSubmission, TeacherSettings } from '../types/exam';
import { INITIAL_EXAMS, INITIAL_SUBMISSIONS, DEFAULT_TEACHER_SETTINGS } from '../services/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.error('Error creating data directory:', e);
}

// In-memory cache with fallback
let examsCache: ExamPackage[] = [];
let submissionsCache: StudentSubmission[] = [];
let settingsCache: TeacherSettings = { ...DEFAULT_TEACHER_SETTINGS };

// Initialize data from disk or initial seeds
const initDataStore = () => {
  try {
    if (fs.existsSync(EXAMS_FILE)) {
      const content = fs.readFileSync(EXAMS_FILE, 'utf-8');
      examsCache = JSON.parse(content);
    } else {
      examsCache = [...INITIAL_EXAMS];
      fs.writeFileSync(EXAMS_FILE, JSON.stringify(examsCache, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Failed to load exams from disk, using fallback initial data:', err);
    examsCache = [...INITIAL_EXAMS];
  }

  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      submissionsCache = JSON.parse(content);
    } else {
      submissionsCache = [...INITIAL_SUBMISSIONS];
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissionsCache, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Failed to load submissions from disk, using fallback initial data:', err);
    submissionsCache = [...INITIAL_SUBMISSIONS];
  }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      settingsCache = JSON.parse(content);
    } else {
      settingsCache = { ...DEFAULT_TEACHER_SETTINGS };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2), 'utf-8');
    }
  } catch (err) {
    settingsCache = { ...DEFAULT_TEACHER_SETTINGS };
  }
};

initDataStore();

const saveExamsToDisk = () => {
  try {
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(examsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save exams to disk:', err);
  }
};

const saveSubmissionsToDisk = () => {
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissionsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save submissions to disk:', err);
  }
};

const saveSettingsToDisk = () => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save settings to disk:', err);
  }
};

export const dataStore = {
  getExams: (): ExamPackage[] => examsCache,

  saveExam: (exam: ExamPackage): ExamPackage => {
    const idx = examsCache.findIndex((e) => e.id === exam.id);
    if (idx >= 0) {
      examsCache[idx] = exam;
    } else {
      examsCache = [exam, ...examsCache];
    }
    saveExamsToDisk();
    return exam;
  },

  deleteExam: (id: string): boolean => {
    const initialLen = examsCache.length;
    examsCache = examsCache.filter((e) => e.id !== id);
    saveExamsToDisk();
    return examsCache.length < initialLen;
  },

  toggleExamActive: (id: string): ExamPackage | null => {
    const exam = examsCache.find((e) => e.id === id);
    if (exam) {
      exam.isActive = !exam.isActive;
      saveExamsToDisk();
      return exam;
    }
    return null;
  },

  getSubmissions: (): StudentSubmission[] => submissionsCache,

  addSubmission: (submission: StudentSubmission): StudentSubmission => {
    submissionsCache = [submission, ...submissionsCache];
    saveSubmissionsToDisk();
    return submission;
  },

  deleteSubmission: (id: string): boolean => {
    const initialLen = submissionsCache.length;
    submissionsCache = submissionsCache.filter((s) => s.id !== id);
    saveSubmissionsToDisk();
    return submissionsCache.length < initialLen;
  },

  getSettings: (): TeacherSettings => settingsCache,

  saveSettings: (settings: TeacherSettings): TeacherSettings => {
    settingsCache = { ...settingsCache, ...settings };
    saveSettingsToDisk();
    return settingsCache;
  },

  resetAll: () => {
    examsCache = [...INITIAL_EXAMS];
    submissionsCache = [...INITIAL_SUBMISSIONS];
    settingsCache = { ...DEFAULT_TEACHER_SETTINGS };
    saveExamsToDisk();
    saveSubmissionsToDisk();
    saveSettingsToDisk();
  },
};

export interface TableData {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface ImageData {
  url: string;
  caption?: string;
  alt?: string;
}

export interface RubricCriterion {
  id?: string;
  criteria: string;
  points: number;
  description: string;
}

export interface Question {
  id: string;
  questionNumber: number;
  prompt: string;
  maxScore: number;
  mediaType: 'none' | 'table' | 'chart' | 'image';
  tableData?: TableData;
  chartData?: ChartData;
  imageData?: ImageData;
  modelAnswer: string;
  rubric: RubricCriterion[];
}

export interface ExamPackage {
  id: string;
  code: string;
  title: string;
  subject: string;
  classGrade: string;
  durationMinutes: number;
  passingGrade: number; // KKM, e.g. 75
  instructions: string;
  isActive: boolean;
  showResultsImmediately: boolean;
  createdAt: string;
  questions: Question[];
}

export interface CriteriaScore {
  criteria: string;
  scoreAwarded: number;
  maxPoints: number;
  notes: string;
}

export interface AnswerEvaluation {
  questionId: string;
  studentAnswer: string;
  aiScore: number;
  maxScore: number;
  feedback: string;
  criteriaBreakdown: CriteriaScore[];
}

export interface StudentSubmission {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentName: string;
  studentNumber: string; // NIS/NISN/Absen
  className: string;
  submittedAt: string;
  answers: AnswerEvaluation[];
  totalScore: number; // scaled 0 - 100
  rawScore: number;
  totalMaxPoints: number;
  passingGrade: number;
  gradeStatus: 'Lulus' | 'Remedial';
  overallFeedback: string;
}

export interface TeacherSettings {
  pin: string;
  schoolName: string;
  teacherName: string;
}

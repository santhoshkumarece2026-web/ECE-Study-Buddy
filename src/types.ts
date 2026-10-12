export type SubjectId = 
  | 'electronics' 
  | 'c-programming' 
  | 'math' 
  | 'general-eng';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  shortName: string;
  tagline: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  icon: string;
  suggestedTopics: string[];
  sampleQuestions: string[];
}

export type QuizDifficulty = 'Beginner' | 'Core Concept' | 'Exam Level';
export type QuizLength = 3 | 5 | 10;

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuizDifficulty | string;
  subtopic?: string;
}

export interface StudyHistoryItem {
  id: string;
  timestamp: number;
  subjectId: SubjectId;
  subjectName: string;
  question: string;
  answer: string;
}

export interface BookmarkItem {
  id: string;
  timestamp: number;
  subjectId: SubjectId;
  subjectName: string;
  topicTitle: string;
  question: string;
  explanation: string;
}

export interface QuizQuestionResult {
  question: string;
  subtopic?: string;
  userAnswerIndex: number;
  correctAnswerIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizAttemptRecord {
  id: string;
  timestamp: number;
  subjectId: SubjectId;
  subjectName: string;
  topic: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  questionResults: QuizQuestionResult[];
}

export interface WeakTopicRecord {
  topic: string;
  subjectId: SubjectId;
  subjectName: string;
  incorrectCount: number;
  totalAttempts: number;
  lastAttempted: number;
}

export interface FormulaItem {
  title: string;
  formula: string;
  note: string;
}

export interface FormulaCategory {
  subjectId: SubjectId;
  category: string;
  items: FormulaItem[];
}

export interface UploadedFileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64 data url or raw data
  previewUrl?: string;
}

export type AIModelId = 'gemini-3.1-flash-lite' | 'gemini-3.8-flash' | 'gemini-3.1-pro';

export interface AIModelMode {
  id: AIModelId;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  speed: string;
  reasoning: string;
}

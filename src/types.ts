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

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Beginner' | 'Core Concept' | 'Exam Level' | string;
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

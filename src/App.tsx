import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  SubjectId, 
  StudyHistoryItem, 
  QuizQuestion, 
  BookmarkItem, 
  QuizAttemptRecord, 
  WeakTopicRecord, 
  QuizDifficulty, 
  QuizLength, 
  QuizQuestionResult,
  UploadedFileAttachment,
  AIModelId,
  DailyGoalsConfig,
  DailyGoalsProgress 
} from './types';
import { SUBJECTS } from './data/subjectData';
import { Navbar } from './components/Navbar';
import { SubjectTabs } from './components/SubjectTabs';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { CircuitRenderer } from './components/CircuitRenderer';
import { QuizSection } from './components/QuizSection';
import { FormulaSheetModal } from './components/FormulaSheetModal';
import { StudyHistoryModal } from './components/StudyHistoryModal';
import { BookmarksModal } from './components/BookmarksModal';
import { ProgressModal } from './components/ProgressModal';
import { DailyGoalsModal } from './components/DailyGoalsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { WeakTopicsCard } from './components/WeakTopicsCard';
import { SubjectOverview } from './components/SubjectOverview';
import { EceLogo } from './components/EceLogo';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2,
  Send,
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Bookmark, 
  BookOpen, 
  ArrowRight, 
  Lightbulb, 
  ShieldAlert, 
  X, 
  RotateCcw,
  Paperclip,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Target,
  Trophy,
  SlidersHorizontal,
  Flame,
  Image as ImageIcon 
} from 'lucide-react';

function calculateStreakDays(records: QuizAttemptRecord[]): number {
  if (!records || records.length === 0) return 0;
  const dates = new Set<string>();
  records.forEach((r) => {
    const d = new Date(r.timestamp);
    dates.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
  });

  const now = new Date();
  let check = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = `${check.getFullYear()}-${check.getMonth() + 1}-${check.getDate()}`;

  let streak = 0;
  if (!dates.has(todayKey)) {
    check.setDate(check.getDate() - 1);
    const yestKey = `${check.getFullYear()}-${check.getMonth() + 1}-${check.getDate()}`;
    if (!dates.has(yestKey)) {
      return 0;
    }
  }

  while (dates.has(`${check.getFullYear()}-${check.getMonth() + 1}-${check.getDate()}`)) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  return streak;
}

function getTodayDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function calculateWeakTopics(records: QuizAttemptRecord[]): WeakTopicRecord[] {
  const map: Record<string, WeakTopicRecord> = {};
  records.forEach((attempt) => {
    if (attempt.questionResults) {
      attempt.questionResults.forEach((q) => {
        const topicName = q.subtopic || attempt.topic || 'Core Concept';
        if (!map[topicName]) {
          map[topicName] = {
            topic: topicName,
            subjectId: attempt.subjectId,
            subjectName: attempt.subjectName,
            incorrectCount: 0,
            totalAttempts: 0,
            lastAttempted: attempt.timestamp,
          };
        }
        map[topicName].totalAttempts++;
        if (!q.isCorrect) {
          map[topicName].incorrectCount++;
        }
        if (attempt.timestamp > map[topicName].lastAttempted) {
          map[topicName].lastAttempted = attempt.timestamp;
        }
      });
    }
  });

  return Object.values(map)
    .filter((t) => t.incorrectCount > 0)
    .sort((a, b) => b.incorrectCount - a.incorrectCount || (b.incorrectCount / b.totalAttempts) - (a.incorrectCount / a.totalAttempts))
    .slice(0, 5);
}

function validateQuizData(raw: unknown): QuizQuestion[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const valid: QuizQuestion[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as { question?: unknown }).question === 'string' &&
      ((item as { question: string }).question.trim().length > 0) &&
      Array.isArray((item as { options?: unknown }).options) &&
      ((item as { options: unknown[] }).options.length >= 2) &&
      typeof (item as { correctIndex?: unknown }).correctIndex === 'number' &&
      (item as { correctIndex: number }).correctIndex >= 0 &&
      (item as { correctIndex: number }).correctIndex < (item as { options: unknown[] }).options.length &&
      typeof (item as { explanation?: unknown }).explanation === 'string'
    ) {
      valid.push({
        question: (item as { question: string }).question.trim(),
        options: (item as { options: unknown[] }).options.map((o) => String(o)),
        correctIndex: (item as { correctIndex: number }).correctIndex,
        explanation: (item as { explanation: string }).explanation.trim(),
        difficulty: (item as { difficulty?: string }).difficulty || 'Core Concept',
        subtopic: (item as { subtopic?: string }).subtopic ? String((item as { subtopic?: string }).subtopic) : undefined,
      });
    }
  }
  return valid.length > 0 ? valid : null;
}

const SUBJECT_PLACEHOLDERS: Record<SubjectId, string> = {
  electronics: 'e.g., Why does a silicon PN junction diode require 0.7V forward bias to conduct? (or paste circuit question)',
  'c-programming': 'e.g., What is the difference between *ptr and &ptr in C with a memory diagram? (or paste code snippet)',
  math: 'e.g., How do you find eigenvalues and eigenvectors of a 2x2 matrix step-by-step? (or paste problem)',
  'general-eng': 'e.g., How to construct a Free Body Diagram for a simply supported beam with point loads (or upload diagram)',
};

const SUBJECT_ACCENTS: Record<SubjectId, { text: string; border: string; bg: string }> = {
  electronics: { text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-50/60 dark:bg-blue-950/30' },
  'c-programming': { text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-50/60 dark:bg-emerald-950/30' },
  math: { text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-50/60 dark:bg-amber-950/30' },
  'general-eng': { text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-50/60 dark:bg-violet-950/30' },
};

export default function App() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('electronics');
  const [question, setQuestion] = useState<string>('');
  
  // AI Explanation State
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isAskingAI, setIsAskingAI] = useState<boolean>(false);
  const [askError, setAskError] = useState<string | null>(null);

  // Similar Practice Problem State
  const [practiceProblemData, setPracticeProblemData] = useState<{
    problem: string;
    solution: string;
  } | null>(null);
  const [isGeneratingPractice, setIsGeneratingPractice] = useState<boolean>(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [isSolutionOpen, setIsSolutionOpen] = useState<boolean>(false);

  // Intuitive Real-World Analogy Explanation State
  const [intuitiveExplanation, setIntuitiveExplanation] = useState<string | null>(null);
  const [isGeneratingIntuitive, setIsGeneratingIntuitive] = useState<boolean>(false);
  const [intuitiveError, setIntuitiveError] = useState<string | null>(null);

  // Active AI Model Selection State
  const [selectedModel, setSelectedModel] = useState<AIModelId>(() => {
    try {
      const saved = localStorage.getItem('ece_study_model');
      if (
        saved === 'gemini-3.1-flash-lite' || 
        saved === 'gemini-3.8-flash' || 
        saved === 'gemini-3.1-pro'
      ) {
        return saved as AIModelId;
      }
    } catch {
      // ignore
    }
    return 'gemini-3.1-flash-lite';
  });

  const handleSelectModel = (model: AIModelId) => {
    setSelectedModel(model);
    try {
      localStorage.setItem('ece_study_model', model);
    } catch {
      // ignore
    }
  };

  // File & Image Attachment State
  const [attachedFile, setAttachedFile] = useState<UploadedFileAttachment | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quiz State & Parameters
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizDifficulty, setQuizDifficulty] = useState<QuizDifficulty>('Core Concept');
  const [quizLength, setQuizLength] = useState<QuizLength>(3);

  // View state: 'explanation' or 'quiz'
  const [activeView, setActiveView] = useState<'explanation' | 'quiz'>('explanation');

  // Modals & Storage
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState<boolean>(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);
  const [isDailyGoalsModalOpen, setIsDailyGoalsModalOpen] = useState<boolean>(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState<boolean>(false);

  // Daily Study Goals Configuration
  const [dailyGoalsConfig, setDailyGoalsConfig] = useState<DailyGoalsConfig>(() => {
    try {
      const saved = localStorage.getItem('ece_daily_goals_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.targetProblems === 'number' && typeof parsed.targetQuizQuestions === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return { targetProblems: 5, targetQuizQuestions: 10 };
  });

  // Daily Study Goals Progress (auto-resets when date rolls over)
  const [dailyGoalsProgress, setDailyGoalsProgress] = useState<DailyGoalsProgress>(() => {
    const today = getTodayDateKey();
    try {
      const saved = localStorage.getItem('ece_daily_goals_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today && typeof parsed.problemsSolved === 'number' && typeof parsed.quizQuestionsAnswered === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      date: today,
      problemsSolved: 0,
      quizQuestionsAnswered: 0,
      lastUpdated: Date.now(),
    };
  });

  // AbortController refs to prevent out-of-order race conditions
  const askAbortRef = useRef<AbortController | null>(null);
  const quizAbortRef = useRef<AbortController | null>(null);

  // Local Study History
  const [history, setHistory] = useState<StudyHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ece_study_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('ece_study_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Learning Progress & Quiz History
  const [quizHistory, setQuizHistory] = useState<QuizAttemptRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ece_quiz_progress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persisted Dark Mode Preference (Consistent Dark Engineering Console)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ece_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
      return true;
    } catch {
      return true;
    }
  });

  const [copiedExplanation, setCopiedExplanation] = useState<boolean>(false);
  const [savedBookmarkToast, setSavedBookmarkToast] = useState<boolean>(false);
  const [bookmarkToastMessage, setBookmarkToastMessage] = useState<string>('Saved to persistent bookmarks!');

  // Synchronize Dark Mode to DOM and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      try {
        localStorage.setItem('ece_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      try {
        localStorage.setItem('ece_theme', 'light');
      } catch {}
    }
  }, [darkMode]);

  // Synchronize Study History to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ece_study_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Synchronize Bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ece_study_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  // Synchronize Quiz Progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ece_quiz_progress', JSON.stringify(quizHistory));
    } catch (e) {
      console.warn('Failed to save quiz history to localStorage', e);
    }
  }, [quizHistory]);

  // Synchronize Daily Goals Config & Progress
  useEffect(() => {
    try {
      localStorage.setItem('ece_daily_goals_config', JSON.stringify(dailyGoalsConfig));
    } catch (e) {
      console.warn('Failed to save daily goals config to localStorage', e);
    }
  }, [dailyGoalsConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('ece_daily_goals_progress', JSON.stringify(dailyGoalsProgress));
    } catch (e) {
      console.warn('Failed to save daily goals progress to localStorage', e);
    }
  }, [dailyGoalsProgress]);

  // Check for date rollover
  useEffect(() => {
    const today = getTodayDateKey();
    if (dailyGoalsProgress.date !== today) {
      setDailyGoalsProgress({
        date: today,
        problemsSolved: 0,
        quizQuestionsAnswered: 0,
        lastUpdated: Date.now(),
      });
    }
  }, [dailyGoalsProgress.date]);

  // Daily Goals increment helpers
  const incrementDailyProblemsSolved = (count = 1) => {
    setDailyGoalsProgress((prev) => {
      const today = getTodayDateKey();
      const isToday = prev.date === today;
      return {
        date: today,
        problemsSolved: (isToday ? prev.problemsSolved : 0) + count,
        quizQuestionsAnswered: isToday ? prev.quizQuestionsAnswered : 0,
        lastUpdated: Date.now(),
      };
    });
  };

  const incrementDailyQuizAnswered = (count: number) => {
    if (count <= 0) return;
    setDailyGoalsProgress((prev) => {
      const today = getTodayDateKey();
      const isToday = prev.date === today;
      return {
        date: today,
        problemsSolved: isToday ? prev.problemsSolved : 0,
        quizQuestionsAnswered: (isToday ? prev.quizQuestionsAnswered : 0) + count,
        lastUpdated: Date.now(),
      };
    });
  };

  const handleResetDailyGoalsProgress = () => {
    setDailyGoalsProgress({
      date: getTodayDateKey(),
      problemsSolved: 0,
      quizQuestionsAnswered: 0,
      lastUpdated: Date.now(),
    });
  };

  const dailyGoalsSummary = useMemo(() => {
    const isProblemsMet = dailyGoalsProgress.problemsSolved >= dailyGoalsConfig.targetProblems;
    const isQuizMet = dailyGoalsProgress.quizQuestionsAnswered >= dailyGoalsConfig.targetQuizQuestions;
    const isAllCompleted = isProblemsMet && isQuizMet;
    const probPct = Math.min(100, Math.round((dailyGoalsProgress.problemsSolved / Math.max(1, dailyGoalsConfig.targetProblems)) * 100));
    const quizPct = Math.min(100, Math.round((dailyGoalsProgress.quizQuestionsAnswered / Math.max(1, dailyGoalsConfig.targetQuizQuestions)) * 100));
    const overallPct = Math.min(100, Math.round((probPct + quizPct) / 2));

    return {
      isAllCompleted,
      problemsSolved: dailyGoalsProgress.problemsSolved,
      targetProblems: dailyGoalsConfig.targetProblems,
      quizAnswered: dailyGoalsProgress.quizQuestionsAnswered,
      targetQuiz: dailyGoalsConfig.targetQuizQuestions,
      overallPct,
    };
  }, [dailyGoalsProgress, dailyGoalsConfig]);

  const activeSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];

  // Derived progress stats
  const streakDays = useMemo(() => calculateStreakDays(quizHistory), [quizHistory]);
  const weakTopics = useMemo(() => calculateWeakTopics(quizHistory), [quizHistory]);

  // Check if active explanation is currently bookmarked
  const isCurrentExplanationBookmarked = useMemo(() => {
    if (!explanation) return false;
    return bookmarks.some(
      (b) => b.explanation === explanation || (b.question === question.trim() && b.subjectId === selectedSubjectId)
    );
  }, [bookmarks, explanation, question, selectedSubjectId]);

  // Toggle bookmark for active explanation
  const handleToggleBookmark = () => {
    if (!explanation) return;
    if (isCurrentExplanationBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.explanation !== explanation && b.question !== question.trim()));
      setBookmarkToastMessage('Removed from bookmarks');
    } else {
      const currentSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];
      const newBookmark: BookmarkItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        subjectId: selectedSubjectId,
        subjectName: currentSubject.name,
        topicTitle: question.slice(0, 50) || currentSubject.shortName,
        question: question.trim() || currentSubject.name,
        explanation,
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
      setBookmarkToastMessage('Saved to persistent bookmarks!');
    }
    setSavedBookmarkToast(true);
    setTimeout(() => setSavedBookmarkToast(false), 2500);
  };

  // File processing helpers for image, screenshot, PDF and document uploads
  const processFile = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setAskError('File is too large (maximum 20MB). Please select a smaller image or document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data: dataUrl,
        previewUrl: file.type.startsWith('image/') ? dataUrl : undefined,
      });
      setAskError(null);
    };
    reader.onerror = () => {
      setAskError('Failed to read the file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/') || items[i].type === 'application/pdf') {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          break;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Switch subject handler with clean session reset & aborting in-flight requests
  const handleSelectSubject = (id: SubjectId) => {
    if (id === selectedSubjectId) {
      return;
    }

    // Abort pending fetches so previous queries cannot overwrite new subject
    askAbortRef.current?.abort();
    quizAbortRef.current?.abort();

    const nextSubject = SUBJECTS.find(s => s.id === id);
    const targetName = nextSubject ? nextSubject.name : id;

    setSelectedSubjectId(id);
    setQuestion('');
    setAttachedFile(null); // Clear attached file so previous subject's file does not persist
    setExplanation(null);
    setPracticeProblemData(null);
    setIntuitiveExplanation(null);
    setPracticeError(null);
    setIntuitiveError(null);
    setIsSolutionOpen(false);
    setQuizQuestions(null);
    setAskError(null);
    setQuizError(null);
    setActiveView('explanation');
  };

  // Handle Ask AI with AbortController and multimodal attachment support
  const handleAskAI = async () => {
    if (!question.trim() && !attachedFile) {
      setAskError('Please enter a question or upload an image, screenshot, or document.');
      return;
    }

    // Abort previous in-flight ask request if any
    askAbortRef.current?.abort();
    const controller = new AbortController();
    askAbortRef.current = controller;

    let isTimeoutAbort = false;
    const timeoutId = setTimeout(() => {
      isTimeoutAbort = true;
      controller.abort();
    }, 35000);

    setIsAskingAI(true);
    setAskError(null);
    setExplanation(''); // Start clean for streaming chunks
    setPracticeProblemData(null);
    setIntuitiveExplanation(null);
    setPracticeError(null);
    setIntuitiveError(null);
    setIsSolutionOpen(false);
    setActiveView('explanation');

    try {
      const currentSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.name,
          question: question.trim(),
          selectedModel,
          file: attachedFile
            ? {
                name: attachedFile.name,
                type: attachedFile.type,
                size: attachedFile.size,
                data: attachedFile.data,
              }
            : undefined,
        }),
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let errorMsg = 'Failed to fetch explanation from server.';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {
          const textErr = await response.text().catch(() => '');
          if (textErr) errorMsg = textErr;
        }
        throw new Error(errorMsg);
      }

      let accumulatedAnswer = '';

      // Check if response is streamed via Server-Sent Events (SSE)
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          // Keep the last, potentially incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payloadStr = trimmed.replace(/^data:\s*/, '');
            if (!payloadStr) continue;

            try {
              const data = JSON.parse(payloadStr);
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.chunk) {
                accumulatedAnswer += data.chunk;
                setExplanation(accumulatedAnswer);
              }
            } catch (jsonErr: any) {
              if (jsonErr?.message && jsonErr.message.includes('error')) {
                throw jsonErr;
              }
              // Skip malformed chunk gracefully
            }
          }
        }

        // Flush any remaining chunk left in buffer
        if (buffer.trim().startsWith('data:')) {
          try {
            const data = JSON.parse(buffer.trim().replace(/^data:\s*/, ''));
            if (data.error) {
              throw new Error(data.error);
            }
            if (data.chunk) {
              accumulatedAnswer += data.chunk;
              setExplanation(accumulatedAnswer);
            }
          } catch (jsonErr: any) {
            if (jsonErr?.message && jsonErr.message.includes('error')) {
              throw jsonErr;
            }
          }
        }
      } else {
        // Fallback for standard JSON response
        const data = await response.json();
        accumulatedAnswer = data.answer || '';
        setExplanation(accumulatedAnswer);
      }

      if (!accumulatedAnswer) {
        throw new Error('No explanation was returned by the engine. Please try asking again.');
      }

      const titleQuestion = question.trim() || (attachedFile ? `[Image Analysis: ${attachedFile.name}]` : currentSubject.name);
      const newItem: StudyHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        subjectId: selectedSubjectId,
        subjectName: currentSubject.name,
        question: titleQuestion,
        answer: accumulatedAnswer,
      };

      setHistory(prev => [newItem, ...prev.slice(0, 29)]);
      incrementDailyProblemsSolved(1);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (isTimeoutAbort) {
          setAskError('Request timed out while connecting to the engine. Please try asking again.');
        }
        // If aborted by user starting a newer query or subject switch, ignore quietly
        return;
      }
      const message = err instanceof Error ? err.message : 'Unable to load explanation. Please check your connection and try again.';
      setAskError(message);
    } finally {
      clearTimeout(timeoutId);
      setIsAskingAI(false);
    }
  };

  // Handle Generate Quiz with AbortController, validation & options
  const handleGenerateQuiz = async (
    diff: QuizDifficulty = quizDifficulty,
    count: QuizLength = quizLength,
    overrideSubjectId?: SubjectId,
    overrideTopic?: string
  ) => {
    // Abort previous in-flight quiz request if any
    quizAbortRef.current?.abort();
    const controller = new AbortController();
    quizAbortRef.current = controller;

    setIsGeneratingQuiz(true);
    setQuizError(null);
    setActiveView('quiz');

    const targetSubId = overrideSubjectId || selectedSubjectId;
    const targetSubject = SUBJECTS.find(s => s.id === targetSubId) || SUBJECTS[0];
    const targetTopic = overrideTopic || question.trim();

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: targetSubject.name,
          topic: targetTopic || undefined,
          difficulty: diff,
          count,
          selectedModel,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz from server.');
      }

      // Validate quiz structure before rendering
      const validated = validateQuizData(data.quiz);
      if (!validated) {
        throw new Error('Received invalid quiz format from server. Please try again.');
      }

      setQuizQuestions(validated);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Could not generate quiz right now. Please try again.';
      setQuizError(message);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Adaptive revision trigger: practice recommended weak topic
  const handlePracticeWeakTopic = (subjectId: SubjectId, topic: string) => {
    setSelectedSubjectId(subjectId);
    setQuestion(topic);
    setExplanation(null);
    setAskError(null);
    setQuizError(null);
    handleGenerateQuiz(quizDifficulty, quizLength, subjectId, topic);
  };

  // Record completed quiz attempt to localStorage progress
  const handleRecordQuizAttempt = (data: {
    totalQuestions: number;
    correctAnswers: number;
    difficulty: string;
    questionResults: QuizQuestionResult[];
  }) => {
    const record: QuizAttemptRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      subjectId: selectedSubjectId,
      subjectName: activeSubject.name,
      topic: question.trim() || activeSubject.shortName,
      difficulty: data.difficulty,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      questionResults: data.questionResults,
    };

    setQuizHistory((prev) => [record, ...prev.slice(0, 49)]);
    incrementDailyQuizAnswered(data.totalQuestions);
  };

  const handleSelectSampleQuestion = (sample: string) => {
    setQuestion(sample);
    setAskError(null);
  };

  const handleCopyExplanation = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopiedExplanation(true);
    setTimeout(() => setCopiedExplanation(false), 2000);
  };

  // Feature 1: Generate Similar Practice Problem
  const handleGenerateSimilarProblem = async () => {
    if (isGeneratingPractice || isAskingAI || isGeneratingQuiz) return;

    const currentSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];
    const baseQuestion = question.trim() || currentSubject.name;

    setIsGeneratingPractice(true);
    setPracticeError(null);
    setIsSolutionOpen(false); // Collapsed by default

    try {
      const prompt = `Generate a similar practice problem based on this student question in ${currentSubject.name}:
"${baseQuestion}"

REQUIREMENTS:
1. Create a NEW practice problem of similar difficulty and core topic, but with DIFFERENT circuit component values, numbers, or parameters.
2. Structure your response into two distinct parts separated by the exact delimiter "---SOLUTION_BREAK---":

PART 1 (Problem Statement):
**PRACTICE PROBLEM:**
[State the problem clearly with all given values, circuit parameters, or requirements, stating what the student must find]

---SOLUTION_BREAK---

PART 2 (Step-by-Step Solution):
**STEP-BY-STEP SOLUTION:**
[Provide the complete step-by-step mathematical solution, formulas, substitutions, calculations, units, and final answer. Format all mathematics strictly in plain text Unicode without LaTeX]`;

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          subject: currentSubject.name,
          question: prompt,
          selectedModel,
          stream: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate practice problem.');
      }

      const raw = data.answer || '';
      let problemPart = raw;
      let solutionPart = '';

      if (raw.includes('---SOLUTION_BREAK---')) {
        const parts = raw.split('---SOLUTION_BREAK---');
        problemPart = parts[0].trim();
        solutionPart = parts[1].trim();
      } else if (raw.includes('**STEP-BY-STEP SOLUTION:**')) {
        const parts = raw.split('**STEP-BY-STEP SOLUTION:**');
        problemPart = parts[0].trim();
        solutionPart = `**STEP-BY-STEP SOLUTION:**\n` + parts[1].trim();
      } else if (raw.includes('STEP-BY-STEP SOLUTION:')) {
        const parts = raw.split('STEP-BY-STEP SOLUTION:');
        problemPart = parts[0].trim();
        solutionPart = `**STEP-BY-STEP SOLUTION:**\n` + parts[1].trim();
      } else {
        problemPart = raw;
        solutionPart = 'Please review the step-by-step principles above to verify your solution.';
      }

      setPracticeProblemData({
        problem: problemPart,
        solution: solutionPart,
      });
      incrementDailyProblemsSolved(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not generate practice problem. Please try again.';
      setPracticeError(message);
    } finally {
      setIsGeneratingPractice(false);
    }
  };

  // Feature 3: Explain Intuitively with everyday real-world analogy
  const handleExplainIntuitively = async () => {
    if (isGeneratingIntuitive || isAskingAI || isGeneratingQuiz) return;

    const currentSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];
    const baseQuestion = question.trim() || currentSubject.name;

    setIsGeneratingIntuitive(true);
    setIntuitiveError(null);

    try {
      const contextText = explanation ? `Context from previous answer:\n${explanation.slice(0, 1200)}\n\n` : '';
      const prompt = `${contextText}Student Question in ${currentSubject.name}: "${baseQuestion}"

SPECIFIC INSTRUCTION:
Explain the core concept using a simple, relatable real-world analogy in two short paragraphs before presenting the formal explanation. Use beginner-friendly language, then provide a clear, step-by-step plain-text solution with formulas and units where relevant. Avoid unnecessary jargon and explain any technical terms.`;

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          subject: currentSubject.name,
          question: prompt,
          selectedModel,
          stream: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate intuitive explanation.');
      }

      setIntuitiveExplanation(data.answer);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not generate intuitive explanation. Please try again.';
      setIntuitiveError(message);
    } finally {
      setIsGeneratingIntuitive(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F1F5F9] flex flex-col font-sans transition-colors w-full max-w-full overflow-x-hidden">
      {/* Top Bar Contract Navigation */}
      <Navbar
        onOpenFormulas={() => setIsFormulaModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenBookmarks={() => setIsBookmarksModalOpen(true)}
        onOpenProgress={() => setIsProgressModalOpen(true)}
        onOpenDailyGoals={() => setIsDailyGoalsModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardModalOpen(true)}
        dailyGoalsSummary={dailyGoalsSummary}
        historyCount={history.length}
        bookmarksCount={bookmarks.length}
        streakDays={streakDays}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />

      {/* Main Educational Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 min-w-0">
        
        {/* Welcoming Header Section */}
        <section className="space-y-2 w-full min-w-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#2A3850]">
            <div className="flex items-start gap-3 min-w-0">
              <div className="hidden sm:flex p-1.5 rounded-2xl bg-[#151F32] border border-[#2A3850] shadow-xs shrink-0 mt-0.5">
                <EceLogo size={38} className="w-9 h-9" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#7F8DA3] mb-1">
                  <span>First-Year Engineering Console</span>
                  <span aria-hidden="true" className="select-none text-[#2A3850] px-0.5">/</span>
                  <span>Semester 1 & 2 Foundations</span>
                  {streakDays > 0 && (
                    <>
                      <span aria-hidden="true" className="select-none text-[#2A3850] px-0.5">/</span>
                      <span className="font-semibold text-amber-400">
                        {streakDays}-Day Streak
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#F1F5F9]" style={{ textWrap: 'balance' }}>
                  ECE Study Buddy
                </h1>
                <p className="text-xs sm:text-sm text-[#A7B4C8] mt-1 max-w-2xl leading-relaxed">
                  Clear conceptual explanations, intuitive analogies, step-by-step mathematical derivations, persistent bookmarks, and adaptive practice quizzes.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-[#7F8DA3] shrink-0">
              <span className="font-semibold text-[#F1F5F9]">{activeSubject.name}</span>
              <span aria-hidden="true" className="select-none text-[#2A3850]">/</span>
              <button
                onClick={() => setIsDailyGoalsModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-medium py-1 px-1.5 min-h-[32px] flex items-center gap-1"
                title="View & Set Daily Goals"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Daily Goals</span>
              </button>
              <span aria-hidden="true" className="select-none text-[#2A3850]">/</span>
              <button
                onClick={() => setIsFormulaModalOpen(true)}
                className="text-[#3B82F6] hover:text-blue-400 hover:underline cursor-pointer font-medium py-1 px-1.5 min-h-[32px] flex items-center"
              >
                Cheatsheets
              </button>
              <span aria-hidden="true" className="select-none text-[#2A3850]">/</span>
              <button
                onClick={() => setIsProgressModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer font-medium py-1 px-1.5 min-h-[32px] flex items-center"
              >
                Analytics
              </button>
              <span aria-hidden="true" className="select-none text-[#2A3850]">/</span>
              <button
                onClick={() => setIsLeaderboardModalOpen(true)}
                className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer font-medium py-1 px-1.5 min-h-[32px] flex items-center gap-1"
                title="View Quiz Leaderboard & Top Scores"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </button>
            </div>
          </div>
        </section>

        {/* Adaptive Revision Recommendation Banner (Displays when user has weak topics) */}
        <WeakTopicsCard
          weakTopics={weakTopics}
          onPracticeTopic={handlePracticeWeakTopic}
          onOpenProgress={() => setIsProgressModalOpen(true)}
        />

        {/* Dashboard 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full min-w-0">
          
          {/* Left Column: Subject Selector & Input Studio (lg: 5 cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5 w-full min-w-0">
            
            {/* Subject Choices */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#151F32] border border-[#2A3850] shadow-sm space-y-3 w-full min-w-0 card-responsive">
              <div className="flex items-center justify-between text-xs font-semibold text-[#7F8DA3]">
                <span>Subject Curriculum</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeSubject.id}
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.16 }}
                    className={`font-semibold ${SUBJECT_ACCENTS[selectedSubjectId].text}`}
                  >
                    {activeSubject.name}
                  </motion.span>
                </AnimatePresence>
              </div>

              <SubjectTabs
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={handleSelectSubject}
                onSelectTopic={(topic) => {
                  setQuestion(`Explain ${topic} with an intuitive analogy, core formulas, and a beginner-friendly example.`);
                  setAskError(null);
                }}
              />
            </div>

            {/* Question Studio Input Card */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-[#151F32] border border-[#2A3850] shadow-sm space-y-3 w-full min-w-0 card-responsive">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*,application/pdf,.txt"
                className="hidden"
                aria-label="Upload image, screenshot, or PDF"
              />

              <div className="flex items-center justify-between text-xs font-semibold text-[#7F8DA3]">
                <label htmlFor="question-input">Engineering Problem Studio</label>
                <div className="flex items-center gap-2">
                  {(question || attachedFile) && (
                    <button
                      onClick={() => {
                        setQuestion('');
                        setAttachedFile(null);
                      }}
                      className="text-[#7F8DA3] hover:text-[#F1F5F9] cursor-pointer py-1 px-1.5 min-h-[30px] flex items-center transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Uploaded File Attachment Preview */}
              {attachedFile && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1B2940] border border-[#2A3850] text-xs shadow-xs w-full min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {attachedFile.previewUrl ? (
                      <img
                        src={attachedFile.previewUrl}
                        alt={attachedFile.name}
                        className="w-11 h-11 object-cover rounded-lg border border-[#2A3850] shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-[#151F32] flex items-center justify-center shrink-0 text-[#3B82F6] border border-[#2A3850]">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#F1F5F9] truncate">
                        {attachedFile.name}
                      </p>
                      <p className="text-[11px] text-[#3B82F6]">
                        {(attachedFile.size / 1024).toFixed(1)} KB • {attachedFile.type.startsWith('image/') ? 'Image/Diagram' : 'Document'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1.5 rounded-md text-[#7F8DA3] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                    title="Remove attached file"
                    aria-label="Remove attached file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`rounded-xl border transition-all ${
                  isDragging
                    ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/30 bg-[#1B2940]/40'
                    : 'border-[#2A3850] bg-[#111827] focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6]/40'
                }`}
              >
                <textarea
                  id="question-input"
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    if (askError) setAskError(null);
                  }}
                  onPaste={handlePaste}
                  rows={3}
                  placeholder={
                    attachedFile
                      ? `Add specific notes or instructions for ${attachedFile.name} (optional)...`
                      : SUBJECT_PLACEHOLDERS[selectedSubjectId] || `Ask anything about ${activeSubject.shortName}...`
                  }
                  className="w-full p-3 sm:p-3.5 text-base sm:text-sm text-[#F1F5F9] placeholder:text-[#7F8DA3] bg-transparent resize-none focus:outline-hidden leading-relaxed min-h-[85px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                />

                <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 border-t border-[#2A3850] text-[11px] text-[#7F8DA3]">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-lg bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] text-[#F1F5F9] transition-colors cursor-pointer font-medium text-[11px]"
                      title="Upload problem image, screenshot, or document"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>{attachedFile ? 'Change File' : 'Attach File'}</span>
                    </button>
                    <span className="hidden sm:inline text-[#7F8DA3]">Drag & drop or paste screenshot</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#7F8DA3]">
                    <span className="hidden sm:inline">Ctrl+Enter</span>
                    <span className="tabular-nums">{question.length} chars</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 w-full">
                {/* Ask AI / Solve & Explain Button */}
                <button
                  type="button"
                  onClick={handleAskAI}
                  disabled={isAskingAI || isGeneratingQuiz}
                  className="w-full py-3 px-4 min-h-[46px] rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:bg-blue-700 shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAskingAI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {isAskingAI
                      ? attachedFile
                        ? 'Analyzing Problem...'
                        : 'Analyzing...'
                      : attachedFile
                      ? 'Solve Uploaded Problem'
                      : 'Solve & Explain'}
                  </span>
                </button>

                {/* Generate Quiz Questions Button */}
                <button
                  type="button"
                  onClick={() => handleGenerateQuiz(quizDifficulty, quizLength)}
                  disabled={isGeneratingQuiz || isAskingAI}
                  className="w-full py-3 px-4 min-h-[46px] rounded-xl text-xs sm:text-sm font-semibold text-[#F1F5F9] bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 text-[#34D399]" />
                  <span>{isGeneratingQuiz ? 'Creating Quiz...' : `Quiz (${quizLength} Qs • ${quizDifficulty})`}</span>
                </button>
              </div>

              {/* Pre-Quiz Difficulty Selector: Allows toggling difficulty before generating */}
              <div className="pt-1.5 flex items-center justify-between gap-2 text-xs">
                <span className="text-[#7F8DA3] font-medium flex items-center gap-1.5 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Difficulty:</span>
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#111827] border border-[#2A3850]">
                  {(['Beginner', 'Core Concept', 'Exam Level'] as QuizDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setQuizDifficulty(diff)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        quizDifficulty === diff
                          ? 'bg-[#1B2940] text-[#3B82F6] border border-[#3B82F6]/40 shadow-xs font-semibold'
                          : 'text-[#7F8DA3] hover:text-[#F1F5F9]'
                      }`}
                      title={`Set difficulty to ${diff} before generating`}
                    >
                      {diff === 'Exam Level' ? 'Exam' : diff === 'Core Concept' ? 'Core' : 'Beginner'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active AI Engine Indicator */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#111827] border border-[#2A3850] text-[11px] text-[#7F8DA3] w-full min-w-0">
                <span className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                  <span className="font-medium text-[#7F8DA3] shrink-0">Engine:</span>
                  <span className="font-semibold text-[#F1F5F9] truncate">
                    {selectedModel === 'gemini-3.1-flash-lite' ? 'Fast · gemini-3.1-flash-lite' : selectedModel === 'gemini-3.1-pro' ? 'Deep Reasoning · gemini-3.1-pro' : 'Balanced · gemini-3.8-flash'}
                  </span>
                </span>
                <span className="text-[10px] text-[#7F8DA3] shrink-0 hidden sm:inline ml-1 font-medium">
                  Switch in header
                </span>
              </div>

              {/* Sample Questions (Animates smoothly with subtle motion when selectedSubjectId changes) */}
              <div className="pt-2.5 border-t border-[#2A3850] w-full min-w-0">
                <span className="text-[11px] font-semibold text-[#7F8DA3] block mb-2">
                  Frequent First-Year Exam Questions:
                </span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`sample-${selectedSubjectId}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-1.5 w-full"
                  >
                    {activeSubject.sampleQuestions.slice(0, 3).map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSampleQuestion(sample)}
                        type="button"
                        className={`w-full text-left text-xs p-2.5 min-h-[38px] rounded-lg bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] text-[#A7B4C8] hover:text-[#F1F5F9] transition-colors cursor-pointer flex items-center justify-between group ${
                          selectedSubjectId === 'electronics' ? 'hover:border-blue-500/50' :
                          selectedSubjectId === 'c-programming' ? 'hover:border-emerald-500/50' :
                          selectedSubjectId === 'math' ? 'hover:border-amber-500/50' :
                          'hover:border-violet-500/50'
                        }`}
                      >
                        <span className="line-clamp-1 flex-1 pr-1 font-medium">{sample}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#7F8DA3] group-hover:text-[#3B82F6] shrink-0 transition-colors" />
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column: Output Console / Quiz Canvas */}
          <div className="lg:col-span-7 space-y-4 w-full min-w-0">
            
            {/* Console Navigation Header if response exists */}
            {(explanation || quizQuestions) && !isGeneratingQuiz && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 sm:p-1.5 bg-[#151F32] rounded-xl border border-[#2A3850] w-full min-w-0 shadow-sm">
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scroll-touch pb-0.5 sm:pb-0 min-w-0">
                  {explanation && (
                    <button
                      onClick={() => setActiveView('explanation')}
                      className={`px-3 py-2 sm:py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeView === 'explanation'
                          ? 'bg-[#1B2940] text-[#F1F5F9] border border-[#2A3850] shadow-xs'
                          : 'text-[#A7B4C8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>AI Explanation</span>
                      {isAskingAI && <span className="inline-block w-2 h-2 rounded-full bg-[#3B82F6] animate-ping" />}
                    </button>
                  )}

                  {quizQuestions && (
                    <button
                      onClick={() => setActiveView('quiz')}
                      className={`px-3 py-2 sm:py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeView === 'quiz'
                          ? 'bg-[#1B2940] text-[#F1F5F9] border border-[#2A3850] shadow-xs'
                          : 'text-[#A7B4C8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Quiz Mode</span>
                      <span className="text-[10px] tabular-nums text-[#7F8DA3]">({quizQuestions.length})</span>
                    </button>
                  )}
                </div>

                {activeView === 'explanation' && explanation && (
                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-[#2A3850]">
                    {/* Explain Intuitively Quick Action Button */}
                    <button
                      type="button"
                      onClick={handleExplainIntuitively}
                      disabled={isGeneratingIntuitive || isAskingAI}
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-amber-950/30 text-amber-300 border border-amber-800/60 hover:bg-amber-900/40 transition-colors flex items-center gap-1.5 cursor-pointer font-medium disabled:opacity-50 min-h-[38px] sm:min-h-[32px]"
                      title="Explain the core concept using a relatable everyday analogy"
                    >
                      <Lightbulb className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingIntuitive ? 'animate-pulse' : ''}`} />
                      <span>{isGeneratingIntuitive ? 'Explaining...' : 'Explain Intuitively'}</span>
                    </button>

                    <button
                      onClick={handleCopyExplanation}
                      disabled={isAskingAI}
                      className="px-2.5 py-1.5 text-xs rounded-md text-[#A7B4C8] hover:text-[#F1F5F9] hover:bg-[#1B2940] transition-colors flex items-center gap-1 cursor-pointer min-h-[38px] sm:min-h-[32px] disabled:opacity-50"
                      title="Copy explanation text"
                    >
                      {copiedExplanation ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#7F8DA3]" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Functional Persistent Bookmark Button */}
                    <button
                      onClick={handleToggleBookmark}
                      disabled={isAskingAI}
                      className={`px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium min-h-[38px] sm:min-h-[32px] disabled:opacity-50 ${
                        isCurrentExplanationBookmarked
                          ? 'bg-[#1B2940] text-[#3B82F6] border border-[#3B82F6]/50'
                          : 'text-[#A7B4C8] hover:text-[#F1F5F9] hover:bg-[#1B2940]'
                      }`}
                      title={isCurrentExplanationBookmarked ? 'Remove bookmark' : 'Bookmark this explanation'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isCurrentExplanationBookmarked ? 'fill-current text-[#3B82F6]' : 'text-[#7F8DA3]'}`} />
                      <span>{isCurrentExplanationBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateQuiz(quizDifficulty, quizLength)}
                      disabled={isAskingAI}
                      className="px-2.5 py-1.5 text-xs rounded-md text-emerald-400 hover:bg-emerald-950/40 transition-colors flex items-center gap-1 cursor-pointer font-medium min-h-[38px] sm:min-h-[32px] disabled:opacity-50 border border-emerald-800/40"
                      title="Generate quiz questions for this topic"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Quiz Me</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {(askError || quizError) && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm w-full min-w-0 shadow-sm">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-semibold text-rose-100">Notice: </span>
                    <span className="text-rose-200">{askError || quizError}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (askError) handleAskAI();
                    if (quizError) handleGenerateQuiz(quizDifficulty, quizLength);
                  }}
                  className="w-full sm:w-auto px-3 py-2 sm:py-1 rounded-md text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/80 transition-colors cursor-pointer shrink-0 text-center min-h-[36px]"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Indicator (Shown when quiz is crafting, or when AI query begins before first chunk arrives) */}
            {((isAskingAI && !explanation) || isGeneratingQuiz) && (
              <div className="p-6 sm:p-12 rounded-2xl bg-[#151F32] border border-[#2A3850] shadow-sm text-center space-y-3 w-full min-w-0 card-responsive">
                <div className="w-10 h-10 mx-auto rounded-xl bg-[#3B82F6] text-white flex items-center justify-center shadow-xs">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#F1F5F9]">
                    {isAskingAI
                      ? `Synthesizing explanation for ${activeSubject.name}...`
                      : `Crafting ${quizLength} conceptual questions for ${activeSubject.name}...`}
                  </h3>
                  <p className="text-xs text-[#A7B4C8] mt-1 max-w-sm mx-auto leading-relaxed">
                    {isAskingAI
                      ? 'Formulating step-by-step logic, mathematical derivations, circuit schematics, and exam traps...'
                      : `Setting up ${quizLength} questions at ${quizDifficulty} level with detailed rationales.`}
                  </p>
                </div>
              </div>
            )}

            {/* Active Output 1: Explanation View (Displayed live during streaming and after completion) */}
            {!isGeneratingQuiz && activeView === 'explanation' && explanation && (
              <motion.div
                key={`explanation-${selectedSubjectId}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 w-full min-w-0"
              >
                <div className="p-3.5 sm:p-6 lg:p-7 rounded-2xl bg-[#151F32] border border-[#2A3850] shadow-sm space-y-4 w-full min-w-0 card-responsive overflow-hidden">
                  {/* Topic Title Bar with live streaming status */}
                  <div className="pb-3 border-b border-[#2A3850] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-[#7F8DA3] flex items-center gap-1.5 mb-1">
                        <span className={`font-semibold ${SUBJECT_ACCENTS[selectedSubjectId].text}`}>{activeSubject.name}</span>
                        <span aria-hidden="true" className="select-none text-[#2A3850] px-0.5">/</span>
                        <span>Technical Breakdown</span>
                      </div>
                      <h2 className="text-base sm:text-xl font-bold text-[#F1F5F9] break-words">
                        {question || 'Concept Explanation'}
                      </h2>
                    </div>

                    {isAskingAI && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B2940] border border-[#3B82F6]/50 text-[#3B82F6] text-xs font-semibold self-start sm:self-center shrink-0">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
                        <span>Formulating solution live...</span>
                      </div>
                    )}
                  </div>

                  {/* Markdown Renderer with live typing cursor */}
                  <div className="text-[#F1F5F9] w-full min-w-0">
                    <MarkdownRenderer content={explanation} />
                    {isAskingAI && (
                      <span className="inline-block w-2 h-4 ml-1.5 bg-[#3B82F6] animate-pulse align-middle" aria-hidden="true" />
                    )}
                  </div>

                  {/* Toast feedback */}
                  {savedBookmarkToast && (
                    <div className="p-3 rounded-lg bg-[#1B2940] border border-[#3B82F6]/40 text-xs text-[#3B82F6] flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-[#3B82F6] shrink-0" />
                      <span>{bookmarkToastMessage}</span>
                    </div>
                  )}

                  {/* Feature 1 Action: Generate Similar Practice Problem Button */}
                  <div className="pt-3.5 border-t border-[#2A3850] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={handleGenerateSimilarProblem}
                      disabled={isGeneratingPractice || isAskingAI}
                      className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-[#1B2940] hover:bg-[#223350] text-[#F1F5F9] border border-[#2A3850] hover:border-[#3B82F6]/60 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 min-h-[44px]"
                    >
                      {isGeneratingPractice ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                          <span>Generating Practice Problem...</span>
                        </>
                      ) : isAskingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                          <span>Streaming answer in progress...</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 text-[#3B82F6]" />
                          <span>Generate Similar Practice Problem</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-[#7F8DA3] text-center sm:text-right">
                      Test yourself with different numbers & hidden solution
                    </span>
                  </div>
                </div>

                {/* Intuitive Explanation Loading State */}
                {isGeneratingIntuitive && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#1B2940] border border-[#2A3850] text-center space-y-2 animate-in fade-in w-full min-w-0">
                    <Lightbulb className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                    <p className="text-xs sm:text-sm font-semibold text-[#F1F5F9]">
                      Crafting intuitive real-world analogy and beginner-friendly solution...
                    </p>
                  </div>
                )}

                {/* Intuitive Explanation Error State */}
                {intuitiveError && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm w-full min-w-0">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{intuitiveError}</span>
                    </div>
                    <button
                      onClick={handleExplainIntuitively}
                      className="w-full sm:w-auto px-3 py-2 sm:py-1 rounded bg-rose-900/80 text-rose-100 border border-rose-700/80 font-semibold cursor-pointer text-center min-h-[36px]"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Intuitive Explanation Display Card */}
                {intuitiveExplanation && (
                  <div className="p-3.5 sm:p-6 rounded-2xl bg-[#1B2940] border border-[#2A3850] shadow-sm space-y-3.5 animate-in fade-in w-full min-w-0 card-responsive overflow-hidden">
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#2A3850]">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-800/40 shrink-0">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9]">
                              Intuitive Real-World Explanation
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/50">
                              Analogy First
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A7B4C8]">
                            Core concept explained using everyday mental models
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIntuitiveExplanation(null)}
                        className="p-1.5 rounded-lg text-[#7F8DA3] hover:text-[#F1F5F9] hover:bg-[#151F32] cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 transition-colors"
                        title="Dismiss intuitive explanation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[#F1F5F9] w-full min-w-0">
                      <MarkdownRenderer content={intuitiveExplanation} />
                    </div>
                  </div>
                )}

                {/* Practice Problem Loading State */}
                {isGeneratingPractice && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#151F32] border border-[#2A3850] text-center space-y-2 animate-in fade-in w-full min-w-0">
                    <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin mx-auto" />
                    <p className="text-xs sm:text-sm font-semibold text-[#F1F5F9]">
                      Formulating a new practice problem with alternative values...
                    </p>
                  </div>
                )}

                {/* Practice Problem Error State */}
                {practiceError && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm w-full min-w-0">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{practiceError}</span>
                    </div>
                    <button
                      onClick={handleGenerateSimilarProblem}
                      className="w-full sm:w-auto px-3 py-2 sm:py-1 rounded bg-rose-900/80 text-rose-100 border border-rose-700/80 font-semibold cursor-pointer text-center min-h-[36px]"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Similar Practice Problem Display Card */}
                {practiceProblemData && (
                  <div className="p-3.5 sm:p-6 rounded-2xl bg-[#151F32] border border-[#2A3850] shadow-sm space-y-4 animate-in fade-in w-full min-w-0 card-responsive overflow-hidden">
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#2A3850]">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-lg bg-[#3B82F6] text-white shadow-xs shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9]">
                              Similar Practice Problem
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B2940] border border-[#2A3850] text-[#3B82F6]">
                              New Values
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A7B4C8]">
                            Work through this problem independently before revealing the steps
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleGenerateSimilarProblem}
                          disabled={isGeneratingPractice}
                          className="px-2.5 py-1.5 text-xs text-[#3B82F6] hover:bg-[#1B2940] rounded-lg transition-colors cursor-pointer flex items-center gap-1 min-h-[38px] sm:min-h-[36px]"
                          title="Generate another variation"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">New Variation</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPracticeProblemData(null)}
                          className="p-1.5 text-[#7F8DA3] hover:text-[#F1F5F9] rounded-lg hover:bg-[#1B2940] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                          title="Dismiss practice problem"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Problem Statement Body */}
                    <div className="text-[#F1F5F9] w-full min-w-0">
                      <MarkdownRenderer content={practiceProblemData.problem} />
                    </div>

                    {/* Collapsible Show Solution Button & Section */}
                    <div className="pt-2 border-t border-[#2A3850] space-y-3">
                      <button
                        type="button"
                        onClick={() => setIsSolutionOpen((prev) => !prev)}
                        className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] bg-[#1B2940] hover:bg-[#223350] text-[#F1F5F9] border border-[#2A3850] shadow-xs"
                      >
                        {isSolutionOpen ? (
                          <>
                            <EyeOff className="w-4 h-4 text-[#3B82F6]" />
                            <span>Hide Step-by-Step Solution</span>
                            <ChevronUp className="w-4 h-4 text-[#7F8DA3]" />
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-[#3B82F6]" />
                            <span>Show Step-by-Step Solution</span>
                            <ChevronDown className="w-4 h-4 text-[#7F8DA3]" />
                          </>
                        )}
                      </button>

                      {isSolutionOpen && (
                        <div className="p-3.5 sm:p-5 rounded-xl bg-[#111827] border border-[#2A3850] space-y-3 animate-in fade-in w-full min-w-0">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#34D399] uppercase tracking-wider">
                            <CheckCircle className="w-4 h-4" />
                            <span>Step-by-Step Solution & Derivations</span>
                          </div>
                          <div className="text-[#F1F5F9] w-full min-w-0">
                            <MarkdownRenderer content={practiceProblemData.solution} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Active Output 2: Quiz View */}
            {!isAskingAI && !isGeneratingQuiz && activeView === 'quiz' && quizQuestions && (
              <motion.div
                key={`quiz-${selectedSubjectId}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="w-full min-w-0"
              >
                <QuizSection
                  questions={quizQuestions}
                  subjectName={activeSubject.name}
                  topicName={question.trim() || activeSubject.shortName}
                  selectedDifficulty={quizDifficulty}
                  selectedLength={quizLength}
                  onChangeDifficulty={(d) => {
                    setQuizDifficulty(d);
                  }}
                  onChangeLength={(l) => {
                    setQuizLength(l);
                  }}
                  onGenerateNew={(d, l) => handleGenerateQuiz(d || quizDifficulty, l || quizLength)}
                  isGeneratingNew={isGeneratingQuiz}
                  onRecordAttempt={handleRecordQuizAttempt}
                  onOpenLeaderboard={() => setIsLeaderboardModalOpen(true)}
                />
              </motion.div>
            )}

            {/* Initial Idle State: Academic Subject Overview with Fluid Motion */}
            <AnimatePresence mode="wait">
              {!explanation && !quizQuestions && !isAskingAI && !isGeneratingQuiz && (
                <SubjectOverview
                  key={`overview-${selectedSubjectId}`}
                  subject={activeSubject}
                  onSelectSample={(sample) => {
                    setQuestion(sample);
                    setAskError(null);
                  }}
                  onSelectTopic={(topic) => {
                    setQuestion(`Explain ${topic} with an intuitive analogy, core formulas, and a beginner-friendly example.`);
                    setAskError(null);
                  }}
                  onStartQuiz={() => handleGenerateQuiz(quizDifficulty, quizLength)}
                  onOpenFormulas={() => setIsFormulaModalOpen(true)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#2A3850] bg-[#0B1120] py-5 text-xs text-[#7F8DA3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ECE Study Buddy - First-Year Engineering Academic Console</span>
          <div className="flex items-center gap-2 text-[#7F8DA3]">
            <span>Electronics</span>
            <span aria-hidden="true" className="select-none text-[#2A3850]">/</span>
            <span>C Programming</span>
            <span aria-hidden="true" className="select-none text-[#2A3850]">/</span>
            <span>Mathematics</span>
            <span aria-hidden="true" className="select-none text-[#2A3850]">/</span>
            <span>General Engg.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FormulaSheetModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        initialSubjectId={selectedSubjectId}
      />

      <StudyHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onSelectHistory={(item) => {
          setSelectedSubjectId(item.subjectId);
          setQuestion(item.question);
          setExplanation(item.answer);
          setActiveView('explanation');
        }}
        onClearHistory={() => setHistory([])}
      />

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksModalOpen}
        onClose={() => setIsBookmarksModalOpen(false)}
        bookmarks={bookmarks}
        onSelectBookmark={(item) => {
          setSelectedSubjectId(item.subjectId);
          setQuestion(item.question);
          setExplanation(item.explanation);
          setActiveView('explanation');
        }}
        onDeleteBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
        onClearBookmarks={() => setBookmarks([])}
      />

      {/* Learning Progress Modal */}
      <ProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        quizHistory={quizHistory}
        onPracticeTopic={handlePracticeWeakTopic}
        onClearProgress={() => setQuizHistory([])}
      />

      {/* Daily Study Goals Modal */}
      <DailyGoalsModal
        isOpen={isDailyGoalsModalOpen}
        onClose={() => setIsDailyGoalsModalOpen(false)}
        config={dailyGoalsConfig}
        progress={dailyGoalsProgress}
        streakDays={streakDays}
        onUpdateConfig={setDailyGoalsConfig}
        onUpdateProgress={setDailyGoalsProgress}
        onResetProgress={handleResetDailyGoalsProgress}
        onNavigateToQuiz={() => {
          setActiveView('quiz');
          if (!quizQuestions) {
            handleGenerateQuiz();
          }
        }}
        onNavigateToAsk={() => {
          setActiveView('explanation');
        }}
      />

      {/* Quiz Leaderboard & Top Scores Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        quizHistory={quizHistory}
        onStartQuiz={(difficulty) => {
          const diff = difficulty || quizDifficulty;
          setQuizDifficulty(diff);
          setActiveView('quiz');
          handleGenerateQuiz(diff, quizLength);
        }}
      />
    </div>
  );
}

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
  AIModelId 
} from './types';
import { SUBJECTS } from './data/subjectData';
import { Navbar } from './components/Navbar';
import { SubjectTabs } from './components/SubjectTabs';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { QuizSection } from './components/QuizSection';
import { FormulaSheetModal } from './components/FormulaSheetModal';
import { StudyHistoryModal } from './components/StudyHistoryModal';
import { BookmarksModal } from './components/BookmarksModal';
import { ProgressModal } from './components/ProgressModal';
import { WeakTopicsCard } from './components/WeakTopicsCard';
import { 
  Sparkles, 
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

export default function App() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('electronics');
  const [question, setQuestion] = useState<string>('');
  
  // AI Explanation State
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isAskingAI, setIsAskingAI] = useState<boolean>(false);
  const [askError, setAskError] = useState<string | null>(null);

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
    return 'gemini-3.8-flash';
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

  // Subject Switch Notification State
  const [switchNotice, setSwitchNotice] = useState<string | null>(null);

  // View state: 'explanation' or 'quiz'
  const [activeView, setActiveView] = useState<'explanation' | 'quiz'>('explanation');

  // Modals & Storage
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState<boolean>(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);

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

  // Persisted Dark Mode Preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ece_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [copiedExplanation, setCopiedExplanation] = useState<boolean>(false);
  const [savedBookmarkToast, setSavedBookmarkToast] = useState<boolean>(false);
  const [bookmarkToastMessage, setBookmarkToastMessage] = useState<string>('Saved to persistent bookmarks!');

  // Synchronize Dark Mode to DOM and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('ece_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
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

  // Auto-dismiss subject switch notification after 4.5 seconds
  useEffect(() => {
    if (!switchNotice) return;
    const timer = setTimeout(() => {
      setSwitchNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [switchNotice]);

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
    setQuizQuestions(null);
    setAskError(null);
    setQuizError(null);
    setActiveView('explanation');

    setSwitchNotice(`Switched to ${targetName}. Started a new conversation.`);
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

    setSwitchNotice(null);
    setIsAskingAI(true);
    setAskError(null);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch explanation from server.');
      }

      setExplanation(data.answer);

      const titleQuestion = question.trim() || (attachedFile ? `[Image Analysis: ${attachedFile.name}]` : currentSubject.name);
      const newItem: StudyHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        subjectId: selectedSubjectId,
        subjectName: currentSubject.name,
        question: titleQuestion,
        answer: data.answer,
      };

      setHistory(prev => [newItem, ...prev.slice(0, 29)]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted by newer query or subject switch, ignore quietly
        return;
      }
      const message = err instanceof Error ? err.message : 'Unable to load explanation. Please check your connection and try again.';
      setAskError(message);
    } finally {
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

    setSwitchNotice(null);
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
  };

  const handleSelectSampleQuestion = (sample: string) => {
    setQuestion(sample);
    setAskError(null);
    setSwitchNotice(null);
  };

  const handleCopyExplanation = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopiedExplanation(true);
    setTimeout(() => setCopiedExplanation(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Contract Navigation */}
      <Navbar
        onOpenFormulas={() => setIsFormulaModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenBookmarks={() => setIsBookmarksModalOpen(true)}
        onOpenProgress={() => setIsProgressModalOpen(true)}
        historyCount={history.length}
        bookmarksCount={bookmarks.length}
        streakDays={streakDays}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />

      {/* Main Educational Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Welcoming Header Section */}
        <section className="space-y-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>First-Year Engineering Learning Console</span>
                <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 px-0.5">/</span>
                <span>Semester 1 & 2 Foundations</span>
                {streakDays > 0 && (
                  <>
                    <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 px-0.5">/</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {streakDays}-Day Streak
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
                ECE Study Buddy
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Clear conceptual explanations, intuitive analogies, step-by-step mathematical derivations, persistent bookmarks, and adaptive practice quizzes.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <span className="font-medium text-slate-900 dark:text-slate-200">{activeSubject.name}</span>
              <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600">/</span>
              <button
                onClick={() => setIsFormulaModalOpen(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
              >
                Cheatsheets
              </button>
              <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600">/</span>
              <button
                onClick={() => setIsProgressModalOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
              >
                Analytics
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Subject Selector & Input Studio (lg: 5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Subject Choices */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>1. Select Subject</span>
                <span className="text-blue-600 dark:text-blue-400">{activeSubject.shortName}</span>
              </div>

              <SubjectTabs
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={handleSelectSubject}
                onSelectTopic={(topic) => {
                  setQuestion(`Explain ${topic} with an intuitive analogy, core formulas, and a beginner-friendly example.`);
                  setAskError(null);
                  setSwitchNotice(null);
                }}
              />
            </div>

            {/* Subject Switch Notification Banner */}
            {switchNotice && (
              <div className="p-3 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium">{switchNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSwitchNotice(null)}
                  className="p-1 rounded-md text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Question Studio Input Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*,application/pdf,.txt"
                className="hidden"
                aria-label="Upload image, screenshot, or PDF"
              />

              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <label htmlFor="question-input">2. Enter Question or Upload Problem</label>
                <div className="flex items-center gap-2">
                  {(question || attachedFile) && (
                    <button
                      onClick={() => {
                        setQuestion('');
                        setAttachedFile(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Uploaded File Attachment Preview */}
              {attachedFile && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/80 text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {attachedFile.previewUrl ? (
                      <img
                        src={attachedFile.previewUrl}
                        alt={attachedFile.name}
                        className="w-11 h-11 object-cover rounded-lg border border-blue-200 dark:border-blue-700 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-[260px]">
                        {attachedFile.name}
                      </p>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">
                        {(attachedFile.size / 1024).toFixed(1)} KB • {attachedFile.type.startsWith('image/') ? 'Image/Diagram' : 'Document'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/30 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-950/40 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
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
                      : `Ask anything about ${activeSubject.shortName} or attach/paste problem screenshot...`
                  }
                  className="w-full p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent resize-none focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                />

                <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer font-medium text-[11px]"
                      title="Upload problem image, screenshot, or document"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{attachedFile ? 'Change File' : 'Attach File'}</span>
                    </button>
                    <span className="hidden sm:inline text-slate-400">Drag & drop or paste screenshot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline">Ctrl+Enter</span>
                    <span className="tabular-nums">{question.length} chars</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Ask AI Button */}
                <button
                  type="button"
                  onClick={handleAskAI}
                  disabled={isAskingAI || isGeneratingQuiz}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isAskingAI
                      ? attachedFile
                        ? 'Analyzing Problem...'
                        : 'Analyzing...'
                      : attachedFile
                      ? 'Solve Uploaded Problem'
                      : 'Ask AI'}
                  </span>
                </button>

                {/* Generate Quiz Questions Button */}
                <button
                  type="button"
                  onClick={() => handleGenerateQuiz(quizDifficulty, quizLength)}
                  disabled={isGeneratingQuiz || isAskingAI}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isGeneratingQuiz ? 'Creating Quiz...' : `Quiz (${quizLength} Qs)`}</span>
                </button>
              </div>

              {/* Active AI Engine Indicator */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Engine:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {selectedModel === 'gemini-3.1-flash-lite' ? 'Fast (gemini-3.1-flash-lite)' : selectedModel === 'gemini-3.1-pro' ? 'Deep Reasoning (gemini-3.1-pro)' : 'Balanced (gemini-3.8-flash)'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 hidden sm:inline">
                  Change mode in top header
                </span>
              </div>

              {/* Sample Questions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                  Frequent First-Year Exam Questions:
                </span>
                <div className="space-y-1.5">
                  {activeSubject.sampleQuestions.slice(0, 3).map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSampleQuestion(sample)}
                      className="w-full text-left text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <span className="line-clamp-1">{sample}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0 ml-1 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Output Console / Quiz Canvas (lg: 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Console Navigation Header if response exists */}
            {(explanation || quizQuestions) && !isAskingAI && !isGeneratingQuiz && (
              <div className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  {explanation && (
                    <button
                      onClick={() => setActiveView('explanation')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeView === 'explanation'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>AI Explanation</span>
                    </button>
                  )}

                  {quizQuestions && (
                    <button
                      onClick={() => setActiveView('quiz')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeView === 'quiz'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Quiz Mode</span>
                      <span className="text-[10px] tabular-nums text-slate-400">({quizQuestions.length})</span>
                    </button>
                  )}
                </div>

                {activeView === 'explanation' && explanation && (
                  <div className="flex items-center gap-1.5 pr-1">
                    <button
                      onClick={handleCopyExplanation}
                      className="px-2.5 py-1 text-xs rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy explanation text"
                    >
                      {copiedExplanation ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {/* Functional Persistent Bookmark Button */}
                    <button
                      onClick={handleToggleBookmark}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium ${
                        isCurrentExplanationBookmarked
                          ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
                      }`}
                      title={isCurrentExplanationBookmarked ? 'Remove bookmark' : 'Bookmark this explanation'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isCurrentExplanationBookmarked ? 'fill-current text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span>{isCurrentExplanationBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateQuiz(quizDifficulty, quizLength)}
                      className="px-2.5 py-1 text-xs rounded-md text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors flex items-center gap-1 cursor-pointer font-medium"
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
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Notice: </span>
                    <span>{askError || quizError}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (askError) handleAskAI();
                    if (quizError) handleGenerateQuiz(quizDifficulty, quizLength);
                  }}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-200 dark:bg-rose-900 hover:bg-rose-300 text-rose-900 dark:text-rose-100 transition-colors cursor-pointer shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {(isAskingAI || isGeneratingQuiz) && (
              <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {isAskingAI
                      ? `Synthesizing explanation for ${activeSubject.name}...`
                      : `Crafting ${quizLength} conceptual questions for ${activeSubject.name}...`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    {isAskingAI
                      ? 'Translating technical formulas into plain analogies, step-by-step logic, and exam warnings.'
                      : `Setting up ${quizLength} questions at ${quizDifficulty} level with detailed rationales.`}
                  </p>
                </div>
              </div>
            )}

            {/* Active Output 1: Explanation View */}
            {!isAskingAI && !isGeneratingQuiz && activeView === 'explanation' && explanation && (
              <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                
                {/* Topic Title Bar */}
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{activeSubject.name}</span>
                    <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 px-0.5">/</span>
                    <span>Conceptual Breakdown</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {question || 'Concept Explanation'}
                  </h2>
                </div>

                {/* Markdown Renderer */}
                <div className="text-slate-800 dark:text-slate-200">
                  <MarkdownRenderer content={explanation} />
                </div>

                {/* Toast feedback */}
                {savedBookmarkToast && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>{bookmarkToastMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* Active Output 2: Quiz View */}
            {!isAskingAI && !isGeneratingQuiz && activeView === 'quiz' && quizQuestions && (
              <QuizSection
                questions={quizQuestions}
                subjectName={activeSubject.name}
                topicName={question.trim() || activeSubject.shortName}
                selectedDifficulty={quizDifficulty}
                selectedLength={quizLength}
                onChangeDifficulty={(d) => {
                  setQuizDifficulty(d);
                  handleGenerateQuiz(d, quizLength);
                }}
                onChangeLength={(l) => {
                  setQuizLength(l);
                  handleGenerateQuiz(quizDifficulty, l);
                }}
                onGenerateNew={(d, l) => handleGenerateQuiz(d || quizDifficulty, l || quizLength)}
                isGeneratingNew={isGeneratingQuiz}
                onRecordAttempt={handleRecordQuizAttempt}
              />
            )}

            {/* Initial Idle State: Dashboard Welcome Guide */}
            {!explanation && !quizQuestions && !isAskingAI && !isGeneratingQuiz && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Study Console Ready
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Select a subject on the left, enter any question, or select a syllabus highlight to get started.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Everyday Analogies</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Visualize electric potential like water pressure, and pointers like street mailboxes.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>Step-by-Step Logic</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Rigorous formulas with SI units, matrix calculations, and clean C programming samples.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Exam Trap Warnings</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Highlight frequent pitfalls students stumble on during midterms and university finals.
                    </p>
                  </div>
                </div>

                {/* Quick Start Prompt */}
                <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      Try a starter inquiry in {activeSubject.name}:
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      "{activeSubject.sampleQuestions[0]}"
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setQuestion(activeSubject.sampleQuestions[0]);
                      setAskError(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Load Question
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-5 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ECE Study Buddy - First-Year Engineering AI Companion</span>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Electronics</span>
            <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-700">/</span>
            <span>C Programming</span>
            <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-700">/</span>
            <span>Mathematics</span>
            <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-700">/</span>
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
    </div>
  );
}

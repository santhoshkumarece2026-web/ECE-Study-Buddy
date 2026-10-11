import React, { useState, useEffect } from 'react';
import { SubjectId, StudyHistoryItem, QuizQuestion } from './types';
import { SUBJECTS } from './data/subjectData';
import { Navbar } from './components/Navbar';
import { SubjectTabs } from './components/SubjectTabs';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { QuizSection } from './components/QuizSection';
import { FormulaSheetModal } from './components/FormulaSheetModal';
import { StudyHistoryModal } from './components/StudyHistoryModal';
import { 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Bookmark, 
  BookOpen, 
  ArrowRight,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  X
} from 'lucide-react';

export default function App() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('electronics');
  const [question, setQuestion] = useState<string>('');
  
  // AI Explanation State
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isAskingAI, setIsAskingAI] = useState<boolean>(false);
  const [askError, setAskError] = useState<string | null>(null);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Subject Switch Notification State
  const [switchNotice, setSwitchNotice] = useState<string | null>(null);

  // View state: 'explanation' or 'quiz'
  const [activeView, setActiveView] = useState<'explanation' | 'quiz'>('explanation');

  // Modals & Storage
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<StudyHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ece_study_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [copiedExplanation, setCopiedExplanation] = useState<boolean>(false);
  const [savedBookmarkToast, setSavedBookmarkToast] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('ece_study_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Auto-dismiss subject switch notification after 4.5 seconds
  useEffect(() => {
    if (!switchNotice) return;
    const timer = setTimeout(() => {
      setSwitchNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [switchNotice]);

  const activeSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];

  // Switch subject handler with clean session reset
  const handleSelectSubject = (id: SubjectId) => {
    // Requirement 8: Do not clear the conversation when selecting the already active subject
    if (id === selectedSubjectId) {
      return;
    }

    const nextSubject = SUBJECTS.find(s => s.id === id);
    const targetName = nextSubject ? nextSubject.name : id;

    // Requirement 1, 2, 3 & 6: Detect change, clear current conversation & start fresh
    setSelectedSubjectId(id);
    setQuestion('');
    setExplanation(null);
    setQuizQuestions(null);
    setAskError(null);
    setQuizError(null);
    setActiveView('explanation');

    // Requirement 7: Show small message such as "Switched to C Programming. Started a new conversation."
    setSwitchNotice(`Switched to ${targetName}. Started a new conversation.`);
  };

  // Handle Ask AI
  const handleAskAI = async () => {
    if (!question.trim()) {
      setAskError('Please enter a question or select one of the syllabus topics.');
      return;
    }

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch explanation from server.');
      }

      setExplanation(data.answer);

      const newItem: StudyHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        subjectId: selectedSubjectId,
        subjectName: currentSubject.name,
        question: question.trim(),
        answer: data.answer,
      };

      setHistory(prev => [newItem, ...prev.slice(0, 29)]);
    } catch (err: any) {
      setAskError(err?.message || 'Unable to load explanation. Please check your connection and try again.');
    } finally {
      setIsAskingAI(false);
    }
  };

  // Handle Generate 3 Quiz Questions
  const handleGenerateQuiz = async () => {
    setSwitchNotice(null);
    setIsGeneratingQuiz(true);
    setQuizError(null);
    setActiveView('quiz');

    try {
      const currentSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.name,
          topic: question.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz from server.');
      }

      setQuizQuestions(data.quiz);
    } catch (err: any) {
      setQuizError(err?.message || 'Could not generate quiz right now. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
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

  const handleSaveBookmark = () => {
    setSavedBookmarkToast(true);
    setTimeout(() => setSavedBookmarkToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Contract Navigation */}
      <Navbar
        onOpenFormulas={() => setIsFormulaModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        historyCount={history.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Educational Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Welcoming Header Section */}
        <section className="space-y-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>First-Year Engineering Learning Console</span>
                <span aria-hidden="true">·</span>
                <span>Semester 1 & 2 Foundations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
                ECE Study Buddy
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Clear conceptual explanations, intuitive real-world analogies, step-by-step mathematical derivations, and 3-question conceptual quizzes powered by Gemini.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <span className="font-medium text-slate-900 dark:text-slate-200">{activeSubject.name}</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsFormulaModalOpen(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
              >
                View Cheatsheet
              </button>
            </div>
          </div>
        </section>

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
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <label htmlFor="question-input">2. Enter Question or Topic</label>
                {question && (
                  <button
                    onClick={() => setQuestion('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-950/40 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <textarea
                  id="question-input"
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    if (askError) setAskError(null);
                  }}
                  rows={3}
                  placeholder={`Ask anything about ${activeSubject.shortName} (e.g. "${activeSubject.sampleQuestions[0]}")`}
                  className="w-full p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent resize-none focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                />

                <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
                  <span className="hidden sm:inline">Shortcut: Ctrl+Enter</span>
                  <span className="tabular-nums">{question.length} characters</span>
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
                  <span>{isAskingAI ? 'Analyzing...' : 'Ask AI'}</span>
                </button>

                {/* Generate 3 Quiz Questions Button */}
                <button
                  type="button"
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz || isAskingAI}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isGeneratingQuiz ? 'Creating Quiz...' : '3 Quiz Questions'}</span>
                </button>
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
                      <span className="text-[10px] tabular-nums text-slate-400">(3)</span>
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

                    <button
                      onClick={handleSaveBookmark}
                      className="px-2.5 py-1 text-xs rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Saved in History"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Saved</span>
                    </button>

                    <button
                      onClick={handleGenerateQuiz}
                      className="px-2.5 py-1 text-xs rounded-md text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      title="Generate 3 quiz questions for this topic"
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
                    if (quizError) handleGenerateQuiz();
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
                      : `Crafting 3 conceptual questions for ${activeSubject.name}...`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    {isAskingAI
                      ? 'Translating technical formulas into plain analogies, step-by-step logic, and exam warnings.'
                      : 'Setting up 4 multiple-choice options with thorough explanations for each.'}
                  </p>
                </div>
              </div>
            )}

            {/* Active Output 1: Explanation View */}
            {!isAskingAI && !isGeneratingQuiz && activeView === 'explanation' && explanation && (
              <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                
                {/* Topic Title Bar */}
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{activeSubject.name}</span>
                    <span aria-hidden="true">·</span>
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
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Saved to your local <strong>Study History</strong> for quick revision.</span>
                  </div>
                )}
              </div>
            )}

            {/* Active Output 2: Quiz View */}
            {!isAskingAI && !isGeneratingQuiz && activeView === 'quiz' && quizQuestions && (
              <QuizSection
                questions={quizQuestions}
                subjectName={activeSubject.name}
                onGenerateNew={handleGenerateQuiz}
                isGeneratingNew={isGeneratingQuiz}
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
          <span>ECE Study Buddy · First-Year Engineering AI Companion</span>
          <div className="flex items-center gap-3">
            <span>Basic Electronics</span>
            <span aria-hidden="true">·</span>
            <span>C Programming</span>
            <span aria-hidden="true">·</span>
            <span>Mathematics</span>
            <span aria-hidden="true">·</span>
            <span>General Engineering</span>
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
    </div>
  );
}

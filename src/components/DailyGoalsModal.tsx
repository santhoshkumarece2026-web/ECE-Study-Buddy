import React, { useState } from 'react';
import { DailyGoalsConfig, DailyGoalsProgress } from '../types';
import { 
  X, 
  Target, 
  CheckCircle2, 
  Flame, 
  HelpCircle, 
  Plus, 
  Minus, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';

interface DailyGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DailyGoalsConfig;
  progress: DailyGoalsProgress;
  streakDays: number;
  onUpdateConfig: (newConfig: DailyGoalsConfig) => void;
  onUpdateProgress: (updater: (prev: DailyGoalsProgress) => DailyGoalsProgress) => void;
  onResetProgress: () => void;
  onNavigateToQuiz: () => void;
  onNavigateToAsk: () => void;
}

export const DailyGoalsModal: React.FC<DailyGoalsModalProps> = ({
  isOpen,
  onClose,
  config,
  progress,
  streakDays,
  onUpdateConfig,
  onUpdateProgress,
  onResetProgress,
  onNavigateToQuiz,
  onNavigateToAsk,
}) => {
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [tempProblems, setTempProblems] = useState<number>(config.targetProblems);
  const [tempQuizQuestions, setTempQuizQuestions] = useState<number>(config.targetQuizQuestions);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  if (!isOpen) return null;

  // Format today's date for header
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Calculations
  const problemsPct = Math.min(100, Math.round((progress.problemsSolved / Math.max(1, config.targetProblems)) * 100));
  const quizPct = Math.min(100, Math.round((progress.quizQuestionsAnswered / Math.max(1, config.targetQuizQuestions)) * 100));
  const overallPct = Math.min(100, Math.round((problemsPct + quizPct) / 2));
  
  const isProblemsCompleted = progress.problemsSolved >= config.targetProblems;
  const isQuizCompleted = progress.quizQuestionsAnswered >= config.targetQuizQuestions;
  const isAllCompleted = isProblemsCompleted && isQuizCompleted;

  // Presets
  const applyPreset = (problems: number, questions: number) => {
    setTempProblems(problems);
    setTempQuizQuestions(questions);
  };

  const handleSaveTargets = () => {
    const validProblems = Math.max(1, Math.min(50, tempProblems || 5));
    const validQuiz = Math.max(1, Math.min(100, tempQuizQuestions || 10));
    onUpdateConfig({
      targetProblems: validProblems,
      targetQuizQuestions: validQuiz,
    });
    setIsEditingTargets(false);
    setSaveFeedback('Daily study targets updated!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const adjustProblems = (delta: number) => {
    onUpdateProgress((prev) => ({
      ...prev,
      problemsSolved: Math.max(0, prev.problemsSolved + delta),
      lastUpdated: Date.now(),
    }));
  };

  const adjustQuizQuestions = (delta: number) => {
    onUpdateProgress((prev) => ({
      ...prev,
      quizQuestionsAnswered: Math.max(0, prev.quizQuestionsAnswered + delta),
      lastUpdated: Date.now(),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Daily Study Goals
                </h3>
                {isAllCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Goals Crushed!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {todayFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setTempProblems(config.targetProblems);
                setTempQuizQuestions(config.targetQuizQuestions);
                setIsEditingTargets(!isEditingTargets);
              }}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isEditingTargets
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Configure targets"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">{isEditingTargets ? 'Done Editing' : 'Edit Targets'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close daily goals modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* Feedback banner */}
          {saveFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{saveFeedback}</span>
            </div>
          )}

          {/* Edit Targets Configuration Panel */}
          {isEditingTargets && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-4 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Customize Daily Targets
                  </h4>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Choose a preset or type custom numbers
                </span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(3, 5)}
                  className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                    tempProblems === 3 && tempQuizQuestions === 5
                      ? 'border-blue-600 bg-blue-100/70 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Casual</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    3 prob · 5 quiz
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset(5, 10)}
                  className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                    tempProblems === 5 && tempQuizQuestions === 10
                      ? 'border-blue-600 bg-blue-100/70 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <Target className="w-3 h-3 text-blue-500" />
                    <span>Balanced</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    5 prob · 10 quiz
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset(10, 20)}
                  className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                    tempProblems === 10 && tempQuizQuestions === 20
                      ? 'border-blue-600 bg-blue-100/70 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <Trophy className="w-3 h-3 text-purple-500" />
                    <span>Exam Prep</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    10 prob · 20 quiz
                  </div>
                </button>
              </div>

              {/* Number Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Problems Target
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={tempProblems}
                      onChange={(e) => setTempProblems(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 shrink-0">problems/day</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Quiz Questions Target
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={tempQuizQuestions}
                      onChange={(e) => setTempQuizQuestions(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 shrink-0">questions/day</span>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end gap-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setIsEditingTargets(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTargets}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Save Targets
                </button>
              </div>
            </div>
          )}

          {/* Overall Progress Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isAllCompleted
              ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-emerald-300 dark:border-emerald-700 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Today&apos;s Target Status
                  </span>
                  {streakDays > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{streakDays} Day Streak</span>
                    </span>
                  )}
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                  <span>{overallPct}% Completed</span>
                  {isAllCompleted ? (
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      🎉 Target Accomplished!
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      Keep pushing toward today&apos;s goal
                    </span>
                  )}
                </div>
              </div>

              {/* Status pill */}
              <div className="shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  isAllCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}>
                  {isAllCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>100% Complete</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>In Progress</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isAllCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                }`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {/* Detailed Metric Cards (Problems Solved & Quiz Questions) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Card 1: Problems Solved */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isProblemsCompleted 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Problems Solved
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Target: {config.targetProblems} problems
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isProblemsCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {progress.problemsSolved} / {config.targetProblems}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden my-3">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isProblemsCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${problemsPct}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  💡 Automatically tracks AI questions asked & generated practice problems solved today.
                </p>
              </div>

              {/* Quick actions for Problems */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Manual Log:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustProblems(-1)}
                    disabled={progress.problemsSolved <= 0}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Decrement by 1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustProblems(1)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Add 1 solved problem"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1 Problem</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Quiz Questions Answered */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              isQuizCompleted 
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Quiz Questions
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Target: {config.targetQuizQuestions} questions
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isQuizCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {progress.quizQuestionsAnswered} / {config.targetQuizQuestions}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden my-3">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isQuizCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${quizPct}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  💡 Automatically tracks each question answered when taking subject quizzes in the app.
                </p>
              </div>

              {/* Quick actions for Quiz Questions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Manual Log:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustQuizQuestions(-1)}
                    disabled={progress.quizQuestionsAnswered <= 0}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Decrement by 1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustQuizQuestions(1)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Add 1 answered question"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1 Question</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Quick study jump-start triggers */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Quick Study Actions
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAsk();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer group text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Solve Circuit or Math Problem</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToQuiz();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer group text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Launch Practice Quiz</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {isConfirmingReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Reset today&apos;s counters?</span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setIsConfirmingReset(false);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingReset(false)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingReset(true)}
              className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Today&apos;s Counters</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer shadow-xs text-center"
          >
            Continue Studying
          </button>
        </div>

      </div>
    </div>
  );
};

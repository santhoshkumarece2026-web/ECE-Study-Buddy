import React, { useState, useRef, useEffect } from 'react';
import { 
  BookMarked, 
  History, 
  Bookmark, 
  Award, 
  Sun, 
  Moon, 
  Flame, 
  Zap, 
  Sparkles, 
  Brain, 
  ChevronDown, 
  Check,
  Menu,
  X,
  Target,
  Trophy
} from 'lucide-react';
import { AIModelId } from '../types';
import { EceLogo } from './EceLogo';

export const MODEL_OPTIONS = [
  {
    id: 'gemini-3.1-flash-lite' as AIModelId,
    name: 'Fast',
    modelId: 'gemini-3.1-flash-lite',
    badge: 'Lite',
    description: 'Sub-second speed for quick questions, definitions & formulas',
    icon: Zap,
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'gemini-3.8-flash' as AIModelId,
    name: 'Balanced',
    modelId: 'gemini-3.8-flash',
    badge: 'Default',
    description: 'Optimal balance of speed, multimodal file analysis & math derivations',
    icon: Sparkles,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'gemini-3.1-pro' as AIModelId,
    name: 'Deep Reasoning',
    modelId: 'gemini-3.1-pro',
    badge: 'Pro',
    description: 'Maximum depth & rigor for complex proofs and multi-step matrix math',
    icon: Brain,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/50',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
];

interface NavbarProps {
  onOpenFormulas: () => void;
  onOpenHistory: () => void;
  onOpenBookmarks: () => void;
  onOpenProgress: () => void;
  onOpenDailyGoals: () => void;
  onOpenLeaderboard: () => void;
  dailyGoalsSummary?: {
    isAllCompleted: boolean;
    problemsSolved: number;
    targetProblems: number;
    quizAnswered: number;
    targetQuiz: number;
    overallPct: number;
  };
  historyCount: number;
  bookmarksCount: number;
  streakDays: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedModel: AIModelId;
  onSelectModel: (model: AIModelId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenFormulas,
  onOpenHistory,
  onOpenBookmarks,
  onOpenProgress,
  onOpenDailyGoals,
  onOpenLeaderboard,
  dailyGoalsSummary,
  historyCount,
  bookmarksCount,
  streakDays,
  darkMode,
  onToggleDarkMode,
  selectedModel,
  onSelectModel,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const activeOption = MODEL_OPTIONS.find((opt) => opt.id === selectedModel) || MODEL_OPTIONS[1];
  const ActiveIcon = activeOption.icon;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Professional ECE Study Buddy Branding */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="flex items-center justify-center p-0.5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-xs shrink-0">
            <EceLogo size={34} className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate leading-tight">
              ECE Study Buddy
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden xs:inline-block leading-none truncate">
              First-Year Engineering
            </span>
          </div>
        </div>

        {/* Center: Model Selection Dropdown Toggle */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            title={`Active Model: ${activeOption.name} (${activeOption.modelId})`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <ActiveIcon className={`w-3.5 h-3.5 ${activeOption.color} shrink-0`} />
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-900 dark:text-white text-xs">{activeOption.name}</span>
              <span className="hidden md:inline text-[11px] font-mono text-slate-400 dark:text-slate-500">
                ({activeOption.modelId})
              </span>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded hidden sm:inline ${activeOption.bgColor} ${activeOption.color} border ${activeOption.borderColor}`}>
              {activeOption.badge}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Model Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-84 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    AI Model Engine
                  </span>
                  <span className="text-[10px] text-slate-400">Applies to Chat & Quiz</span>
                </div>
              </div>

              {MODEL_OPTIONS.map((opt) => {
                const isSelected = opt.id === selectedModel;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(opt.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${opt.bgColor} border ${opt.borderColor}`}>
                      <Icon className={`w-4 h-4 ${opt.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {opt.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {opt.badge}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {opt.modelId}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={onOpenFormulas}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer py-1.5"
          >
            <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Formulas</span>
          </button>

          <button
            onClick={onOpenDailyGoals}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer py-1.5"
            title="Open Daily Study Goals"
          >
            <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Daily Goals</span>
            {dailyGoalsSummary && (
              <span className={`text-xs font-semibold px-1.5 py-0.2 rounded-md tabular-nums flex items-center gap-0.5 ${
                dailyGoalsSummary.isAllCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300'
              }`}>
                {dailyGoalsSummary.isAllCompleted
                  ? '✓ Done'
                  : `${dailyGoalsSummary.problemsSolved + dailyGoalsSummary.quizAnswered}/${dailyGoalsSummary.targetProblems + dailyGoalsSummary.targetQuiz}`}
              </span>
            )}
          </button>

          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer py-1.5"
          >
            <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Bookmarks</span>
            {bookmarksCount > 0 && (
              <span className="text-xs font-semibold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 tabular-nums">
                {bookmarksCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProgress}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer py-1.5"
          >
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Progress</span>
            {streakDays > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center gap-0.5 tabular-nums">
                <Flame className="w-3 h-3 fill-amber-500" />
                <span>{streakDays}d</span>
              </span>
            )}
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer py-1.5 text-amber-700 dark:text-amber-400 font-semibold"
            title="Quiz Leaderboard & High Scores"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer py-1.5"
          >
            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="text-xs font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Theme Toggle + Mobile Menu Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick theme toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open study navigation menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Clean, fully touch-friendly, no page horizontal overflow) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => {
                onOpenDailyGoals();
                setIsMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40 border border-cyan-200/80 dark:border-cyan-800/80 text-slate-800 dark:text-slate-100 active:bg-cyan-100 cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Daily Study Goals</span>
              </span>
              {dailyGoalsSummary && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                  dailyGoalsSummary.isAllCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-cyan-600 text-white'
                }`}>
                  {dailyGoalsSummary.isAllCompleted
                    ? 'Target Met 🎉'
                    : `${dailyGoalsSummary.problemsSolved + dailyGoalsSummary.quizAnswered}/${dailyGoalsSummary.targetProblems + dailyGoalsSummary.targetQuiz} Done`}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenFormulas();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:bg-slate-100 cursor-pointer min-h-[44px]"
            >
              <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Formulas</span>
            </button>

            <button
              onClick={() => {
                onOpenBookmarks();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:bg-slate-100 cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Bookmarks</span>
              </span>
              {bookmarksCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white tabular-nums">
                  {bookmarksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenProgress();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:bg-slate-100 cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Progress</span>
              </span>
              {streakDays > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-0.5 tabular-nums">
                  <Flame className="w-3 h-3 fill-white" />
                  <span>{streakDays}d</span>
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenHistory();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:bg-slate-100 cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>History</span>
              </span>
              {historyCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 tabular-nums">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenLeaderboard();
                setIsMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 active:bg-amber-100 cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Quiz Leaderboard & Rankings</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                Top Scores
              </span>
            </button>

            {/* Mobile Drawer Theme Toggle */}
            <button
              onClick={() => {
                onToggleDarkMode();
              }}
              className="col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 cursor-pointer min-h-[44px] transition-colors"
            >
              <span className="flex items-center gap-2">
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                <span className="font-semibold">{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                {darkMode ? 'Dark Active' : 'Light Active'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

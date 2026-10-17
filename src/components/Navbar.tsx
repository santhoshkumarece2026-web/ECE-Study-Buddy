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
  SlidersHorizontal, 
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
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-800/60',
  },
  {
    id: 'gemini-3.8-flash' as AIModelId,
    name: 'Balanced',
    modelId: 'gemini-3.8-flash',
    badge: 'Default',
    description: 'Optimal balance of speed, multimodal file analysis & math derivations',
    icon: SlidersHorizontal,
    color: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10',
    borderColor: 'border-[#3B82F6]/30',
  },
  {
    id: 'gemini-3.1-pro' as AIModelId,
    name: 'Deep Reasoning',
    modelId: 'gemini-3.1-pro',
    badge: 'Pro',
    description: 'Maximum depth & rigor for complex proofs and multi-step matrix math',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-800/60',
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
    <header className="sticky top-0 z-40 w-full bg-[#0B1120]/95 backdrop-blur-md border-b border-[#2A3850] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Professional ECE Study Buddy Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <EceLogo size={34} className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#F1F5F9] truncate leading-tight">
              ECE Study Buddy
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-[#7F8DA3] hidden xs:inline-block leading-none truncate">
              Engineering Console
            </span>
          </div>
        </div>

        {/* Center: Model Selection Dropdown Toggle */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg border border-[#2A3850] bg-[#151F32] hover:bg-[#1B2940] hover:border-[#3B82F6]/50 text-xs font-medium text-[#F1F5F9] transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            title={`Active Engine: ${activeOption.name} (${activeOption.modelId})`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <ActiveIcon className={`w-3.5 h-3.5 ${activeOption.color} shrink-0`} />
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[#F1F5F9] text-xs">{activeOption.name}</span>
              <span className="hidden md:inline text-[11px] font-mono text-[#7F8DA3]">
                ({activeOption.modelId})
              </span>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded hidden sm:inline ${activeOption.bgColor} ${activeOption.color} border ${activeOption.borderColor}`}>
              {activeOption.badge}
            </span>
            <ChevronDown className={`w-3 h-3 text-[#7F8DA3] transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Model Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 rounded-xl bg-[#151F32] border border-[#2A3850] shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 border-b border-[#2A3850] mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F8DA3]">
                    AI Computation Engine
                  </span>
                  <span className="text-[10px] text-[#7F8DA3] font-mono">Chat & Quiz</span>
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
                        ? 'bg-[#1B2940] border border-[#3B82F6]'
                        : 'hover:bg-[#1B2940]/60 border border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${opt.bgColor} border ${opt.borderColor}`}>
                      <Icon className={`w-4 h-4 ${opt.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#F1F5F9]">
                          {opt.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected 
                            ? 'bg-[#3B82F6] text-white' 
                            : 'bg-[#1B2940] text-[#A7B4C8] border border-[#2A3850]'
                        }`}>
                          {opt.badge}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#7F8DA3]">
                        {opt.modelId}
                      </div>
                      <p className="text-[11px] text-[#A7B4C8] mt-1 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#3B82F6] shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-[#A7B4C8]">
          <button
            onClick={onOpenFormulas}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-[#F1F5F9] hover:bg-[#151F32] transition-colors whitespace-nowrap cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Reference Sheet</span>
          </button>

          <button
            onClick={onOpenDailyGoals}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-[#F1F5F9] hover:bg-[#151F32] transition-colors whitespace-nowrap cursor-pointer"
            title="Open Daily Study Goals"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Daily Goals</span>
            {dailyGoalsSummary && (
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums flex items-center gap-0.5 ${
                dailyGoalsSummary.isAllCompleted
                  ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-bold'
                  : 'bg-[#1B2940] text-cyan-300 border border-[#2A3850]'
              }`}>
                {dailyGoalsSummary.isAllCompleted
                  ? 'Done ✓'
                  : `${dailyGoalsSummary.problemsSolved + dailyGoalsSummary.quizAnswered}/${dailyGoalsSummary.targetProblems + dailyGoalsSummary.targetQuiz}`}
              </span>
            )}
          </button>

          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-[#F1F5F9] hover:bg-[#151F32] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Bookmarks</span>
            {bookmarksCount > 0 && (
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-[#1B2940] text-indigo-300 border border-[#2A3850] tabular-nums">
                {bookmarksCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProgress}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-[#F1F5F9] hover:bg-[#151F32] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Progress</span>
            {streakDays > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center gap-0.5 tabular-nums">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>{streakDays}d</span>
              </span>
            )}
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-[#F1F5F9] hover:bg-[#151F32] transition-colors whitespace-nowrap cursor-pointer text-amber-400 font-semibold"
            title="Quiz Leaderboard & High Scores"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-[#F1F5F9] hover:bg-[#151F32] transition-colors whitespace-nowrap cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#7F8DA3]" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-[#1B2940] text-[#A7B4C8] border border-[#2A3850] tabular-nums">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Mobile Menu Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick theme toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#A7B4C8] hover:text-[#F1F5F9] hover:bg-[#151F32] border border-[#2A3850] transition-colors cursor-pointer"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#A7B4C8]" />}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#F1F5F9] hover:bg-[#151F32] border border-[#2A3850] transition-colors cursor-pointer"
            title="Open study navigation menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Cohesive Dark Theme) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#2A3850] bg-[#0B1120] px-4 py-3 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => {
                onOpenDailyGoals();
                setIsMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-[#151F32] border border-[#2A3850] text-[#F1F5F9] active:bg-[#1B2940] cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Daily Study Goals</span>
              </span>
              {dailyGoalsSummary && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums ${
                  dailyGoalsSummary.isAllCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-cyan-600 text-white'
                }`}>
                  {dailyGoalsSummary.isAllCompleted
                    ? 'Target Met ✓'
                    : `${dailyGoalsSummary.problemsSolved + dailyGoalsSummary.quizAnswered}/${dailyGoalsSummary.targetProblems + dailyGoalsSummary.targetQuiz} Done`}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenFormulas();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#151F32] border border-[#2A3850] text-[#F1F5F9] active:bg-[#1B2940] cursor-pointer min-h-[44px]"
            >
              <BookMarked className="w-4 h-4 text-[#3B82F6]" />
              <span>Reference Sheet</span>
            </button>

            <button
              onClick={() => {
                onOpenBookmarks();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#151F32] border border-[#2A3850] text-[#F1F5F9] active:bg-[#1B2940] cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-400" />
                <span>Bookmarks</span>
              </span>
              {bookmarksCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-600 text-white tabular-nums">
                  {bookmarksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenProgress();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#151F32] border border-[#2A3850] text-[#F1F5F9] active:bg-[#1B2940] cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Progress</span>
              </span>
              {streakDays > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-0.5 tabular-nums">
                  <Flame className="w-3 h-3 fill-slate-950" />
                  <span>{streakDays}d</span>
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenHistory();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#151F32] border border-[#2A3850] text-[#F1F5F9] active:bg-[#1B2940] cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#7F8DA3]" />
                <span>History</span>
              </span>
              {historyCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#1B2940] text-[#A7B4C8] border border-[#2A3850] tabular-nums">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenLeaderboard();
                setIsMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-[#151F32] border border-amber-800/60 text-amber-300 active:bg-[#1B2940] cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Quiz Leaderboard & Rankings</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800/80">
                Top Scores
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

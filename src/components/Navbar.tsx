import React, { useState, useRef, useEffect } from 'react';
import { 
  BookMarked, 
  History, 
  Bookmark, 
  Award, 
  Sun, 
  Moon, 
  Flame, 
  GraduationCap, 
  Zap, 
  Sparkles, 
  Brain, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { AIModelId } from '../types';

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
  historyCount,
  bookmarksCount,
  streakDays,
  darkMode,
  onToggleDarkMode,
  selectedModel,
  onSelectModel,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
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
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Zone 1: Brand & Logo with Lucide GraduationCap */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700/60 dark:border-slate-700 flex items-center justify-center shadow-xs">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap leading-tight">
              ECE Study Buddy
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block leading-none">
              First-Year Engineering
            </span>
          </div>
        </div>

        {/* Model Selection Dropdown Toggle */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            title={`Active Model: ${activeOption.name} (${activeOption.modelId})`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <ActiveIcon className={`w-3.5 h-3.5 ${activeOption.color}`} />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 dark:text-white">{activeOption.name}</span>
              <span className="hidden md:inline text-[11px] font-mono text-slate-400 dark:text-slate-500">
                ({activeOption.modelId})
              </span>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded hidden sm:inline ${activeOption.bgColor} ${activeOption.color} border ${activeOption.borderColor}`}>
              {activeOption.badge}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-84 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    AI Model Mode
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

        {/* Zone 2: Navigation links for desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={onOpenFormulas}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Formulas</span>
          </button>

          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
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
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
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
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
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

        {/* Zone 3: Mobile shortcuts + Theme toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile shortcuts */}
          <button
            onClick={onOpenBookmarks}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer"
            title="Bookmarks"
            aria-label="Open bookmarks"
          >
            <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {bookmarksCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {bookmarksCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProgress}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer"
            title="Learning progress"
            aria-label="Open learning progress"
          >
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {streakDays > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {streakDays}
              </span>
            )}
          </button>

          <button
            onClick={onOpenFormulas}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Formulas"
            aria-label="Open formulas"
          >
            <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>

          <button
            onClick={onOpenHistory}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="History"
            aria-label="Open history"
          >
            <History className="w-4 h-4 text-slate-500" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* Theme toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};

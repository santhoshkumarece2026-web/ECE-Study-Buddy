import React from 'react';
import { BookOpen, BookMarked, History, Bookmark, Award, Sun, Moon, Flame } from 'lucide-react';

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
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            ECE Study Buddy
          </span>
        </div>

        {/* Zone 2: Clean single-line navigation links for desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
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

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile shortcuts */}
          <button
            onClick={onOpenBookmarks}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer"
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
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer"
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
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Formulas"
            aria-label="Open formulas"
          >
            <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>

          <button
            onClick={onOpenHistory}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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

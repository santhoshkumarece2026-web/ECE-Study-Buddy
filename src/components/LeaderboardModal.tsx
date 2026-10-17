import React, { useState, useMemo, useEffect } from 'react';
import { QuizAttemptRecord, QuizDifficulty, SubjectId } from '../types';
import { SUBJECTS } from '../data/subjectData';
import { 
  Trophy, 
  X, 
  Medal, 
  Crown, 
  Flame, 
  Target, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  SlidersHorizontal, 
  Edit3, 
  Check, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizHistory: QuizAttemptRecord[];
  onStartQuiz: (difficulty?: QuizDifficulty) => void;
}

interface RankedQuizEntry {
  id: string;
  rank: number;
  score: number;
  subjectName: string;
  subjectId: SubjectId;
  topic: string;
  difficulty: string;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timestamp: number;
  dateStr: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  quizHistory,
  onStartQuiz,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [studentHandle, setStudentHandle] = useState<string>(() => {
    try {
      return localStorage.getItem('ece_student_handle') || 'You (ECE Scholar)';
    } catch {
      return 'You (ECE Scholar)';
    }
  });
  const [isEditingHandle, setIsEditingHandle] = useState<boolean>(false);
  const [handleInput, setHandleInput] = useState<string>(studentHandle);

  useEffect(() => {
    setHandleInput(studentHandle);
  }, [studentHandle]);

  const handleSaveHandle = () => {
    const trimmed = handleInput.trim() || 'You (ECE Scholar)';
    setStudentHandle(trimmed);
    setIsEditingHandle(false);
    try {
      localStorage.setItem('ece_student_handle', trimmed);
    } catch (e) {
      console.warn('Failed to save handle to localStorage', e);
    }
  };

  // Compute calculated scores and ranks
  const rankedEntries = useMemo<RankedQuizEntry[]>(() => {
    if (!quizHistory || quizHistory.length === 0) return [];

    // Score formula:
    // Base: 100 pts per correct answer
    // Accuracy bonus: up to 50 pts
    // Difficulty multiplier: Exam Level = 1.5x, Core Concept = 1.25x, Beginner = 1.0x
    // Perfect score bonus: +100 pts
    const computed = quizHistory.map((attempt) => {
      const accuracy = attempt.totalQuestions > 0 
        ? Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100) 
        : 0;

      let multiplier = 1.0;
      if (attempt.difficulty === 'Exam Level') multiplier = 1.5;
      else if (attempt.difficulty === 'Core Concept') multiplier = 1.25;

      const basePoints = attempt.correctAnswers * 100;
      const accuracyBonus = Math.round(accuracy * 0.5);
      const isPerfect = attempt.correctAnswers === attempt.totalQuestions && attempt.totalQuestions > 0;
      const perfectBonus = isPerfect ? 100 : 0;

      const rawScore = Math.round((basePoints + accuracyBonus + perfectBonus) * multiplier);

      const d = new Date(attempt.timestamp);
      const dateStr = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      return {
        id: attempt.id,
        rank: 0,
        score: rawScore,
        subjectName: attempt.subjectName,
        subjectId: attempt.subjectId,
        topic: attempt.topic || 'General Foundational Quiz',
        difficulty: attempt.difficulty || 'Core Concept',
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        accuracy,
        timestamp: attempt.timestamp,
        dateStr,
      };
    });

    // Sort by Score desc, then Accuracy desc, then timestamp desc
    computed.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.timestamp - a.timestamp;
    });

    // Assign rank numbers
    return computed.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [quizHistory]);

  // Filtered leaderboard list
  const filteredEntries = useMemo(() => {
    return rankedEntries.filter((entry) => {
      const matchesSubject = selectedSubjectFilter === 'all' || entry.subjectId === selectedSubjectFilter;
      const matchesDifficulty = selectedDifficultyFilter === 'all' || entry.difficulty === selectedDifficultyFilter;
      return matchesSubject && matchesDifficulty;
    });
  }, [rankedEntries, selectedSubjectFilter, selectedDifficultyFilter]);

  // Aggregate stats
  const totalPoints = useMemo(() => {
    return rankedEntries.reduce((sum, item) => sum + item.score, 0);
  }, [rankedEntries]);

  const bestScore = useMemo(() => {
    if (rankedEntries.length === 0) return 0;
    return Math.max(...rankedEntries.map((e) => e.score));
  }, [rankedEntries]);

  const perfectScoreCount = useMemo(() => {
    return rankedEntries.filter((e) => e.accuracy === 100).length;
  }, [rankedEntries]);

  const averageAccuracy = useMemo(() => {
    if (rankedEntries.length === 0) return 0;
    const sum = rankedEntries.reduce((acc, curr) => acc + curr.accuracy, 0);
    return Math.round(sum / rankedEntries.length);
  }, [rankedEntries]);

  // Rank Tier determination
  const rankTier = useMemo(() => {
    if (totalPoints >= 3000) {
      return {
        title: 'Grandmaster Engineer',
        icon: Crown,
        badgeBg: 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300',
        color: 'text-amber-500',
        nextTier: 'Max Rank Achieved!',
        nextPointsNeeded: 0,
      };
    } else if (totalPoints >= 1800) {
      return {
        title: 'Senior Scholar',
        icon: Medal,
        badgeBg: 'bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300',
        color: 'text-purple-500',
        nextTier: 'Grandmaster Engineer',
        nextPointsNeeded: 3000 - totalPoints,
      };
    } else if (totalPoints >= 900) {
      return {
        title: 'Concept Master',
        icon: Zap,
        badgeBg: 'bg-blue-100 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300',
        color: 'text-blue-500',
        nextTier: 'Senior Scholar',
        nextPointsNeeded: 1800 - totalPoints,
      };
    } else if (totalPoints >= 300) {
      return {
        title: 'Rising Engineer',
        icon: TrendingUp,
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
        color: 'text-emerald-500',
        nextTier: 'Concept Master',
        nextPointsNeeded: 900 - totalPoints,
      };
    } else {
      return {
        title: 'Apprentice Scholar',
        icon: BookOpen,
        badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
        color: 'text-slate-500',
        nextTier: 'Rising Engineer',
        nextPointsNeeded: 300 - totalPoints,
      };
    }
  }, [totalPoints]);

  const TierIcon = rankTier.icon;

  // Cohort percentile estimation based on average accuracy & quizzes taken
  const cohortPercentile = useMemo(() => {
    if (rankedEntries.length === 0) return 'Unranked';
    if (averageAccuracy >= 90 && rankedEntries.length >= 3) return 'Top 5% Cohort';
    if (averageAccuracy >= 80) return 'Top 15% Cohort';
    if (averageAccuracy >= 65) return 'Top 35% Cohort';
    return 'Active Learner';
  }, [averageAccuracy, rankedEntries.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#151F32] rounded-2xl shadow-2xl border border-[#2A3850] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#2A3850] bg-[#111827] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="leaderboard-modal-title" className="text-base sm:text-lg font-bold text-[#F1F5F9] leading-tight">
                  Top Quiz Scores & Leaderboard
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${rankTier.badgeBg} flex items-center gap-1`}>
                  <TierIcon className="w-3 h-3" />
                  <span>{rankTier.title}</span>
                </span>
              </div>
              <p className="text-xs text-[#A7B4C8] mt-0.5 truncate">
                Personal bests, performance tiers, and cohort benchmarks based on completed quizzes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#7F8DA3] hover:text-[#F1F5F9] hover:bg-[#1B2940] transition-colors cursor-pointer shrink-0"
            aria-label="Close leaderboard modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Student Profile Card & Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* User Profile Banner (md: 5 cols) */}
            <div className="md:col-span-5 p-4 rounded-xl border border-[#2A3850] bg-[#1B2940] flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7F8DA3]">
                  Student Profile
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {isEditingHandle ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveHandle();
                          if (e.key === 'Escape') setIsEditingHandle(false);
                        }}
                        className="px-2 py-1 text-sm rounded-md border border-[#3B82F6] bg-[#111827] text-[#F1F5F9] flex-1 focus:outline-none"
                        placeholder="Enter your name"
                        autoFocus
                        maxLength={30}
                      />
                      <button
                        onClick={handleSaveHandle}
                        className="p-1 rounded-md bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors"
                        title="Save name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-bold text-[#F1F5F9] text-base truncate">
                        {studentHandle}
                      </span>
                      <button
                        onClick={() => setIsEditingHandle(true)}
                        className="p-1 text-[#7F8DA3] hover:text-[#F1F5F9] cursor-pointer rounded-md hover:bg-[#151F32]"
                        title="Edit display name"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-[#151F32] border border-[#2A3850] text-[#3B82F6]">
                    {cohortPercentile}
                  </span>
                  <span className="text-xs text-[#A7B4C8] tabular-nums">
                    {totalPoints.toLocaleString()} Total Pts
                  </span>
                </div>
              </div>

              {rankTier.nextPointsNeeded > 0 && (
                <div className="mt-3 pt-3 border-t border-[#2A3850] text-[11px] text-[#A7B4C8] flex items-center justify-between">
                  <span>Next Rank: <strong className="text-[#F1F5F9]">{rankTier.nextTier}</strong></span>
                  <span className="font-semibold text-amber-400 tabular-nums">+{rankTier.nextPointsNeeded} pts needed</span>
                </div>
              )}
            </div>

            {/* Metric Cards (md: 7 cols) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-[#2A3850] bg-[#1B2940] flex flex-col justify-between">
                <span className="text-[11px] text-[#A7B4C8] font-medium">Best Score</span>
                <div className="text-xl font-bold text-[#F1F5F9] tabular-nums mt-1">
                  {bestScore > 0 ? `${bestScore} pts` : '—'}
                </div>
                <span className="text-[10px] text-[#7F8DA3] mt-0.5">Single Attempt</span>
              </div>

              <div className="p-3 rounded-xl border border-[#2A3850] bg-[#1B2940] flex flex-col justify-between">
                <span className="text-[11px] text-[#A7B4C8] font-medium">Avg Accuracy</span>
                <div className="text-xl font-bold text-[#3B82F6] tabular-nums mt-1">
                  {rankedEntries.length > 0 ? `${averageAccuracy}%` : '—'}
                </div>
                <span className="text-[10px] text-[#7F8DA3] mt-0.5">Across All Quizzes</span>
              </div>

              <div className="p-3 rounded-xl border border-[#2A3850] bg-[#1B2940] flex flex-col justify-between">
                <span className="text-[11px] text-[#A7B4C8] font-medium">100% Perfect</span>
                <div className="text-xl font-bold text-emerald-400 tabular-nums mt-1">
                  {perfectScoreCount}
                </div>
                <span className="text-[10px] text-[#7F8DA3] mt-0.5">Flawless Runs</span>
              </div>

              <div className="p-3 rounded-xl border border-[#2A3850] bg-[#1B2940] flex flex-col justify-between">
                <span className="text-[11px] text-[#A7B4C8] font-medium">Quizzes Taken</span>
                <div className="text-xl font-bold text-[#F1F5F9] tabular-nums mt-1">
                  {rankedEntries.length}
                </div>
                <span className="text-[10px] text-[#7F8DA3] mt-0.5">Total Attempts</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#111827] border border-[#2A3850] text-xs">
            {/* Subject Filter */}
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="text-[#A7B4C8] font-medium shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Subject:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setSelectedSubjectFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    selectedSubjectFilter === 'all'
                      ? 'bg-[#3B82F6] text-white font-semibold shadow-xs'
                      : 'bg-[#1B2940] text-[#A7B4C8] hover:text-[#F1F5F9] border border-[#2A3850]'
                  }`}
                >
                  All ({rankedEntries.length})
                </button>
                {SUBJECTS.map((s) => {
                  const count = rankedEntries.filter((e) => e.subjectId === s.id).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubjectFilter(s.id)}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                        selectedSubjectFilter === s.id
                          ? 'bg-[#3B82F6] text-white font-semibold shadow-xs'
                          : 'bg-[#1B2940] text-[#A7B4C8] hover:text-[#F1F5F9] border border-[#2A3850]'
                      }`}
                    >
                      {s.shortName} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[#A7B4C8] font-medium">Difficulty:</span>
              <select
                value={selectedDifficultyFilter}
                onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                className="px-2 py-1 rounded-md bg-[#1B2940] border border-[#2A3850] text-[#F1F5F9] text-xs focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="all">All Difficulties</option>
                <option value="Beginner">Beginner (1.0x)</option>
                <option value="Core Concept">Core Concept (1.25x)</option>
                <option value="Exam Level">Exam Level (1.5x)</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-[#2A3850] p-6 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-950/40 text-amber-400 flex items-center justify-center">
                <Trophy className="w-6 h-6 opacity-60" />
              </div>
              <h4 className="font-bold text-[#F1F5F9] text-sm">
                No Quiz Scores Found for this Filter
              </h4>
              <p className="text-xs text-[#A7B4C8] max-w-sm mx-auto leading-relaxed">
                Take a concept check quiz to record your score and claim the top ranking on the leaderboard!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onStartQuiz();
                }}
                className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Start a Quiz Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#7F8DA3] px-3">
                <span>Rank & Quiz Topic</span>
                <div className="flex items-center gap-6">
                  <span className="hidden sm:inline">Accuracy</span>
                  <span>Score</span>
                </div>
              </div>

              <div className="space-y-2">
                {filteredEntries.map((entry) => {
                  const isTopThree = entry.rank <= 3;
                  const rankBadge = entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : entry.rank === 3 ? '3rd' : `#${entry.rank}`;
                  
                  return (
                    <div
                      key={entry.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isTopThree
                          ? entry.rank === 1
                            ? 'bg-amber-950/20 border-amber-800/60 shadow-sm'
                            : 'bg-[#1B2940] border-[#2A3850] shadow-sm'
                          : 'bg-[#151F32] border-[#2A3850]'
                      }`}
                    >
                      {/* Left: Rank & Title */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span 
                          className={`w-12 text-center text-xs font-bold py-1 px-1.5 rounded-lg shrink-0 tabular-nums ${
                            entry.rank === 1
                              ? 'bg-amber-950/80 border border-amber-800/80 text-amber-300'
                              : entry.rank === 2
                              ? 'bg-[#151F32] border border-[#2A3850] text-[#F1F5F9]'
                              : entry.rank === 3
                              ? 'bg-amber-950/40 border border-amber-900/60 text-amber-400'
                              : 'bg-[#111827] border border-[#2A3850] text-[#7F8DA3]'
                          }`}
                        >
                          {rankBadge}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-[#F1F5F9] truncate">
                              {entry.topic}
                            </span>
                            {entry.accuracy === 100 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800 flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Perfect</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#A7B4C8] mt-0.5">
                            <span className="font-medium text-[#F1F5F9]">{entry.subjectName}</span>
                            <span aria-hidden="true" className="select-none text-[#2A3850]">•</span>
                            <span className={`font-medium ${
                              entry.difficulty === 'Exam Level'
                                ? 'text-purple-400'
                                : entry.difficulty === 'Core Concept'
                                ? 'text-[#3B82F6]'
                                : 'text-emerald-400'
                            }`}>
                              {entry.difficulty}
                            </span>
                            <span aria-hidden="true" className="select-none text-[#2A3850]">•</span>
                            <span className="tabular-nums">{entry.correctAnswers}/{entry.totalQuestions} correct</span>
                            <span aria-hidden="true" className="select-none text-[#2A3850]">•</span>
                            <span className="text-[#7F8DA3]">{entry.dateStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Accuracy & Points Score */}
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-right">
                        <div className="hidden sm:block text-right">
                          <div className="text-xs font-semibold text-[#CBD5E1] tabular-nums">
                            {entry.accuracy}%
                          </div>
                          <div className="w-16 h-1.5 rounded-full bg-[#111827] border border-[#2A3850] overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                entry.accuracy >= 80 ? 'bg-emerald-500' : entry.accuracy >= 60 ? 'bg-[#3B82F6]' : 'bg-amber-500'
                              }`}
                              style={{ width: `${entry.accuracy}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base sm:text-lg font-bold text-[#F1F5F9] tabular-nums">
                            {entry.score}
                          </span>
                          <span className="text-[10px] text-[#7F8DA3] font-medium block -mt-1">
                            pts
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:p-5 border-t border-[#2A3850] bg-[#111827] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#7F8DA3] text-center sm:text-left">
            <span>Points formula rewards Exam Level difficulty (1.5x) and 100% accuracy streaks!</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onStartQuiz('Exam Level');
              }}
              className="flex-1 sm:flex-initial px-4 py-2 min-h-[38px] rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/80 text-purple-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>Exam Level (+1.5x)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onStartQuiz();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 min-h-[38px] rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Take Quiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

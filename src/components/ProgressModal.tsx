import React, { useMemo } from 'react';
import { QuizAttemptRecord, SubjectId, WeakTopicRecord } from '../types';
import { SUBJECTS } from '../data/subjectData';
import { X, Flame, Target, Award, AlertTriangle, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizHistory: QuizAttemptRecord[];
  onPracticeTopic: (subjectId: SubjectId, topic: string) => void;
  onClearProgress: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  quizHistory,
  onPracticeTopic,
  onClearProgress,
}) => {
  // Aggregate stats
  const stats = useMemo(() => {
    let totalQuestions = 0;
    let totalCorrect = 0;

    const subjectStats: Record<SubjectId, { total: number; correct: number }> = {
      electronics: { total: 0, correct: 0 },
      'c-programming': { total: 0, correct: 0 },
      math: { total: 0, correct: 0 },
      'general-eng': { total: 0, correct: 0 },
    };

    const topicMap: Record<string, WeakTopicRecord> = {};

    // Calculate streak
    const dates = new Set<string>();

    quizHistory.forEach((attempt) => {
      totalQuestions += attempt.totalQuestions;
      totalCorrect += attempt.correctAnswers;

      if (subjectStats[attempt.subjectId]) {
        subjectStats[attempt.subjectId].total += attempt.totalQuestions;
        subjectStats[attempt.subjectId].correct += attempt.correctAnswers;
      }

      // Record date for streak calculation
      const d = new Date(attempt.timestamp);
      dates.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);

      // Track weak topics by analyzing individual questions
      if (attempt.questionResults) {
        attempt.questionResults.forEach((q) => {
          const topicName = q.subtopic || attempt.topic || 'General Core';
          if (!topicMap[topicName]) {
            topicMap[topicName] = {
              topic: topicName,
              subjectId: attempt.subjectId,
              subjectName: attempt.subjectName,
              incorrectCount: 0,
              totalAttempts: 0,
              lastAttempted: attempt.timestamp,
            };
          }
          topicMap[topicName].totalAttempts += 1;
          if (!q.isCorrect) {
            topicMap[topicName].incorrectCount += 1;
          }
          if (attempt.timestamp > topicMap[topicName].lastAttempted) {
            topicMap[topicName].lastAttempted = attempt.timestamp;
          }
        });
      }
    });

    // Compute streak
    let currentStreak = 0;
    const now = new Date();
    let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if user practiced today
    const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
    if (!dates.has(todayKey)) {
      // Check if user practiced yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayKey = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
      if (!dates.has(yesterdayKey)) {
        currentStreak = 0;
      } else {
        currentStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
        while (dates.has(`${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
    } else {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (dates.has(`${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Top weak topics
    const weakTopics = Object.values(topicMap)
      .filter((t) => t.incorrectCount > 0)
      .sort((a, b) => b.incorrectCount - a.incorrectCount || (b.incorrectCount / b.totalAttempts) - (a.incorrectCount / a.totalAttempts))
      .slice(0, 5);

    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      totalCorrect,
      overallAccuracy,
      currentStreak,
      subjectStats,
      weakTopics,
    };
  }, [quizHistory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Learning Progress Dashboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Performance analytics, mastery tracking, and revision planner
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close progress modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {quizHistory.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Quiz Attempts Recorded Yet
              </h4>
              <p className="text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                Take a 3, 5, or 10-question concept check quiz in any subject to start building your personalized study metrics and identifying weak spots!
              </p>
            </div>
          ) : (
            <>
              {/* Primary Metric Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Overall Accuracy</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {stats.overallAccuracy}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                      {stats.totalCorrect} of {stats.totalQuestions} correct
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Study Streak</div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5 flex items-center gap-1.5">
                      <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
                      <span>{stats.currentStreak} Day{stats.currentStreak === 1 ? '' : 's'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {stats.currentStreak > 0 ? 'Consistent practice keeps concepts sharp' : 'Complete a quiz today to start streak'}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quizzes Completed</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {quizHistory.length}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                      {stats.totalQuestions} total questions answered
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Subject-Wise Accuracy Breakdown */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Subject-Wise Mastery
                </h4>

                <div className="space-y-3">
                  {SUBJECTS.map((sub) => {
                    const subStat = stats.subjectStats[sub.id];
                    const percent = subStat.total > 0 ? Math.round((subStat.correct / subStat.total) * 100) : 0;
                    return (
                      <div key={sub.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {sub.name}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 tabular-nums font-medium">
                            {subStat.total > 0 ? `${percent}% (${subStat.correct}/${subStat.total})` : 'Not attempted'}
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              subStat.total === 0
                                ? 'bg-slate-200 dark:bg-slate-700 w-0'
                                : percent >= 80
                                ? 'bg-emerald-500'
                                : percent >= 50
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${subStat.total > 0 ? percent : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weak Topics & Adaptive Revision */}
              {stats.weakTopics.length > 0 && (
                <div className="p-4 sm:p-5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                        Recommended Revision Focus (Weak Topics)
                      </h4>
                    </div>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      Based on missed quiz questions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stats.weakTopics.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-amber-200/60 dark:border-amber-800/60 bg-white/80 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.topic}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-medium text-blue-600 dark:text-blue-400">{item.subjectName}</span>
                            <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 mx-1.5">&bull;</span>
                            <span className="text-rose-600 dark:text-rose-400 font-medium">
                              {item.incorrectCount} missed in {item.totalAttempts} attempts
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onPracticeTopic(item.subjectId, item.topic);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                        >
                          <span>Practice Topic</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Quiz Attempts Log */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recently Studied Topics & Quizzes
                </h4>

                <div className="space-y-2">
                  {quizHistory.slice(0, 5).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {attempt.topic || attempt.subjectName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{attempt.subjectName}</span>
                          <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 mx-1.5">&bull;</span>
                          <span>{attempt.difficulty}</span>
                          <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 mx-1.5">&bull;</span>
                          <span className="tabular-nums">
                            {new Date(attempt.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-bold tabular-nums text-sm ${
                            attempt.correctAnswers === attempt.totalQuestions
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : attempt.correctAnswers / attempt.totalQuestions >= 0.5
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {attempt.correctAnswers} / {attempt.totalQuestions}
                        </span>
                        <div className="text-[10px] text-slate-400 tabular-nums">
                          {Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          {quizHistory.length > 0 ? (
            <button
              onClick={onClearProgress}
              className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

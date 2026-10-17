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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#151F32] rounded-2xl shadow-xl border border-[#2A3850] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2A3850] bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9]">
                Learning Progress Dashboard
              </h3>
              <p className="text-xs text-[#A7B4C8]">
                Performance analytics, mastery tracking, and revision planner
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7F8DA3] hover:text-[#F1F5F9] hover:bg-[#1B2940] transition-colors cursor-pointer"
            aria-label="Close progress modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {quizHistory.length === 0 ? (
            <div className="text-center py-16 text-[#7F8DA3]">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <h4 className="text-base font-bold text-[#F1F5F9]">
                No Quiz Attempts Recorded Yet
              </h4>
              <p className="text-xs mt-1 max-w-sm mx-auto leading-relaxed text-[#A7B4C8]">
                Take a 3, 5, or 10-question concept check quiz in any subject to start building your personalized study metrics and identifying weak spots!
              </p>
            </div>
          ) : (
            <>
              {/* Primary Metric Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl border border-[#2A3850] bg-[#1B2940] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#A7B4C8] font-medium">Overall Accuracy</div>
                    <div className="text-2xl font-bold text-[#F1F5F9] tabular-nums mt-0.5">
                      {stats.overallAccuracy}%
                    </div>
                    <div className="text-[11px] text-[#7F8DA3] mt-0.5 tabular-nums">
                      {stats.totalCorrect} of {stats.totalQuestions} correct
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#151F32] border border-[#2A3850] text-[#3B82F6] flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#2A3850] bg-[#1B2940] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#A7B4C8] font-medium">Study Streak</div>
                    <div className="text-2xl font-bold text-amber-400 tabular-nums mt-0.5 flex items-center gap-1.5">
                      <Flame className="w-6 h-6 fill-amber-500 text-amber-400" />
                      <span>{stats.currentStreak} Day{stats.currentStreak === 1 ? '' : 's'}</span>
                    </div>
                    <div className="text-[11px] text-[#7F8DA3] mt-0.5">
                      {stats.currentStreak > 0 ? 'Consistent practice keeps concepts sharp' : 'Complete a quiz today to start streak'}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#2A3850] bg-[#1B2940] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#A7B4C8] font-medium">Quizzes Completed</div>
                    <div className="text-2xl font-bold text-[#F1F5F9] tabular-nums mt-0.5">
                      {quizHistory.length}
                    </div>
                    <div className="text-[11px] text-[#7F8DA3] mt-0.5 tabular-nums">
                      {stats.totalQuestions} total questions answered
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Subject-Wise Accuracy Breakdown */}
              <div className="p-4 sm:p-5 rounded-xl border border-[#2A3850] bg-[#1B2940] space-y-3.5">
                <h4 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
                  Subject-Wise Mastery
                </h4>

                <div className="space-y-3">
                  {SUBJECTS.map((sub) => {
                    const subStat = stats.subjectStats[sub.id];
                    const percent = subStat.total > 0 ? Math.round((subStat.correct / subStat.total) * 100) : 0;
                    return (
                      <div key={sub.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#F1F5F9]">
                            {sub.name}
                          </span>
                          <span className="text-[#A7B4C8] tabular-nums font-medium">
                            {subStat.total > 0 ? `${percent}% (${subStat.correct}/${subStat.total})` : 'Not attempted'}
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-[#111827] border border-[#2A3850] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              subStat.total === 0
                                ? 'bg-[#2A3850] w-0'
                                : percent >= 80
                                ? 'bg-emerald-500'
                                : percent >= 50
                                ? 'bg-[#3B82F6]'
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
                <div className="p-4 sm:p-5 rounded-xl border border-amber-800/60 bg-amber-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Recommended Revision Focus (Weak Topics)
                      </h4>
                    </div>
                    <span className="text-[11px] text-amber-400 font-medium">
                      Based on missed quiz questions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stats.weakTopics.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-[#2A3850] bg-[#151F32] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#F1F5F9]">
                            {item.topic}
                          </div>
                          <div className="text-[11px] text-[#A7B4C8] mt-0.5">
                            <span className="font-medium text-[#3B82F6]">{item.subjectName}</span>
                            <span aria-hidden="true" className="select-none text-[#2A3850] mx-1.5">&bull;</span>
                            <span className="text-rose-400 font-medium">
                              {item.incorrectCount} missed in {item.totalAttempts} attempts
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onPracticeTopic(item.subjectId, item.topic);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
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
                <h4 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
                  Recently Studied Topics & Quizzes
                </h4>

                <div className="space-y-2">
                  {quizHistory.slice(0, 5).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-3 rounded-lg border border-[#2A3850] bg-[#151F32] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#F1F5F9]">
                          {attempt.topic || attempt.subjectName}
                        </div>
                        <div className="text-[11px] text-[#A7B4C8] mt-0.5">
                          <span>{attempt.subjectName}</span>
                          <span aria-hidden="true" className="select-none text-[#2A3850] mx-1.5">&bull;</span>
                          <span>{attempt.difficulty}</span>
                          <span aria-hidden="true" className="select-none text-[#2A3850] mx-1.5">&bull;</span>
                          <span className="tabular-nums text-[#7F8DA3]">
                            {new Date(attempt.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-bold tabular-nums text-sm ${
                            attempt.correctAnswers === attempt.totalQuestions
                              ? 'text-emerald-400'
                              : attempt.correctAnswers / attempt.totalQuestions >= 0.5
                              ? 'text-[#3B82F6]'
                              : 'text-amber-400'
                          }`}
                        >
                          {attempt.correctAnswers} / {attempt.totalQuestions}
                        </span>
                        <div className="text-[10px] text-[#7F8DA3] tabular-nums">
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
        <div className="p-3.5 border-t border-[#2A3850] bg-[#111827] flex items-center justify-between">
          {quizHistory.length > 0 ? (
            <button
              onClick={onClearProgress}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] text-[#F1F5F9] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

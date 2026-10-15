import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizDifficulty, QuizLength, QuizQuestionResult } from '../types';
import { CheckCircle2, XCircle, RotateCcw, Sparkles, Award, SlidersHorizontal, RefreshCw, Trophy, Flame, Zap, HelpCircle } from 'lucide-react';

interface QuizSectionProps {
  questions: QuizQuestion[];
  subjectName: string;
  topicName?: string;
  selectedDifficulty: QuizDifficulty;
  selectedLength: QuizLength;
  onChangeDifficulty: (difficulty: QuizDifficulty) => void;
  onChangeLength: (length: QuizLength) => void;
  onGenerateNew: (difficulty?: QuizDifficulty, count?: QuizLength) => void;
  isGeneratingNew: boolean;
  onRecordAttempt?: (data: {
    totalQuestions: number;
    correctAnswers: number;
    difficulty: string;
    questionResults: QuizQuestionResult[];
  }) => void;
  onOpenLeaderboard?: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  questions,
  subjectName,
  topicName,
  selectedDifficulty,
  selectedLength,
  onChangeDifficulty,
  onChangeLength,
  onGenerateNew,
  isGeneratingNew,
  onRecordAttempt,
  onOpenLeaderboard,
}) => {
  // Questions currently being presented (either the full set or retry subset)
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [showAllExplanations, setShowAllExplanations] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [hasRecordedCurrentAttempt, setHasRecordedCurrentAttempt] = useState(false);

  // Sync when parent provides brand new questions
  useEffect(() => {
    setActiveQuestions(questions);
    setSelectedAnswers({});
    setShowAllExplanations(false);
    setIsRetryMode(false);
    setHasRecordedCurrentAttempt(false);
  }, [questions]);

  const handleSelectOption = (qIndex: number, optionIndex: number) => {
    if (selectedAnswers[qIndex] !== undefined) return;
    const nextAnswers = { ...selectedAnswers, [qIndex]: optionIndex };
    setSelectedAnswers(nextAnswers);

    // If all questions are now answered, record attempt for progress analytics
    if (Object.keys(nextAnswers).length === activeQuestions.length && !hasRecordedCurrentAttempt && !isRetryMode) {
      setHasRecordedCurrentAttempt(true);
      if (onRecordAttempt) {
        const questionResults: QuizQuestionResult[] = activeQuestions.map((q, idx) => {
          const userIdx = nextAnswers[idx];
          return {
            question: q.question,
            subtopic: q.subtopic || topicName,
            userAnswerIndex: userIdx,
            correctAnswerIndex: q.correctIndex,
            isCorrect: userIdx === q.correctIndex,
            explanation: q.explanation,
          };
        });

        const correctCount = questionResults.filter((r) => r.isCorrect).length;

        onRecordAttempt({
          totalQuestions: activeQuestions.length,
          correctAnswers: correctCount,
          difficulty: selectedDifficulty,
          questionResults,
        });
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowAllExplanations(false);
  };

  const totalAnswered = Object.keys(selectedAnswers).length;
  const correctCount = activeQuestions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);
  const incorrectCount = totalAnswered - correctCount;

  // Retry only incorrect questions
  const handleStartRetryIncorrect = () => {
    const missed = activeQuestions.filter((q, idx) => {
      const ans = selectedAnswers[idx];
      return ans !== undefined && ans !== q.correctIndex;
    });

    if (missed.length > 0) {
      setActiveQuestions(missed);
      setSelectedAnswers({});
      setShowAllExplanations(false);
      setIsRetryMode(true);
    }
  };

  const handleExitRetry = () => {
    setActiveQuestions(questions);
    setSelectedAnswers({});
    setShowAllExplanations(false);
    setIsRetryMode(false);
  };

  const difficultyDescriptions: Record<QuizDifficulty, { label: string; desc: string; badge: string; color: string; activeClass: string }> = {
    'Beginner': {
      label: 'Beginner',
      desc: 'Foundational definitions, units & standard laws',
      badge: '1.0x Pts',
      color: 'text-emerald-600 dark:text-emerald-400',
      activeClass: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-semibold shadow-2xs',
    },
    'Core Concept': {
      label: 'Core Concept',
      desc: 'Formulas, circuit analysis & code tracing',
      badge: '1.25x Pts',
      color: 'text-blue-600 dark:text-blue-400',
      activeClass: 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-semibold shadow-2xs',
    },
    'Exam Level': {
      label: 'Exam Level',
      desc: 'Rigorous multi-step derivations & university finals',
      badge: '1.5x Pts 🔥',
      color: 'text-purple-600 dark:text-purple-400',
      activeClass: 'bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200 font-semibold shadow-2xs',
    },
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0">
      {/* Quiz Top Action & Controls Bar */}
      <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 w-full min-w-0 card-responsive">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                {isRetryMode ? 'Retry Missed Questions' : 'Concept Check Quiz'}
              </h3>
              {isRetryMode ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  Targeted Revision
                </span>
              ) : (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${difficultyDescriptions[selectedDifficulty]?.activeClass || ''}`}>
                  {selectedDifficulty}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>{subjectName}</span>
              <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 px-0.5">/</span>
              <span>{selectedDifficulty}</span>
              <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 px-0.5">/</span>
              <span className="tabular-nums font-medium">{totalAnswered} of {activeQuestions.length} completed</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
            {onOpenLeaderboard && (
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="px-3 py-2 sm:py-1.5 min-h-[38px] text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                title="View Quiz Leaderboard & Top Scores"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Leaderboard</span>
              </button>
            )}

            {isRetryMode ? (
              <button
                onClick={handleExitRetry}
                className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 min-h-[38px] text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer text-center"
              >
                Back to Full Quiz
              </button>
            ) : totalAnswered > 0 ? (
              <button
                onClick={handleReset}
                className="px-3.5 py-2 sm:py-1.5 min-h-[38px] text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            ) : null}

            <button
              onClick={() => onGenerateNew(selectedDifficulty, selectedLength)}
              disabled={isGeneratingNew}
              className="flex-1 sm:flex-initial px-4 py-2 sm:py-1.5 min-h-[38px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
            >
              {isGeneratingNew ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate {selectedDifficulty} Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quiz Difficulty Level Toggles - Users can toggle freely before generating */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Select Difficulty Level before generating:</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Choose difficulty to tailor question depth and bonus points
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['Beginner', 'Core Concept', 'Exam Level'] as QuizDifficulty[]).map((diff) => {
              const isSelected = selectedDifficulty === diff;
              const info = difficultyDescriptions[diff];
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => onChangeDifficulty(diff)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${info.activeClass} ring-1 ring-blue-500/30`
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      {diff === 'Exam Level' && <Flame className="w-3.5 h-3.5 text-purple-500" />}
                      {diff === 'Core Concept' && <Zap className="w-3.5 h-3.5 text-blue-500" />}
                      {diff === 'Beginner' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      <span>{diff}</span>
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {info.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {info.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Question Count / Length Selector */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Question Count:</span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              {([3, 5, 10] as QuizLength[]).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => onChangeLength(len)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                    selectedLength === len
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {len} Questions
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-4">
        {activeQuestions.map((q, qIndex) => {
          const userAnswer = selectedAnswers[qIndex];
          const hasAnswered = userAnswer !== undefined;
          const isCorrect = hasAnswered && userAnswer === q.correctIndex;

          return (
            <div
              key={qIndex}
              className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors w-full min-w-0 card-responsive"
            >
              {/* Question Metadata Line */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-slate-900 dark:text-slate-200 tabular-nums shrink-0">
                    Question {qIndex + 1 < 10 ? `0${qIndex + 1}` : qIndex + 1}
                  </span>
                  {q.subtopic && (
                    <>
                      <span aria-hidden="true" className="select-none text-slate-300 dark:text-slate-600 px-1">/</span>
                      <span className="text-slate-600 dark:text-slate-300 truncate">{q.subtopic}</span>
                    </>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-1">
                  {q.difficulty}
                </span>
              </div>

              {/* Question Title */}
              <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug mb-3.5">
                {q.question}
              </h4>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => {
                  const isSelected = userAnswer === optIndex;
                  const isThisCorrect = optIndex === q.correctIndex;

                  let optionClasses =
                    'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';

                  if (hasAnswered) {
                    if (isThisCorrect) {
                      optionClasses =
                        'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected) {
                      optionClasses =
                        'border-rose-500 bg-rose-50/80 dark:bg-rose-950/50 text-rose-950 dark:text-rose-100 font-medium';
                    } else {
                      optionClasses =
                        'border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      disabled={hasAnswered}
                      className={`w-full text-left p-3 sm:p-3.5 min-h-[46px] rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${optionClasses}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-xs font-bold shrink-0 mt-0.5 ${
                          hasAnswered && isThisCorrect
                            ? 'bg-emerald-600 text-white'
                            : hasAnswered && isSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {optionLetters[optIndex]}
                      </span>

                      <span className="flex-1 text-xs sm:text-sm leading-relaxed">{opt}</span>

                      {hasAnswered && isThisCorrect && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 self-center">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct</span>
                        </span>
                      )}
                      {hasAnswered && isSelected && !isThisCorrect && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0 self-center">
                          <XCircle className="w-4 h-4" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Disclosure */}
              {(hasAnswered || showAllExplanations) && (
                <div
                  className={`mt-3.5 p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                    isCorrect
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="font-semibold mb-1 flex items-center gap-1.5 text-xs text-slate-900 dark:text-white">
                    <span>Explanation & Core Takeaway:</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress, Score & Retry Strip */}
      {totalAnswered > 0 && (
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4 w-full min-w-0 card-responsive">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                Score: {correctCount} / {activeQuestions.length} ({Math.round((correctCount / activeQuestions.length) * 100)}%)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                {correctCount === activeQuestions.length
                  ? 'Outstanding! Complete mastery of all concepts in this question set.'
                  : totalAnswered === activeQuestions.length
                  ? `Completed with ${incorrectCount} question${incorrectCount === 1 ? '' : 's'} missed. Use the retry button to master them.`
                  : `${activeQuestions.length - totalAnswered} question${activeQuestions.length - totalAnswered === 1 ? '' : 's'} remaining.`}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
            {!showAllExplanations && totalAnswered < activeQuestions.length && (
              <button
                onClick={() => setShowAllExplanations(true)}
                className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 min-h-[38px] text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer text-center"
              >
                Reveal Explanations
              </button>
            )}

            {/* Retry Incorrect Questions Button */}
            {totalAnswered === activeQuestions.length && incorrectCount > 0 && !isRetryMode && (
              <button
                onClick={handleStartRetryIncorrect}
                className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 min-h-[38px] text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Incorrect ({incorrectCount})</span>
              </button>
            )}

            {onOpenLeaderboard && (
              <button
                type="button"
                onClick={onOpenLeaderboard}
                className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 min-h-[38px] text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs text-center"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Leaderboard</span>
              </button>
            )}

            <button
              onClick={() => onGenerateNew(selectedDifficulty, selectedLength)}
              disabled={isGeneratingNew}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 min-h-[38px] text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs text-center"
            >
              New {selectedDifficulty} Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

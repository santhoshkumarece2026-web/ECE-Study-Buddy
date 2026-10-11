import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, RotateCcw, Sparkles, Award } from 'lucide-react';

interface QuizSectionProps {
  questions: QuizQuestion[];
  subjectName: string;
  onGenerateNew: () => void;
  isGeneratingNew: boolean;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  questions,
  subjectName,
  onGenerateNew,
  isGeneratingNew,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [showAllExplanations, setShowAllExplanations] = useState(false);

  const handleSelectOption = (qIndex: number, optionIndex: number) => {
    if (selectedAnswers[qIndex] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowAllExplanations(false);
  };

  const totalAnswered = Object.keys(selectedAnswers).length;
  const correctCount = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0);
  }, 0);

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-5">
      {/* Quiz Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
            3-Question Concept Check
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{subjectName}</span>
            <span aria-hidden="true">·</span>
            <span>Instant Feedback</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-medium">{totalAnswered} of {questions.length} completed</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalAnswered > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={onGenerateNew}
            disabled={isGeneratingNew}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingNew ? 'Generating...' : 'New 3 Questions'}</span>
          </button>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-4">
        {questions.map((q, qIndex) => {
          const userAnswer = selectedAnswers[qIndex];
          const hasAnswered = userAnswer !== undefined;
          const isCorrect = hasAnswered && userAnswer === q.correctIndex;

          return (
            <div
              key={qIndex}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors"
            >
              {/* Question Metadata Line (Zero-Pill Discipline) */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-200 tabular-nums">
                    Question 0{qIndex + 1}
                  </span>
                  {q.subtopic && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{q.subtopic}</span>
                    </>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-400">
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
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${optionClasses}`}
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

      {/* Progress & Score Strip */}
      {totalAnswered > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                Score: {correctCount} / {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {correctCount === questions.length
                  ? 'Excellent! You have solid mastery of these concepts.'
                  : totalAnswered === questions.length
                  ? 'Good practice! Review the explanations above to reinforce weak spots.'
                  : `${questions.length - totalAnswered} question remaining.`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showAllExplanations && totalAnswered < questions.length && (
              <button
                onClick={() => setShowAllExplanations(true)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
              >
                Reveal Explanations
              </button>
            )}
            <button
              onClick={onGenerateNew}
              disabled={isGeneratingNew}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              New 3 Questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

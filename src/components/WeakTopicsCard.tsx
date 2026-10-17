import React from 'react';
import { WeakTopicRecord, SubjectId } from '../types';
import { Target, ArrowRight, Flame } from 'lucide-react';

interface WeakTopicsCardProps {
  weakTopics: WeakTopicRecord[];
  onPracticeTopic: (subjectId: SubjectId, topic: string) => void;
  onOpenProgress: () => void;
}

export const WeakTopicsCard: React.FC<WeakTopicsCardProps> = ({
  weakTopics,
  onPracticeTopic,
  onOpenProgress,
}) => {
  if (weakTopics.length === 0) return null;

  const topWeak = weakTopics[0];

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-800/40 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm w-full min-w-0 card-responsive">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-800/40">
          <Target className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Adaptive Revision Recommended
            </span>
            <span className="text-[11px] text-amber-400/80 font-semibold tabular-nums">
              ({topWeak.incorrectCount} missed questions)
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#F1F5F9] mt-0.5 truncate">
            Focus Area: {topWeak.topic} ({topWeak.subjectName})
          </h4>
          <p className="text-xs text-[#A7B4C8] mt-0.5 leading-normal">
            Solidify this concept with an adaptive targeted quiz to master frequent exam traps.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
        <button
          onClick={onOpenProgress}
          className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 min-h-[40px] sm:min-h-[38px] text-xs font-medium text-[#F1F5F9] bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] rounded-xl transition-colors cursor-pointer text-center"
        >
          View Analytics
        </button>

        <button
          onClick={() => onPracticeTopic(topWeak.subjectId, topWeak.topic)}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 min-h-[40px] sm:min-h-[38px] text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 active:bg-amber-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Practice Weak Topic</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

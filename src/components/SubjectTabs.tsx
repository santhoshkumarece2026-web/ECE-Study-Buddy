import React from 'react';
import { SUBJECTS } from '../data/subjectData';
import { SubjectId } from '../types';
import { Cpu, Code2, Calculator, Wrench, Compass, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubjectTabsProps {
  selectedSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  onSelectTopic: (topic: string) => void;
}

const SUBJECT_DETAILS: Record<SubjectId, {
  courseCode: string;
  summary: string;
}> = {
  electronics: {
    courseCode: 'ECE 101',
    summary: 'Diodes · BJT · Op-Amps · Logic',
  },
  'c-programming': {
    courseCode: 'CS 102',
    summary: 'Pointers · Memory · Arrays · Structs',
  },
  math: {
    courseCode: 'MAT 101',
    summary: 'Matrices · Differential Eqns · Laplace',
  },
  'general-eng': {
    courseCode: 'ENG 100',
    summary: 'Statics · Thermodynamics · AC Power',
  },
};

export const SubjectTabs: React.FC<SubjectTabsProps> = ({
  selectedSubjectId,
  onSelectSubject,
  onSelectTopic,
}) => {
  const getSubjectIcon = (id: SubjectId, isSelected: boolean) => {
    const iconClass = isSelected ? 'text-[#3B82F6]' : 'text-[#7F8DA3] group-hover:text-[#A7B4C8]';
    switch (id) {
      case 'electronics':
        return <Cpu className={`w-4 h-4 ${iconClass} transition-colors`} />;
      case 'c-programming':
        return <Code2 className={`w-4 h-4 ${iconClass} transition-colors`} />;
      case 'math':
        return <Calculator className={`w-4 h-4 ${iconClass} transition-colors`} />;
      case 'general-eng':
        return <Wrench className={`w-4 h-4 ${iconClass} transition-colors`} />;
    }
  };

  const activeSubject = SUBJECTS.find((s) => s.id === selectedSubjectId) || SUBJECTS[0];
  const activeDetails = SUBJECT_DETAILS[selectedSubjectId];

  return (
    <div className="space-y-3.5 w-full min-w-0" role="tablist" aria-label="Curriculum subjects">
      {/* 4 Subject Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full min-w-0 relative">
        {SUBJECTS.map((subject) => {
          const isSelected = subject.id === selectedSubjectId;
          const details = SUBJECT_DETAILS[subject.id];

          return (
            <button
              key={subject.id}
              onClick={() => onSelectSubject(subject.id)}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`group relative p-3 sm:p-3.5 min-h-[72px] sm:min-h-[78px] rounded-xl text-left transition-all duration-200 flex flex-col justify-between cursor-pointer min-w-0 border overflow-hidden ${
                isSelected
                  ? 'border-[#3B82F6] bg-[#1B2940] text-[#F1F5F9] shadow-sm'
                  : 'border-[#2A3850] bg-[#151F32] text-[#A7B4C8] hover:border-[#3B82F6]/50 hover:bg-[#1B2940]/60'
              }`}
            >
              {/* Left active indicator bar */}
              {isSelected && (
                <motion.div
                  layoutId="activeSubjectIndicatorBar"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#3B82F6] pointer-events-none"
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-1 mb-1 min-w-0 w-full pl-0.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`p-1.5 rounded-lg shrink-0 transition-colors duration-200 ${
                      isSelected
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6]'
                        : 'bg-[#1B2940] text-[#7F8DA3] group-hover:bg-[#223350] group-hover:text-[#A7B4C8]'
                    }`}
                  >
                    {getSubjectIcon(subject.id, isSelected)}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-[#F1F5F9] leading-tight truncate">
                    {subject.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#7F8DA3] shrink-0">
                  {details.courseCode}
                </span>
              </div>

              <div className="relative z-10 text-[10px] sm:text-[11px] text-[#A7B4C8] line-clamp-1 leading-normal pl-1">
                {details.summary}
              </div>
            </button>
          );
        })}
      </div>

      {/* Curriculum Highlights Section (Cohesive Dark Theme Panel) */}
      <motion.div
        layout
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="p-3.5 sm:p-4 rounded-xl bg-[#151F32] border border-[#2A3850] w-full min-w-0 space-y-2.5 shadow-xs"
      >
        <div className="flex items-center justify-between text-xs text-[#A7B4C8] font-medium pb-1 border-b border-[#2A3850]/70">
          <span className="flex items-center gap-1.5 min-w-0 truncate">
            <Compass className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
            <span className="truncate">
              Curriculum Highlights: <strong className="text-[#F1F5F9] font-semibold">{activeSubject.shortName}</strong>
            </span>
          </span>
          <span className="text-[10px] font-mono text-[#7F8DA3] shrink-0 ml-1">
            {activeDetails.courseCode}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`topics-${selectedSubjectId}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5"
          >
            {activeSubject.suggestedTopics.map((topic, index) => (
              <motion.button
                key={topic}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.16, delay: index * 0.015 }}
                onClick={() => onSelectTopic(topic)}
                type="button"
                className="px-2.5 py-1.5 min-h-[30px] text-xs rounded-lg bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] text-[#F1F5F9] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all duration-150 cursor-pointer text-left font-medium active:scale-95 flex items-center gap-1.5 group"
              >
                <span>{topic}</span>
                <ChevronRight className="w-3 h-3 text-[#7F8DA3] group-hover:text-[#3B82F6] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

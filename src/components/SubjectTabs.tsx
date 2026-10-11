import React from 'react';
import { SUBJECTS } from '../data/subjectData';
import { SubjectId } from '../types';
import { Cpu, Code2, Calculator, Wrench, Sparkles } from 'lucide-react';

interface SubjectTabsProps {
  selectedSubjectId: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  onSelectTopic: (topic: string) => void;
}

export const SubjectTabs: React.FC<SubjectTabsProps> = ({
  selectedSubjectId,
  onSelectSubject,
  onSelectTopic,
}) => {
  const getIcon = (id: SubjectId) => {
    switch (id) {
      case 'electronics':
        return <Cpu className="w-4 h-4" />;
      case 'c-programming':
        return <Code2 className="w-4 h-4" />;
      case 'math':
        return <Calculator className="w-4 h-4" />;
      case 'general-eng':
        return <Wrench className="w-4 h-4" />;
    }
  };

  const activeSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];

  return (
    <div className="space-y-3.5">
      {/* 4 Subject Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {SUBJECTS.map((subject) => {
          const isSelected = subject.id === selectedSubjectId;
          return (
            <button
              key={subject.id}
              onClick={() => onSelectSubject(subject.id)}
              className={`p-3 sm:p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100 ring-1 ring-blue-600/30 dark:ring-blue-500/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {getIcon(subject.id)}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {subject.name}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-normal">
                {subject.shortName === 'Electronics' && 'Diodes · BJT · Op-Amps'}
                {subject.shortName === 'C Programming' && 'Pointers · Memory · Arrays'}
                {subject.shortName === 'Engg. Mathematics' && 'Matrices · Calculus · Laplace'}
                {subject.shortName === 'General Engg.' && 'Mechanics · Thermodynamics'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Suggested Syllabus Topics */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Syllabus Highlights for {activeSubject.shortName}</span>
          </span>
          <span className="text-[10px] text-slate-400">Click to fill</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeSubject.suggestedTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => onSelectTopic(topic)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left font-medium"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

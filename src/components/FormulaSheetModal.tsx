import React, { useState } from 'react';
import { FORMULA_SHEETS } from '../data/subjectData';
import { SubjectId } from '../types';
import { X, BookMarked, Cpu, Code2, Calculator, Wrench, Copy, Check } from 'lucide-react';

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectId?: SubjectId;
}

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({
  isOpen,
  onClose,
  initialSubjectId = 'electronics',
}) => {
  const [activeTab, setActiveTab] = useState<SubjectId>(initialSubjectId);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategory = FORMULA_SHEETS.find(c => c.subjectId === activeTab) || FORMULA_SHEETS[0];

  const handleCopy = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#151F32] rounded-2xl shadow-xl border border-[#2A3850] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2A3850]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center shadow-xs">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9]">
                Formula Cheatsheets & Key Relations
              </h3>
              <p className="text-xs text-[#A7B4C8]">
                Core definitions and standard equations for first-year engineering
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7F8DA3] hover:text-[#F1F5F9] hover:bg-[#1B2940] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls (Functional Segmented Control) */}
        <div className="flex border-b border-[#2A3850] p-2 gap-1 bg-[#111827] overflow-x-auto">
          <button
            onClick={() => setActiveTab('electronics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'electronics'
                ? 'bg-[#1B2940] text-[#F1F5F9] border border-[#2A3850] shadow-xs'
                : 'text-[#A7B4C8] hover:text-[#F1F5F9]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Electronics</span>
          </button>
          <button
            onClick={() => setActiveTab('c-programming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'c-programming'
                ? 'bg-[#1B2940] text-[#F1F5F9] border border-[#2A3850] shadow-xs'
                : 'text-[#A7B4C8] hover:text-[#F1F5F9]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>C Programming</span>
          </button>
          <button
            onClick={() => setActiveTab('math')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'math'
                ? 'bg-[#1B2940] text-[#F1F5F9] border border-[#2A3850] shadow-xs'
                : 'text-[#A7B4C8] hover:text-[#F1F5F9]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Engg. Math</span>
          </button>
          <button
            onClick={() => setActiveTab('general-eng')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'general-eng'
                ? 'bg-[#1B2940] text-[#F1F5F9] border border-[#2A3850] shadow-xs'
                : 'text-[#A7B4C8] hover:text-[#F1F5F9]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-purple-400" />
            <span>General Engg.</span>
          </button>
        </div>

        {/* List of Formulas */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {currentCategory.items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-[#2A3850] bg-[#1B2940]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-semibold text-xs sm:text-sm text-[#F1F5F9]">
                  {item.title}
                </h4>
                <button
                  onClick={() => handleCopy(item.formula)}
                  className="px-2 py-1 rounded-md text-[11px] text-[#7F8DA3] hover:text-[#F1F5F9] hover:bg-[#151F32] transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy formula"
                >
                  {copiedFormula === item.formula ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#7F8DA3]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111827] border border-[#2A3850] font-mono text-xs text-[#3B82F6] whitespace-pre-wrap leading-relaxed tabular-nums">
                {item.formula}
              </div>

              <div className="mt-2 text-xs text-[#A7B4C8] leading-normal">
                {item.note}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2A3850] bg-[#111827] flex justify-end">
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

import React from 'react';
import { StudyHistoryItem } from '../types';
import { X, History, Trash2, ArrowRight } from 'lucide-react';

interface StudyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: StudyHistoryItem[];
  onSelectHistory: (item: StudyHistoryItem) => void;
  onClearHistory: () => void;
}

export const StudyHistoryModal: React.FC<StudyHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#151F32] rounded-2xl shadow-xl border border-[#2A3850] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2A3850]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9]">
                Study History
              </h3>
              <p className="text-xs text-[#A7B4C8]">
                {history.length} saved topic{history.length === 1 ? '' : 's'} on this device
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

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-12 text-[#7F8DA3]">
              <History className="w-10 h-10 mx-auto mb-2.5 opacity-40" />
              <p className="text-sm font-semibold text-[#F1F5F9]">No questions in history yet</p>
              <p className="text-xs mt-0.5">Ask a question to save it for quick revision.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistory(item);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-[#2A3850] bg-[#1B2940] hover:border-[#3B82F6] hover:bg-[#223350] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-[#7F8DA3] mb-1">
                  <span className="font-semibold text-[#3B82F6]">
                    {item.subjectName}
                  </span>
                  <span className="tabular-nums">
                    {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="font-semibold text-xs sm:text-sm text-[#F1F5F9] line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
                  {item.question}
                </h4>

                <p className="text-xs text-[#A7B4C8] mt-1 line-clamp-1">
                  {item.answer.replace(/[\#\*\_`]/g, '')}
                </p>

                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-[#3B82F6]">
                  <span>Open explanation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3.5 border-t border-[#2A3850] bg-[#111827] flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] text-[#F1F5F9] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

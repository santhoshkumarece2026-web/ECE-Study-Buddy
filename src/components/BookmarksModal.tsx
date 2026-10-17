import React, { useState, useMemo } from 'react';
import { BookmarkItem, SubjectId } from '../types';
import { X, Bookmark, Search, Trash2, ArrowRight, Copy, Check, BookOpen } from 'lucide-react';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  onSelectBookmark: (item: BookmarkItem) => void;
  onDeleteBookmark: (id: string) => void;
  onClearBookmarks: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onSelectBookmark,
  onDeleteBookmark,
  onClearBookmarks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | SubjectId>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((item) => {
      const matchesFilter = selectedFilter === 'all' || item.subjectId === selectedFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.topicTitle.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [bookmarks, selectedFilter, searchQuery]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#151F32] rounded-2xl shadow-xl border border-[#2A3850] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2A3850]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F1F5F9]">
                Saved Bookmarks
              </h3>
              <p className="text-xs text-[#A7B4C8]">
                {bookmarks.length} saved explanation{bookmarks.length === 1 ? '' : 's'} stored on this device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7F8DA3] hover:text-[#F1F5F9] hover:bg-[#1B2940] transition-colors cursor-pointer"
            aria-label="Close bookmarks modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Subject Filter Bar */}
        <div className="p-3.5 bg-[#111827] border-b border-[#2A3850] space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#7F8DA3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in bookmarked questions, topics, or formulas..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#151F32] border border-[#2A3850] rounded-xl text-[#F1F5F9] placeholder:text-[#7F8DA3] focus:outline-hidden focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7F8DA3] hover:text-[#F1F5F9] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Subject Filter Segmented Control */}
          <div className="flex gap-1.5 overflow-x-auto text-xs pb-0.5">
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'electronics', label: 'Electronics' },
              { id: 'c-programming', label: 'C Programming' },
              { id: 'math', label: 'Engg. Math' },
              { id: 'general-eng', label: 'General Engg.' },
            ].map((tab) => {
              const active = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as 'all' | SubjectId)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#3B82F6] text-white shadow-xs font-semibold'
                      : 'bg-[#1B2940] text-[#A7B4C8] hover:text-[#F1F5F9] border border-[#2A3850]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-14 text-[#7F8DA3]">
              <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-[#F1F5F9]">
                {bookmarks.length === 0 ? 'No bookmarks saved yet' : 'No matching bookmarks found'}
              </p>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                {bookmarks.length === 0
                  ? 'Click "Save Bookmark" on any AI explanation to save it for offline review and quick exam revision.'
                  : 'Try modifying your search keywords or subject filter.'}
              </p>
            </div>
          ) : (
            filteredBookmarks.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#2A3850] bg-[#1B2940] hover:border-[#3B82F6]/60 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-[#7F8DA3] mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#3B82F6]">
                      {item.subjectName}
                    </span>
                    <span aria-hidden="true" className="select-none text-[#2A3850]">/</span>
                    <span className="tabular-nums">
                      {new Date(item.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.explanation)}
                      className="p-1.5 rounded-lg text-[#7F8DA3] hover:text-[#F1F5F9] hover:bg-[#151F32] transition-colors cursor-pointer"
                      title="Copy explanation"
                      aria-label="Copy explanation"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteBookmark(item.id)}
                      className="p-1.5 rounded-lg text-[#7F8DA3] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete bookmark"
                      aria-label="Delete bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-[#F1F5F9] line-clamp-2 mb-1.5">
                  {item.question}
                </h4>

                <p className="text-xs text-[#A7B4C8] line-clamp-2 leading-relaxed mb-3">
                  {item.explanation.replace(/[\#\*\_`]/g, '')}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#2A3850]">
                  <span className="text-[11px] text-[#7F8DA3]">
                    Topic: {item.topicTitle}
                  </span>

                  <button
                    onClick={() => {
                      onSelectBookmark(item);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-[#3B82F6] hover:bg-[#151F32] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Explanation</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2A3850] bg-[#111827] flex items-center justify-between">
          {bookmarks.length > 0 ? (
            <button
              onClick={onClearBookmarks}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All ({bookmarks.length})</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#1B2940] hover:bg-[#223350] border border-[#2A3850] text-[#F1F5F9] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Copy, Check, Terminal, Lightbulb, AlertTriangle, Target, BookOpen } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeBlockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '') || 'code';
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const codeText = codeBuffer.join('\n');
        const currentIndex = codeBlockIndex++;
        elements.push(
          <div key={`code-${currentIndex}`} className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700/60 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                {codeLanguage.toUpperCase()}
              </span>
              <button
                onClick={() => handleCopyCode(codeText, currentIndex)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-xs cursor-pointer"
                title="Copy code"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-emerald-300 leading-relaxed tabular-nums">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Check Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2 flex items-center gap-2">
          {renderInlineFormatting(line.replace('### ', ''))}
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      const headingText = line.replace('## ', '');
      const isAnalogy = headingText.includes('Analogy') || headingText.includes('Intuition') || headingText.includes('💡');
      const isPitfall = headingText.includes('Pitfall') || headingText.includes('Trap') || headingText.includes('⚠️');
      const isSummary = headingText.includes('Summary') || headingText.includes('🎯');

      elements.push(
        <div key={`h3-${i}`} className="mt-6 mb-2.5">
          <div className="flex items-center gap-2">
            {isAnalogy && <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />}
            {isPitfall && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
            {isSummary && <Target className="w-4 h-4 text-blue-500 shrink-0" />}
            {!isAnalogy && !isPitfall && !isSummary && <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />}
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {renderInlineFormatting(headingText)}
            </h3>
          </div>
        </div>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3 border-b pb-1.5 border-slate-200 dark:border-slate-800">
          {renderInlineFormatting(line.replace('# ', ''))}
        </h2>
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletContent = line.trim().substring(2);
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-slate-700 dark:text-slate-300 my-1 leading-relaxed text-sm">
          {renderInlineFormatting(bulletContent)}
        </li>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex gap-2 my-1.5 ml-1 text-slate-700 dark:text-slate-300 text-sm">
          <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[1.25rem] tabular-nums">{numMatch[1]}.</span>
          <div className="flex-1 leading-relaxed">{renderInlineFormatting(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm my-1.5">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
};

function renderInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-mono text-xs font-medium"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts.length > 0 ? parts : text;
}

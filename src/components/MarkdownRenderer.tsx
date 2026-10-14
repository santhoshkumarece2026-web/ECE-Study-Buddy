import React, { useState } from 'react';
import { Copy, Check, Terminal, Lightbulb, AlertTriangle, Target, BookOpen, FileText, Cpu, Zap } from 'lucide-react';
import { CircuitRenderer, isCircuitSchematic } from './CircuitRenderer';
import { AsciiCircuitSchematic } from './AsciiCircuitSchematic';

interface MarkdownRendererProps {
  content: string;
}

function formatLatexMatrixToUnicode(inner: string): string {
  const rawRows = inner
    .split('\\\\')
    .map((r) => r.trim())
    .filter(Boolean);

  if (rawRows.length === 0) return '';

  const parsedGrid = rawRows.map((row) =>
    row
      .split('&')
      .map((cell) => {
        let c = cell.trim();
        // put spaces around operators if needed
        c = c.replace(/([0-9a-zA-Zλβμαγνθ\(\)])-([0-9a-zA-Zλβμαγνθ\(\)])/g, '$1 - $2');
        c = c.replace(/([0-9a-zA-Zλβμαγνθ\(\)])\+([0-9a-zA-Zλβμαγνθ\(\)])/g, '$1 + $2');
        return c;
      })
  );

  const numCols = Math.max(...parsedGrid.map((r) => r.length));
  const colWidths: number[] = [];
  for (let c = 0; c < numCols; c++) {
    let maxW = 0;
    for (let r = 0; r < parsedGrid.length; r++) {
      const cellLen = (parsedGrid[r][c] || '').length;
      if (cellLen > maxW) maxW = cellLen;
    }
    colWidths.push(maxW);
  }

  const lines = parsedGrid.map((row, rIdx) => {
    const formattedCells = colWidths.map((w, cIdx) => {
      const val = row[cIdx] || '';
      return val.padStart(w, ' ');
    });
    const content = formattedCells.join('   ');
    if (parsedGrid.length === 1) {
      return `[ ${content} ]`;
    }
    if (parsedGrid.length === 2) {
      return rIdx === 0 ? `⎡ ${content} ⎤` : `⎣ ${content} ⎦`;
    }
    if (rIdx === 0) return `⎡ ${content} ⎤`;
    if (rIdx === parsedGrid.length - 1) return `⎣ ${content} ⎦`;
    return `⎢ ${content} ⎥`;
  });

  return lines.join('\n');
}

function cleanLatexToUnicode(raw: string): string {
  if (!raw) return '';

  let cleaned = raw;

  // Replace matrix blocks \begin{pmatrix} ... \end{pmatrix} or \begin{bmatrix} ... \end{bmatrix}
  cleaned = cleaned.replace(/\\begin\{[pbvV]?matrix\}([\s\S]*?)\\end\{[pbvV]?matrix\}/g, (_, inner: string) => {
    return formatLatexMatrixToUnicode(inner);
  });

  // Replace \frac{a}{b} with (a / b)
  cleaned = cleaned.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)');
  cleaned = cleaned.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)');

  // Replace common Greek letters
  cleaned = cleaned
    .replace(/\\lambda/g, 'λ')
    .replace(/\\Lambda/g, 'Λ')
    .replace(/\\beta/g, 'β')
    .replace(/\\alpha/g, 'α')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\Gamma/g, 'Γ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\Theta/g, 'Θ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\Pi/g, 'Π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\phi/g, 'φ')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\eta/g, 'η')
    .replace(/\\delta/g, 'δ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\epsilon/g, 'ε');

  // Replace common math operators & symbols
  cleaned = cleaned
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏')
    .replace(/\\int/g, '∫')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\ne/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\le/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\ge/g, '≥')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±')
    .replace(/\\infty/g, '∞')
    .replace(/\\nabla/g, '∇')
    .replace(/\\partial/g, '∂')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\mathbb\{R\}/g, 'ℝ')
    .replace(/\\mathbb\{C\}/g, 'ℂ')
    .replace(/\\mathbb\{Z\}/g, 'ℤ')
    .replace(/\\mathbb\{N\}/g, 'ℕ')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\to/g, '→')
    .replace(/\\implies/g, '=>')
    .replace(/\\iff/g, '<=>');

  // Strip font/format macros like \text{...}, \mathbf{...}, \mathrm{...}, \mathit{...}
  cleaned = cleaned.replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1');

  // Strip remaining escape slashes on brackets: \[ \] \( \) \{ \}
  cleaned = cleaned
    .replace(/\\([\{\}\[\]\(\)])/g, '$1')
    .replace(/\\;/g, ' ')
    .replace(/\\,/g, ' ')
    .replace(/\\!/g, '')
    .replace(/\\quad/g, '  ')
    .replace(/\\qquad/g, '    ');

  // Remove $$ and $ markers
  cleaned = cleaned.replace(/\$\$/g, '').replace(/\$/g, '');

  return cleaned;
}

function isCircuitDiagramText(text: string): boolean {
  const indicators = [
    '+---', '---|', '|   |', '+===', 
    '[R1]', '[R2]', '[RL]', '[R3]', '[R', 
    '(V1)', '(Vs)', '(Is)', '(V', '(I', 
    'GND', '---///', '-> i1', '-> i2', '-> i',
    '[D1]', '[D2]', '[D', 'Node A', 'Node B', 'Node 1',
    '---[', ']---', '===|', '|==='
  ];
  let matches = 0;
  for (const ind of indicators) {
    if (text.includes(ind)) matches++;
  }
  return matches >= 2;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sanitizedContent = cleanLatexToUnicode(content);
  const lines = sanitizedContent.split('\n');
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
        const isCircuit = codeLanguage.toLowerCase().includes('circuit') || isCircuitDiagramText(codeText);

        if (isCircuit) {
          elements.push(
            <CircuitRenderer
              key={`circuit-${currentIndex}`}
              schematic={codeText}
              title="ASCII Circuit Schematic"
            />
          );
        } else {
          elements.push(
            <div key={`code-${currentIndex}`} className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b text-xs font-mono bg-slate-800/90 border-slate-700/60 text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>{codeLanguage.toUpperCase() || 'CODE'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeText, currentIndex)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-200 transition-colors text-xs cursor-pointer min-h-[30px]"
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
              <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed tabular-nums whitespace-pre text-emerald-300">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Sanitize any Markdown heading markers (#, ##, ###) by stripping them
    let effectiveLine = line.trim();
    let isHeadingLike = false;
    if (/^#{1,6}\s+/.test(effectiveLine)) {
      effectiveLine = effectiveLine.replace(/^#{1,6}\s+/, '');
      isHeadingLike = true;
    }

    // Detect standalone bold labels (e.g. "**The 2-Step Recipe:**" or "**QUICK SUMMARY**")
    // and UPPERCASE labels (e.g. "THE 2-STEP RECIPE:" or "QUICK CONCEPTUAL SUMMARY:")
    const isBoldLabel =
      (effectiveLine.startsWith('**') && effectiveLine.endsWith('**')) ||
      (effectiveLine.startsWith('**') && effectiveLine.endsWith('**:')) ||
      (effectiveLine.startsWith('**') && effectiveLine.includes('**:'));

    const lettersOnly = effectiveLine.replace(/[^a-zA-Z]/g, '');
    const isUpperLabel =
      lettersOnly.length >= 3 &&
      lettersOnly === lettersOnly.toUpperCase() &&
      effectiveLine.endsWith(':');

    if (isHeadingLike || (isBoldLabel && effectiveLine.length < 100) || (isUpperLabel && effectiveLine.length < 80)) {
      const isAnalogy = effectiveLine.includes('Analogy') || effectiveLine.includes('Intuition') || effectiveLine.includes('💡');
      const isPitfall = effectiveLine.includes('Pitfall') || effectiveLine.includes('Trap') || effectiveLine.includes('Warning') || effectiveLine.includes('⚠️');
      const isSummary = effectiveLine.includes('Summary') || effectiveLine.includes('🎯');
      const isTranscribed = effectiveLine.includes('Transcribe') || effectiveLine.includes('📝');
      const isSchematic = effectiveLine.includes('Schematic') || effectiveLine.includes('Circuit') || effectiveLine.includes('Diagram');

      elements.push(
        <div key={`section-label-${i}`} className="mt-4 sm:mt-5 mb-2">
          <div className="flex items-center gap-2">
            {isAnalogy && <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />}
            {isPitfall && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
            {isSummary && <Target className="w-4 h-4 text-blue-500 shrink-0" />}
            {isTranscribed && <FileText className="w-4 h-4 text-indigo-500 shrink-0" />}
            {isSchematic && <Zap className="w-4 h-4 text-cyan-500 shrink-0" />}
            {!isAnalogy && !isPitfall && !isSummary && !isTranscribed && !isSchematic && (
              <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">
              {renderInlineFormatting(effectiveLine)}
            </div>
          </div>
        </div>
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletContent = line.trim().substring(2);
      elements.push(
        <li key={`li-${i}`} className="ml-4 sm:ml-5 list-disc text-slate-700 dark:text-slate-300 my-1 leading-relaxed text-sm sm:text-base break-words">
          {renderInlineFormatting(bulletContent)}
        </li>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex gap-2 my-1.5 ml-0.5 sm:ml-1 text-slate-700 dark:text-slate-300 text-sm sm:text-base break-words">
          <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[1.25rem] tabular-nums shrink-0">{numMatch[1]}.</span>
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

    // Matrix Unicode bracket wall blocks
    if (line.includes('⎡') || line.includes('⎣') || line.includes('⎢')) {
      const matrixLines: string[] = [line];
      while (
        i + 1 < lines.length &&
        lines[i + 1].trim() !== '' &&
        !lines[i + 1].startsWith('#') &&
        !lines[i + 1].startsWith('-') &&
        (lines[i + 1].includes('⎡') ||
          lines[i + 1].includes('⎣') ||
          lines[i + 1].includes('⎢') ||
          lines[i + 1].includes('⎦') ||
          lines[i + 1].includes('⎥') ||
          lines[i + 1].includes('×') ||
          lines[i + 1].includes('='))
      ) {
        i++;
        matrixLines.push(lines[i]);
      }
      elements.push(
        <div
          key={`matrix-wall-${i}`}
          className="my-3 overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/90 p-3 sm:p-4 shadow-2xs"
        >
          <pre className="font-mono text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre tabular-nums">
            {matrixLines.join('\n')}
          </pre>
        </div>
      );
      continue;
    }

    // HTML <pre> tag blocks in AI responses (e.g. <pre>...</pre> or <pre class="circuit">)
    if (line.includes('<pre') || line.trim().startsWith('<pre')) {
      const preBuffer = [line];
      while (i < lines.length && !lines[i].includes('</pre>')) {
        i++;
        if (i < lines.length) preBuffer.push(lines[i]);
      }
      const fullPre = preBuffer.join('\n');
      const innerText = fullPre
        .replace(/<pre[^>]*>/i, '')
        .replace(/<\/pre>/i, '')
        .replace(/<code[^>]*>/i, '')
        .replace(/<\/code>/i, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

      const isCircuit = fullPre.toLowerCase().includes('circuit') || isCircuitDiagramText(innerText) || isCircuitSchematic(innerText);
      if (isCircuit) {
        elements.push(
          <CircuitRenderer
            key={`pre-circuit-${i}`}
            schematic={innerText}
            title="ASCII Circuit Schematic"
          />
        );
      } else {
        const curIdx = codeBlockIndex++;
        elements.push(
          <div key={`pre-code-${curIdx}`} className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b text-xs font-mono bg-slate-800/90 border-slate-700/60 text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>CODE</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(innerText, curIdx)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-200 transition-colors text-xs cursor-pointer min-h-[30px]"
                title="Copy code"
              >
                {copiedIndex === curIdx ? (
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
            <pre className="p-3 sm:p-4 text-xs sm:text-sm font-mono overflow-x-auto text-slate-200 whitespace-pre">
              {innerText}
            </pre>
          </div>
        );
      }
      continue;
    }

    // Standalone ASCII circuit schematics not in backticks (e.g. lines with +--- or |   |)
    if (isCircuitDiagramText(line) || isCircuitSchematic(line) || (line.includes('+---') && (line.includes('[R') || line.includes('(V') || line.includes('|')))) {
      const circuitLines: string[] = [line];
      while (
        i + 1 < lines.length &&
        lines[i + 1].trim() !== '' &&
        !lines[i + 1].startsWith('**') &&
        !lines[i + 1].startsWith('#') &&
        (lines[i + 1].includes('+') ||
          lines[i + 1].includes('|') ||
          lines[i + 1].includes('-') ||
          lines[i + 1].includes('[') ||
          lines[i + 1].includes('(') ||
          lines[i + 1].includes('GND'))
      ) {
        i++;
        circuitLines.push(lines[i]);
      }

      elements.push(
        <CircuitRenderer
          key={`ascii-circuit-${i}`}
          schematic={circuitLines.join('\n')}
          title="ASCII Circuit Schematic"
        />
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base my-1.5 break-words">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  // Handle active streaming where a code block or circuit block is currently being written
  if (inCodeBlock && codeBuffer.length > 0) {
    const codeText = codeBuffer.join('\n');
    const isCircuit = codeLanguage.toLowerCase().includes('circuit') || isCircuitDiagramText(codeText);

    if (isCircuit) {
      elements.push(
        <CircuitRenderer
          key="streaming-circuit"
          schematic={codeText}
          title="ASCII Circuit Schematic"
        />
      );
    } else {
      elements.push(
        <div key="streaming-code" className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b text-xs font-mono bg-slate-800/90 border-slate-700/60 text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>{codeLanguage.toUpperCase() || 'CODE'}</span>
            </span>
          </div>
          <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed tabular-nums whitespace-pre text-emerald-300">
            <code>{codeText}</code>
          </pre>
        </div>
      );
    }
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
      parts.push(<span key={`txt-${lastIdx}`}>{text.substring(lastIdx, match.index)}</span>);
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
    parts.push(<span key={`txt-${lastIdx}`}>{text.substring(lastIdx)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

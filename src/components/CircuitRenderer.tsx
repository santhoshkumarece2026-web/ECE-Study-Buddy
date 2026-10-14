import React, { useState, useMemo } from 'react';
import { Cpu, Copy, Check, ZoomIn, ZoomOut, Maximize2, Minimize2, Layers, Sun, Moon, Terminal, Zap } from 'lucide-react';

export interface CircuitRendererProps {
  /**
   * Complete text or AI response to scan and render.
   * Detects <pre> blocks, markdown code blocks, or raw ASCII schematics.
   */
  content?: string;
  /**
   * Directly render a single schematic string block.
   */
  schematic?: string;
  /**
   * Optional custom title for the schematic card.
   */
  title?: string;
  /**
   * Optional custom wrapper class name.
   */
  className?: string;
  /**
   * Optional children representing pre content or schematic code.
   */
  children?: React.ReactNode;
}

export type CircuitTheme = 'auto' | 'blueprint' | 'paper' | 'phosphor' | 'amber';
export type CircuitZoom = 75 | 90 | 100 | 110 | 125 | 140 | 160;

/**
 * Indicators used to detect if a block of pre-formatted text or code is an ASCII circuit schematic.
 */
const CIRCUIT_INDICATORS = [
  '+---', '---|', '|   |', '+===', '===+',
  '[R1]', '[R2]', '[RL]', '[R3]', '[R',
  '(V1)', '(Vs)', '(Is)', '(V', '(I',
  'GND', '---///', '-> i1', '-> i2', '-> i',
  '[D1]', '[D2]', '[D', 'Node A', 'Node B', 'Node 1',
  '---[', ']---', '===|', '|===', '_|_', '⏚'
];

/**
 * Helper to determine if a string contains an ASCII circuit diagram
 */
export function isCircuitSchematic(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  let matches = 0;
  for (const ind of CIRCUIT_INDICATORS) {
    if (text.includes(ind)) matches++;
  }
  // If it has multiple circuit component or wire markers, or wire pattern with components
  const hasWireGrid = (text.includes('+---') || text.includes('---|')) && (text.includes('|') || text.includes('-'));
  return matches >= 2 || (hasWireGrid && matches >= 1);
}

interface ParsedBlock {
  type: 'circuit' | 'code' | 'text';
  content: string;
  language?: string;
}

/**
 * Parses an AI response text to extract <pre> tags, fenced blocks, and ASCII schematics
 */
export function parseAIResponseForCircuits(input: string): ParsedBlock[] {
  if (!input) return [];

  const blocks: ParsedBlock[] = [];

  // 1. First, check for HTML <pre> tags (e.g. <pre class="circuit">...</pre> or <pre><code>...</code></pre>)
  const preTagRegex = /<pre(?:[^>]*)>([\s\S]*?)<\/pre>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const rawChunks: { type: 'pre' | 'raw'; text: string; language?: string }[] = [];

  while ((match = preTagRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      rawChunks.push({
        type: 'raw',
        text: input.substring(lastIndex, match.index),
      });
    }

    // Strip inner <code> tags if present inside <pre>
    let innerContent = match[1];
    let lang = 'code';
    const codeTagMatch = /<code(?: class="([^"]*)")?>([\s\S]*?)<\/code>/i.exec(innerContent);
    if (codeTagMatch) {
      lang = codeTagMatch[1] || 'code';
      innerContent = codeTagMatch[2];
    }

    rawChunks.push({
      type: 'pre',
      text: innerContent,
      language: lang,
    });

    lastIndex = preTagRegex.lastIndex;
  }

  if (lastIndex < input.length) {
    rawChunks.push({
      type: 'raw',
      text: input.substring(lastIndex),
    });
  }

  // 2. For each chunk, process markdown code fences and circuit lines
  for (const chunk of rawChunks) {
    if (chunk.type === 'pre') {
      const isCircuit = chunk.language?.includes('circuit') || isCircuitSchematic(chunk.text);
      blocks.push({
        type: isCircuit ? 'circuit' : 'code',
        content: chunk.text,
        language: chunk.language,
      });
    } else {
      // Process raw text: check for markdown code fences ```
      const lines = chunk.text.split('\n');
      let textBuffer: string[] = [];
      let inFence = false;
      let fenceLang = '';
      let fenceBuffer: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith('```')) {
          if (!inFence) {
            // Flush text buffer
            if (textBuffer.length > 0) {
              blocks.push({ type: 'text', content: textBuffer.join('\n') });
              textBuffer = [];
            }
            inFence = true;
            fenceLang = line.trim().replace('```', '') || 'text';
            fenceBuffer = [];
          } else {
            inFence = false;
            const codeContent = fenceBuffer.join('\n');
            const isCircuit = fenceLang.toLowerCase().includes('circuit') || isCircuitSchematic(codeContent);
            blocks.push({
              type: isCircuit ? 'circuit' : 'code',
              content: codeContent,
              language: fenceLang,
            });
            fenceBuffer = [];
          }
          continue;
        }

        if (inFence) {
          fenceBuffer.push(line);
          continue;
        }

        // Check for standalone unfenced ASCII circuit block
        if (isCircuitSchematic(line) || (line.includes('+---') && (line.includes('[R') || line.includes('(V') || line.includes('|')))) {
          // Flush text buffer
          if (textBuffer.length > 0) {
            blocks.push({ type: 'text', content: textBuffer.join('\n') });
            textBuffer = [];
          }

          const circuitLines = [line];
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

          blocks.push({
            type: 'circuit',
            content: circuitLines.join('\n'),
          });
          continue;
        }

        textBuffer.push(line);
      }

      // Flush remaining buffers
      if (inFence && fenceBuffer.length > 0) {
        const codeContent = fenceBuffer.join('\n');
        const isCircuit = fenceLang.toLowerCase().includes('circuit') || isCircuitSchematic(codeContent);
        blocks.push({
          type: isCircuit ? 'circuit' : 'code',
          content: codeContent,
          language: fenceLang,
        });
      } else if (textBuffer.length > 0) {
        blocks.push({ type: 'text', content: textBuffer.join('\n') });
      }
    }
  }

  return blocks;
}

/**
 * Dedicated UI Component for Rendering ASCII Circuit Schematics
 * Ensures strict monospaced alignment, high-contrast themes (Light/Dark/Blueprint/Terminal),
 * zoom controls, component detection chips, and full-screen inspection.
 */
export const CircuitSchematicCard: React.FC<{
  schematic: string;
  title?: string;
  className?: string;
}> = ({ schematic, title = 'ASCII Circuit Schematic', className = '' }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [theme, setTheme] = useState<CircuitTheme>('auto');
  const [zoom, setZoom] = useState<CircuitZoom>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Clean lines: strip enclosing markdown fences if passed raw
  const cleanSchematic = useMemo(() => {
    let text = (schematic || '').trim();
    if (text.startsWith('```')) {
      const firstNewline = text.indexOf('\n');
      if (firstNewline !== -1) {
        text = text.substring(firstNewline + 1);
      }
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3).trimEnd();
    }
    // Also decode common HTML entities if coming from <pre> tags
    text = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return text;
  }, [schematic]);

  // Detected circuit components for quick-reference inspector chips
  const detectedComponents = useMemo(() => {
    const list: { label: string; count: number; type: 'resistor' | 'source' | 'diode' | 'gnd' | 'node' }[] = [];

    // Resistors
    const resistors = Array.from(cleanSchematic.matchAll(/\[R[0-9a-zA-Z_]*\]/g)).map((m) => m[0]);
    if (resistors.length > 0) {
      const unique = Array.from(new Set(resistors));
      list.push({ label: unique.join(', '), count: resistors.length, type: 'resistor' });
    }

    // Sources (Voltage or Current)
    const sources = Array.from(cleanSchematic.matchAll(/\((?:V|I)[0-9a-zA-Z_]*\)/g)).map((m) => m[0]);
    if (sources.length > 0) {
      const unique = Array.from(new Set(sources));
      list.push({ label: unique.join(', '), count: sources.length, type: 'source' });
    }

    // Diodes / Rectifiers
    const diodes = Array.from(cleanSchematic.matchAll(/\[D[0-9a-zA-Z_]*\]/g)).map((m) => m[0]);
    if (diodes.length > 0) {
      const unique = Array.from(new Set(diodes));
      list.push({ label: unique.join(', '), count: diodes.length, type: 'diode' });
    }

    // Ground
    if (/GND|_\|_|⏚/i.test(cleanSchematic)) {
      list.push({ label: 'GND (0V Ref)', count: 1, type: 'gnd' });
    }

    // Nodes
    const nodes = Array.from(cleanSchematic.matchAll(/Node\s+[A-Za-z0-9]/gi)).map((m) => m[0]);
    if (nodes.length > 0) {
      list.push({ label: Array.from(new Set(nodes)).join(', '), count: nodes.length, type: 'node' });
    }

    return list.slice(0, 5);
  }, [cleanSchematic]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanSchematic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => {
    const levels: CircuitZoom[] = [75, 90, 100, 110, 125, 140, 160];
    const curIdx = levels.indexOf(zoom);
    if (curIdx < levels.length - 1) {
      setZoom(levels[curIdx + 1]);
    }
  };

  const handleZoomOut = () => {
    const levels: CircuitZoom[] = [75, 90, 100, 110, 125, 140, 160];
    const curIdx = levels.indexOf(zoom);
    if (curIdx > 0) {
      setZoom(levels[curIdx - 1]);
    }
  };

  // High-contrast styling maps for light and dark modes
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'paper':
        // High-Contrast Technical Paper (crisp dark ink on pure bright paper)
        return {
          wrapper: 'bg-white border-slate-300 shadow-md text-slate-900',
          header: 'bg-slate-100 border-b border-slate-200 text-slate-800',
          pre: 'text-slate-950 selection:bg-blue-100',
          accent: 'text-blue-700',
          badge: 'bg-slate-200 text-slate-800 border-slate-300',
          wireColor: 'text-slate-900',
        };
      case 'blueprint':
        // CAD Blueprint (deep navy with luminous cyan and white lines)
        return {
          wrapper: 'bg-slate-950 border-cyan-500/50 shadow-lg shadow-cyan-950/20 text-cyan-50',
          header: 'bg-slate-900 border-b border-cyan-500/30 text-cyan-200',
          pre: 'text-cyan-100 selection:bg-cyan-900/60',
          accent: 'text-cyan-400',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
          wireColor: 'text-cyan-100',
        };
      case 'phosphor':
        // High-Contrast Terminal Phosphor (pitch black with vivid CRT green)
        return {
          wrapper: 'bg-black border-emerald-500/60 shadow-lg shadow-emerald-950/30 text-emerald-100',
          header: 'bg-zinc-950 border-b border-emerald-500/40 text-emerald-400',
          pre: 'text-emerald-300 selection:bg-emerald-950',
          accent: 'text-emerald-400',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          wireColor: 'text-emerald-300',
        };
      case 'amber':
        // High-Contrast Amber CRT (pitch black with warm luminous amber)
        return {
          wrapper: 'bg-black border-amber-500/60 shadow-lg shadow-amber-950/30 text-amber-100',
          header: 'bg-zinc-950 border-b border-amber-500/40 text-amber-400',
          pre: 'text-amber-300 selection:bg-amber-950',
          accent: 'text-amber-400',
          badge: 'bg-amber-950 text-amber-300 border-amber-800',
          wireColor: 'text-amber-300',
        };
      case 'auto':
      default:
        // High-Contrast Adaptive: Light mode = Crisp Paper / Dark mode = Deep CAD Blueprint
        return {
          wrapper:
            'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-cyan-500/40 shadow-md dark:shadow-cyan-950/20 text-slate-900 dark:text-cyan-100',
          header:
            'bg-slate-200/90 dark:bg-slate-900/90 border-b border-slate-300 dark:border-cyan-500/30 text-slate-800 dark:text-cyan-300',
          pre: 'text-slate-950 dark:text-cyan-100 selection:bg-blue-200 dark:selection:bg-cyan-900/60',
          accent: 'text-blue-700 dark:text-cyan-400',
          badge:
            'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-cyan-300 border-slate-300 dark:border-cyan-800/80',
          wireColor: 'text-slate-950 dark:text-cyan-100',
        };
    }
  }, [theme]);

  // Monospaced font configuration ensuring zero horizontal drift & disabled ligatures
  const monospaceStyles: React.CSSProperties = {
    fontFamily:
      'ui-monospace, "JetBrains Mono", "Cascadia Code", "Fira Code", Menlo, Monaco, Consolas, "Courier New", monospace',
    fontVariantLigatures: 'none',
    fontFeatureSettings: '"liga" 0, "calt" 0',
    WebkitFontFeatureSettings: '"liga" 0, "calt" 0',
    letterSpacing: '0px',
    wordSpacing: '0px',
    lineHeight: 1.35,
    tabSize: 4,
    whiteSpace: 'pre',
    fontSize: `${zoom}%`,
  };

  return (
    <>
      <div
        className={`my-4 rounded-xl border overflow-hidden transition-all duration-150 ${themeStyles.wrapper} ${className}`}
      >
        {/* Schematic Header Bar */}
        <div className={`px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 ${themeStyles.header}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1 rounded-md bg-cyan-500/10 dark:bg-cyan-500/20 ${themeStyles.accent}`}>
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wide uppercase">
                  {title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-black/5 dark:bg-white/5 opacity-80">
                  MONOSPACE GRID
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Theme Selector, Zoom, Fullscreen, Copy */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Dropdown / Buttons */}
            <div className="flex items-center rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setTheme('auto')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  theme === 'auto'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Adaptive Auto (Sync with Light/Dark App theme)"
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setTheme('paper')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  theme === 'paper'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="High-Contrast Paper (Light)"
              >
                Paper
              </button>
              <button
                type="button"
                onClick={() => setTheme('blueprint')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  theme === 'blueprint'
                    ? 'bg-cyan-700 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="CAD Blueprint (Dark)"
              >
                Blueprint
              </button>
              <button
                type="button"
                onClick={() => setTheme('phosphor')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors hidden sm:inline ${
                  theme === 'phosphor'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Phosphor CRT Terminal (Green)"
              >
                CRT
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 p-0.5 text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 75}
                className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Reset Zoom to 100%"
              >
                {zoom}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 160}
                className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fullscreen Expand */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
              title="Expand Schematic"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[28px]"
              title="Copy schematic to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Detected Circuit Components Inspector Chips */}
        {detectedComponents.length > 0 && (
          <div className="px-3 sm:px-4 py-1.5 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider mr-1">
              Detected Elements:
            </span>
            {detectedComponents.map((comp, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] border font-medium ${themeStyles.badge}`}
              >
                {comp.type === 'resistor' && '⚡ Resistor: '}
                {comp.type === 'source' && '🔋 Source: '}
                {comp.type === 'diode' && '🔺 Diode: '}
                {comp.label}
              </span>
            ))}
          </div>
        )}

        {/* The Monospaced Schematic Display */}
        <div className="p-3 sm:p-5 overflow-x-auto select-text scrollbar-thin">
          <pre
            className={`font-mono text-xs sm:text-sm tracking-normal ${themeStyles.pre}`}
            style={monospaceStyles}
          >
            {cleanSchematic}
          </pre>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className={`w-full max-w-5xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${themeStyles.wrapper}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 flex items-center justify-between border-b ${themeStyles.header}`}>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm sm:text-base">{title} (Expanded View)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-auto flex-1 bg-black/10">
              <pre
                className={`font-mono text-sm sm:text-base tracking-normal ${themeStyles.pre}`}
                style={{ ...monospaceStyles, fontSize: '115%' }}
              >
                {cleanSchematic}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Main CircuitRenderer Component
 * Detects ASCII schematic blocks in AI responses (using <pre> tags or raw text)
 * and renders them with monospaced font alignment and high-contrast styling for both light and dark modes.
 */
export const CircuitRenderer: React.FC<CircuitRendererProps> = ({
  content,
  schematic,
  title,
  className = '',
  children,
}) => {
  // Case 1: Directly provided a schematic string or child string
  const directSchematic = schematic || (typeof children === 'string' ? children : undefined);
  if (directSchematic) {
    return <CircuitSchematicCard schematic={directSchematic} title={title} className={className} />;
  }

  // Case 2: Scan complete content string for <pre> tags and schematic blocks
  const targetText = content || '';
  if (!targetText) {
    return null;
  }

  const parsedBlocks = parseAIResponseForCircuits(targetText);

  return (
    <div className={`circuit-rendered-response space-y-2 ${className}`}>
      {parsedBlocks.map((block, index) => {
        if (block.type === 'circuit') {
          return (
            <CircuitSchematicCard
              key={`circuit-block-${index}`}
              schematic={block.content}
              title={title || 'ASCII Circuit Schematic'}
            />
          );
        }

        if (block.type === 'code') {
          return (
            <div
              key={`code-block-${index}`}
              className="my-3 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-100 overflow-hidden shadow-xs"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-xs font-mono text-slate-300 border-b border-slate-700">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>{block.language?.toUpperCase() || 'CODE'}</span>
                </span>
              </div>
              <pre className="p-3 text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre">
                {block.content}
              </pre>
            </div>
          );
        }

        // Standard text paragraph
        return (
          <div key={`text-block-${index}`} className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
            {block.content.split('\n').map((line, lIdx) => (
              <p key={lIdx} className="my-1 break-words">
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default CircuitRenderer;

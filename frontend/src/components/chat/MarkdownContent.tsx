import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  // Helper to parse inline bold and code
  const renderInline = (text: string) => {
    // Replace inline code and bold
    const parts: (string | React.ReactNode)[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Pattern for `code` and **bold**
    const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={`code-${keyIdx++}`} className="bg-black/50 text-cyan-400 px-1.5 py-0.5 rounded text-[11px] font-mono border border-cyan-900/40">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-semibold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split lines and group blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];
  let inTable = false;
  let blockKey = 0;

  const flushTable = () => {
    if (tableRows.length >= 2) {
      const headerLine = tableRows[0];
      const dataLines = tableRows.slice(2); // Skip separator row

      const parseCells = (row: string) =>
        row
          .split('|')
          .map(c => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      const headers = parseCells(headerLine);

      elements.push(
        <div key={`table-${blockKey++}`} className="my-2.5 overflow-x-auto rounded-lg border border-slate-700/80 bg-slate-950/60 shadow-inner">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-semibold">
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 font-mono uppercase tracking-wider text-[10px]">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {dataLines.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                  {parseCells(row).map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 font-sans">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check table row
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!line) {
      elements.push(<div key={`spacer-${blockKey++}`} className="h-1.5" />);
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${blockKey++}`} className="text-sm font-bold text-cyan-400 mt-2 mb-1 flex items-center gap-1.5">
          {renderInline(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${blockKey++}`} className="text-xs font-semibold text-slate-200 mt-2 mb-1">
          {renderInline(line.substring(5))}
        </h4>
      );
    } else if (line.startsWith('---')) {
      elements.push(<hr key={`hr-${blockKey++}`} className="border-slate-800 my-2" />);
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${blockKey++}`} className="border-l-2 border-cyan-500/70 bg-cyan-950/20 pl-2.5 py-1 my-1.5 text-xs text-cyan-200/90 rounded-r">
          {renderInline(line.substring(2))}
        </blockquote>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={`li-${blockKey++}`} className="flex items-start gap-1.5 text-xs text-slate-300 ml-1 my-0.5">
          <span className="text-cyan-400 font-bold mt-0.5">•</span>
          <span>{renderInline(line.substring(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const numMatch = line.match(/^(\d+)\.\s(.*)/);
      elements.push(
        <div key={`num-${blockKey++}`} className="flex items-start gap-1.5 text-xs text-slate-300 ml-1 my-0.5">
          <span className="text-cyan-400 font-mono text-[11px] font-bold shrink-0">{numMatch ? `${numMatch[1]}.` : '•'}</span>
          <span>{renderInline(numMatch ? numMatch[2] : line)}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={`p-${blockKey++}`} className="text-xs text-slate-300 leading-relaxed my-0.5">
          {renderInline(line)}
        </p>
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
};

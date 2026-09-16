import { useMemo } from 'react';
import katex from 'katex';

interface Props {
  children: string;
  className?: string;
  /** Larger rendering for question stems */
  block?: boolean;
}

type Segment = { type: 'text' | 'inline' | 'display'; value: string };

/**
 * Tokenize a string into text / inline-math / display-math segments.
 * Supports $...$, $$...$$, \(...\) and \[...\] delimiters.
 */
function tokenize(input: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  const push = (type: Segment['type'], value: string) => {
    if (value) segments.push({ type, value });
  };
  let textBuf = '';

  while (i < input.length) {
    const two = input.slice(i, i + 2);

    if (two === '$$') {
      const end = input.indexOf('$$', i + 2);
      if (end !== -1) {
        push('text', textBuf);
        textBuf = '';
        push('display', input.slice(i + 2, end));
        i = end + 2;
        continue;
      }
    }
    if (two === '\\[') {
      const end = input.indexOf('\\]', i + 2);
      if (end !== -1) {
        push('text', textBuf);
        textBuf = '';
        push('display', input.slice(i + 2, end));
        i = end + 2;
        continue;
      }
    }
    if (two === '\\(') {
      const end = input.indexOf('\\)', i + 2);
      if (end !== -1) {
        push('text', textBuf);
        textBuf = '';
        push('inline', input.slice(i + 2, end));
        i = end + 2;
        continue;
      }
    }
    if (input[i] === '$') {
      const end = input.indexOf('$', i + 1);
      if (end !== -1) {
        push('text', textBuf);
        textBuf = '';
        push('inline', input.slice(i + 1, end));
        i = end + 1;
        continue;
      }
    }

    textBuf += input[i];
    i += 1;
  }
  push('text', textBuf);
  return segments;
}

function renderKatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return tex;
  }
}

/**
 * Renders a mix of plain text and LaTeX math using KaTeX.
 * Bundled KaTeX CSS keeps math available offline.
 */
export default function MathText({ children, className = '', block = false }: Props) {
  const segments = useMemo(() => tokenize(children), [children]);

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          // Preserve newlines as line breaks
          const parts = seg.value.split('\n');
          return (
            <span key={idx}>
              {parts.map((p, j) => (
                <span key={j}>
                  {p}
                  {j < parts.length - 1 && <br />}
                </span>
              ))}
            </span>
          );
        }
        const isDisplay = seg.type === 'display';
        return (
          <span
            key={idx}
            className={isDisplay ? 'block my-2 overflow-x-auto' : ''}
            style={block && !isDisplay ? { fontSize: '1.05em' } : undefined}
            dangerouslySetInnerHTML={{ __html: renderKatex(seg.value, isDisplay) }}
          />
        );
      })}
    </span>
  );
}

import React from 'react';

/**
 * CodeBlock — resaltado de sintaxis minimalista para los extractos de `cat`.
 * Tokenizador por línea con regex; sin dependencias externas.
 */

const C = {
  keyword: '#cba6f7', // mauve
  string: '#a6e3a1', // green
  comment: '#6c7086', // faint
  number: '#fab387', // peach
  fn: '#89b4fa', // blue
  text: '#cdd6f4',
  border: '#313244',
};

const KEYWORDS = new Set([
  'def', 'async', 'await', 'return', 'yield', 'if', 'else', 'elif', 'for', 'while',
  'import', 'from', 'class', 'break', 'continue', 'in', 'not', 'and', 'or', 'None', 'True', 'False',
  'const', 'let', 'var', 'function', 'export', 'new', 'typeof', 'interface', 'type', 'extends',
]);

// Orden importa: comentario y string se detectan antes que el resto
const TOKEN_RE = /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+|.)/gm;

function highlightLine(line: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let key = 0;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(line)) !== null) {
    const [tok, comment, str, num, word] = match;
    let color = C.text;
    if (comment) color = C.comment;
    else if (str) color = C.string;
    else if (num) color = C.number;
    else if (word && KEYWORDS.has(word)) color = C.keyword;
    else if (word && line[TOKEN_RE.lastIndex] === '(') color = C.fn;
    nodes.push(
      <span key={key++} style={{ color, fontStyle: comment ? 'italic' : undefined }}>
        {tok}
      </span>,
    );
    if (tok.length === 0) break; // seguridad ante regex vacía
  }
  return nodes;
}

export const CodeBlock: React.FC<{ lines: string[] }> = ({ lines }) => (
  <pre
    className="my-2 p-3 rounded overflow-x-auto text-[12px] leading-relaxed"
    style={{ backgroundColor: '#181825', border: `1px solid ${C.border}` }}
  >
    {lines.map((line, i) => (
      <div key={i} className="whitespace-pre">
        <span className="select-none mr-3 inline-block w-5 text-right" style={{ color: C.comment }}>
          {i + 1}
        </span>
        {highlightLine(line)}
      </div>
    ))}
  </pre>
);

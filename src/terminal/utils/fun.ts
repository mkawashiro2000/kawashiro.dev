/**
 * fun.ts — cowsay, fortune y utilidades lúdicas de la Terminal UI.
 */

const FORTUNES = [
  'There are only two hard things in CS: cache invalidation, naming things, and off-by-one errors.',
  'It works on my Raspberry Pi. — every line of this website',
  'A SQL query walks into a bar, approaches two tables and asks: "Can I JOIN you?"',
  'In theory, theory and practice are the same. In practice, they are not.',
  '99 little bugs in the code, 99 little bugs... take one down, patch it around, 127 little bugs in the code.',
  'Weeks of coding can save you hours of planning.',
  'A good backup is the one you tested. A great backup is the one you never needed.',
  'Real programmers count from 0.',
  'The cloud is just someone else\'s computer. This site is literally my computer. 🍓',
  'DNS: it\'s always DNS. Even when it\'s not, it\'s DNS.',
  'Data is the new oil, but most of it is still crude.',
  'rm -rf /problems  # if only',
];

export function fortune(): string {
  return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
}

/** Genera la vaca ASCII clásica con el mensaje en su globo. */
export function cowsay(message: string): string[] {
  const text = message.trim() || 'moo';
  // Partir en líneas de máx 38 columnas
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > 38) {
      lines.push(current.trim());
      current = w;
    } else {
      current = `${current} ${w}`.trim();
    }
  }
  if (current) lines.push(current.trim());

  const width = Math.max(...lines.map((l) => l.length));
  const pad = (l: string) => l.padEnd(width);
  const bubble: string[] = [` ${'_'.repeat(width + 2)}`];
  if (lines.length === 1) {
    bubble.push(`< ${pad(lines[0])} >`);
  } else {
    lines.forEach((l, i) => {
      const [open, close] =
        i === 0 ? ['/', '\\'] : i === lines.length - 1 ? ['\\', '/'] : ['|', '|'];
      bubble.push(`${open} ${pad(l)} ${close}`);
    });
  }
  bubble.push(` ${'-'.repeat(width + 2)}`);

  return [
    ...bubble,
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ];
}

// Parses the repo CSV question banks into src/data/questions.generated.ts
// Run from mobile-app/:  node scripts/build-questions.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

const SOURCES = [
  path.join(REPO_ROOT, 'PYP qns CA(Sheet1) (3).csv'),
  path.join(REPO_ROOT, 'question-bank/Transient/transient.csv'),
];

/** Minimal RFC-4180 CSV parser (handles quotes, escaped quotes, newlines in fields). */
function parseCsv(text) {
  // strip BOM
  text = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // ignore, handle on \n
    } else if (c === '\n') {
      row.push(field);
      field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some((f) => f.trim() !== '')) rows.push(row);
  }
  return rows;
}

const all = [];
for (const src of SOURCES) {
  if (!fs.existsSync(src)) {
    console.warn('missing source', src);
    continue;
  }
  const rows = parseCsv(fs.readFileSync(src, 'utf8'));
  const header = rows[0].map((h) => h.trim());
  const idx = (name) => header.indexOf(name);
  for (const r of rows.slice(1)) {
    const get = (name) => {
      const j = idx(name);
      return j >= 0 ? (r[j] ?? '').trim() : '';
    };
    const id = get('id');
    if (!id) continue;
    let image = get('image') || undefined;
    // Fix broken raw paths: files live under /main/question-bank/Transient/...
    if (image) {
      image = image.replace(
        /\/main\/Transient\//,
        '/main/question-bank/Transient/'
      );
    }
    all.push({
      id,
      topicId: Number(get('topicid')),
      question: get('question'),
      optionA: get('optionA'),
      optionB: get('optionB'),
      optionC: get('optionC'),
      optionD: get('optionD'),
      answer: get('answer'),
      image,
      explanation: get('explanation'),
      difficulty: Number(get('difficulty')) || 1,
      walkthroughTag: get('walkthrough_tag') || undefined,
    });
  }
}

const banner = `// AUTO-GENERATED from repo CSV question banks by scripts/build-questions.mjs.
// Do not edit by hand — re-run the script to regenerate.
import type { Question, OptionKey } from '../types';

export const QUESTIONS: Question[] = ${JSON.stringify(all, null, 2)} as unknown as Question[];

export function questionsForTopic(topicId: number): Question[] {
  return QUESTIONS.filter((q) => q.topicId === topicId);
}

export const OPTION_KEYS: OptionKey[] = ['optionA', 'optionB', 'optionC', 'optionD'];
`;

const outDir = path.join(__dirname, '../src/data');
fs.writeFileSync(path.join(outDir, 'questions.generated.ts'), banner);
console.log(`Wrote ${all.length} questions to src/data/questions.generated.ts`);
const byTopic = all.reduce((m, q) => ((m[q.topicId] = (m[q.topicId] || 0) + 1), m), {});
console.log('By topic:', byTopic);

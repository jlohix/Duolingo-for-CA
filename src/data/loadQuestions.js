import Papa from "papaparse";
import pastYearCsv from "./pastYearPapers.csv?raw";
import { LOCAL_BANK_FOLDERS, QUESTION_BANKS } from "./questionBanks";

const LETTERS = ["a", "b", "c", "d"];

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeImage(url) {
  const src = clean(url);
  if (!src) return "";
  const blob = src.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+?)(?:\?.*)?$/
  );
  if (blob) {
    return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}/${blob[4]}`;
  }
  return src;
}

function parseDifficulty(value) {
  const n = Number(value);
  if (n === 1 || n === 2 || n === 3) return n;
  return 2;
}

/** Split CSV ids like 201-1 into family + numeric step. */
export function parseFamilyStep(rawId) {
  const id = clean(rawId);
  const match = id.match(/^(.*)-(\d+)$/);
  if (!match) {
    return { csvId: id, questionFamilyId: id || "q", stepNumber: 1 };
  }
  return {
    csvId: id,
    questionFamilyId: match[1],
    stepNumber: Number(match[2]),
  };
}

function compareFamilyIds(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

export function isAnswerCorrect(question, choice) {
  const letter = clean(choice).toLowerCase();
  const answer = question.answer;
  if (letter === answer) return true;
  const chosen = question.options[letter];
  const correct = question.options[answer];
  return Boolean(chosen && correct && chosen === correct);
}

function parseAnswerLetter(value) {
  const raw = clean(value).toLowerCase();
  if (LETTERS.includes(raw)) return raw;
  const opt = raw.match(/^option\s*([abcd])$/);
  if (opt) return opt[1];
  return "";
}

function cell(row, ...names) {
  for (const name of names) {
    if (row[name] != null && String(row[name]).trim()) return row[name];
    const hit = Object.keys(row).find(
      (key) => key.toLowerCase() === name.toLowerCase()
    );
    if (hit && String(row[hit]).trim()) return row[hit];
  }
  return "";
}

function paperFromImage(url) {
  const file = String(url).split("/").pop() || "";
  const match = file.match(/^(\d{2})(\d{2})(s[12])?/i);
  if (!match) return "";
  const sem = match[3] ? ` ${match[3].toUpperCase()}` : "";
  return `PYP · AY ${match[1]}/${match[2]}${sem}`;
}

function dressLatex(text) {
  const raw = clean(text);
  if (!raw) return raw;
  if (/\$|\\\(|\\\[/.test(raw)) return raw;
  if (/\\frac|\\mathrm|\\text|\\left|\\right/.test(raw)) return `$${raw}$`;
  return raw;
}

function parseQuestionRows(text, { withPaper = false } = {}) {
  const parsed = Papa.parse(String(text ?? "").replace(/^\uFEFF/, ""), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => String(h ?? "").replace(/^\uFEFF/, "").trim(),
  });

  const questions = [];
  for (const row of parsed.data) {
    const question = dressLatex(cell(row, "question"));
    const answer = parseAnswerLetter(cell(row, "answer"));
    if (!question || !LETTERS.includes(answer)) continue;

    const options = {
      a: dressLatex(cell(row, "optionA")),
      b: dressLatex(cell(row, "optionB")),
      c: dressLatex(cell(row, "optionC")),
      d: dressLatex(cell(row, "optionD")),
    };
    if (!options[answer]) continue;

    const image = normalizeImage(cell(row, "image"));
    const topicRaw = cell(row, "topicId", "topicid");
    const rawId =
      clean(cell(row, "id")) || `${topicRaw || "p"}-${questions.length}`;
    const { csvId, questionFamilyId, stepNumber } = parseFamilyStep(rawId);
    const item = {
      id: csvId,
      csvId,
      questionFamilyId,
      stepNumber,
      topicId: Number(topicRaw) || 0,
      question,
      options,
      answer,
      image,
      explanation: dressLatex(cell(row, "explanation")),
      difficulty: parseDifficulty(cell(row, "difficulty")),
    };
    if (withPaper) {
      item.paper =
        clean(cell(row, "paper", "year")) ||
        paperFromImage(image) ||
        "Past papers";
    }
    questions.push(item);
  }
  return questions;
}

function localBankImage(image, bank) {
  const src = clean(image);
  if (!src) return "";
  const file = src.split("?")[0].split("/").pop();
  return file ? `/question-bank/${bank.assetFolder}/${file}` : "";
}

function resolveBankImage(image, bank) {
  const remote = normalizeImage(image);
  if (LOCAL_BANK_FOLDERS.has(bank.assetFolder)) {
    return localBankImage(remote, bank) || remote;
  }
  return remote;
}

async function loadQuestionBank(bank) {
  const res = await fetch(`/question-bank/csv/${bank.csv}`);
  if (!res.ok) throw new Error(`Could not load ${bank.csv}`);
  const rows = parseQuestionRows(await res.text());
  return rows.map((question) => ({
    ...question,
    id: `${bank.id}-${question.csvId}`,
    bankId: bank.id,
    topicId: bank.topicId,
    image: resolveBankImage(question.image, bank),
  }));
}

export async function loadQuestions() {
  const res = await fetch("/QuestionBank.csv");
  if (!res.ok) {
    throw new Error("Could not load QuestionBank.csv");
  }
  const text = await res.text();
  const banks = await Promise.all(QUESTION_BANKS.map(loadQuestionBank));
  return [...parseQuestionRows(text), ...banks.flat()];
}

export const PAST_YEAR_QUESTIONS = parseQuestionRows(pastYearCsv, {
  withPaper: true,
});

export function loadPastYearQuestions() {
  return Promise.resolve(PAST_YEAR_QUESTIONS);
}

export function groupPastPapers(questions) {
  const map = new Map();
  for (const q of questions) {
    const title = q.paper || "Past papers";
    if (!map.has(title)) map.set(title, []);
    map.get(title).push(q);
  }
  return [...map.entries()].map(([title, list]) => {
    const key = paperKey(title);
    return {
      id: key,
      key,
      title,
      questions: list,
    };
  });
}

function paperKey(title) {
  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `paper-${slug || "set"}`;
}

export function shuffle(list) {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function questionsForLesson(all, topicId, difficulty) {
  return shuffle(
    all.filter(
      (q) =>
        !q.bankId &&
        q.topicId === topicId &&
        q.difficulty === difficulty
    )
  );
}

/**
 * Bank lessons: group CSV rows by questionFamilyId, sort steps numerically,
 * keep families in numeric order. Flat list of steps for the quiz queue.
 */
export function questionsForBank(all, bankId, difficulty) {
  const rows = all.filter(
    (q) => q.bankId === bankId && q.difficulty === difficulty
  );
  const byFamily = new Map();
  for (const question of rows) {
    const familyId = String(
      question.questionFamilyId || question.csvId || question.id
    );
    if (!byFamily.has(familyId)) byFamily.set(familyId, []);
    byFamily.get(familyId).push(question);
  }

  for (const steps of byFamily.values()) {
    steps.sort(
      (a, b) =>
        (Number(a.stepNumber) || 0) - (Number(b.stepNumber) || 0) ||
        String(a.id).localeCompare(String(b.id))
    );
  }

  const familyIds = [...byFamily.keys()].sort(compareFamilyIds);
  const out = [];
  familyIds.forEach((familyId, familyIndex) => {
    const steps = byFamily.get(familyId);
    steps.forEach((step, stepIndex) => {
      out.push({
        ...step,
        questionFamilyId: familyId,
        familyIndex: familyIndex + 1,
        familyTotal: familyIds.length,
        stepIndex: stepIndex + 1,
        stepCount: steps.length,
        isFamilyFinal: stepIndex === steps.length - 1,
      });
    });
  });
  return out;
}

export function countBankFamilies(all, bankId, difficulty) {
  const seen = new Set();
  for (const question of all) {
    if (question.bankId !== bankId || question.difficulty !== difficulty) {
      continue;
    }
    seen.add(String(question.questionFamilyId || question.id));
  }
  return seen.size;
}

export function questionsForSkip(all, targetTopicId, count = 5) {
  const pool = all.filter((q) => q.topicId < targetTopicId);
  const byTopic = new Map();
  for (const q of shuffle(pool)) {
    if (!byTopic.has(q.topicId)) byTopic.set(q.topicId, []);
    byTopic.get(q.topicId).push(q);
  }
  const picked = [];
  const topics = [...byTopic.keys()];
  while (picked.length < count) {
    let added = false;
    for (const topicId of topics) {
      const list = byTopic.get(topicId);
      if (list.length) {
        picked.push(list.shift());
        added = true;
        if (picked.length >= count) break;
      }
    }
    if (!added) break;
  }
  return picked;
}

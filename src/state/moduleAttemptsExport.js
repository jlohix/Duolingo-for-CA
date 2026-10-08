// ============================================================
// Export module attempt analytics as CSV
// ============================================================
// Fetches every attempt row via the list_module_attempts RPC and turns
// it into CSVs for the two analytics features:
//
//   Feature 1 — Module repeat count
//     * per module (aggregated across difficulties)
//     * per module + difficulty
//     * per student within each module (the COUNT of attempts, not a flag)
//
//   Feature 2 — Module completion count
//     * per module (distinct students who answered every question >= once)
//     * per module + difficulty
//
// The same aggregates are also available directly in the Supabase SQL
// Editor via the views in supabase/module_attempts.sql; this helper is
// for a staff/admin download button in the app.

import { listModuleAttempts } from "../supabaseClient";
import { QUESTION_BANKS } from "../data/questionBanks";

// module_id -> human title (e.g. "supernode" -> "Supernode"). Falls back
// to the raw id for anything not in the registry.
const MODULE_TITLE = new Map(QUESTION_BANKS.map((b) => [b.id, b.title]));

export function moduleTitle(moduleId) {
  return MODULE_TITLE.get(String(moduleId)) || String(moduleId || "");
}

const DIFFICULTY_NAME = { 1: "Easy", 2: "Average", 3: "Challenging" };

function difficultyName(difficulty) {
  return DIFFICULTY_NAME[Number(difficulty)] || String(difficulty ?? "");
}

// RFC-4180 safe field: quote when it contains comma, quote or newline.
function csvField(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(row.map(csvField).join(","));
  }
  return lines.join("\r\n");
}

function normalizeRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((r) => ({
    attemptId: String(r.attemptId || ""),
    email: String(r.email || "").trim().toLowerCase(),
    moduleId: String(r.moduleId || ""),
    difficulty: Math.max(1, Math.min(3, Math.round(Number(r.difficulty) || 1))),
    classId: String(r.classId || ""),
    startedAt: r.startedAt || "",
    completedAt: r.completedAt || null,
    completed: Boolean(r.completed ?? r.completedAt),
    questionCount: Math.max(0, Math.round(Number(r.questionCount) || 0)),
    answeredCount: Math.max(0, Math.round(Number(r.answeredCount) || 0)),
  }));
}

// ---------- Feature 1: repeats per module (across difficulties) ----------
// repeat_attempts = total_attempts - distinct_students (each student's
// first go is not a repeat; every attempt after that is).
export function buildRepeatsByModuleCsv(rows) {
  const norm = normalizeRows(rows);
  const byModule = new Map(); // moduleId -> { attempts, students:Set }
  for (const r of norm) {
    let g = byModule.get(r.moduleId);
    if (!g) {
      g = { attempts: 0, students: new Set() };
      byModule.set(r.moduleId, g);
    }
    g.attempts += 1;
    g.students.add(r.email);
  }
  const out = [...byModule.entries()]
    .map(([moduleId, g]) => {
      const distinct = g.students.size;
      const repeats = Math.max(g.attempts - distinct, 0);
      return {
        moduleId,
        title: moduleTitle(moduleId),
        totalAttempts: g.attempts,
        distinctStudents: distinct,
        repeatAttempts: repeats,
        avgAttemptsPerStudent: distinct
          ? (g.attempts / distinct).toFixed(2)
          : "0.00",
      };
    })
    .sort((a, b) => b.repeatAttempts - a.repeatAttempts || a.title.localeCompare(b.title));

  return toCsv(
    [
      "module_id",
      "module",
      "total_attempts",
      "distinct_students",
      "repeat_attempts",
      "avg_attempts_per_student",
    ],
    out.map((r) => [
      r.moduleId,
      r.title,
      r.totalAttempts,
      r.distinctStudents,
      r.repeatAttempts,
      r.avgAttemptsPerStudent,
    ])
  );
}

// ---------- Feature 1: repeats per module + difficulty ----------
export function buildRepeatsByModuleDifficultyCsv(rows) {
  const norm = normalizeRows(rows);
  const byKey = new Map(); // `${moduleId}|${difficulty}` -> {...}
  for (const r of norm) {
    const key = `${r.moduleId}|${r.difficulty}`;
    let g = byKey.get(key);
    if (!g) {
      g = { moduleId: r.moduleId, difficulty: r.difficulty, attempts: 0, students: new Set() };
      byKey.set(key, g);
    }
    g.attempts += 1;
    g.students.add(r.email);
  }
  const out = [...byKey.values()]
    .map((g) => {
      const distinct = g.students.size;
      return {
        ...g,
        distinct,
        repeats: Math.max(g.attempts - distinct, 0),
        avg: distinct ? (g.attempts / distinct).toFixed(2) : "0.00",
      };
    })
    .sort(
      (a, b) =>
        moduleTitle(a.moduleId).localeCompare(moduleTitle(b.moduleId)) ||
        a.difficulty - b.difficulty
    );

  return toCsv(
    [
      "module_id",
      "module",
      "difficulty",
      "difficulty_name",
      "total_attempts",
      "distinct_students",
      "repeat_attempts",
      "avg_attempts_per_student",
    ],
    out.map((r) => [
      r.moduleId,
      moduleTitle(r.moduleId),
      r.difficulty,
      difficultyName(r.difficulty),
      r.attempts,
      r.distinct,
      r.repeats,
      r.avg,
    ])
  );
}

// ---------- Feature 1: per-student attempt counts within each module ----------
export function buildAttemptsByStudentCsv(rows) {
  const norm = normalizeRows(rows);
  const byKey = new Map(); // `${moduleId}|${email}` -> {...}
  for (const r of norm) {
    const key = `${r.moduleId}|${r.email}`;
    let g = byKey.get(key);
    if (!g) {
      g = {
        moduleId: r.moduleId,
        email: r.email,
        attempts: 0,
        completed: 0,
        first: r.startedAt,
        last: r.startedAt,
      };
      byKey.set(key, g);
    }
    g.attempts += 1;
    if (r.completed) g.completed += 1;
    if (String(r.startedAt) < String(g.first)) g.first = r.startedAt;
    if (String(r.startedAt) > String(g.last)) g.last = r.startedAt;
  }
  const out = [...byKey.values()].sort(
    (a, b) =>
      moduleTitle(a.moduleId).localeCompare(moduleTitle(b.moduleId)) ||
      b.attempts - a.attempts ||
      a.email.localeCompare(b.email)
  );

  return toCsv(
    [
      "module_id",
      "module",
      "email",
      "attempts",
      "repeats",
      "completed_attempts",
      "first_attempt_at",
      "last_attempt_at",
    ],
    out.map((r) => [
      r.moduleId,
      moduleTitle(r.moduleId),
      r.email,
      r.attempts,
      Math.max(r.attempts - 1, 0),
      r.completed,
      r.first,
      r.last,
    ])
  );
}

// ---------- Feature 2: completions per module (across difficulties) ----------
// A student counts as completing the module if they completed it at ANY
// difficulty. students_completed = distinct emails with a completed attempt.
export function buildCompletionsByModuleCsv(rows) {
  const norm = normalizeRows(rows);
  const byModule = new Map(); // moduleId -> { completedStudents:Set, attemptedStudents:Set, completedAttempts }
  for (const r of norm) {
    let g = byModule.get(r.moduleId);
    if (!g) {
      g = { completedStudents: new Set(), attemptedStudents: new Set(), completedAttempts: 0 };
      byModule.set(r.moduleId, g);
    }
    g.attemptedStudents.add(r.email);
    if (r.completed) {
      g.completedStudents.add(r.email);
      g.completedAttempts += 1;
    }
  }
  const out = [...byModule.entries()]
    .map(([moduleId, g]) => ({
      moduleId,
      title: moduleTitle(moduleId),
      studentsCompleted: g.completedStudents.size,
      completedAttempts: g.completedAttempts,
      studentsAttempted: g.attemptedStudents.size,
    }))
    .sort(
      (a, b) => b.studentsCompleted - a.studentsCompleted || a.title.localeCompare(b.title)
    );

  return toCsv(
    [
      "module_id",
      "module",
      "students_completed",
      "completed_attempts",
      "students_attempted",
    ],
    out.map((r) => [
      r.moduleId,
      r.title,
      r.studentsCompleted,
      r.completedAttempts,
      r.studentsAttempted,
    ])
  );
}

// ---------- Feature 2: completions per module + difficulty ----------
export function buildCompletionsByModuleDifficultyCsv(rows) {
  const norm = normalizeRows(rows);
  const byKey = new Map();
  for (const r of norm) {
    const key = `${r.moduleId}|${r.difficulty}`;
    let g = byKey.get(key);
    if (!g) {
      g = {
        moduleId: r.moduleId,
        difficulty: r.difficulty,
        completedStudents: new Set(),
        attemptedStudents: new Set(),
        completedAttempts: 0,
      };
      byKey.set(key, g);
    }
    g.attemptedStudents.add(r.email);
    if (r.completed) {
      g.completedStudents.add(r.email);
      g.completedAttempts += 1;
    }
  }
  const out = [...byKey.values()].sort(
    (a, b) =>
      moduleTitle(a.moduleId).localeCompare(moduleTitle(b.moduleId)) ||
      a.difficulty - b.difficulty
  );

  return toCsv(
    [
      "module_id",
      "module",
      "difficulty",
      "difficulty_name",
      "students_completed",
      "completed_attempts",
      "students_attempted",
    ],
    out.map((r) => [
      r.moduleId,
      moduleTitle(r.moduleId),
      r.difficulty,
      difficultyName(r.difficulty),
      r.completedStudents.size,
      r.completedAttempts,
      r.attemptedStudents.size,
    ])
  );
}

// ---------- Raw one-row-per-attempt CSV ----------
export function buildAttemptsRawCsv(rows) {
  const norm = normalizeRows(rows);
  const sorted = [...norm].sort(
    (a, b) =>
      a.moduleId.localeCompare(b.moduleId) ||
      a.email.localeCompare(b.email) ||
      String(a.startedAt).localeCompare(String(b.startedAt))
  );
  return toCsv(
    [
      "attempt_id",
      "email",
      "module_id",
      "module",
      "difficulty",
      "difficulty_name",
      "class_id",
      "started_at",
      "completed_at",
      "completed",
      "question_count",
      "answered_count",
    ],
    sorted.map((r) => [
      r.attemptId,
      r.email,
      r.moduleId,
      moduleTitle(r.moduleId),
      r.difficulty,
      difficultyName(r.difficulty),
      r.classId,
      r.startedAt,
      r.completedAt || "",
      r.completed ? "yes" : "no",
      r.questionCount,
      r.answeredCount,
    ])
  );
}

// ---------- Browser download plumbing ----------
function downloadCsv(csv, filename) {
  if (typeof document === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Report id -> { filename, build(rows) } for the staff export options.
export const MODULE_ANALYTICS_REPORTS = {
  repeatsByModule: {
    label: "Repeats per module",
    filename: "module_repeats_by_module.csv",
    build: buildRepeatsByModuleCsv,
  },
  repeatsByModuleDifficulty: {
    label: "Repeats per module + difficulty",
    filename: "module_repeats_by_module_difficulty.csv",
    build: buildRepeatsByModuleDifficultyCsv,
  },
  attemptsByStudent: {
    label: "Attempts per student per module",
    filename: "module_attempts_by_student.csv",
    build: buildAttemptsByStudentCsv,
  },
  completionsByModule: {
    label: "Completions per module",
    filename: "module_completions_by_module.csv",
    build: buildCompletionsByModuleCsv,
  },
  completionsByModuleDifficulty: {
    label: "Completions per module + difficulty",
    filename: "module_completions_by_module_difficulty.csv",
    build: buildCompletionsByModuleDifficultyCsv,
  },
  raw: {
    label: "Raw attempts (one row each)",
    filename: "module_attempts_raw.csv",
    build: buildAttemptsRawCsv,
  },
};

/**
 * Fetch all attempts once and download one analytics CSV by report id.
 * @param {keyof typeof MODULE_ANALYTICS_REPORTS} reportId
 * @returns {Promise<number>} number of raw attempt rows the report drew from
 */
export async function downloadModuleAnalyticsCsv(reportId = "repeatsByModule") {
  const report = MODULE_ANALYTICS_REPORTS[reportId];
  if (!report) throw new Error(`Unknown report: ${reportId}`);
  const rows = await listModuleAttempts();
  downloadCsv(report.build(rows), report.filename);
  return Array.isArray(rows) ? rows.length : 0;
}

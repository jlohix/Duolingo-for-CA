import {
  submitQuestionReportRemote,
  listQuestionReportsRemote,
  resolveQuestionReportRemote,
} from "../supabaseClient";

const STORAGE_KEY = "circuito-question-reports-v1";

export const REPORT_REASONS = [
  { id: "wrong", label: "Question is wrong" },
  { id: "answer", label: "Marked answer or explanation is wrong" },
  { id: "image", label: "Image or diagram is wrong" },
  { id: "unclear", label: "Question is unclear" },
  { id: "other", label: "Something else" },
];

export function reasonLabel(id) {
  return REPORT_REASONS.find((row) => row.id === id)?.label || id || "—";
}

// ---------- Local cache (fallback + offline safety) ----------

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(rows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

// Map a Supabase row (snake_case) to the shape the UI already expects.
function fromRemoteRow(row) {
  return {
    id: row.id,
    at: row.created_at || row.at || "",
    questionId: row.question_id ?? row.questionId ?? "",
    questionText: row.question_text ?? row.questionText ?? "",
    reason: row.reason || "",
    note: row.note || "",
    reporter: row.reporter || "anonymous",
    resolved: Boolean(row.resolved),
  };
}

// ---------- Public API (same names as before) ----------

/**
 * Submit a question report. Saves to Supabase; falls back to a local
 * cache if the network/RPC is unavailable so the student still gets
 * a "thanks" and nothing is lost.
 * Returns { ok, report? , error? }.
 */
export async function submitQuestionReport({
  questionId,
  questionText,
  reason,
  note,
  reporter,
}) {
  const id = String(questionId || "").trim();
  const why = String(reason || "").trim();
  if (!id || !why) return { ok: false, error: "Pick a reason." };

  const report = {
    questionId: id,
    questionText: String(questionText || "").slice(0, 500),
    reason: why,
    note: String(note || "").trim().slice(0, 400),
    reporter: String(reporter || "").trim().toLowerCase() || "anonymous",
  };

  try {
    const ok = await submitQuestionReportRemote(report);
    if (ok) return { ok: true, report };
    // fall through to local cache if the server said "no"
  } catch {
    /* offline / RPC not installed yet -> local cache below */
  }

  // Fallback: keep it locally so the student's report is not lost.
  const localRow = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...report,
  };
  writeAll([localRow, ...readAll()].slice(0, 200));
  return { ok: true, report: localRow };
}

/**
 * List all question reports for the admin view. Reads from Supabase;
 * falls back to the local cache if unavailable.
 * (Admin-only: only the admin screen calls this.)
 */
export async function listQuestionReports() {
  try {
    const rows = await listQuestionReportsRemote();
    if (Array.isArray(rows)) return rows.map(fromRemoteRow);
  } catch {
    /* offline / RPC not installed yet -> local cache below */
  }
  return readAll().sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

/**
 * Mark a report resolved / unresolved (admins). Returns true on success.
 */
export async function resolveQuestionReport(id, resolved = true) {
  try {
    return await resolveQuestionReportRemote(id, resolved);
  } catch {
    return false;
  }
}

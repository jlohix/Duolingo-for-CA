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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function listQuestionReports() {
  return readAll().sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

export function submitQuestionReport({
  questionId,
  questionText,
  reason,
  note,
  reporter,
}) {
  const id = String(questionId || "").trim();
  const why = String(reason || "").trim();
  if (!id || !why) return { ok: false, error: "Pick a reason." };

  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    questionId: id,
    questionText: String(questionText || "").slice(0, 280),
    reason: why,
    note: String(note || "").trim().slice(0, 400),
    reporter: String(reporter || "").trim().toLowerCase() || "anonymous",
  };

  const next = [row, ...readAll()].slice(0, 200);
  writeAll(next);
  return { ok: true, report: row };
}

// ============================================================
// Export logged module visits as module_times_logged.csv
// ============================================================
// Fetches every module visit via the list_module_visits RPC (already
// sorted by user, module, then entry time on the server) and turns it
// into a CSV string / browser download named "module_times_logged.csv".
//
// Intended for a staff/admin export button; mirrors the shape of the
// public.module_times_logged view in the Supabase SQL Editor.

import { listModuleVisits } from "../supabaseClient";

const CSV_HEADERS = [
  "email",
  "class_id",
  "module_key",
  "module_detail",
  "module_label",
  "visit_id",
  "session_id",
  "entered_at",
  "last_seen_at",
  "duration_seconds",
  "duration_minutes",
  "duration_hms",
  "duration_hours",
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Whole seconds -> "HH:MM:SS"
export function secondsToHms(totalSeconds) {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

// RFC-4180 safe field: quote when it contains comma, quote or newline.
function csvField(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Build the CSV text from an array of visit rows (as returned by the RPC). */
export function buildModuleTimesCsv(rows) {
  const list = Array.isArray(rows) ? rows : [];
  // Ensure ordering by user -> module -> entry time even if unsorted.
  const sorted = [...list].sort((a, b) => {
    const ea = String(a.email || "");
    const eb = String(b.email || "");
    if (ea !== eb) return ea < eb ? -1 : 1;
    const ka = String(a.moduleKey || "");
    const kb = String(b.moduleKey || "");
    if (ka !== kb) return ka < kb ? -1 : 1;
    return String(a.enteredAt || "").localeCompare(String(b.enteredAt || ""));
  });

  const lines = [CSV_HEADERS.join(",")];
  for (const r of sorted) {
    const durationSeconds = Math.max(
      0,
      Math.round(Number(r.durationSeconds) || 0)
    );
    lines.push(
      [
        csvField(r.email),
        csvField(r.classId),
        csvField(r.moduleKey),
        csvField(r.moduleDetail),
        csvField(r.moduleLabel),
        csvField(r.visitId),
        csvField(r.sessionId),
        csvField(r.enteredAt),
        csvField(r.lastSeenAt),
        csvField(durationSeconds),
        csvField((durationSeconds / 60).toFixed(2)),
        csvField(secondsToHms(durationSeconds)),
        csvField((durationSeconds / 3600).toFixed(2)),
      ].join(",")
    );
  }
  return lines.join("\r\n");
}

/** Fetch all module visits and return the CSV string. */
export async function fetchModuleTimesCsv() {
  const rows = await listModuleVisits();
  return buildModuleTimesCsv(rows);
}

/**
 * Fetch + trigger a browser download of module_times_logged.csv.
 * Returns the number of visit rows exported.
 */
export async function downloadModuleTimesLoggedCsv(
  filename = "module_times_logged.csv"
) {
  const rows = await listModuleVisits();
  const csv = buildModuleTimesCsv(rows);
  if (typeof document !== "undefined") {
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
  return rows.length;
}

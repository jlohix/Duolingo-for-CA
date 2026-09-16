// ============================================================
// Export logged session times as user_times_logged.csv
// ============================================================
// Fetches every session row via the list_session_times RPC (already
// sorted by user then start time on the server) and turns it into a
// CSV string / browser download named exactly "user_times_logged.csv".
//
// Intended for a staff/admin export button; the same shape is what the
// public.user_times_logged view produces in the Supabase SQL Editor.

import { listSessionTimes } from "../supabaseClient";

const CSV_HEADERS = [
  "email",
  "class_id",
  "session_id",
  "started_at",
  "last_seen_at",
  "duration_seconds",
  "duration_minutes",
  "duration_hms",
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

/** Build the CSV text from an array of session rows (as returned by the RPC). */
export function buildSessionTimesCsv(rows) {
  const list = Array.isArray(rows) ? rows : [];
  // Ensure ordering by user then start time even if the source isn't sorted.
  const sorted = [...list].sort((a, b) => {
    const ea = String(a.email || "");
    const eb = String(b.email || "");
    if (ea !== eb) return ea < eb ? -1 : 1;
    return String(a.startedAt || "").localeCompare(String(b.startedAt || ""));
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
        csvField(r.sessionId),
        csvField(r.startedAt),
        csvField(r.lastSeenAt),
        csvField(durationSeconds),
        csvField((durationSeconds / 60).toFixed(2)),
        csvField(secondsToHms(durationSeconds)),
      ].join(",")
    );
  }
  return lines.join("\r\n");
}

/** Fetch all logged sessions and return the CSV string. */
export async function fetchSessionTimesCsv() {
  const rows = await listSessionTimes();
  return buildSessionTimesCsv(rows);
}

/**
 * Fetch + trigger a browser download of user_times_logged.csv.
 * Returns the number of session rows exported.
 */
export async function downloadUserTimesLoggedCsv(filename = "user_times_logged.csv") {
  const rows = await listSessionTimes();
  const csv = buildSessionTimesCsv(rows);
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

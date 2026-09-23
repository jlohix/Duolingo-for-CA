// Per-question-family timing tracker.
// ============================================================
// Records how long a student takes on a whole question family (all steps
// of e.g. Question 201: 201-1, 201-2, ... 201-n) and persists ONE record
// per completed family to Supabase (question_family_times).
//
// Timing rules (as specified):
//   * loginTime + a per-login sessionId are captured when the user logs in.
//   * questionStartTime is recorded the FIRST time the student enters a
//     family, and is NOT reset when they move between steps (201-1 ->
//     201-2) or revisit a previous step.
//   * When the family's FINAL step is completed, questionFinishTime is
//     recorded and durationSeconds = finish - start; the record is saved.
//
// This module is deliberately self-contained (module-level state) so it can
// be called from anywhere in the quiz flow without threading props. It does
// NOT create a second login/session system — loginTime/sessionId are set
// once from the existing auth flow via beginTimingSession().

import {
  logQuestionFamilyTime,
  logQuestionFamilyTimeBeacon,
} from "../supabaseClient";

function makeSessionId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// --- Login-scoped context (one per successful login) ---
let sessionId = null;
let loginTime = null;
let studentEmail = null;
let currentClassId = "";

// --- Per-family state ---
// startTimes: familyId -> ISO string of first entry (never overwritten).
const startTimes = new Map();
// completed: familyIds already persisted this login, so we don't double-log.
const completed = new Set();

/**
 * Begin a timing session for a freshly logged-in student. Call once from the
 * login flow. Captures loginTime + a unique sessionId and clears any prior
 * per-family state.
 * @param {object} opts
 * @param {string} opts.email    the student's login id (email)
 * @param {string} [opts.classId]
 */
export function beginTimingSession({ email, classId = "" }) {
  sessionId = makeSessionId();
  loginTime = new Date().toISOString();
  studentEmail = String(email || "").trim().toLowerCase();
  currentClassId = String(classId || "");
  startTimes.clear();
  completed.clear();
}

/** Keep the reported class id current (optional). */
export function setTimingClassId(classId) {
  currentClassId = String(classId || "");
}

/** Clear everything on logout. */
export function endTimingSession() {
  sessionId = null;
  loginTime = null;
  studentEmail = null;
  currentClassId = "";
  startTimes.clear();
  completed.clear();
}

/** Whether a timing session is active (a student is logged in). */
export function isTimingActive() {
  return Boolean(sessionId && studentEmail);
}

/**
 * Record that the student is currently on a step of `familyId`. Sets the
 * family's start time on FIRST sight only — subsequent calls (moving between
 * steps or revisiting) do not change it. Safe to call on every step render.
 * @param {string|number} familyId
 */
export function noteFamilyStep(familyId) {
  if (!isTimingActive()) return;
  const id = String(familyId || "").trim();
  if (!id) return;
  if (!startTimes.has(id)) {
    startTimes.set(id, new Date().toISOString());
  }
}

/**
 * Mark a family's FINAL step complete: compute the duration and persist one
 * record. No-op if the family was never started or was already logged this
 * login. `useBeacon` uses the unload-safe path (for completions that coincide
 * with the tab closing).
 * @param {string|number} familyId
 * @param {object} [opts]
 * @param {boolean} [opts.useBeacon=false]
 */
export function completeFamily(familyId, { useBeacon = false } = {}) {
  if (!isTimingActive()) return;
  const id = String(familyId || "").trim();
  if (!id) return;
  // If we never saw a start (edge case), start = now so duration is 0 rather
  // than losing the record entirely.
  const startIso = startTimes.get(id) || new Date().toISOString();
  if (completed.has(id)) return; // already logged this family this login
  completed.add(id);

  const finishIso = new Date().toISOString();
  const durationSeconds = Math.max(
    0,
    Math.round((Date.parse(finishIso) - Date.parse(startIso)) / 1000)
  );

  const payload = {
    email: studentEmail,
    sessionId,
    questionFamilyId: id,
    questionStartTime: startIso,
    questionFinishTime: finishIso,
    durationSeconds,
    loginTime,
    classId: currentClassId,
  };

  if (useBeacon) {
    logQuestionFamilyTimeBeacon(payload);
  } else {
    // Fire and forget: never block or break the quiz flow on a logging error.
    logQuestionFamilyTime(payload).catch(() => {});
  }
}

// Test/analytics helpers (not required by the app, handy for debugging).
export function _getTimingState() {
  return {
    sessionId,
    loginTime,
    studentEmail,
    currentClassId,
    startTimes: new Map(startTimes),
    completed: new Set(completed),
  };
}

// ============================================================
// Module attempt tracking — client helper
// ============================================================
// Logs one row per attempt at a QUESTION BANK module so staff can see
// how often each module is repeated (Feature 1) and how many people
// complete each module (Feature 2). See supabase/module_attempts.sql.
//
// Design mirrors sessionTimer.js:
//   * One attempt = one (re)start of a bank module. A fresh UUID is
//     generated each time a module enters its quiz stage, so replays
//     are counted as separate attempts (the repeat signal).
//   * Calls are best-effort and never block or break the quiz — every
//     network path is wrapped so a failure is swallowed.
//   * Admin / staff sessions are NOT tracked (same rule as progress
//     sync), so staff previews don't pollute the analytics.

import { loadSession } from "./auth";
import { isAdmin } from "./auth";
import {
  logModuleAttemptStart,
  completeModuleAttempt,
} from "../supabaseClient";

// Generate a stable UUID for one attempt (crypto.randomUUID with a
// RFC4122-ish fallback — same approach as sessionTimer.makeSessionId).
export function makeAttemptId() {
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

// Resolve the tracked student's email, or "" for admin/anon sessions
// (which we deliberately do not track).
function trackedEmail() {
  const session = loadSession();
  if (!session || isAdmin(session)) return "";
  const email = String(session.username || "").trim().toLowerCase();
  if (!email || email === "admin") return "";
  return email;
}

function userAgent() {
  return typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
}

// ---- DEV-ONLY: mirror attempts to the local logger-server ----------
// The browser can't write files, so when running locally we also POST
// each attempt to logger-server.mjs (node logger-server.mjs), which
// appends it to module_attempts.csv on disk. This runs ONLY on localhost
// and is fully best-effort: if the logger isn't running, it's ignored.
const LOCAL_LOGGER_URL = "http://localhost:4321";

function isLocalhost() {
  if (typeof window === "undefined") return false;
  const host = window.location?.hostname || "";
  return host === "localhost" || host === "127.0.0.1";
}

function logToLocalCsv(event, payload) {
  if (!isLocalhost()) return;
  try {
    fetch(`${LOCAL_LOGGER_URL}/${event}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* logger not running — ignore */
    });
  } catch {
    /* ignore */
  }
}

/**
 * Begin tracking a bank-module attempt. Returns an attempt handle you can
 * later pass to finishModuleAttempt, or null when tracking is skipped
 * (admin/anon session, or missing module id).
 *
 * @param {object} opts
 * @param {string} opts.moduleId      question bank id (e.g. "supernode")
 * @param {number} [opts.difficulty]  1-3
 * @param {string} [opts.classId]     student's class id, for reporting
 * @param {number} [opts.questionCount] number of questions in the run
 * @returns {{attemptId:string, moduleId:string, difficulty:number, classId:string, email:string, questionCount:number}|null}
 */
export function startModuleAttempt({
  moduleId,
  difficulty = 1,
  classId = "",
  questionCount = 0,
}) {
  const email = trackedEmail();
  const module = String(moduleId || "").trim();
  if (!email || !module) return null;

  const handle = {
    attemptId: makeAttemptId(),
    moduleId: module,
    difficulty: Math.max(1, Math.min(3, Math.round(Number(difficulty) || 1))),
    classId: String(classId || ""),
    email,
    questionCount: Math.max(0, Math.round(Number(questionCount) || 0)),
  };

  logModuleAttemptStart({ ...handle, userAgent: userAgent() }).catch(() => {
    /* best-effort; the complete call also upserts if this one is lost */
  });

  // Dev-only local CSV log (no-op unless logger-server.mjs is running).
  logToLocalCsv("start", { ...handle, answeredCount: 0 });

  return handle;
}

/**
 * Mark a previously started attempt as completed (all questions answered
 * at least once). No-op when handle is null.
 *
 * @param {object|null} handle       value returned by startModuleAttempt
 * @param {object} [opts]
 * @param {number} [opts.answeredCount] distinct questions answered >= once
 */
export function finishModuleAttempt(handle, { answeredCount = 0 } = {}) {
  if (!handle || !handle.attemptId || !handle.email || !handle.moduleId) {
    return;
  }
  const safeAnswered = Math.max(0, Math.round(Number(answeredCount) || 0));
  completeModuleAttempt({
    ...handle,
    answeredCount: safeAnswered,
    userAgent: userAgent(),
  }).catch(() => {
    /* best-effort */
  });

  // Dev-only local CSV log (no-op unless logger-server.mjs is running).
  logToLocalCsv("complete", { ...handle, answeredCount: safeAnswered });
}

// ============================================================
// Module timer — measures how long a user spends inside a single
// module (a lesson, lab, paper, leaderboard, profile, ...) and
// reports the running duration to Supabase (module_visits).
// ============================================================
// Design mirrors sessionTimer.js:
//   * One "visit" per module entry, identified by a UUID.
//   * ACTIVE time only: the clock runs while the tab is visible and
//     pauses when hidden, so idle background tabs don't inflate it.
//   * A heartbeat flushes the running total every HEARTBEAT_MS.
//   * On tab-hide / close we flush via sendBeacon (survives unload).
//   * Navigating to another module stops this timer (final flush) and
//     the hook starts a fresh one for the new module.
//
// Driven by the useModuleTime() hook, but framework-agnostic.

import { logModuleVisit, logModuleVisitBeacon } from "../supabaseClient";

const HEARTBEAT_MS = 30_000; // flush the running duration every 30s
const MIN_FLUSH_DELTA_SECONDS = 5; // don't spam the server for tiny changes

function makeVisitId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  // RFC4122-ish fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a timer for a single module visit.
 * @param {object} opts
 * @param {string} opts.email        logged-in user's email (required)
 * @param {string} opts.moduleKey    stable module/screen key (required)
 * @param {string} [opts.moduleDetail] finer detail (e.g. lesson key)
 * @param {string} [opts.moduleLabel] human label for reports
 * @param {string} [opts.classId]     current class id, for reporting
 * @param {string} [opts.sessionId]   parent browsing session id (optional link)
 * @returns {{ stop: () => void, flush: () => void, visitId: string }}
 */
export function startModuleTimer({
  email,
  moduleKey,
  moduleDetail = "",
  moduleLabel = "",
  classId = "",
  sessionId = null,
}) {
  const visitId = makeVisitId();

  let accumulatedMs = 0;
  let activeSince = null;
  let lastFlushedSeconds = -1;
  let heartbeat = null;
  let stopped = false;

  function isVisible() {
    return typeof document === "undefined" || !document.hidden;
  }

  function currentSeconds() {
    let ms = accumulatedMs;
    if (activeSince != null) ms += Date.now() - activeSince;
    return Math.round(ms / 1000);
  }

  function resume() {
    if (stopped) return;
    if (activeSince == null) activeSince = Date.now();
  }

  function pause() {
    if (activeSince != null) {
      accumulatedMs += Date.now() - activeSince;
      activeSince = null;
    }
  }

  function payload(seconds) {
    return {
      visitId,
      email,
      moduleKey,
      durationSeconds: seconds,
      moduleDetail,
      moduleLabel,
      classId,
      sessionId,
    };
  }

  // Reliable (async, headers) flush — used on start and heartbeats.
  function flush(force = false) {
    if (!email || !moduleKey) return;
    const seconds = currentSeconds();
    if (!force && seconds - lastFlushedSeconds < MIN_FLUSH_DELTA_SECONDS) {
      return;
    }
    lastFlushedSeconds = seconds;
    logModuleVisit(payload(seconds)).catch(() => {
      /* best-effort; heartbeat will retry */
    });
  }

  // Unload-safe flush — used when the tab is being hidden/closed.
  function flushBeacon() {
    if (!email || !moduleKey) return;
    const seconds = currentSeconds();
    lastFlushedSeconds = seconds;
    logModuleVisitBeacon(payload(seconds));
  }

  function handleVisibility() {
    if (isVisible()) {
      resume();
    } else {
      pause();
      flushBeacon();
    }
  }

  function handlePageHide() {
    pause();
    flushBeacon();
  }

  // ---- wire up ----
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibility);
  }
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);
  }

  // Start the clock (if visible) and record the initial row immediately.
  if (isVisible()) resume();
  flush(true);
  heartbeat = setInterval(() => flush(false), HEARTBEAT_MS);

  function stop() {
    if (stopped) return;
    stopped = true;
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibility);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    }
    pause();
    flush(true); // final reliable flush when leaving the module / unmount
  }

  return { stop, flush: () => flush(true), visitId };
}

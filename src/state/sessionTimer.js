// ============================================================
// Session timer — measures how long a user actually spends on the
// site and reports the running duration to Supabase.
// ============================================================
// Design:
//   * One "session" per page load, identified by a UUID.
//   * We accumulate ACTIVE time only: the clock runs while the tab is
//     visible and pauses when it is hidden, so idle background tabs
//     don't inflate the numbers.
//   * A heartbeat flushes the running total every HEARTBEAT_MS so a
//     hard crash still leaves a recent value in the DB.
//   * On tab-hide / page-close we do a final flush via sendBeacon
//     (see logSessionTimeBeacon) which survives unload.
//
// Usage is normally through the useSessionTime() hook, but the module
// is framework-agnostic and can be driven manually in tests.

import { logSessionTime, logSessionTimeBeacon } from "../supabaseClient";

const HEARTBEAT_MS = 30_000; // flush the running duration every 30s
const MIN_FLUSH_DELTA_SECONDS = 5; // don't spam the server for tiny changes

function makeSessionId() {
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
 * Create a session timer for a given user.
 * @param {object} opts
 * @param {string} opts.email    logged-in user's email (required)
 * @param {string} [opts.classId] current class id, for reporting
 * @returns {{ stop: () => void, flush: () => void, sessionId: string }}
 */
export function startSessionTimer({ email, classId = "" }) {
  const sessionId = makeSessionId();
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent || "" : "";

  // Accumulated active milliseconds up to `activeSince` transitions.
  let accumulatedMs = 0;
  // Timestamp (ms) when the active clock last started running, or null
  // when paused (tab hidden).
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

  // Reliable (async, headers) flush — used on start and heartbeats.
  function flush(force = false) {
    if (!email) return;
    const seconds = currentSeconds();
    if (!force && seconds - lastFlushedSeconds < MIN_FLUSH_DELTA_SECONDS) {
      return;
    }
    lastFlushedSeconds = seconds;
    logSessionTime({
      sessionId,
      email,
      durationSeconds: seconds,
      classId,
      userAgent,
    }).catch(() => {
      /* best-effort; heartbeat will retry */
    });
  }

  // Unload-safe flush — used when the tab is being hidden/closed.
  function flushBeacon() {
    if (!email) return;
    const seconds = currentSeconds();
    lastFlushedSeconds = seconds;
    logSessionTimeBeacon({
      sessionId,
      email,
      durationSeconds: seconds,
      classId,
      userAgent,
    });
  }

  function handleVisibility() {
    if (isVisible()) {
      resume();
    } else {
      // Tab hidden: pause the clock and persist what we have so far.
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
    // pagehide is the most reliable "leaving" signal on mobile Safari.
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
    flush(true); // final reliable flush (e.g. on logout / unmount)
  }

  return { stop, flush: () => flush(true), sessionId };
}

// Client cache + helpers for the weekly leaderboard period.
// The period (snapshot + next-reset time) is owned server-side
// (supabase/leaderboard_period.sql). We fetch it, cache it in memory + a tiny
// localStorage mirror (so the first paint after a refresh has data), and expose
// synchronous accessors that the leaderboard builders can use.

import { syncLeaderboardPeriodRemote } from "../supabaseClient";

const STORAGE_KEY = "circuito-leaderboard-period-v1";

// In-memory cache: { weeklyXp: {email->gained}, nextReset: ms, periodStart: ms,
// recurWeeks: number }.
let cache = loadCache();
const listeners = new Set();

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* ignore */
  }
  return { weeklyXp: {}, nextReset: 0, periodStart: 0, recurWeeks: 1 };
}

function saveCache() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

function emit() {
  for (const fn of listeners) {
    try {
      fn(cache);
    } catch {
      /* ignore */
    }
  }
}

// Subscribe to cache updates (e.g. so a mounted leaderboard re-renders when the
// weekly data arrives). Returns an unsubscribe function.
export function subscribeLeaderboardPeriod(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Fetch the latest period from the server and update the cache.
export async function refreshLeaderboardPeriod() {
  try {
    const remote = await syncLeaderboardPeriodRemote();
    if (remote && typeof remote === "object") {
      cache = {
        weeklyXp:
          remote.weeklyXp && typeof remote.weeklyXp === "object"
            ? remote.weeklyXp
            : {},
        nextReset: Number(remote.nextReset) || 0,
        periodStart: Number(remote.periodStart) || 0,
        recurWeeks: Number(remote.recurWeeks) || 1,
      };
      saveCache();
      emit();
    }
    return cache;
  } catch {
    return cache;
  }
}

// Weekly (this-period) XP earned by a student email. Falls back to 0 when the
// snapshot hasn't captured them yet.
export function weeklyXpFor(email) {
  const key = String(email || "").toLowerCase();
  const v = cache.weeklyXp?.[key];
  return Number.isFinite(Number(v)) ? Number(v) : 0;
}

// ms epoch of the next reset (0 if unknown).
export function nextResetAt() {
  return Number(cache.nextReset) || 0;
}

// ms remaining until the next reset (0 if unknown / passed).
export function msUntilReset() {
  const next = nextResetAt();
  return next > 0 ? Math.max(0, next - Date.now()) : 0;
}

export function getPeriodCache() {
  return cache;
}

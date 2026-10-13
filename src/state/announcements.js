// Client helpers for announcements.
// - Fetches the active announcements for the login pop-up.
// - Tracks per-browser dismissals so "once" announcements don't reappear
//   (localStorage, matching the app's circuito-*-v1 convention).

import { listActiveAnnouncementsRemote } from "../supabaseClient";

const SEEN_KEY = "circuito-announcements-seen-v1";

function loadSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveSeen(map) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

// Mark a set of announcement ids as dismissed in this browser.
export function markAnnouncementsSeen(ids) {
  const map = loadSeen();
  const now = Date.now();
  for (const id of ids || []) map[id] = now;
  saveSeen(map);
}

function wasSeen(id) {
  return Boolean(loadSeen()[id]);
}

// Fetch the active announcements the student should see RIGHT NOW:
//   - "recurring": always shown while active
//   - "once": shown only if not already dismissed in this browser
// Returns a (possibly empty) array, newest first.
export async function loadAnnouncementsForPopup() {
  let active = [];
  try {
    active = await listActiveAnnouncementsRemote();
  } catch {
    return [];
  }
  return (active || []).filter((a) => {
    if (!a || !a.id) return false;
    if (a.frequency === "recurring") return true;
    return !wasSeen(a.id); // "once"
  });
}

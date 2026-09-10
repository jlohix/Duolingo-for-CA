import { todayKey, visibleStreak } from "./progress";
import { DEFAULT_CLASS, normalizeClassId } from "../data/classes";
import { loadRemoteStudents, normalizeRemoteStudent } from "./remoteRoster";

const STORAGE_KEY = "circuito-roster-v1";
export const LIVE_USERNAME = "live";

export function displayNameFor(username) {
  const raw = String(username || "").trim();
  if (!raw || raw === LIVE_USERNAME) return "You";
  if (raw.includes("@")) return raw.split("@")[0];
  return raw;
}

export function boardName(user, progress) {
  const custom = String(progress?.displayName || "").trim();
  if (custom) return custom;
  return displayNameFor(user?.username);
}

export function liveUsernameOf(user) {
  if (user?.role === "admin" || !user?.username) return LIVE_USERNAME;
  return String(user.username).trim().toLowerCase();
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { overlays: {}, extras: [] };
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return { overlays: {}, extras: [] };
    if (Array.isArray(data.extras) || data.overlays) {
      return {
        overlays:
          data.overlays && typeof data.overlays === "object"
            ? data.overlays
            : {},
        extras: Array.isArray(data.extras) ? data.extras : [],
      };
    }
    return { overlays: data, extras: [] };
  } catch {
    return { overlays: {}, extras: [] };
  }
}

function saveStore(store) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ overlays: store.overlays, extras: store.extras })
  );
}

function loadOverlays() {
  return loadStore().overlays;
}

function saveOverlays(overlays) {
  const store = loadStore();
  saveStore({ ...store, overlays });
}

function slugName(display) {
  const base =
    String(display)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18) || "student";
  return base;
}

function takenNames(store) {
  return new Set([
    LIVE_USERNAME,
    "student1",
    "admin",
    ...store.extras.map((row) => String(row.username).toLowerCase()),
    ...loadRemoteStudents().map((row) => String(row.username).toLowerCase()),
  ]);
}

export function addStudent(display, classId = DEFAULT_CLASS) {
  const name = String(display || "").trim();
  if (!name) return { ok: false, error: "Enter a name." };
  const store = loadStore();
  const taken = takenNames(store);
  let username = slugName(name);
  let n = 2;
  while (taken.has(username)) {
    username = `${slugName(name)}${n}`;
    n += 1;
  }
  const student = {
    username,
    display: name,
    classId: normalizeClassId(classId),
    xp: 0,
    streak: 0,
    topicStats: {},
    completed: [],
  };
  store.extras.push(student);
  saveStore(store);
  return { ok: true, student };
}

function cloneStats(stats) {
  const out = {};
  for (const [id, val] of Object.entries(stats || {})) {
    out[id] = {
      correct: Number(val?.correct) || 0,
      attempts: Number(val?.attempts) || 0,
    };
  }
  return out;
}

function applyOverlay(base, overlay) {
  if (!overlay) {
    return {
      ...base,
      classId: normalizeClassId(base.classId),
      topicStats: cloneStats(base.topicStats),
      completed: Array.isArray(base.completed) ? [...base.completed] : [],
    };
  }
  return {
    ...base,
    display: overlay.display || base.display,
    classId: normalizeClassId(
      overlay.classId != null ? overlay.classId : base.classId
    ),
    xp: overlay.xp != null ? Number(overlay.xp) || 0 : base.xp,
    streak: overlay.streak != null ? Number(overlay.streak) || 0 : base.streak,
    topicStats: overlay.topicStats
      ? cloneStats(overlay.topicStats)
      : cloneStats(base.topicStats),
    completed: Array.isArray(overlay.completed)
      ? overlay.completed
      : Array.isArray(base.completed)
        ? base.completed
        : [],
  };
}

export function listStudents(liveProgress, options = {}) {
  const store = loadStore();
  const liveUsername = liveUsernameOf(options.user);
  const live = {
    username: liveUsername,
    display:
      liveUsername === LIVE_USERNAME
        ? "This device"
        : String(liveProgress.displayName || "").trim() ||
          displayNameFor(liveUsername),
    classId: normalizeClassId(liveProgress.classId),
    xp: Number(liveProgress.xp) || 0,
    streak: visibleStreak(liveProgress),
    topicStats: cloneStats(liveProgress.topicStats),
    completed: liveProgress.completed || [],
    walkFeedback: liveProgress.walkFeedback || {},
    live: true,
  };

  const extras = options.includeExtras
    ? store.extras.map((row) => ({
        ...applyOverlay(
          {
            username: row.username,
            display: row.display || row.username,
            classId: row.classId || DEFAULT_CLASS,
            xp: Number(row.xp) || 0,
            streak: Number(row.streak) || 0,
            topicStats: row.topicStats || {},
            completed: Array.isArray(row.completed) ? row.completed : [],
          },
          store.overlays[row.username]
        ),
        live: false,
        custom: true,
      }))
    : [];

  const remote = loadRemoteStudents()
    .map((row) => {
      const base = normalizeRemoteStudent(row);
      if (!base) return null;
      return {
        ...applyOverlay(base, store.overlays[base.username]),
        remote: true,
        live: false,
      };
    })
    .filter(Boolean);

  const roster = [];
  const taken = new Set();
  const staffView = options.user?.role === "admin";
  const seed = staffView ? [...remote, ...extras] : [live, ...remote, ...extras];
  for (const row of seed) {
    const key = String(row.username || "").toLowerCase();
    if (!key || taken.has(key)) continue;
    taken.add(key);
    roster.push({
      ...row,
      classId: normalizeClassId(row.classId),
    });
  }
  return roster;
}

export function studentToProgress(student) {
  return {
    xp: Number(student.xp) || 0,
    streak: Number(student.streak) || 0,
    lastPracticeDate: student.streak ? todayKey() : "",
    completed: student.completed || [],
    unlockedBySkip: [],
    topicStats: cloneStats(student.topicStats),
  };
}

export function saveStudentRecord(username, edits, liveProgress) {
  const xp = Math.max(0, Number(edits.xp) || 0);
  const streak = Math.max(0, Number(edits.streak) || 0);
  const topicStats = cloneStats(edits.topicStats);
  const completed = Array.isArray(edits.completed)
    ? edits.completed.filter((key) => typeof key === "string")
    : [];
  const overlays = loadOverlays();
  overlays[username] = {
    display: edits.display,
    classId: normalizeClassId(edits.classId),
    xp,
    streak,
    topicStats,
    completed,
  };
  saveOverlays(overlays);

  const store = loadStore();
  const extraIndex = store.extras.findIndex(
    (row) => row.username.toLowerCase() === username.toLowerCase()
  );
  if (extraIndex >= 0) {
    store.extras[extraIndex] = {
      ...store.extras[extraIndex],
      display: edits.display || store.extras[extraIndex].display,
      classId: normalizeClassId(edits.classId),
      xp,
      streak,
      topicStats,
      completed,
    };
    saveStore(store);
  }

  const liveRow = listStudents(liveProgress).find((row) => row.live);
  const isLive =
    liveRow &&
    String(username).toLowerCase() === liveRow.username.toLowerCase();
  if (isLive) {
    const next = {
      ...liveProgress,
      xp,
      streak,
      lastPracticeDate: streak ? todayKey() : "",
      topicStats,
      completed,
      classId: normalizeClassId(edits.classId),
    };
    return next;
  }
  return liveProgress;
}

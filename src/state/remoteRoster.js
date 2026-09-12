import { DEFAULT_CLASS, normalizeClassId } from "../data/classes";
import { listStudentProgress } from "../supabaseClient";

function displayFromUsername(username) {
  const raw = String(username || "").trim();
  if (!raw) return "Student";
  if (raw.includes("@")) return raw.split("@")[0];
  return raw;
}

let remoteCache = [];
let rosterEpoch = 0;
const rosterListeners = new Set();

function bumpRoster() {
  rosterEpoch += 1;
  rosterListeners.forEach((listener) => listener());
}

/**
 * Shape for a classmate from student_progress:
 * { username, display, classId, xp, streak, topicStats, completed }
 *
 * username should be the NTU email (lowercase). Do not send matric numbers
 * to the client.
 */
export function normalizeRemoteStudent(row) {
  const username = String(row?.username || row?.email || "")
    .trim()
    .toLowerCase();
  if (!username) return null;
  return {
    username,
    display: row.display || displayFromUsername(username),
    classId: normalizeClassId(row.classId || row.class_id || DEFAULT_CLASS),
    xp: Number(row.xp) || 0,
    streak: Number(row.streak) || 0,
    topicStats:
      row.topicStats && typeof row.topicStats === "object"
        ? row.topicStats
        : row.topic_stats && typeof row.topic_stats === "object"
          ? row.topic_stats
          : {},
    completed: Array.isArray(row.completed) ? row.completed : [],
    avatarUrl: String(row.avatarUrl || row.avatar_url || "").trim(),
    remote: true,
    live: false,
  };
}

export function setRemoteStudentCache(rows) {
  remoteCache = Array.isArray(rows) ? rows : [];
  bumpRoster();
}

export function loadRemoteStudents() {
  return remoteCache;
}

export function getRemoteRosterEpoch() {
  return rosterEpoch;
}

export function subscribeRemoteRoster(listener) {
  rosterListeners.add(listener);
  return () => rosterListeners.delete(listener);
}

export async function refreshRemoteStudents() {
  try {
    const rows = await listStudentProgress();
    setRemoteStudentCache(rows);
    return rows;
  } catch {
    return remoteCache;
  }
}

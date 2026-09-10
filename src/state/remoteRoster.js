import { DEFAULT_CLASS, normalizeClassId } from "../data/classes";

function displayFromUsername(username) {
  const raw = String(username || "").trim();
  if (!raw) return "Student";
  if (raw.includes("@")) return raw.split("@")[0];
  return raw;
}

/**
 * Shape for a classmate that will come from the database later:
 * { username, display, classId, xp, streak, topicStats, completed }
 *
 * username should be the NTU email (lowercase). Do not send matric numbers
 * to the client. When a students/progress table exists, map rows here.
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
    topicStats: row.topicStats && typeof row.topicStats === "object"
      ? row.topicStats
      : {},
    completed: Array.isArray(row.completed) ? row.completed : [],
    remote: true,
    live: false,
  };
}

export function loadRemoteStudents() {
  return [];
}

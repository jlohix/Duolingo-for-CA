import { listStudents } from "./roster";
import { saveProgress } from "./progress";
import { clampLeagueIndex, trophyFromIndex } from "../data/trophies";

const STORAGE_KEY = "circuito-league-v2";
export const SEASON_DAYS = 3;
const DURATION_MS = SEASON_DAYS * 24 * 60 * 60 * 1000;

export function zoneCounts(total) {
  const n = Math.max(0, Number(total) || 0);
  if (n <= 1) return { promote: 0, demote: 0 };
  let promote = Math.max(1, Math.round(n * 0.2));
  let demote = Math.max(1, Math.round(n * 0.2));
  if (promote + demote >= n) {
    promote = 1;
    demote = n > 1 ? 1 : 0;
  }
  return { promote, demote };
}

export function zoneForRank(rank, total) {
  const { promote, demote } = zoneCounts(total);
  if (rank <= promote) return "promote";
  if (demote && rank > total - demote) return "demote";
  return "safe";
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.seasonStart) return null;
    return {
      seasonStart: Number(data.seasonStart) || Date.now(),
      startXp: data.startXp && typeof data.startXp === "object" ? data.startXp : {},
      leagueIndex:
        data.leagueIndex && typeof data.leagueIndex === "object"
          ? data.leagueIndex
          : {},
    };
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function seasonXpFor(student, state) {
  const start = Number(state.startXp[student.username]);
  const base = Number.isFinite(start) ? start : Number(student.xp) || 0;
  return Math.max(0, (Number(student.xp) || 0) - base);
}

function snapshot(students, leagueIndex) {
  const startXp = {};
  const nextIndex = { ...leagueIndex };
  for (const row of students) {
    startXp[row.username] = Number(row.xp) || 0;
    if (nextIndex[row.username] == null) nextIndex[row.username] = 0;
    else nextIndex[row.username] = clampLeagueIndex(nextIndex[row.username]);
  }
  return { startXp, leagueIndex: nextIndex };
}

function withLeagueMeta(students, state) {
  return students.map((row) => ({
    ...row,
    filler: false,
    seasonXp: seasonXpFor(row, state),
    leagueIndex: clampLeagueIndex(state.leagueIndex[row.username] ?? 0),
  }));
}

function sortZone(rows) {
  const total = rows.length;
  return [...rows]
    .sort(
      (a, b) =>
        b.seasonXp - a.seasonXp ||
        b.xp - a.xp ||
        a.display.localeCompare(b.display)
    )
    .map((row, index) => {
      const rank = index + 1;
      return { ...row, rank, zone: zoneForRank(rank, total) };
    });
}

function fieldForLeague(students, state, leagueIndex) {
  const members = withLeagueMeta(students, state).filter(
    (row) => row.leagueIndex === leagueIndex
  );
  return sortZone(members);
}

function applySeasonResults(ranked, leagueIndex) {
  const next = { ...leagueIndex };
  for (const row of ranked) {
    if (row.filler) continue;
    const current = clampLeagueIndex(next[row.username] ?? row.leagueIndex);
    if (row.zone === "promote") next[row.username] = clampLeagueIndex(current + 1);
    else if (row.zone === "demote") next[row.username] = clampLeagueIndex(current - 1);
    else next[row.username] = current;
  }
  return next;
}

function settleSeason(students, seasonStart, startXp, leagueIndex) {
  const state = { seasonStart, startXp, leagueIndex };
  const meta = withLeagueMeta(students, state);
  const indices = [...new Set(meta.map((row) => row.leagueIndex))];
  let next = { ...leagueIndex };
  for (const index of indices) {
    const ranked = fieldForLeague(students, state, index);
    next = applySeasonResults(ranked, next);
  }
  return next;
}

export function syncLeagueSeason(liveProgress, user) {
  const students = listStudents(liveProgress, { user });
  const liveName = students.find((row) => row.live)?.username;
  const now = Date.now();
  let state = loadState();
  if (!state) {
    const snap = snapshot(students, {});
    state = { seasonStart: now, ...snap };
    saveState(state);
    const progress = {
      ...liveProgress,
      leagueIndex: liveName != null ? state.leagueIndex[liveName] : 0,
    };
    if (progress.leagueIndex !== liveProgress.leagueIndex) saveProgress(progress);
    return { progress, state };
  }

  let seasonStart = state.seasonStart;
  let leagueIndex = { ...state.leagueIndex };
  let startXp = { ...state.startXp };
  let guard = 0;
  while (now >= seasonStart + DURATION_MS && guard < 24) {
    leagueIndex = settleSeason(
      students,
      seasonStart,
      startXp,
      leagueIndex
    );
    seasonStart += DURATION_MS;
    const snap = snapshot(students, leagueIndex);
    startXp = snap.startXp;
    leagueIndex = snap.leagueIndex;
    guard += 1;
  }

  for (const row of students) {
    if (leagueIndex[row.username] == null) leagueIndex[row.username] = 0;
    if (startXp[row.username] == null) startXp[row.username] = row.xp;
  }

  state = { seasonStart, startXp, leagueIndex };
  saveState(state);
  const progress = {
    ...liveProgress,
    leagueIndex: liveName != null ? leagueIndex[liveName] : liveProgress.leagueIndex,
  };
  if (progress.leagueIndex !== liveProgress.leagueIndex) saveProgress(progress);
  return { progress, state };
}

export function formatRemain(ms) {
  const value = Math.max(0, ms);
  const days = Math.floor(value / 86400000);
  const hours = Math.floor((value % 86400000) / 3600000);
  const minutes = Math.floor((value % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function buildLeagueBoard(user, progress, leagueIndexOverride) {
  const { state } = syncLeagueSeason(progress, user);
  const students = listStudents(progress, { user });
  const now = Date.now();
  const youName = user?.role === "admin" ? "" : user?.username || "";
  const focusName = youName || students.find((row) => row.live)?.username;
  const focus =
    students.find(
      (row) => row.username.toLowerCase() === String(focusName || "").toLowerCase()
    ) || students[0];
  const leagueIndex = clampLeagueIndex(
    leagueIndexOverride != null
      ? leagueIndexOverride
      : state.leagueIndex[focus?.username] ?? 0
  );
  const ranked = fieldForLeague(students, state, leagueIndex);
  const total = ranked.length;
  const counts = zoneCounts(total);
  const league = trophyFromIndex(leagueIndex).current;
  const rows = ranked.map((row) => ({
    username: row.username,
    display: row.display,
    xp: row.xp,
    seasonXp: row.seasonXp,
    streak: row.streak,
    rank: row.rank,
    zone: row.zone,
    league,
    avatarUrl: row.avatarUrl || "",
    isYou: youName
      ? row.username.toLowerCase() === youName.toLowerCase()
      : false,
  }));
  return {
    rows,
    counts,
    league,
    remainMs: state.seasonStart + DURATION_MS - now,
    seasonDays: SEASON_DAYS,
  };
}

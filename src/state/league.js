import { listStudents } from "./roster";
import { saveProgress } from "./progress";
import { isRemoteRosterLoaded } from "./remoteRoster";
import { clampLeagueIndex, trophyFromIndex } from "../data/trophies";
import { syncLeagueSeasonRemote } from "../supabaseClient";

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

function asName(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function clampMap(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw)) {
    const name = asName(key);
    if (!name) continue;
    out[name] = clampLeagueIndex(value);
  }
  return out;
}

function xpMap(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw)) {
    const name = asName(key);
    if (!name) continue;
    out[name] = Number(value) || 0;
  }
  return out;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.seasonStart) return null;
    return {
      seasonStart: Number(data.seasonStart) || Date.now(),
      startXp: xpMap(data.startXp),
      leagueIndex: clampMap(data.leagueIndex),
    };
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function seasonXpFor(student, state) {
  const name = asName(student.username);
  const start = Number(state.startXp[name]);
  const base = Number.isFinite(start) ? start : Number(student.xp) || 0;
  return Math.max(0, (Number(student.xp) || 0) - base);
}

function seededIndex(students, stored) {
  const next = clampMap(stored);
  for (const row of students) {
    const name = asName(row.username);
    if (!name) continue;
    if (next[name] == null) {
      next[name] = clampLeagueIndex(row.leagueIndex);
    }
  }
  return next;
}

function snapshot(students, leagueIndex) {
  const startXp = {};
  const nextIndex = seededIndex(students, leagueIndex);
  for (const row of students) {
    const name = asName(row.username);
    if (!name) continue;
    startXp[name] = Number(row.xp) || 0;
  }
  return { startXp, leagueIndex: nextIndex };
}

function withLeagueMeta(students, state) {
  return students.map((row) => {
    const name = asName(row.username);
    return {
      ...row,
      username: name || row.username,
      filler: false,
      seasonXp: seasonXpFor(row, state),
      leagueIndex: clampLeagueIndex(
        state.leagueIndex[name] ?? row.leagueIndex ?? 0
      ),
    };
  });
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
    const name = asName(row.username);
    const current = clampLeagueIndex(next[name] ?? row.leagueIndex);
    if (row.zone === "promote") next[name] = clampLeagueIndex(current + 1);
    else if (row.zone === "demote") next[name] = clampLeagueIndex(current - 1);
    else next[name] = current;
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

function liveNameOf(students) {
  return students.find((row) => row.live)?.username || null;
}

function withLiveLeague(liveProgress, students, leagueIndex) {
  const liveName = liveNameOf(students);
  const nextIndex =
    liveName != null
      ? clampLeagueIndex(leagueIndex[asName(liveName)] ?? liveProgress.leagueIndex)
      : liveProgress.leagueIndex;
  const progress = { ...liveProgress, leagueIndex: nextIndex };
  if (progress.leagueIndex !== liveProgress.leagueIndex) saveProgress(progress);
  return progress;
}

function applyRemoteSeason(liveProgress, user, remote) {
  const students = listStudents(liveProgress, { user });
  const leagueIndex = seededIndex(students, clampMap(remote.leagueIndex));
  const startXp = xpMap(remote.startXp);
  for (const row of students) {
    const name = asName(row.username);
    if (!name) continue;
    if (startXp[name] == null) startXp[name] = Number(row.xp) || 0;
  }
  const state = {
    seasonStart: Number(remote.seasonStart) || Date.now(),
    startXp,
    leagueIndex,
  };
  saveState(state);
  return {
    progress: withLiveLeague(liveProgress, students, leagueIndex),
    state,
  };
}

export function syncLeagueSeason(liveProgress, user) {
  const students = listStudents(liveProgress, { user });
  const now = Date.now();
  let state = loadState();
  if (!state) {
    const snap = snapshot(students, {});
    state = { seasonStart: now, ...snap };
    saveState(state);
    return {
      progress: withLiveLeague(liveProgress, students, state.leagueIndex),
      state,
    };
  }

  let seasonStart = state.seasonStart;
  let leagueIndex = seededIndex(students, state.leagueIndex);
  let startXp = xpMap(state.startXp);
  let guard = 0;
  const canSettle = isRemoteRosterLoaded();
  while (canSettle && now >= seasonStart + DURATION_MS && guard < 24) {
    leagueIndex = settleSeason(students, seasonStart, startXp, leagueIndex);
    seasonStart += DURATION_MS;
    const snap = snapshot(students, leagueIndex);
    startXp = snap.startXp;
    leagueIndex = snap.leagueIndex;
    guard += 1;
  }

  for (const row of students) {
    const name = asName(row.username);
    if (!name) continue;
    if (leagueIndex[name] == null) {
      leagueIndex[name] = clampLeagueIndex(row.leagueIndex);
    }
    if (startXp[name] == null) startXp[name] = Number(row.xp) || 0;
  }

  state = { seasonStart, startXp, leagueIndex };
  saveState(state);
  return {
    progress: withLiveLeague(liveProgress, students, leagueIndex),
    state,
  };
}

export async function pullLeagueSeason(liveProgress, user) {
  try {
    const remote = await syncLeagueSeasonRemote();
    if (remote && Number.isFinite(Number(remote.seasonStart))) {
      return applyRemoteSeason(liveProgress, user, remote);
    }
  } catch {
    /* use local roster-aware settle */
  }
  return syncLeagueSeason(liveProgress, user);
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
  const youName = user?.role === "admin" ? "" : asName(user?.username);
  const focusName = youName || liveNameOf(students);
  const focus =
    students.find((row) => asName(row.username) === asName(focusName)) ||
    students[0];
  const leagueIndex = clampLeagueIndex(
    leagueIndexOverride != null
      ? leagueIndexOverride
      : state.leagueIndex[asName(focus?.username)] ??
          focus?.leagueIndex ??
          0
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
    isYou: youName ? asName(row.username) === youName : false,
  }));
  return {
    rows,
    counts,
    league,
    remainMs: state.seasonStart + DURATION_MS - now,
    seasonDays: SEASON_DAYS,
  };
}

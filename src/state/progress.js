import { DEFAULT_CLASS, normalizeClassId } from "../data/classes";
import { QUESTION_BANKS, bankLessonKey } from "../data/questionBanks";
import { hasTopicQuiz } from "../data/topics";
import { trophyFromIndex } from "../data/trophies";

const STORAGE_KEY = "circuito-progress-v1";
const XP_CORRECT = 10;
const XP_LESSON_BONUS = 20;

/** Active student email for scoped localStorage + remote sync. */
let progressOwner = null;

export function setProgressOwner(email) {
  const next = String(email || "")
    .trim()
    .toLowerCase();
  progressOwner = next && next !== "admin" ? next : null;
}

export function getProgressOwner() {
  return progressOwner;
}

function storageKeyFor(email) {
  const owner = String(email || progressOwner || "")
    .trim()
    .toLowerCase();
  if (!owner || owner === "admin") return STORAGE_KEY;
  return `${STORAGE_KEY}:${owner}`;
}

const XP_BY_DIFFICULTY = {
  1: { correct: 10, bonus: 20 },
  2: { correct: 20, bonus: 40 },
  3: { correct: 30, bonus: 60 },
};

export function xpForCorrect(difficulty) {
  return XP_BY_DIFFICULTY[Number(difficulty)]?.correct ?? XP_CORRECT;
}

export function xpForLessonBonus(difficulty) {
  return XP_BY_DIFFICULTY[Number(difficulty)]?.bonus ?? XP_LESSON_BONUS;
}

function emptyState() {
  return {
    xp: 0,
    completed: [],
    streak: 0,
    lastPracticeDate: "",
    unlockedBySkip: [],
    topicStats: {},
    leagueIndex: 0,
    classId: DEFAULT_CLASS,
    classChosen: false,
    displayName: "",
    avatarUrl: "",
    walkFeedback: {},
    knowledgeChecks: {},
    brainAttempts: null,
  };
}

export function todayKey() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function dayGap(fromKey, toKey) {
  const from = new Date(`${fromKey}T12:00:00`);
  const to = new Date(`${toKey}T12:00:00`);
  return Math.round((to - from) / 86400000);
}

export function visibleStreak(state) {
  const last = state.lastPracticeDate;
  if (!last) return 0;
  const gap = dayGap(last, todayKey());
  if (gap > 1) return 0;
  return Number(state.streak) || 0;
}

export function wouldExtendStreak(state) {
  return state.lastPracticeDate !== todayKey();
}

/** True when a live streak has not been practiced yet today (resets at midnight). */
export function streakExpiresTonight(state) {
  return visibleStreak(state) > 0 && wouldExtendStreak(state);
}

export function msUntilEndOfDay(now = Date.now()) {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return Math.max(0, end.getTime() - now);
}

/** Time left until the streak would reset if no more practice happens. */
export function msUntilStreakExpiry(state, now = Date.now()) {
  if (visibleStreak(state) <= 0) return 0;
  const tonight = msUntilEndOfDay(now);
  if (streakExpiresTonight(state)) return tonight;
  return tonight + 86400000;
}

export function formatTimer(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const clock = [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
  return days > 0 ? `${days}d ${clock}` : clock;
}

export function recordPractice(state) {
  const today = todayKey();
  const last = state.lastPracticeDate;
  if (last === today) return state;

  let streak = 1;
  if (last && dayGap(last, today) === 1) {
    streak = (Number(state.streak) || 0) + 1;
  }

  const next = { ...state, streak, lastPracticeDate: today };
  saveProgress(next);
  return next;
}

function parseTopicStats(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const [id, val] of Object.entries(raw)) {
    if (id === "__kc" || String(id).startsWith("__")) continue;
    out[id] = {
      correct: Number(val?.correct) || 0,
      attempts: Number(val?.attempts) || 0,
    };
  }
  return out;
}

function parseQuestionStats(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => ({
      index: Math.max(1, Number(row?.index) || 0),
      correct: Math.max(0, Number(row?.correct) || 0),
      total: Math.max(0, Number(row?.total) || 0),
    }))
    .filter((row) => row.index && row.total);
}

export function knowledgeCheckPercent(correct, total) {
  if (!total) return 0;
  return Math.round((100 * Number(correct)) / Number(total));
}

export function formatKnowledgeCheckScore(correct, total) {
  if (!total) return "—";
  return `${knowledgeCheckPercent(correct, total)}%`;
}

export function formatKnowledgeCheckDetail(correct, total) {
  if (!total) return "—";
  return `${correct}/${total} · ${knowledgeCheckPercent(correct, total)}%`;
}

export function scoreKnowledgeCheck(
  questions,
  fallbackCorrect = 0,
  fallbackTotal = 0
) {
  const stats = parseQuestionStats(questions);
  if (stats.length) {
    const correct = stats.reduce((sum, row) => sum + row.correct, 0);
    const total = stats.reduce((sum, row) => sum + row.total, 0);
    if (total) return { correct, total };
  }
  return {
    correct: Math.max(0, Number(fallbackCorrect) || 0),
    total: Math.max(0, Number(fallbackTotal) || 0),
  };
}

function parseKnowledgeAttempt(row) {
  const total = Number(row?.total) || 0;
  if (!total) return null;
  return {
    correct: Math.max(0, Number(row?.correct) || 0),
    total,
    at: String(row?.at || ""),
    questions: parseQuestionStats(row?.questions),
  };
}

export function parseKnowledgeChecks(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [id, val] of Object.entries(raw)) {
    if (!val || typeof val !== "object" || Array.isArray(val)) continue;
    const later = (Array.isArray(val.later) ? val.later : [])
      .map(parseKnowledgeAttempt)
      .filter(Boolean)
      .slice(-40);
    const firstTotal = Number(val.firstTotal) || 0;
    if (!firstTotal && !later.length) continue;
    out[String(id)] = {
      firstCorrect: Math.max(0, Number(val.firstCorrect) || 0),
      firstTotal,
      firstAt: String(val.firstAt || ""),
      firstQuestions: parseQuestionStats(val.firstQuestions),
      later,
    };
  }
  return out;
}

function bestLaterAttempt(later) {
  if (!later.length) return null;
  return later.reduce((best, attempt) => {
    const bestRatio = best.total ? best.correct / best.total : 0;
    const ratio = attempt.total ? attempt.correct / attempt.total : 0;
    if (ratio > bestRatio) return attempt;
    if (ratio < bestRatio) return best;
    return attempt.correct > best.correct ? attempt : best;
  });
}

export function knowledgeCheckSummary(progress, topicId) {
  const row =
    progress?.knowledgeChecks?.[String(topicId)] ||
    progress?.knowledgeChecks?.[topicId];
  if (!row || !row.firstTotal) return null;
  const first = scoreKnowledgeCheck(
    row.firstQuestions,
    row.firstCorrect,
    row.firstTotal
  );
  const later = (Array.isArray(row.later) ? row.later : []).map((attempt) => {
    const scored = scoreKnowledgeCheck(
      attempt.questions,
      attempt.correct,
      attempt.total
    );
    return { ...attempt, correct: scored.correct, total: scored.total };
  });
  const laterCount = later.length;
  const laterBest = bestLaterAttempt(later);
  return {
    firstCorrect: first.correct,
    firstTotal: first.total,
    firstAt: row.firstAt,
    later,
    laterCount,
    laterBest,
  };
}

export function formatKnowledgeCheckCell(summary) {
  if (!summary) return "—";
  const first = `${formatKnowledgeCheckScore(
    summary.firstCorrect,
    summary.firstTotal
  )} first`;
  if (!summary.laterBest) return first;
  const best = `${formatKnowledgeCheckScore(
    summary.laterBest.correct,
    summary.laterBest.total
  )} later`;
  const count = summary.laterCount > 1 ? ` ×${summary.laterCount}` : "";
  return `${first} · ${best}${count}`;
}

function parseWalkFeedback(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const [id, vote] of Object.entries(raw)) {
    if (vote === "up" || vote === "down") out[id] = vote;
  }
  return out;
}

function normalizeProgressData(data) {
  return {
    xp: Number(data.xp) || 0,
    completed: Array.isArray(data.completed) ? data.completed : [],
    streak: Number(data.streak) || 0,
    lastPracticeDate: data.lastPracticeDate || "",
    unlockedBySkip: Array.isArray(data.unlockedBySkip)
      ? data.unlockedBySkip
      : [],
    topicStats: parseTopicStats(data.topicStats),
    leagueIndex: Number.isFinite(Number(data.leagueIndex))
      ? Number(data.leagueIndex)
      : 0,
    classId: normalizeClassId(data.classId),
    classChosen: Boolean(data.classChosen),
    displayName: normalizeDisplayName(data.displayName),
    avatarUrl: normalizeAvatarUrl(data.avatarUrl),
    walkFeedback: parseWalkFeedback(data.walkFeedback),
    knowledgeChecks: parseKnowledgeChecks(
      data.knowledgeChecks ||
        data.knowledge_checks ||
        data.topicStats?.__kc ||
        data.topic_stats?.__kc
    ),
    brainAttempts: parseBrainAttempts(
      data.brainAttempts ||
        data.brain_attempts ||
        data.topicStats?.__brain ||
        data.topic_stats?.__brain
    ),
  };
}

function normalizeAvatarUrl(value) {
  const url = String(value ?? "").trim();
  // Only allow http(s) URLs (e.g. Supabase Storage public URLs).
  if (/^https?:\/\//i.test(url)) return url.slice(0, 500);
  return "";
}

function readProgressRaw(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return normalizeProgressData(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function loadProgress(email) {
  const key = storageKeyFor(email);
  const scoped = readProgressRaw(key);
  if (scoped) return scoped;

  // One-time migrate unscoped browser progress into this student's key.
  if (key !== STORAGE_KEY) {
    const legacy = readProgressRaw(STORAGE_KEY);
    if (legacy) {
      localStorage.setItem(key, JSON.stringify(legacy));
      return legacy;
    }
  }

  return emptyState();
}

function saveProgress(state, email) {
  localStorage.setItem(storageKeyFor(email), JSON.stringify(state));
}

export { saveProgress };

export function progressToRemotePayload(state) {
  const topicStats = parseTopicStats(state.topicStats);
  const knowledgeChecks = parseKnowledgeChecks(state.knowledgeChecks);
  if (Object.keys(knowledgeChecks).length) {
    topicStats.__kc = knowledgeChecks;
  }
  const brainAttempts = parseBrainAttempts(state.brainAttempts);
  if (brainAttempts) {
    topicStats.__brain = brainAttempts;
  }
  return {
    classId: normalizeClassId(state.classId),
    classChosen: Boolean(state.classChosen),
    xp: Number(state.xp) || 0,
    streak: Number(state.streak) || 0,
    lastPracticeDate: state.lastPracticeDate || "",
    completed: Array.isArray(state.completed) ? state.completed : [],
    unlockedBySkip: Array.isArray(state.unlockedBySkip)
      ? state.unlockedBySkip
      : [],
    topicStats,
    knowledgeChecks,
    brainAttempts,
    leagueIndex: Number.isFinite(Number(state.leagueIndex))
      ? Number(state.leagueIndex)
      : 0,
    trophyTier: trophyFromIndex(state.leagueIndex).current.id,
    displayName: normalizeDisplayName(state.displayName),
    avatarUrl: normalizeAvatarUrl(state.avatarUrl),
    walkFeedback: parseWalkFeedback(state.walkFeedback),
  };
}

export function remotePayloadToProgress(data) {
  if (!data || typeof data !== "object") return emptyState();
  return normalizeProgressData({
    xp: data.xp,
    completed: data.completed,
    streak: data.streak,
    lastPracticeDate: data.lastPracticeDate || data.last_practice_date,
    unlockedBySkip: data.unlockedBySkip || data.unlocked_by_skip,
    topicStats: data.topicStats || data.topic_stats,
    leagueIndex: data.leagueIndex ?? data.league_index,
    classId: data.classId || data.class_id,
    classChosen: data.classChosen ?? data.class_chosen,
    displayName: data.displayName || data.display_name,
    avatarUrl: data.avatarUrl || data.avatar_url,
    walkFeedback: data.walkFeedback || data.walk_feedback,
    knowledgeChecks:
      data.knowledgeChecks ||
      data.knowledge_checks ||
      data.topicStats?.__kc ||
      data.topic_stats?.__kc,
    brainAttempts:
      data.brainAttempts ||
      data.brain_attempts ||
      data.topicStats?.__brain ||
      data.topic_stats?.__brain,
  });
}

// Update just the avatar URL and persist locally.
export function setAvatarUrl(state, url) {
  const next = { ...state, avatarUrl: normalizeAvatarUrl(url) };
  saveProgress(next);
  return next;
}

export function recordWalkFeedback(state, lessonKey, vote) {
  if (!lessonKey || (vote !== "up" && vote !== "down")) return state;
  const next = {
    ...state,
    walkFeedback: { ...(state.walkFeedback || {}), [lessonKey]: vote },
  };
  saveProgress(next);
  return next;
}

export function recordKnowledgeCheck(
  state,
  topicId,
  correct,
  total,
  questionStats = []
) {
  const id = Number(topicId);
  const scored = Math.max(0, Number(correct) || 0);
  const outOf = Math.max(0, Number(total) || 0);
  if (!id || !outOf) return state;
  let next = recordPractice(state);
  const knowledgeChecks = { ...(next.knowledgeChecks || {}) };
  const prev = knowledgeChecks[String(id)];
  const attempt = {
    correct: scored,
    total: outOf,
    at: new Date().toISOString(),
    questions: parseQuestionStats(questionStats),
  };
  if (!prev || !prev.firstTotal) {
    knowledgeChecks[String(id)] = {
      firstCorrect: attempt.correct,
      firstTotal: attempt.total,
      firstAt: attempt.at,
      firstQuestions: attempt.questions,
      later: [],
    };
  } else {
    knowledgeChecks[String(id)] = {
      ...prev,
      later: [...(prev.later || []), attempt].slice(-40),
    };
  }
  next = { ...next, knowledgeChecks };
  saveProgress(next);
  return next;
}

function parseBrainReport(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const name = String(row?.name || "").trim();
      const total = Math.max(0, Number(row?.total) || 0);
      if (!name || !total) return null;
      const correct = Math.max(0, Number(row?.correct) || 0);
      const pct = Number.isFinite(Number(row?.pct))
        ? Math.max(0, Math.round(Number(row.pct)))
        : Math.round((100 * correct) / total);
      return { name, correct, total, pct };
    })
    .filter(Boolean);
}

function parseBrainAttempt(row) {
  const total = Number(row?.total) || 0;
  if (!total) return null;
  return {
    correct: Math.max(0, Number(row?.correct) || 0),
    total,
    at: String(row?.at || ""),
    report: parseBrainReport(row?.report),
  };
}

export function parseBrainAttempts(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const later = (Array.isArray(raw.later) ? raw.later : [])
    .map(parseBrainAttempt)
    .filter(Boolean)
    .slice(-40);
  const firstTotal = Number(raw.firstTotal) || 0;
  if (!firstTotal && !later.length) return null;
  return {
    firstCorrect: Math.max(0, Number(raw.firstCorrect) || 0),
    firstTotal,
    firstAt: String(raw.firstAt || ""),
    firstReport: parseBrainReport(raw.firstReport),
    later,
  };
}

export function recordBrainAttempt(state, correct, total, report = []) {
  const scored = Math.max(0, Number(correct) || 0);
  const outOf = Math.max(0, Number(total) || 0);
  if (!outOf) return state;
  const attempt = {
    correct: scored,
    total: outOf,
    at: new Date().toISOString(),
    report: parseBrainReport(report),
  };
  const prev = parseBrainAttempts(state.brainAttempts);
  let brainAttempts;
  if (!prev || !prev.firstTotal) {
    brainAttempts = {
      firstCorrect: attempt.correct,
      firstTotal: attempt.total,
      firstAt: attempt.at,
      firstReport: attempt.report,
      later: [],
    };
  } else {
    brainAttempts = {
      ...prev,
      later: [...(prev.later || []), attempt].slice(-40),
    };
  }
  const next = { ...state, brainAttempts };
  saveProgress(next);
  return next;
}

export function brainAttemptSummary(progress) {
  const row = parseBrainAttempts(progress?.brainAttempts);
  if (!row || !row.firstTotal) return null;
  const later = Array.isArray(row.later) ? row.later : [];
  return {
    firstCorrect: row.firstCorrect,
    firstTotal: row.firstTotal,
    firstAt: row.firstAt,
    firstReport: row.firstReport || [],
    later,
    laterCount: later.length,
    laterBest: bestLaterAttempt(later),
  };
}

export function recordFirstTry(state, topicId, ok) {
  if (!topicId) return state;
  const key = String(topicId);
  const topicStats = { ...(state.topicStats || {}) };
  const prev = topicStats[key] || { correct: 0, attempts: 0 };
  topicStats[key] = {
    correct: prev.correct + (ok ? 1 : 0),
    attempts: prev.attempts + 1,
  };
  const next = { ...state, topicStats };
  saveProgress(next);
  return next;
}

const STRENGTH_PCT = 80;
const SOLID_PCT = 60;
const DEVELOP_PCT = 40;
const LABEL_AFTER = 3;

export function topicInsight(progress, topicId) {
  const stats = progress.topicStats?.[topicId] || progress.topicStats?.[String(topicId)];
  const correct = Number(stats?.correct) || 0;
  const attempts = Number(stats?.attempts) || 0;
  if (!attempts) {
    const practiced = (progress.completed || []).some((key) => {
      const id = String(key);
      return id.startsWith(`${topicId}-`) || id.startsWith(`walk-${topicId}-`);
    });
    return {
      kind: "empty",
      label: practiced ? "No accuracy yet" : "Not practiced",
      detail: practiced
        ? "Replay a lesson or walkthrough to measure first-try accuracy."
        : "Answer lesson or walkthrough questions to measure this topic.",
      pct: null,
      correct: 0,
      attempts: 0,
    };
  }
  const pct = Math.round((correct / attempts) * 100);
  const score = { pct, correct, attempts };
  if (attempts < LABEL_AFTER) {
    return {
      kind: "starting",
      label: "Getting started",
      detail: `${correct}/${attempts} first try (${pct}%)`,
      ...score,
    };
  }
  if (pct >= STRENGTH_PCT) {
    return {
      kind: "strength",
      label: "Strength",
      detail: `${correct}/${attempts} first try (${pct}%)`,
      ...score,
    };
  }
  if (pct >= SOLID_PCT) {
    return {
      kind: "solid",
      label: "Solid",
      detail: `${correct}/${attempts} first try (${pct}%)`,
      ...score,
    };
  }
  if (pct >= DEVELOP_PCT) {
    return {
      kind: "developing",
      label: "Needs work",
      detail: `${correct}/${attempts} first try (${pct}%)`,
      ...score,
    };
  }
  return {
    kind: "weakness",
    label: "Weakness",
    detail: `${correct}/${attempts} first try (${pct}%)`,
    ...score,
  };
}

export function addXp(state, amount) {
  const next = { ...state, xp: state.xp + amount };
  saveProgress(next);
  return next;
}

export const DISPLAY_NAME_MAX = 24;

export function normalizeDisplayName(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, DISPLAY_NAME_MAX);
}

export function chooseDisplayName(state, displayName) {
  const next = {
    ...state,
    displayName: normalizeDisplayName(displayName),
  };
  saveProgress(next);
  return next;
}

export function walkLessonKey(section, labId) {
  return `walk-${section}-${labId}`;
}

export function testLessonKey(section, labId) {
  return `test-${section}-${labId}`;
}

export function payGuidedCheck(
  setProgress,
  { preview, xpEach, ok, firstTry, topicId, paidRef, xpRef, id }
) {
  if (preview || !setProgress) return;
  const award = Boolean(ok && xpEach && id && !paidRef.current.has(id));
  if (award) {
    paidRef.current.add(id);
    xpRef.current += xpEach;
  }
  if (!award && !(firstTry && topicId)) return;
  setProgress((p) => {
    let next = p;
    if (firstTry && topicId) next = recordFirstTry(next, topicId, ok);
    if (award) next = addXp(next, xpEach);
    return next;
  });
}

export function finishGuidedLesson({
  preview,
  progress,
  setProgress,
  key,
  xpFromChecks,
  correct,
  total,
  topicName,
  difficultyName = "Walkthrough",
  kind = "walk",
  onFinished,
}) {
  const base = {
    kind,
    status: "complete",
    correct,
    total,
    topicName,
    difficultyName,
    lessonKey: key,
  };
  if (preview || !setProgress) {
    onFinished?.({
      ...base,
      xpGained: 0,
      streak: visibleStreak(progress),
      streakFrom: visibleStreak(progress),
      streakGrew: false,
    });
    return;
  }
  const alreadyDone = Boolean(progress?.completed?.includes(key));
  const bonus = alreadyDone ? 0 : XP_LESSON_BONUS;
  const grew = wouldExtendStreak(progress);
  const streakFrom = visibleStreak(progress);
  let next = progress;
  setProgress((p) => {
    next = completeLesson(p, key, XP_LESSON_BONUS);
    return next;
  });
  onFinished?.({
    ...base,
    xpGained: xpFromChecks + bonus,
    streak: visibleStreak(next),
    streakFrom,
    streakGrew: grew,
  });
}

export function completeLesson(state, key, bonus = XP_LESSON_BONUS) {
  let next = recordPractice(state);
  if (!next.completed.includes(key)) {
    next = {
      ...next,
      xp: next.xp + bonus,
      completed: [...next.completed, key],
    };
  }
  saveProgress(next);
  return next;
}

export function unlockTopicBySkip(state, topicId) {
  let next = recordPractice(state);
  const unlockedBySkip = next.unlockedBySkip.includes(topicId)
    ? next.unlockedBySkip
    : [...next.unlockedBySkip, topicId];
  next = {
    ...next,
    unlockedBySkip,
    xp: next.xp + XP_LESSON_BONUS,
  };
  saveProgress(next);
  return next;
}

/** Walkthrough-only sections complete when every walk node is done. */
const WALK_SECTION_LABS = {
  5: ["laplace-basics", "laplace-circuit", "transfer-functions"],
  6: ["poles-zeros-stability", "complex-phase"],
  7: [
    "network-function-types",
    "network-responses",
    "steady-state-response",
  ],
  8: [
    "two-port-basics",
    "y-parameters",
    "z-parameters",
    "h-abcd-parameters",
    "two-port-properties",
    "two-port-interconnections",
  ],
};

export function walkProgressKeys(topicId) {
  return (WALK_SECTION_LABS[Number(topicId)] || []).map((id) =>
    walkLessonKey(topicId, id)
  );
}

/** Quiz + bank lesson keys that count toward finishing a section. */
export function sectionProgressKeys(topicId, counts = {}, bankCounts = {}) {
  const topicKeys = hasTopicQuiz(topicId)
    ? [1, 2, 3]
        .map((d) => `${topicId}-${d}`)
        .filter((key) => (counts[key] || 0) > 0)
    : [];
  const bankKeys = QUESTION_BANKS.filter((bank) => bank.topicId === topicId)
    .flatMap((bank) =>
      [1, 2, 3]
        .map((d) => bankLessonKey(bank.id, d))
        .filter((key) => (bankCounts[key] || 0) > 0)
    );
  if (topicKeys.length || bankKeys.length) return [...topicKeys, ...bankKeys];
  return walkProgressKeys(topicId);
}

export function isSectionComplete(topicId, progress, counts = {}, bankCounts = {}) {
  const keys = sectionProgressKeys(topicId, counts, bankCounts);
  if (!keys.length) return false;
  const completed = progress.completed || [];
  return keys.every((key) => completed.includes(key));
}

export function isTopicUnlocked(
  _topicIndex,
  _progress,
  _counts = {},
  _bankCounts = {}
) {
  return true;
}

export function isLessonUnlocked(_topicId, _difficulty, _progress, _counts = {}) {
  return true;
}

export const SKIP_QUIZ_SIZE = 5;
export const SKIP_PASS_RATIO = 0.8;

export { XP_CORRECT, XP_LESSON_BONUS };

import { loadSession, isAdmin } from "./auth";
import { scoreKnowledgeCheck } from "./progress";
import {
  logKnowledgeCheckAttempt as logRemote,
  listMyKnowledgeCheckAttempts as listRemote,
} from "../supabaseClient";

function trackedEmail() {
  const session = loadSession();
  if (!session || isAdmin(session)) return "";
  const email = String(session.username || "").trim().toLowerCase();
  if (!email || email === "admin") return "";
  return email;
}

export function parseQuestionStats(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => ({
      index: Math.max(1, Number(row?.index) || 0),
      correct: Math.max(0, Number(row?.correct) || 0),
      total: Math.max(0, Number(row?.total) || 0),
    }))
    .filter((row) => row.index && row.total);
}

export function flattenLocalKnowledgeChecks(progress, topics = []) {
  const checks = progress?.knowledgeChecks || {};
  const rows = [];
  for (const topic of topics) {
    const rec = checks[String(topic.id)] || checks[topic.id];
    if (!rec || !rec.firstTotal) continue;
    const firstQuestions = parseQuestionStats(rec.firstQuestions);
    const first = scoreKnowledgeCheck(
      firstQuestions,
      rec.firstCorrect,
      rec.firstTotal
    );
    rows.push({
      topicId: Number(topic.id),
      topicName: topic.name,
      attempt: 1,
      correct: first.correct,
      total: first.total,
      questions: firstQuestions,
      at: rec.firstAt || "",
      source: "local",
    });
    const later = Array.isArray(rec.later) ? rec.later : [];
    later.forEach((item, index) => {
      const questions = parseQuestionStats(item.questions);
      const scored = scoreKnowledgeCheck(questions, item.correct, item.total);
      rows.push({
        topicId: Number(topic.id),
        topicName: topic.name,
        attempt: index + 2,
        correct: scored.correct,
        total: scored.total,
        questions,
        at: item.at || "",
        source: "local",
      });
    });
  }
  return rows;
}

function rowKey(row) {
  return `${Number(row.topicId)}|${Number(row.attempt) || 1}`;
}

function preferRow(prev, next) {
  if (!prev) return next;
  const richer =
    next.questions.length > prev.questions.length ? next : prev;
  const chosen =
    next.source === "remote" && prev.source !== "remote" ? next : richer;
  return {
    ...prev,
    ...chosen,
    topicName: prev.topicName || next.topicName,
    questions: chosen.questions.length ? chosen.questions : prev.questions,
  };
}

function withStepScore(row) {
  const scored = scoreKnowledgeCheck(row.questions, row.correct, row.total);
  return { ...row, correct: scored.correct, total: scored.total };
}

export function mergeKnowledgeCheckRows(localRows, remoteRows, topics = []) {
  const names = new Map(topics.map((topic) => [Number(topic.id), topic.name]));
  const remote = (remoteRows || []).map((row) => ({
    topicId: Number(row.topicId),
    topicName: names.get(Number(row.topicId)) || `Section ${row.topicId}`,
    attempt: Number(row.attempt) || 1,
    correct: Number(row.correct) || 0,
    total: Number(row.total) || 0,
    questions: parseQuestionStats(row.questions),
    at: row.at || "",
    source: "remote",
  }));
  const local = localRows || [];
  const topicIds = new Set(
    [...local, ...remote].map((row) => Number(row.topicId))
  );
  const out = [];
  for (const topicId of topicIds) {
    const loc = local.filter((row) => Number(row.topicId) === topicId);
    const rem = remote.filter((row) => Number(row.topicId) === topicId);
    const primary = rem.length >= loc.length && rem.length ? rem : loc;
    const secondary = primary === rem ? loc : rem;
    const map = new Map();
    for (const row of [...secondary, ...primary]) {
      map.set(rowKey(row), preferRow(map.get(rowKey(row)), row));
    }
    out.push(...[...map.values()].map(withStepScore));
  }
  return out.sort(
    (a, b) =>
      a.topicId - b.topicId ||
      a.attempt - b.attempt ||
      String(a.at).localeCompare(String(b.at))
  );
}

export async function logKnowledgeCheckAttempt({
  topicId,
  correct,
  total,
  questionStats = [],
  classId = "",
}) {
  const email = trackedEmail();
  if (!email) return false;
  try {
    return await logRemote({
      email,
      topicId,
      correct,
      total,
      questionStats: parseQuestionStats(questionStats),
      classId,
    });
  } catch {
    return false;
  }
}

export async function loadMyKnowledgeCheckAttempts(email) {
  const who = String(email || trackedEmail() || "")
    .trim()
    .toLowerCase();
  if (!who) return [];
  try {
    return await listRemote(who);
  } catch {
    return [];
  }
}

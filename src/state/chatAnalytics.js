// Frontend data layer for the tutor-usage analytics dashboard.
// Fetches the chat_logs analytics RPCs and shapes them into ready-to-render
// structures for src/components/TutorUsage.jsx. All reads are admin-only
// (called only from the Admin screen).

import {
  chatUsageSummaryRemote,
  listChatTopicTallyRemote,
  listChatDailyRemote,
  listChatByStudentRemote,
} from "../supabaseClient";
import { orderedTopicNames, UNCATEGORIZED } from "../data/chatTopics";

// Fetch everything the dashboard needs in parallel and shape it.
// Returns:
//   {
//     summary:    { totalQueries, uniqueStudents, totalSessions, answered, unanswered, adoptionPct? },
//     topics:     [{ topic, queries, answered, unanswered }]  (all registered topics, incl. zero),
//     daily:      [{ day, queries, students }],
//     students:   [{ email, queries, sessions, lastUsed }],
//     answeredSplit: [{ name: "Answered", value }, { name: "Not in material", value }],
//   }
// `totalStudentsForAdoption` (optional) lets the caller compute an adoption %
// against the roster size.
export async function loadChatAnalytics(totalStudentsForAdoption = 0) {
  const [summaryRow, tallyRows, dailyRows, studentRows] = await Promise.all([
    chatUsageSummaryRemote().catch(() => null),
    listChatTopicTallyRemote().catch(() => []),
    listChatDailyRemote().catch(() => []),
    listChatByStudentRemote().catch(() => []),
  ]);

  // --- Summary (big-number cards) ---
  const totalQueries = Number(summaryRow?.total_queries || 0);
  const uniqueStudents = Number(summaryRow?.unique_students || 0);
  const totalSessions = Number(summaryRow?.total_sessions || 0);
  const answered = Number(summaryRow?.answered || 0);
  const unanswered = Number(summaryRow?.unanswered || 0);
  const avgPerSession = totalSessions > 0 ? totalQueries / totalSessions : 0;
  const adoptionPct =
    totalStudentsForAdoption > 0
      ? Math.round((uniqueStudents / totalStudentsForAdoption) * 100)
      : null;

  const summary = {
    totalQueries,
    uniqueStudents,
    totalSessions,
    answered,
    unanswered,
    avgPerSession,
    adoptionPct,
  };

  // --- Topic tally (bar chart) ---
  // Start from the full registered topic list so topics with zero queries still
  // appear. Then overlay actual counts from the RPC.
  const byTopic = new Map();
  for (const name of orderedTopicNames()) {
    byTopic.set(name, { topic: name, queries: 0, answered: 0, unanswered: 0 });
  }
  for (const row of tallyRows) {
    const name = row?.topic || UNCATEGORIZED;
    if (!byTopic.has(name)) {
      byTopic.set(name, { topic: name, queries: 0, answered: 0, unanswered: 0 });
    }
    const t = byTopic.get(name);
    t.queries = Number(row.queries || 0);
    t.answered = Number(row.answered || 0);
    t.unanswered = Number(row.unanswered || 0);
  }
  const topics = [...byTopic.values()];

  // --- Daily usage (area chart) ---
  const daily = (dailyRows || []).map((r) => ({
    day: String(r.day || "").slice(0, 10),
    queries: Number(r.queries || 0),
    students: Number(r.students || 0),
  }));

  // --- Per-student table ---
  const students = (studentRows || []).map((r) => ({
    email: r.email || "",
    queries: Number(r.queries || 0),
    sessions: Number(r.sessions || 0),
    lastUsed: r.last_used_sgt || null,
  }));

  // --- Answered vs not (donut) ---
  const answeredSplit = [
    { name: "Answered", value: answered },
    { name: "Not in material", value: unanswered },
  ];

  // --- Content gaps: topics with the most unanswered queries, worst first ---
  const gaps = topics
    .filter((t) => t.unanswered > 0)
    .sort((a, b) => b.unanswered - a.unanswered);

  return { summary, topics, daily, students, answeredSplit, gaps };
}

import { useEffect, useMemo, useState } from "react";
import { TOPICS, DIFFICULTIES, lessonKey } from "../data/topics";
import { topicInsight, saveProgress, sectionProgressKeys } from "../state/progress";
import {
  listStudents,
  saveStudentRecord,
  studentToProgress,
  addStudent,
} from "../state/roster";
import TopicInsight from "../components/TopicInsight";
import ProgressPage from "./Progress";
import { CLASS_IDS, DEFAULT_CLASS, isPartTimeClass } from "../data/classes";
import { trophyFromIndex } from "../data/trophies";
import { syncLeagueSeason } from "../state/league";
import { summarizeWalkFeedback, WALK_TITLES } from "../data/walkTitles";
import { topicsWithQuestions, unitsForTopic, unitPillText } from "../data/topicUnits";
import { useRemoteRosterTick } from "../hooks/useRemoteRosterTick";
import {
  listQuestionReports,
  resolveQuestionReport,
  reasonLabel,
} from "../state/questionReports";
import { listModuleAttempts } from "../supabaseClient";
import {
  moduleTitle,
  MODULE_ANALYTICS_REPORTS,
  downloadModuleAnalyticsCsv,
} from "../state/moduleAttemptsExport";

function lessonKeysForCounts(counts, bankCounts = {}) {
  const keys = [];
  for (const topic of TOPICS) {
    keys.push(...sectionProgressKeys(topic.id, counts, bankCounts));
  }
  for (const walk of WALK_TITLES) {
    if (walk.key === "walk-lab-dc") continue;
    if (!keys.includes(walk.key)) keys.push(walk.key);
  }
  return keys;
}

function studentSummary(student, counts, leagues, bankCounts = {}) {
  const preview = studentToProgress(student);
  const insights = TOPICS.map((topic) => ({
    topic,
    insight: topicInsight(preview, topic.id),
  }));
  const ranked = insights.filter((row) => row.insight.attempts >= 3);
  const weakest = ranked.reduce(
    (worst, row) =>
      !worst || row.insight.pct < worst.insight.pct ? row : worst,
    null
  );
  const strongest = ranked.reduce(
    (best, row) =>
      !best || row.insight.pct > best.insight.pct ? row : best,
    null
  );
  const keys = lessonKeysForCounts(counts, bankCounts);
  const completed = student.completed || [];
  const done = keys.filter((key) => completed.includes(key)).length;
  return {
    league: trophyFromIndex(
      leagues?.[student.username] ?? student.leagueIndex ?? 0
    ).current,
    done,
    total: keys.length,
    weakest,
    strongest,
    preview,
  };
}

export default function Admin({ progress, setProgress, counts, bankCounts = {} }) {
  const rosterEpoch = useRemoteRosterTick();
  const [added, setAdded] = useState(0);
  const students = useMemo(
    () => listStudents(progress, { includeExtras: true }),
    [progress, added, rosterEpoch]
  );
  const leagues = useMemo(
    () => syncLeagueSeason(progress).state.leagueIndex,
    [progress, added, rosterEpoch]
  );
  const [selected, setSelected] = useState(students[0]?.username || "live");
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState(DEFAULT_CLASS);
  const [addError, setAddError] = useState("");
  const student =
    students.find((row) => row.username === selected) || students[0];

  function handleAdd(event) {
    event.preventDefault();
    const result = addStudent(newName, newClass);
    if (!result.ok) {
      setAddError(result.error);
      return;
    }
    setAddError("");
    setNewName("");
    setAdded((n) => n + 1);
    setSelected(result.student.username);
  }

  return (
    <div className="page admin-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Staff</p>
          <h1>Students</h1>
        </div>
      </header>
      <p className="login-hint">
        Class overview, then pick a student to view progress or adjust XP,
        streak, lessons, and first-try stats. This device is the live learner
        on this browser. Walkthrough thumbs from this device show under
        Walkthrough feedback. Names you add here are local until the class
        roster comes from the database.
      </p>
      <form className="admin-add" onSubmit={handleAdd}>
        <label>
          New student name
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Jordan"
            maxLength={32}
          />
        </label>
        <label>
          Class
          <select
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
          >
            {CLASS_IDS.map((id) => (
              <option key={id} value={id}>
                {isPartTimeClass(id) ? "EEPT (part-time)" : id}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="primary">
          Add student
        </button>
        {addError ? <p className="login-hint">{addError}</p> : null}
      </form>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>XP</th>
              <th>League</th>
              <th>Streak</th>
              <th>Lessons</th>
              <th>Focus</th>
            </tr>
          </thead>
          <tbody>
            {students.map((row) => {
              const sum = studentSummary(row, counts, leagues, bankCounts);
              return (
                <tr
                  key={row.username}
                  className={row.username === student?.username ? "on" : ""}
                >
                  <td>
                    <button
                      type="button"
                      className="admin-name-btn"
                      onClick={() => setSelected(row.username)}
                    >
                      {row.display}
                      {row.live ? " · live" : row.custom ? " · added" : ""}
                    </button>
                  </td>
                  <td>{row.classId}</td>
                  <td>{row.xp}</td>
                  <td>
                    <span
                      className="trophy-badge compact"
                      data-tier={sum.league.id}
                    >
                      <span className="trophy-gem" aria-hidden="true">
                        ◆
                      </span>
                      {sum.league.name}
                    </span>
                  </td>
                  <td>🔥 {row.streak}d</td>
                  <td>
                    {sum.done}/{sum.total}
                  </td>
                  <td>
                    {sum.weakest
                      ? `${sum.weakest.topic.name} (${sum.weakest.insight.pct}%)`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <WalkFeedbackTable students={students} />
      <ModuleAnalyticsTable />
      <QuestionReportsTable />
      {student ? (
        <StudentEditor
          key={student.username}
          student={student}
          counts={counts}
          bankCounts={bankCounts}
          onSave={(edits) => {
            const nextLive = saveStudentRecord(
              student.username,
              edits,
              progress
            );
            if (student.live) saveProgress(nextLive);
            setProgress({ ...nextLive });
            setAdded((n) => n + 1);
          }}
        />
      ) : null}
    </div>
  );
}

function QuestionReportsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [busyId, setBusyId] = useState(null);

  function reload(active = { current: true }) {
    setLoading(true);
    listQuestionReports()
      .then((data) => {
        if (active.current !== false) setRows(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (active.current !== false) setLoading(false);
      });
  }

  useEffect(() => {
    const active = { current: true };
    reload(active);
    return () => {
      active.current = false;
    };
  }, []);

  async function toggleResolved(row) {
    setBusyId(row.id);
    const ok = await resolveQuestionReport(row.id, !row.resolved);
    if (ok) {
      // Update locally so the change shows immediately.
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, resolved: !row.resolved } : r
        )
      );
    }
    setBusyId(null);
  }

  const openCount = rows.filter((r) => !r.resolved).length;
  const visible = showResolved ? rows : rows.filter((r) => !r.resolved);

  return (
    <section className="admin-walk-feedback">
      <h2>Question reports</h2>
      <p className="login-hint">
        Reports submitted by students across all devices. {openCount} open.
        Mark a report resolved once you have fixed the question.
      </p>
      <label className="login-hint" style={{ display: "inline-block", marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={showResolved}
          onChange={(e) => setShowResolved(e.target.checked)}
        />{" "}
        Show resolved reports
      </label>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Question</th>
              <th>Reason</th>
              <th>Details</th>
              <th>From</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((row) => (
                <tr key={row.id} className={row.resolved ? "report-resolved" : ""}>
                  <td>{String(row.at || "").replace("T", " ").slice(0, 16)}</td>
                  <td>
                    <code>{row.questionId}</code>
                    {row.questionText ? (
                      <>
                        <br />
                        <span className="login-hint">
                          {row.questionText.slice(0, 80)}
                          {row.questionText.length > 80 ? "…" : ""}
                        </span>
                      </>
                    ) : null}
                  </td>
                  <td>{reasonLabel(row.reason)}</td>
                  <td>{row.note || "—"}</td>
                  <td>
                    {row.reporter?.includes("@")
                      ? row.reporter.split("@")[0]
                      : row.reporter || "—"}
                  </td>
                  <td>{row.resolved ? "Resolved" : "Open"}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-name-btn"
                      disabled={busyId === row.id}
                      onClick={() => toggleResolved(row)}
                    >
                      {busyId === row.id
                        ? "…"
                        : row.resolved
                          ? "Reopen"
                          : "Resolve"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  {loading
                    ? "Loading reports…"
                    : showResolved
                      ? "No question reports yet."
                      : "No open reports. 🎉"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const DIFFICULTY_NAMES = { 1: "Easy", 2: "Average", 3: "Challenging" };

// Roll up raw attempt rows into the numbers the two features report.
// Mirrors the logic in moduleAttemptsExport.js so the on-screen tables
// and the CSV downloads always agree.
function rollupModuleAttempts(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const byModule = new Map();
  const byModuleDiff = new Map();

  for (const r of list) {
    const moduleId = String(r.moduleId || "");
    const difficulty = Math.max(1, Math.min(3, Math.round(Number(r.difficulty) || 1)));
    const email = String(r.email || "").trim().toLowerCase();
    const done = Boolean(r.completed ?? r.completedAt);
    if (!moduleId || !email) continue;

    let m = byModule.get(moduleId);
    if (!m) {
      m = { attempts: 0, students: new Set(), completedStudents: new Set(), completedAttempts: 0 };
      byModule.set(moduleId, m);
    }
    m.attempts += 1;
    m.students.add(email);
    if (done) {
      m.completedStudents.add(email);
      m.completedAttempts += 1;
    }

    const dKey = `${moduleId}|${difficulty}`;
    let d = byModuleDiff.get(dKey);
    if (!d) {
      d = { moduleId, difficulty, attempts: 0, students: new Set(), completedStudents: new Set(), completedAttempts: 0 };
      byModuleDiff.set(dKey, d);
    }
    d.attempts += 1;
    d.students.add(email);
    if (done) {
      d.completedStudents.add(email);
      d.completedAttempts += 1;
    }
  }

  const perModule = [...byModule.entries()]
    .map(([moduleId, m]) => ({
      moduleId,
      title: moduleTitle(moduleId),
      attempts: m.attempts,
      students: m.students.size,
      repeats: Math.max(m.attempts - m.students.size, 0),
      studentsCompleted: m.completedStudents.size,
      completedAttempts: m.completedAttempts,
    }))
    .sort((a, b) => b.attempts - a.attempts || a.title.localeCompare(b.title));

  const perModuleDiff = [...byModuleDiff.values()]
    .map((d) => ({
      moduleId: d.moduleId,
      title: moduleTitle(d.moduleId),
      difficulty: d.difficulty,
      attempts: d.attempts,
      students: d.students.size,
      repeats: Math.max(d.attempts - d.students.size, 0),
      studentsCompleted: d.completedStudents.size,
      completedAttempts: d.completedAttempts,
    }))
    .sort(
      (a, b) =>
        a.title.localeCompare(b.title) || a.difficulty - b.difficulty
    );

  return { perModule, perModuleDiff, totalAttempts: list.length };
}

function ModuleAnalyticsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [splitByDifficulty, setSplitByDifficulty] = useState(false);
  const [busy, setBusy] = useState("");

  function reload(active = { current: true }) {
    setLoading(true);
    setError("");
    listModuleAttempts()
      .then((data) => {
        if (active.current !== false) setRows(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active.current !== false) {
          setError(
            "Couldn't load module attempts. Make sure module_attempts.sql has been run in Supabase."
          );
        }
      })
      .finally(() => {
        if (active.current !== false) setLoading(false);
      });
  }

  useEffect(() => {
    const active = { current: true };
    reload(active);
    return () => {
      active.current = false;
    };
  }, []);

  const { perModule, perModuleDiff, totalAttempts } = useMemo(
    () => rollupModuleAttempts(rows),
    [rows]
  );

  async function download(reportId) {
    setBusy(reportId);
    try {
      await downloadModuleAnalyticsCsv(reportId);
    } catch {
      setError("Download failed.");
    } finally {
      setBusy("");
    }
  }

  const showDiff = splitByDifficulty;

  return (
    <section className="admin-walk-feedback">
      <h2>Module analytics</h2>
      <p className="login-hint">
        Per-attempt tracking of question-bank modules across all students.
        A <strong>repeat</strong> is any attempt after a student's first go at a
        module (completed or abandoned). A <strong>completion</strong> means a
        student answered every question in the module at least once.{" "}
        {totalAttempts} attempt{totalAttempts === 1 ? "" : "s"} logged.
      </p>
      <label
        className="login-hint"
        style={{ display: "inline-block", marginBottom: 8 }}
      >
        <input
          type="checkbox"
          checked={splitByDifficulty}
          onChange={(e) => setSplitByDifficulty(e.target.checked)}
        />{" "}
        Split by difficulty
      </label>

      {error ? <p className="login-hint">{error}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Module</th>
              {showDiff ? <th>Difficulty</th> : null}
              <th>Total attempts</th>
              <th>Students</th>
              <th>Repeat attempts</th>
              <th>Students completed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={showDiff ? 6 : 5}>Loading module attempts…</td>
              </tr>
            ) : (showDiff ? perModuleDiff : perModule).length ? (
              (showDiff ? perModuleDiff : perModule).map((row) => (
                <tr key={showDiff ? `${row.moduleId}-${row.difficulty}` : row.moduleId}>
                  <td>{row.title}</td>
                  {showDiff ? (
                    <td>{DIFFICULTY_NAMES[row.difficulty] || row.difficulty}</td>
                  ) : null}
                  <td>{row.attempts}</td>
                  <td>{row.students}</td>
                  <td>{row.repeats}</td>
                  <td>{row.studentsCompleted}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showDiff ? 6 : 5}>
                  No module attempts logged yet. Play a question bank as a
                  student to see data here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="login-hint" style={{ marginTop: 12 }}>
        Download detailed CSVs:
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.entries(MODULE_ANALYTICS_REPORTS).map(([id, report]) => (
          <button
            key={id}
            type="button"
            className="admin-name-btn"
            disabled={busy === id || loading}
            onClick={() => download(id)}
          >
            {busy === id ? "…" : report.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function WalkFeedbackTable({ students }) {
  const rows = useMemo(() => summarizeWalkFeedback(students), [students]);
  const voted = rows.filter((row) => row.up + row.down > 0);
  const up = voted.reduce((sum, row) => sum + row.up, 0);
  const down = voted.reduce((sum, row) => sum + row.down, 0);
  return (
    <section className="admin-walk-feedback">
      <h2>Walkthrough feedback</h2>
      <p className="login-hint">
        Thumbs from this device's live learner. Other roster names do not vote
        here.
      </p>
      <p className="login-hint">
        {up} thumbs up · {down} thumbs down
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Walkthrough</th>
              <th>👍</th>
              <th>👎</th>
              <th>From</th>
            </tr>
          </thead>
          <tbody>
            {voted.length ? (
              voted.map((row) => (
                <tr key={row.key}>
                  <td>
                    {row.section ? `Section ${row.section} · ` : ""}
                    {row.title}
                  </td>
                  <td>{row.up}</td>
                  <td>{row.down}</td>
                  <td>
                    {row.voters
                      .map((who) => `${who.name} ${who.vote === "up" ? "👍" : "👎"}`)
                      .join(", ")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  No thumbs yet. Finish a walkthrough on this device and tap
                  thumbs up or thumbs down.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StudentEditor({ student, counts, bankCounts = {}, onSave }) {
  const [tab, setTab] = useState("progress");
  const [classId, setClassId] = useState(
    student.classId || DEFAULT_CLASS
  );
  const [xp, setXp] = useState(student.xp);
  const [streak, setStreak] = useState(student.streak);
  const [completed, setCompleted] = useState(() => [
    ...(student.completed || []),
  ]);
  const [stats, setStats] = useState(() => {
    const next = {};
    for (const topic of TOPICS) {
      const cur = student.topicStats?.[topic.id] ||
        student.topicStats?.[String(topic.id)] || {
          correct: 0,
          attempts: 0,
        };
      next[topic.id] = {
        correct: Number(cur.correct) || 0,
        attempts: Number(cur.attempts) || 0,
      };
    }
    return next;
  });
  const [saved, setSaved] = useState(false);

  const preview = useMemo(
    () =>
      studentToProgress({
        ...student,
        xp,
        streak,
        topicStats: stats,
        completed,
      }),
    [student, xp, streak, stats, completed]
  );

  useEffect(() => {
    setSaved(false);
  }, [xp, streak, stats, completed, classId]);

  function updateStat(topicId, field, value) {
    const n = Math.max(0, Number(value) || 0);
    setStats((prev) => {
      const row = { ...prev[topicId], [field]: n };
      if (field === "attempts") row.correct = Math.min(row.correct, n);
      if (field === "correct") row.attempts = Math.max(row.attempts, n);
      return { ...prev, [topicId]: row };
    });
  }

  function toggleLesson(key) {
    setCompleted((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  function save() {
    onSave({ xp, streak, topicStats: stats, completed, classId });
    setSaved(true);
  }

  return (
    <div className="admin-detail">
      <div className="admin-detail-head">
        <div>
          <p className="eyebrow">{student.live ? "Live device" : "Demo"}</p>
          <h2>{student.display}</h2>
        </div>
        <div className="board-tabs" role="tablist" aria-label="Student tools">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "progress"}
            className={tab === "progress" ? "on" : ""}
            onClick={() => setTab("progress")}
          >
            Progress
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "adjust"}
            className={tab === "adjust" ? "on" : ""}
            onClick={() => setTab("adjust")}
          >
            Adjust
          </button>
        </div>
      </div>

      {tab === "progress" ? (
        <div className="admin-progress">
          <ProgressPage
            topics={TOPICS}
            progress={preview}
            counts={counts}
            bankCounts={bankCounts}
            eyebrow="Student progress"
            title={student.display}
          />
        </div>
      ) : (
        <form
          className="admin-edit"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <p className="login-hint">
            Edit numbers, then save. Lesson ticks mark completed difficulties.
          </p>
          <div className="admin-fields">
            <label>
              Class
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                {CLASS_IDS.map((id) => (
                  <option key={id} value={id}>
                    {isPartTimeClass(id) ? "EEPT (part-time)" : id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              XP
              <input
                type="number"
                min="0"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
              />
            </label>
            <label>
              Streak (days)
              <input
                type="number"
                min="0"
                value={streak}
                onChange={(e) => setStreak(e.target.value)}
              />
            </label>
          </div>
          <h3>Lessons completed</h3>
          <ol className="admin-topics">
            {topicsWithQuestions(TOPICS, counts, bankCounts).map((topic) => (
              <li key={topic.id} className="admin-topic">
                <strong>{topic.name}</strong>
                <div className="admin-lessons">
                  {unitsForTopic(topic.id, counts, bankCounts).map((unit) => {
                    const on = completed.includes(unit.key);
                    return (
                      <label
                        key={unit.key}
                        className={`admin-lesson ${on ? "on" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleLesson(unit.key)}
                        />
                        {unitPillText(unit, on)}
                      </label>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
          <h3>First-try accuracy</h3>
          <ol className="admin-topics">
            {topicsWithQuestions(TOPICS, counts, bankCounts).map((topic) => {
              const insight = topicInsight(preview, topic.id);
              const row = stats[topic.id];
              return (
                <li key={topic.id} className="admin-topic">
                  <div className="profile-topic-head">
                    <strong>{topic.name}</strong>
                    <TopicInsight insight={insight} compact />
                  </div>
                  <div className="admin-fields">
                    <label>
                      First-try correct
                      <input
                        type="number"
                        min="0"
                        value={row.correct}
                        onChange={(e) =>
                          updateStat(topic.id, "correct", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      First-try attempts
                      <input
                        type="number"
                        min="0"
                        value={row.attempts}
                        onChange={(e) =>
                          updateStat(topic.id, "attempts", e.target.value)
                        }
                      />
                    </label>
                  </div>
                </li>
              );
            })}
          </ol>
          <button type="submit" className="primary">
            Save changes
          </button>
          {saved ? <p className="login-hint">Saved.</p> : null}
        </form>
      )}
    </div>
  );
}

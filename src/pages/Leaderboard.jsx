import { useEffect, useState } from "react";
import {
  buildClassLeaderboard,
  buildCohortLeaderboard,
  buildIndividualLeaderboard,
  studentClassId,
} from "../data/leaderboard";
import { CLASS_IDS, DEFAULT_CLASS, isPartTimeClass } from "../data/classes";
import { avatarSrc, isDefaultAvatar } from "../data/avatars";
import { isAdmin } from "../state/auth";
import { useRemoteRosterTick } from "../hooks/useRemoteRosterTick";
import {
  subscribeLeaderboardPeriod,
  nextResetAt,
} from "../state/leaderboardPeriod";

// Format "time left until the weekly reset", e.g. "3d 4h left".
function formatCountdown(ms) {
  const v = Math.max(0, ms);
  const d = Math.floor(v / 86400000);
  const h = Math.floor((v % 86400000) / 3600000);
  const m = Math.floor((v % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

// Weekly/Lifetime toggle + the reset countdown (shown in weekly mode).
function ModeToggle({ mode, setMode, resetAt }) {
  const [, tick] = useState(0);
  // Re-render once a minute so the countdown stays current.
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="board-mode">
      <div className="board-mode-switch" role="group" aria-label="Ranking period">
        <button
          type="button"
          className={mode === "weekly" ? "on" : ""}
          onClick={() => setMode("weekly")}
        >
          Weekly
        </button>
        <button
          type="button"
          className={mode === "lifetime" ? "on" : ""}
          onClick={() => setMode("lifetime")}
        >
          Lifetime
        </button>
      </div>
      {mode === "weekly" && resetAt > 0 ? (
        <span className="board-reset">
          Resets in {formatCountdown(resetAt - Date.now())}
        </span>
      ) : null}
    </div>
  );
}

function StudentRows({ rows, mode }) {
  return (
    <ol className="board">
      {rows.map((row) => {
        const days = Number(row.streak) || 0;
        return (
          <li
            key={row.username}
            className={`board-row ${row.isYou ? "you" : ""}`}
          >
            <span className="board-rank">{row.rank}</span>
            <img
              className={`board-avatar${
                isDefaultAvatar(row.avatarUrl) ? " is-default" : ""
              }`}
              src={avatarSrc(row.avatarUrl)}
              alt=""
              aria-hidden="true"
              width={32}
              height={32}
            />
            <span className="board-name">
              {row.display}
              {row.isYou ? " (you)" : ""}
              <span className="class-chip">{row.classId}</span>
              <span
                className="trophy-badge compact"
                data-tier={row.league.id}
              >
                <span className="trophy-gem" aria-hidden="true">
                  ◆
                </span>
                {row.league.name}
              </span>
            </span>
            <span className="board-xp">
              {mode === "weekly" ? row.weeklyXp : row.xp} XP
              {mode === "weekly" ? " this week" : ""}
            </span>
            <span
              className={`streak-chip board-streak ${days > 0 ? "hot" : ""}`}
              title="Days practiced in a row"
            >
              <span aria-hidden="true">🔥</span>
              {days} day{days === 1 ? "" : "s"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function Leaderboard({ user, progress, mode = "class" }) {
  useRemoteRosterTick();
  const yourClass = studentClassId(user, progress);
  const [classId, setClassId] = useState(yourClass || DEFAULT_CLASS);
  // Ranking period: weekly (this period's XP) or lifetime (total XP).
  // Defaults to weekly.
  const [rankMode, setRankMode] = useState("weekly");
  // Re-render when the weekly period data arrives/updates.
  const [, periodTick] = useState(0);
  useEffect(
    () => subscribeLeaderboardPeriod(() => periodTick((n) => n + 1)),
    []
  );
  const resetAt = nextResetAt();
  const admin = isAdmin(user);
  const focusClass = admin ? classId : yourClass || DEFAULT_CLASS;
  const classBoard = buildClassLeaderboard(user, progress, focusClass, rankMode);
  const cohort = buildCohortLeaderboard(user, progress, rankMode);
  const individuals = buildIndividualLeaderboard(user, progress, rankMode);
  const cohortMode = mode === "cohort";
  const individualMode = mode === "individual";
  const xpLabel = rankMode === "weekly" ? "XP this week" : "total XP";

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            {cohortMode
              ? "EE01–EE22 · EEPT"
              : individualMode
                ? "All classes"
                : classBoard.classId}
          </p>
          <h1>
            {cohortMode
              ? "Cohort leaderboard"
              : individualMode
                ? "Individual leaderboard"
                : "Class leaderboard"}
          </h1>
        </div>
      </header>
      <ModeToggle mode={rankMode} setMode={setRankMode} resetAt={resetAt} />
      {cohortMode ? (
        <>
          <p className="login-hint">
            Classes ranked by {xpLabel}. Classmates will show here once they are
            in Circuito.
            {admin
              ? " Staff are not in a class."
              : cohort.youRank
                ? ` You are in ${cohort.yourClass}, currently #${cohort.youRank}.`
                : ` You are in ${cohort.yourClass}.`}
          </p>
          <ol className="board">
            {cohort.rows.map((row) => (
              <li
                key={row.classId}
                className={`board-row cohort-row ${row.you ? "you" : ""}`}
              >
                <span className="board-rank">{row.rank}</span>
                <span className="board-name">
                  {row.classId}
                  {row.you ? " (your class)" : ""}
                </span>
                <span className="board-xp">{row.members} students</span>
                <span className="board-xp">
                  {row.xp} XP{rankMode === "weekly" ? " this week" : ""}
                </span>
                <span className="login-hint">avg {row.avg}</span>
              </li>
            ))}
          </ol>
        </>
      ) : individualMode ? (
        <>
          <p className="login-hint">
            Top 10 students in the cohort by {xpLabel}. Classmates appear as they
            join Circuito.
            {admin
              ? ""
              : individuals.youRank
                ? ` You are #${individuals.youRank} of ${individuals.total}.`
                : individuals.total
                  ? ` ${individuals.total} students.`
                  : ""}
          </p>
          {individuals.top.length ? (
            <StudentRows rows={individuals.top} mode={rankMode} />
          ) : (
            <p className="login-hint">No students on this board yet.</p>
          )}
          {individuals.you && !individuals.youInTop ? (
            <>
              <p className="board-cut">Your place in the cohort</p>
              <StudentRows rows={[individuals.you]} mode={rankMode} />
            </>
          ) : null}
        </>
      ) : (
        <>
          <p className="login-hint">
            Students in {classBoard.classId}, ranked by {xpLabel}.
            {classBoard.youRank
              ? ` You are #${classBoard.youRank} of ${classBoard.total}.`
              : classBoard.total
                ? ` ${classBoard.total} student${classBoard.total === 1 ? "" : "s"}.`
                : admin
                  ? " Staff are not in a class."
                  : " Classmates will show here once they are in Circuito."}
          </p>
          {admin ? (
            <label className="class-picker">
              View class
              <select
                value={focusClass}
                onChange={(e) => setClassId(e.target.value)}
              >
                {CLASS_IDS.map((id) => (
                  <option key={id} value={id}>
                    {isPartTimeClass(id) ? "EEPT (part-time)" : id}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {classBoard.rows.length ? (
            <StudentRows rows={classBoard.rows} mode={rankMode} />
          ) : (
            <p className="login-hint">No students in this class yet.</p>
          )}
        </>
      )}
    </div>
  );
}

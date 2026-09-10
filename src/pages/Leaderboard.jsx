import { useState } from "react";
import {
  buildClassLeaderboard,
  buildCohortLeaderboard,
  buildIndividualLeaderboard,
  studentClassId,
} from "../data/leaderboard";
import { CLASS_IDS, DEFAULT_CLASS, isPartTimeClass } from "../data/classes";
import { isAdmin } from "../state/auth";

function StudentRows({ rows }) {
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
            <span className="board-xp">{row.xp} XP</span>
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
  const yourClass = studentClassId(user, progress);
  const [classId, setClassId] = useState(yourClass || DEFAULT_CLASS);
  const admin = isAdmin(user);
  const focusClass = admin ? classId : yourClass || DEFAULT_CLASS;
  const classBoard = buildClassLeaderboard(user, progress, focusClass);
  const cohort = buildCohortLeaderboard(user, progress);
  const individuals = buildIndividualLeaderboard(user, progress);
  const cohortMode = mode === "cohort";
  const individualMode = mode === "individual";

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
      {cohortMode ? (
        <>
          <p className="login-hint">
            Classes ranked by total XP. Classmates will show here once they are
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
                <span className="board-xp">{row.xp} XP</span>
                <span className="login-hint">avg {row.avg}</span>
              </li>
            ))}
          </ol>
        </>
      ) : individualMode ? (
        <>
          <p className="login-hint">
            Top 10 students in the cohort by total XP. Classmates appear as they
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
            <StudentRows rows={individuals.top} />
          ) : (
            <p className="login-hint">No students on this board yet.</p>
          )}
          {individuals.you && !individuals.youInTop ? (
            <>
              <p className="board-cut">Your place in the cohort</p>
              <StudentRows rows={[individuals.you]} />
            </>
          ) : null}
        </>
      ) : (
        <>
          <p className="login-hint">
            Students in {classBoard.classId}, ranked by total XP.
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
            <StudentRows rows={classBoard.rows} />
          ) : (
            <p className="login-hint">No students in this class yet.</p>
          )}
        </>
      )}
    </div>
  );
}

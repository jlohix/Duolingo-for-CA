import { useCallback, useMemo, useState } from "react";
import ThemeSwitch from "../components/ThemeSwitch";
import StreakCelebrate from "../components/StreakCelebrate";
import WalkRating from "../components/WalkRating";
import { knowledgeCheckPercent } from "../state/progress";

export default function Results({
  summary,
  onHome,
  progress,
  setProgress,
  userEmail = "",
  displayName = "",
}) {
  const skip = summary.kind === "skip";
  const kcheck = summary.kind === "kcheck";
  const failedSkip = skip && !summary.passed;
  const title = skip
    ? failedSkip
      ? "Not enough to skip"
      : "Topic unlocked"
    : kcheck
      ? "Knowledge check"
      : summary.kind === "walk"
        ? "Walkthrough completed"
        : summary.kind === "lab"
          ? "Lab complete"
          : "Lesson complete";
  const showStreak = Boolean(summary.streakGrew);
  const finalStreak = summary.streak ?? 0;
  const [streakShown, setStreakShown] = useState(
    showStreak ? summary.streakFrom ?? 0 : finalStreak
  );
  const onTick = useCallback((value) => setStreakShown(value), []);
  const askRating = summary.kind === "walk" || summary.kind === "lab";
  const lessonKey = summary.lessonKey || summary.topicName;
  const questionStats = Array.isArray(summary.questionStats)
    ? summary.questionStats
    : [];
  const kcheckPct = kcheck
    ? knowledgeCheckPercent(summary.correct, summary.total)
    : 0;
  const firstPct = kcheck
    ? knowledgeCheckPercent(summary.firstCorrect, summary.firstTotal)
    : 0;

  // Completion timestamp (captured when this page renders), shown in SGT for
  // the verification footer. useMemo so it stays fixed while the page is open.
  const completedAt = useMemo(
    () =>
      new Date().toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    []
  );

  return (
    <div className="page results">
      <header className="topbar">
        <h1>{title}</h1>
        <ThemeSwitch />
      </header>
      <p>
        {summary.topicName}
        {summary.difficultyName ? ` · ${summary.difficultyName}` : ""}
      </p>
      {skip ? (
        <p className="skip-result">
          {failedSkip
            ? `You need ${summary.needed}/${summary.total} first try. A second miss ends the skip. Try the lessons, then skip again.`
            : `You scored ${summary.correct}/${summary.total}. This topic is open.`}
        </p>
      ) : null}
      {kcheck ? (
        <p className="skip-result">
          {summary.preview
            ? `Staff preview: ${kcheckPct}% (${summary.correct} of ${summary.total} first-try steps). This was not saved.`
            : summary.firstAttempt
              ? `First check: ${kcheckPct}% — ${summary.correct} of ${summary.total} first-try steps. You can retake it any time — later scores are tracked separately.`
              : `This attempt: ${kcheckPct}% (${summary.correct} of ${summary.total} first-try steps). First check was ${firstPct}%.`}
        </p>
      ) : null}
      {showStreak ? (
        <StreakCelebrate
          from={summary.streakFrom}
          to={summary.streak}
          onTick={onTick}
        />
      ) : null}
      <ul className="stats">
        <li>
          <strong>{kcheck ? `${kcheckPct}%` : summary.correct}</strong>
          <span>{kcheck ? "score" : "correct"}</span>
        </li>
        {kcheck ? (
          <li>
            <strong>
              {summary.correct}/{summary.total}
            </strong>
            <span>first-try steps</span>
          </li>
        ) : null}
        {kcheck ? null : (
        <li>
          <strong>+{summary.xpGained}</strong>
          <span>XP</span>
        </li>
        )}
        <li className={showStreak ? "streak-stat" : ""}>
          <strong>{showStreak ? streakShown : finalStreak}</strong>
          <span>day streak</span>
        </li>
      </ul>
      {kcheck && questionStats.length ? (
        <>
          <p className="skip-result">First try on each question’s steps</p>
        <ul className="stats kcheck-breakdown">
          {questionStats.map((row) => (
            <li
              key={row.index}
              className={row.correct === row.total ? "done" : ""}
            >
              <strong>
                {row.correct}/{row.total}
              </strong>
              <span>
                Question {row.index}
                {row.total
                  ? ` · ${knowledgeCheckPercent(row.correct, row.total)}%`
                  : ""}
              </span>
            </li>
          ))}
        </ul>
        </>
      ) : null}
      {askRating ? (
        <WalkRating
          lessonKey={lessonKey}
          progress={progress}
          setProgress={setProgress}
        />
      ) : null}
      <button type="button" className="primary" onClick={onHome}>
        Back to path
      </button>
      {userEmail ? (
        <div className="results-identity" aria-label="Account for verification">
          {displayName ? <span>{displayName}</span> : null}
          <span>{userEmail}</span>
          <span>{completedAt} SGT</span>
        </div>
      ) : null}
    </div>
  );
}

import { useCallback, useMemo, useState } from "react";
import ThemeSwitch from "../components/ThemeSwitch";
import StreakCelebrate from "../components/StreakCelebrate";
import WalkRating from "../components/WalkRating";
import { knowledgeCheckPercent } from "../state/progress";
import BrainScorecard from "../components/BrainScorecard";
import BrainReport from "../components/BrainReport";
import { BRAIN_REMARK_BANDS } from "../data/brainVerdict";

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
  const brain = summary.kind === "brain";
  const [remarkBand, setRemarkBand] = useState("run");
  const remarkMarks =
    remarkBand === "run"
      ? summary.correct
      : BRAIN_REMARK_BANDS.find((band) => band.id === remarkBand)?.marks ??
        summary.correct;
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
          : brain
            ? "Your marks"
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
      {brain && summary.preview ? (
        <div className="staff-remarks">
          <p>Staff preview. Tap a band to see that remark. Nothing is saved.</p>
          <div className="staff-remark-row">
            <button
              type="button"
              className={remarkBand === "run" ? "on" : ""}
              onClick={() => setRemarkBand("run")}
            >
              This run · {summary.correct}
            </button>
            {BRAIN_REMARK_BANDS.map((band) => (
              <button
                key={band.id}
                type="button"
                className={remarkBand === band.id ? "on" : ""}
                onClick={() => setRemarkBand(band.id)}
              >
                {band.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {brain ? (
        <BrainScorecard correct={remarkMarks} total={summary.total} />
      ) : null}
      {brain ? <BrainReport rows={summary.brainReport} /> : null}
      <ul className={`stats${brain ? " stats-aside" : ""}`}>
        {brain ? null : (
        <li>
          <strong>{kcheck ? `${kcheckPct}%` : summary.correct}</strong>
          <span>{kcheck ? "score" : "correct"}</span>
        </li>
        )}
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

import { DIFFICULTIES, lessonKey } from "../data/topics";
import { QUESTION_BANKS, bankLessonKey } from "../data/questionBanks";
import { WALK_TITLES } from "../data/walkTitles";
import {
  visibleStreak,
  topicInsight,
  sectionProgressKeys,
} from "../state/progress";
import TopicInsight from "../components/TopicInsight";
import HexStats from "../components/HexStats";

function lessonCompletionStats(progress, topics, counts, bankCounts) {
  const keys = [];
  for (const topic of topics || []) {
    keys.push(...sectionProgressKeys(topic.id, counts, bankCounts));
  }
  for (const walk of WALK_TITLES) {
    if (!keys.includes(walk.key)) keys.push(walk.key);
  }
  const completed = progress?.completed || [];
  const done = keys.filter((key) => completed.includes(key)).length;
  return { done, total: keys.length };
}

export default function ProgressPage({
  topics,
  progress,
  counts,
  bankCounts = {},
  eyebrow = "Your stats",
  title = "Progress",
}) {
  const streak = visibleStreak(progress);
  const completed = progress.completed || [];
  const { done, total } = lessonCompletionStats(
    progress,
    topics,
    counts,
    bankCounts
  );
  const insights = topics.map((topic) => ({
    topic,
    insight: topicInsight(progress, topic.id),
  }));
  const ranked = insights.filter((row) => row.insight.attempts >= 3);
  const strongest = ranked.reduce(
    (best, row) =>
      !best || row.insight.pct > best.insight.pct ? row : best,
    null
  );
  const weakest = ranked.reduce(
    (worst, row) =>
      !worst || row.insight.pct < worst.insight.pct ? row : worst,
    null
  );

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </header>
      <ul className="stats">
        <li>
          <strong>{progress.xp}</strong>
          <span>XP</span>
        </li>
        <li>
          <strong>{streak}</strong>
          <span>day streak</span>
        </li>
        <li>
          <strong>
            {done}/{total}
          </strong>
          <span>lessons done</span>
        </li>
      </ul>
      {strongest || weakest ? (
        <p className="focus-line">
          {strongest ? (
            <>
              Strongest: <strong>{strongest.topic.name}</strong>
              {strongest.insight.pct != null
                ? ` (${strongest.insight.pct}%)`
                : ""}
            </>
          ) : null}
          {strongest && weakest && strongest.topic.id !== weakest.topic.id
            ? " · "
            : null}
          {weakest && strongest?.topic.id !== weakest.topic.id ? (
            <>
              Focus: <strong>{weakest.topic.name}</strong>
              {weakest.insight.pct != null ? ` (${weakest.insight.pct}%)` : ""}
            </>
          ) : null}
        </p>
      ) : (
        <p className="focus-line">
          First-try accuracy is measured as you answer. Replay a lesson to fill
          this in.
        </p>
      )}
      <section className="profile-card hex-stats-card">
        <h2>Topic hex</h2>
        <HexStats topics={topics} progress={progress} />
      </section>
      <ol className="progress-topics">
        {insights.map(({ topic, insight }) => {
          const bankRows = QUESTION_BANKS.filter(
            (bank) => bank.topicId === topic.id
          ).flatMap((bank) =>
            DIFFICULTIES.map((diff) => {
              const key = bankLessonKey(bank.id, diff.id);
              const n = bankCounts[key] || 0;
              if (!n) return null;
              return {
                key,
                label: `${bank.title} ${diff.name}`,
                n,
                done: completed.includes(key),
              };
            }).filter(Boolean)
          );
          return (
            <li key={topic.id} className="progress-topic">
              <h2>{topic.name}</h2>
              <p>{topic.blurb}</p>
              <TopicInsight insight={insight} />
              {insight.attempts ? (
                <div className="insight-meter" aria-hidden="true">
                  <div
                    className={`insight-fill ${insight.kind}`}
                    style={{ width: `${insight.pct}%` }}
                  />
                </div>
              ) : null}
              <ul className="progress-diffs">
                {DIFFICULTIES.map((diff) => {
                  const key = lessonKey(topic.id, diff.id);
                  const n = counts[key] || 0;
                  const isDone = completed.includes(key);
                  return (
                    <li
                      key={key}
                      className={`progress-pill ${isDone ? "done" : ""} ${n ? "" : "empty"}`}
                    >
                      {diff.name}
                      {n ? (isDone ? " · done" : ` · ${n} Qs`) : " · none"}
                    </li>
                  );
                })}
                {bankRows.map((row) => (
                  <li
                    key={row.key}
                    className={`progress-pill ${row.done ? "done" : ""}`}
                  >
                    {row.label}
                    {row.done ? " · done" : " · step-by-step"}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

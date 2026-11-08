import { useMemo, useRef, useState } from "react";
import ThemeSwitch from "../components/ThemeSwitch";
import StaffSkipNext from "../components/StaffSkipNext";
import SchematicPractice from "./SchematicPractice";

function groupOrder(questions) {
  const order = [];
  for (const q of questions) {
    if (q.groupId && !order.includes(q.groupId)) order.push(q.groupId);
  }
  return order;
}

export default function PracticeStage({
  title,
  progressLabel,
  questions,
  preview = false,
  xpEach = 0,
  Board,
  onExit,
  onBack,
  showBack = false,
  onCheck,
  onDone,
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [ok, setOk] = useState(false);
  const [firstPass, setFirstPass] = useState(0);
  const attemptedRef = useRef(new Set());
  const question = questions[index];
  const last = index + 1 >= questions.length;
  const groups = useMemo(() => groupOrder(questions), [questions]);
  const grouped = Boolean(question?.groupId);
  const groupNumber = grouped ? groups.indexOf(question.groupId) + 1 : 0;
  const endsGroup =
    grouped && questions[index + 1]?.groupId !== question.groupId;

  function check() {
    if (!question || !selected || revealed) return;
    const pass = selected === question.answer;
    const checkId = question.id || `s3-test-${index}`;
    const firstTry = !attemptedRef.current.has(checkId);
    attemptedRef.current.add(checkId);
    setOk(pass);
    setRevealed(true);
    if (firstTry && pass) setFirstPass((count) => count + 1);
    onCheck?.({ ok: pass, firstTry, id: checkId });
  }

  function retry() {
    setRevealed(false);
    setOk(false);
  }

  function skipAhead() {
    if (!preview) return;
    if (last) {
      onDone(firstPass, questions.length);
      return;
    }
    setSelected("");
    setRevealed(false);
    setOk(false);
    setIndex((value) => value + 1);
  }

  function next() {
    if (!revealed) return;
    if (last) {
      onDone(firstPass, questions.length);
      return;
    }
    setSelected("");
    setRevealed(false);
    setOk(false);
    setIndex((value) => value + 1);
  }

  return (
    <div className="page drag-lab practice-stage">
      {showBack ? (
        <div className="lesson-close-row">
          <button type="button" className="ghost" onClick={onExit}>
            Close
          </button>
        </div>
      ) : null}
      <header className="lesson-bar">
        {showBack ? (
          <button
            type="button"
            className="ghost back-link back-sticky"
            onClick={onBack || onExit}
          >
            ← Back
          </button>
        ) : (
          <button type="button" className="ghost" onClick={onExit}>
            Close
          </button>
        )}
        <p className="lesson-meta">
          {progressLabel ? `${progressLabel} · ` : ""}
          <i>Test</i> · {title}
          {preview ? " · staff preview · no XP" : xpEach ? ` · +${xpEach} XP` : ""}
        </p>
        <ThemeSwitch compact className={showBack ? "theme-sticky" : ""} />
      </header>
      <section className="practice-shell">
        <p className="eyebrow"><i>Test</i></p>
        <p className="practice-progress">
          {grouped
            ? `Question ${groupNumber} of ${groups.length}`
            : `Question ${index + 1} of ${questions.length}`}
          {question?.difficulty ? ` · ${question.difficulty}` : ""}
        </p>
        <h2>{title}</h2>
        {grouped && question.partCount > 1 ? (
          <p className="practice-part">
            Part {question.part} of {question.partCount}
          </p>
        ) : null}
        <SchematicPractice
          question={question}
          Board={Board}
          selected={selected}
          revealed={revealed}
          ok={ok}
          onSelect={setSelected}
          onCheck={check}
          onRetry={retry}
        />
        {!revealed && preview ? (
          <div className="practice-continue">
            <StaffSkipNext onClick={skipAhead} />
          </div>
        ) : null}
        {revealed ? (
          <div className="practice-continue">
            <button type="button" className="primary" onClick={preview ? skipAhead : next}>
              {last
                ? "Finish test"
                : endsGroup
                  ? `Continue to Question ${groupNumber + 1}`
                  : "Continue"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}


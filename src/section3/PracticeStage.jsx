import { useRef, useState } from "react";
import ThemeSwitch from "../components/ThemeSwitch";
import SchematicPractice from "./SchematicPractice";

export default function PracticeStage({
  title,
  progressLabel,
  questions,
  preview = false,
  xpEach = 0,
  Board,
  onExit,
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
      <header className="lesson-bar">
        <button type="button" className="ghost" onClick={onExit}>
          Close
        </button>
        <p className="lesson-meta">
          {progressLabel ? `${progressLabel} · ` : ""}
          Test · {title}
          {preview ? " · staff preview · no XP" : xpEach ? ` · +${xpEach} XP` : ""}
        </p>
        <ThemeSwitch compact />
      </header>
      <section className="practice-shell">
        <p className="eyebrow">Test</p>
        <p className="practice-progress">
          Question {index + 1} of {questions.length}
          {question?.difficulty ? ` · ${question.difficulty}` : ""}
        </p>
        <h2>{title}</h2>
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
        {revealed ? (
          <div className="practice-continue">
            <button type="button" className="primary" onClick={next}>
              {last ? "Finish test" : "Continue"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

import { useMemo, useState } from "react";
import { isAnswerCorrect } from "../data/loadQuestions";
import { primerForLesson } from "../data/lessonPrimers";
import MathText from "./MathText";
import QuestionCard from "./QuestionCard";
import FeedbackBanner from "./FeedbackBanner";
import QuizPartBack from "./QuizPartBack";
import ThemeSwitch from "./ThemeSwitch";
import CloseWarning from "./CloseWarning";

export default function LessonWarmup({
  topic,
  difficulty,
  difficultyName,
  bankCount,
  onReady,
  onExit,
}) {
  const primer = useMemo(
    () => primerForLesson(topic?.id),
    [topic?.id]
  );
  const [step, setStep] = useState("concepts");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [leaveOpen, setLeaveOpen] = useState(false);

  if (!primer) {
    return (
      <div className="page">
        <p>No warm-up for this topic.</p>
        <button type="button" className="primary" onClick={onReady}>
          Start the quiz
        </button>
      </div>
    );
  }

  const warmup = primer.warmups[index];
  const lastWarmup = index >= primer.warmups.length - 1;

  function remember(fromIndex, sel, rev, base = answers) {
    return {
      ...base,
      [fromIndex]: { selected: sel, revealed: Boolean(rev) },
    };
  }

  function showWarmup(nextIndex, nextAnswers) {
    const saved = nextAnswers[nextIndex];
    setAnswers(nextAnswers);
    setIndex(nextIndex);
    setSelected(saved?.selected ?? "");
    setRevealed(Boolean(saved?.revealed));
  }

  function nextWarmup() {
    const nextAnswers = remember(index, selected, revealed);
    if (lastWarmup) {
      setAnswers(nextAnswers);
      setStep("go");
      return;
    }
    showWarmup(index + 1, nextAnswers);
  }

  function previousWarmup() {
    if (index <= 0) return;
    showWarmup(index - 1, remember(index, selected, revealed));
  }

  return (
    <div className="page lesson">
      <header className="lesson-bar">
        <button type="button" className="ghost" onClick={() => setLeaveOpen(true)}>
          Close
        </button>
        <p className="eyebrow lesson-teach-label">Warm-up</p>
        <button type="button" className="ghost" onClick={onReady}>
          Skip warm-up
        </button>
        <ThemeSwitch compact />
      </header>
      <p className="lesson-meta">
        {topic?.name} · {difficultyName} · before the question bank
      </p>

      {step === "concepts" ? (
        <section className="teach-card">
          <p className="eyebrow">Formulas</p>
          <h2>{primer.title}</h2>
          <p className="login-hint">{primer.intro}</p>
          <ul className="formula-list">
            {primer.formulas.map((row) => (
              <li key={row.name}>
                <strong>{row.name}</strong>
                <MathText text={row.expr} />
              </li>
            ))}
          </ul>
          <div className="warmup-actions">
            <button type="button" className="primary" onClick={() => setStep("practice")}>
              Try {primer.warmups.length} easy checks
            </button>
            <button type="button" className="ghost" onClick={onReady}>
              Skip warm-up
            </button>
          </div>
        </section>
      ) : null}

      {step === "practice" && warmup ? (
        <>
          <p className="lesson-meta">
            Practice {index + 1}/{primer.warmups.length}
            {warmup.concept ? ` · ${warmup.concept}` : ""} · no XP yet
          </p>
          <QuestionCard
            question={warmup}
            selected={selected}
            revealed={revealed}
            onSelect={setSelected}
          />
          {!revealed ? (
            <div className="quiz-actions">
              <div className="quiz-actions-row">
                {index > 0 ? (
                  <QuizPartBack
                    onBack={previousWarmup}
                    label="← Previous question"
                  />
                ) : null}
                <button
                  type="button"
                  className="primary check"
                  disabled={!selected}
                  onClick={() => {
                    setRevealed(true);
                    setAnswers(remember(index, selected, true));
                  }}
                >
                  Check
                </button>
                <button type="button" className="ghost" onClick={onReady}>
                  Skip warm-up
                </button>
              </div>
            </div>
          ) : (
            <FeedbackBanner
              correct={isAnswerCorrect(warmup, selected)}
              explanation={warmup.explanation}
              onContinue={nextWarmup}
              onBack={index > 0 ? previousWarmup : undefined}
              backLabel="← Previous question"
            />
          )}
        </>
      ) : null}

      {step === "go" ? (
        <section className="teach-card teach-go">
          <p className="eyebrow">Ready</p>
          <h2>Question bank next</h2>
          <p>
            Those were teaching checks. Now you get {bankCount} lesson
            question{bankCount === 1 ? "" : "s"} from the bank. First-try
            answers earn XP.
          </p>
          <button type="button" className="primary" onClick={onReady}>
            Start the quiz
          </button>
        </section>
      ) : null}

      <CloseWarning
        open={leaveOpen}
        onStay={() => setLeaveOpen(false)}
        onLeave={onExit}
      />
    </div>
  );
}

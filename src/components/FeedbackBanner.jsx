import MathText from "./MathText";
import QuizMascot from "./QuizMascot";
import QuizPartBack from "./QuizPartBack";
import FitKatex from "./FitKatex";

export default function FeedbackBanner({
  correct,
  explanation,
  willRepeat,
  failOut,
  onContinue,
  onBack,
  backLabel,
  onNext,
  nextLabel = "Next →",
}) {
  return (
    <div className={`feedback ${correct ? "ok" : "bad"}`}>
      <div className="feedback-body">
        <QuizMascot mood={correct ? "happy" : "scary"} playKey={correct ? "ok" : "bad"} />
        <strong>{correct ? "Correct" : "Not quite"}</strong>
        {failOut ? (
          <p>
            That is two misses. This skip cannot unlock the topic. Next you can
            try again.
          </p>
        ) : willRepeat ? (
          <p>This question will come back at the end.</p>
        ) : null}
        {explanation ? (
          <FitKatex className="feedback-why">
            <p>
              <MathText text={explanation} sentenceLines />
            </p>
          </FitKatex>
        ) : null}
      </div>
      <div className="feedback-nav">
        {onBack ? <QuizPartBack onBack={onBack} label={backLabel} /> : null}
        {onNext ? (
          <button type="button" className="primary" onClick={onNext}>
            {nextLabel}
          </button>
        ) : (
          <button type="button" className="primary" onClick={onContinue}>
            {failOut ? "Next" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}

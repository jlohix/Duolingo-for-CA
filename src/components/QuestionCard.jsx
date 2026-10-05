import MathText from "./MathText";
import QuestionReport from "./QuestionReport";

const LABELS = ["A", "B", "C", "D"];

function CircuitImage({ src }) {
  if (!src) return null;
  return (
    <img
      className="circuit-image"
      src={src}
      alt="Circuit for this question"
      onError={(event) => {
        event.currentTarget.remove();
      }}
    />
  );
}

export default function QuestionCard({
  question,
  selected,
  revealed,
  onSelect,
}) {
  const mainQuestion = String(question.mainQuestion || "").trim();
  return (
    <article className="question-card">
      {mainQuestion ? (
        <>
          <h2 className="question-main">
            <MathText text={mainQuestion} />
          </h2>
          <CircuitImage src={question.image} />
          <p className="question-part">
            <MathText text={question.question} />
          </p>
        </>
      ) : (
        <>
          <h2>
            <MathText text={question.question} />
          </h2>
          <CircuitImage src={question.image} />
        </>
      )}
      <div className="options">
        {LABELS.map((label) => {
          const key = label.toLowerCase();
          const text = question.options[key];
          if (!text) return null;
          const isSelected = selected === key;
          const isCorrect = question.answer === key;
          let extra = "";
          if (revealed && isCorrect) extra = "correct";
          if (revealed && isSelected && !isCorrect) extra = "wrong";
          if (!revealed && isSelected) extra = "picked";
          return (
            <button
              key={key}
              type="button"
              className={`option ${extra}`}
              disabled={revealed}
              onClick={() => onSelect(key)}
            >
              <span className="option-letter">{label}</span>
              <MathText text={text} />
            </button>
          );
        })}
      </div>
      <QuestionReport question={question} />
    </article>
  );
}

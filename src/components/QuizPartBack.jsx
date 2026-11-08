export default function QuizPartBack({ onBack, label = "← Previous" }) {
  if (!onBack) return null;
  return (
    <button type="button" className="ghost quiz-part-back" onClick={onBack}>
      {label}
    </button>
  );
}

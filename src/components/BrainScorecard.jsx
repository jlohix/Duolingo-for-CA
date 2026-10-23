import { brainVerdict } from "../data/brainVerdict";

export default function BrainScorecard({ correct = 0, total = 0 }) {
  const marks = Math.max(0, Number(correct) || 0);
  const outOf = Math.max(0, Number(total) || 0);
  const verdict = brainVerdict(marks);
  const pct = outOf ? Math.round((marks / outOf) * 100) : 0;

  return (
    <section className={`brain-card brain-${verdict.id}`} aria-label="Marks">
      {verdict.mascot ? (
        <img
          className="brain-mascot"
          src="/mascots/happy-sunwoo/celebration.gif"
          alt="Happy Sunwoo celebrating"
        />
      ) : null}
      {verdict.portrait ? (
        <img
          className="brain-portrait"
          src="/mascots/kirchhoff.png"
          alt="Kirchhoff"
        />
      ) : null}
      {verdict.calling ? (
        <img
          className="brain-portrait"
          src="/mascots/kirchhoff.png"
          alt="Kirchhoff"
        />
      ) : null}
      {verdict.prize ? (
        <img
          className="brain-prize"
          src="/mascots/nobel-pizza.png"
          alt="Nobel Pizza Prize"
        />
      ) : null}
      <p className="brain-marks">
        {marks}
        <span className="brain-of"> / {outOf}</span>
      </p>
      <p className="brain-label">marks</p>
      <div className="brain-meter" aria-hidden="true">
        <div className="brain-meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="brain-line">{verdict.line}</p>
    </section>
  );
}

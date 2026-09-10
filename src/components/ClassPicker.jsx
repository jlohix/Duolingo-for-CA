import { useState } from "react";
import { CLASS_IDS, isPartTimeClass } from "../data/classes";

export default function ClassPicker({ onPick }) {
  const [picked, setPicked] = useState("");

  return (
    <div className="overlay trophy-overlay class-pick-overlay" role="presentation">
      <div
        className="event-sheet trophy-guide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-pick-title"
      >
        <p className="eyebrow">Welcome</p>
        <h2 id="class-pick-title">Which class are you in?</h2>
        <p>
          Pick your group so Class board and Cohort board put you with the
          right students. Part-time students choose EEPT.
        </p>
        <div className="class-pick-grid">
          {CLASS_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`class-pick-option ${isPartTimeClass(id) ? "pt" : ""} ${picked === id ? "on" : ""}`}
              onClick={() => setPicked(id)}
            >
              {id}
              {isPartTimeClass(id) ? <span>Part-time</span> : null}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="primary"
          disabled={!picked}
          onClick={() => onPick(picked)}
        >
          Save class
        </button>
      </div>
    </div>
  );
}

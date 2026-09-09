import { useState } from "react";
import MathText from "../components/MathText";
import { MiniGraph, PracticeBoard as DefaultBoard } from "./PracticeSchematics";

const KEYS = ["a", "b", "c", "d"];
const LABELS = ["A", "B", "C", "D"];

export default function SchematicPractice({ question, selected, revealed, ok, onSelect, onCheck, onRetry, Board = DefaultBoard }) {
  const entries = KEYS.map((key) => [key, question.options[key]]).filter(([, text]) => text);
  const graphs = question.graphs || {};

  return (
    <div className="practice-card schematic-practice">
      {question.view ? (
        <div className="circuit-board practice-board-wrap">
          <Board view={question.view} />
        </div>
      ) : null}
      <p className="practice-prompt">
        <MathText text={question.prompt} />
      </p>
      <div className={`qc-options ${graphs.a ? "has-graphs" : ""}`}>
        {entries.map(([key, text], i) => {
          const graph = graphs[key];
          const chosen = selected === key;
          const showMark = revealed && (key === question.answer || chosen);
          const right = key === question.answer;
          return (
            <button
              key={key}
              type="button"
              className={`qc-option practice-option ${chosen ? "picked" : ""} ${
                revealed && right ? "correct" : ""
              } ${revealed && chosen && !ok ? "wrong" : ""}`}
              disabled={revealed && ok}
              onClick={() => {
                if (revealed && ok) return;
                if (revealed) onRetry?.();
                onSelect(key);
              }}
            >
              <span className="qc-letter">{LABELS[i]}</span>
              <span className="practice-option-body">
                {graph ? <MiniGraph {...graph} /> : null}
                <span>
                  <MathText text={text} />
                </span>
              </span>
              {showMark ? (
                <span className="qc-mark">{right ? "✓" : "✕"}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="practice-actions">
        <button
          type="button"
          className="primary"
          disabled={!selected || (revealed && ok)}
          onClick={onCheck}
        >
          Check answer
        </button>
        {revealed ? (
          <button type="button" className="ghost" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
      {revealed ? (
        <div className={`feedback ${ok ? "ok" : "bad"}`}>
          <div>
            <strong>{ok ? "Correct" : "Not quite"}</strong>
            <p>
              <MathText text={question.why} />
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import MathText from "./MathText";
import QuestionReport from "./QuestionReport";
import { shuffle } from "../data/loadQuestions";

function encode(placed, slotIds) {
  if (slotIds.some((id) => !placed[id])) return "";
  return slotIds.map((id) => `${id}=${placed[id]}`).join("|");
}

export default function MatchQuestion({
  question,
  revealed,
  onSelect,
}) {
  const pairs = question.pairs || [];
  const slotIds = pairs.map((pair) => pair.id);
  const chips = useMemo(
    () => shuffle(pairs.map((pair) => ({ id: pair.id, text: pair.answer }))),
    [question.id, pairs]
  );
  const [placed, setPlaced] = useState({});
  const [held, setHeld] = useState("");
  const dragRef = useRef(null);

  useEffect(() => {
    setPlaced({});
    setHeld("");
    onSelect("");
  }, [question.id]);

  function commit(next) {
    setPlaced(next);
    onSelect(encode(next, slotIds));
  }

  function placeChip(slotId, chipId) {
    if (revealed || !slotId || !chipId) return;
    const next = { ...placed };
    for (const key of Object.keys(next)) {
      if (next[key] === chipId) delete next[key];
    }
    next[slotId] = chipId;
    setHeld("");
    commit(next);
  }

  function returnChip(chipId) {
    if (revealed) return;
    const next = { ...placed };
    for (const key of Object.keys(next)) {
      if (next[key] === chipId) delete next[key];
    }
    setHeld("");
    commit(next);
  }

  function chipById(id) {
    return chips.find((chip) => chip.id === id);
  }

  function onPointerDown(event, chipId) {
    if (revealed) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      id: chipId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
  }

  function onPointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6) {
      drag.moved = true;
    }
  }

  function onPointerUp(event) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || revealed) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const slot = target?.closest?.("[data-slot]");
    const tray = target?.closest?.("[data-tray]");
    if (drag.moved && slot) {
      placeChip(slot.dataset.slot, drag.id);
      return;
    }
    if (drag.moved && tray) {
      returnChip(drag.id);
      return;
    }
    if (placed[Object.keys(placed).find((key) => placed[key] === drag.id) || ""]) {
      returnChip(drag.id);
      return;
    }
    setHeld((current) => (current === drag.id ? "" : drag.id));
  }

  function onSlotClick(slotId) {
    if (revealed) return;
    if (held) {
      placeChip(slotId, held);
    }
  }

  return (
    <article className="question-card">
      {question.mainQuestion ? (
        <h2 className="question-main">
          <MathText text={question.mainQuestion} />
        </h2>
      ) : null}
      <p className="question-part">
        <MathText text={question.question} />
      </p>
      <p className="match-help">
        Drag each tile onto its match. On a phone, tap a tile, then tap the slot.
      </p>
      <div className="match-layout">
        <div className="match-slots">
          {pairs.map((pair) => {
            const chip = chipById(placed[pair.id]);
            const right = revealed && placed[pair.id] === pair.id;
            const wrong = revealed && placed[pair.id] && placed[pair.id] !== pair.id;
            return (
              <div
                key={pair.id}
                className={`match-slot ${right ? "correct" : ""} ${wrong ? "wrong" : ""} ${held ? "armed" : ""}`}
                data-slot={pair.id}
                onClick={() => onSlotClick(pair.id)}
              >
                <span className="match-prompt">
                  <MathText text={pair.prompt} />
                </span>
                <span className={`match-drop ${chip ? "filled" : ""}`}>
                  {chip ? (
                    <button
                      type="button"
                      className="match-chip"
                      data-chip={chip.id}
                      onPointerDown={(event) => onPointerDown(event, chip.id)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                    >
                      <MathText text={chip.text} />
                    </button>
                  ) : (
                    "Drop here"
                  )}
                </span>
                {wrong ? (
                  <span className="match-fix">
                    <MathText text={pair.answer} />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="match-tray" data-tray="true">
          {chips
            .filter((chip) => !Object.values(placed).includes(chip.id))
            .map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={`match-chip ${held === chip.id ? "held" : ""}`}
                data-chip={chip.id}
                onPointerDown={(event) => onPointerDown(event, chip.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <MathText text={chip.text} />
              </button>
            ))}
        </div>
      </div>
      <QuestionReport question={question} />
    </article>
  );
}

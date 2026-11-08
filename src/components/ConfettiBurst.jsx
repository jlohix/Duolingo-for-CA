import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const COLORS = [
  "#3b82f6",
  "#f5c400",
  "#e11d48",
  "#22c55e",
  "#fb923c",
  "#c084fc",
  "#f472b6",
  "#38bdf8",
];

function piecesFor(seed) {
  const count = 160;
  const list = [];
  let n = Number(seed) || 1;
  const next = () => {
    n = (n * 1664525 + 1013904223) >>> 0;
    return n / 4294967296;
  };
  for (let i = 0; i < count; i += 1) {
    const roll = next();
    list.push({
      id: i,
      left: next() * 100,
      delay: next() * 1.6,
      duration: 3.2 + next() * 2.4,
      size: 8 + Math.floor(next() * 10),
      drift: (next() * 64 - 32).toFixed(1),
      spin: 280 + Math.floor(next() * 820),
      start: (-8 + next() * 42).toFixed(1),
      color: COLORS[Math.floor(next() * COLORS.length)],
      kind: roll < 0.34 ? "dot" : roll < 0.67 ? "strip" : "shard",
    });
  }
  return list;
}

export default function ConfettiBurst({ play = true, burstKey = "ok" }) {
  const pieces = useMemo(() => piecesFor(burstKey), [burstKey]);
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    setAlive(true);
    const timer = window.setTimeout(() => setAlive(false), 7000);
    return () => window.clearTimeout(timer);
  }, [burstKey]);

  if (!play || !alive || typeof document === "undefined") return null;

  return createPortal(
    <div className="confetti-layer" aria-hidden="true" key={burstKey}>
      {pieces.map((piece) => (
        <span
          key={`${burstKey}-${piece.id}`}
          className={`confetti-piece confetti-${piece.kind}`}
          style={{
            left: `${piece.left}vw`,
            width: `${piece.size}px`,
            height:
              piece.kind === "dot" ? `${piece.size}px` : `${piece.size * 1.7}px`,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            "--confetti-drift": `${piece.drift}vw`,
            "--confetti-spin": `${piece.spin}deg`,
            "--confetti-start": `${piece.start}vh`,
          }}
        />
      ))}
    </div>,
    document.body
  );
}

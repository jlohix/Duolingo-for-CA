import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const CONFETTI_COLORS = [
  "#3b82f6",
  "#f5c400",
  "#e11d48",
  "#22c55e",
  "#fb923c",
  "#c084fc",
  "#f472b6",
  "#38bdf8",
];

const CROSS_COLORS = ["#e11d48", "#dc2626", "#f43f5e", "#be123c", "#fb7185"];

function mulberry(seed) {
  let n = Number(seed) || 1;
  return () => {
    n = (n * 1664525 + 1013904223) >>> 0;
    return n / 4294967296;
  };
}

function confettiPieces(seed) {
  const next = mulberry(seed);
  const list = [];
  for (let i = 0; i < 160; i += 1) {
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
      color: CONFETTI_COLORS[Math.floor(next() * CONFETTI_COLORS.length)],
      kind: roll < 0.34 ? "dot" : roll < 0.67 ? "strip" : "shard",
    });
  }
  return list;
}

function crossPieces(seed) {
  const next = mulberry(Number(seed) + 91);
  const list = [];
  for (let i = 0; i < 90; i += 1) {
    list.push({
      id: i,
      left: next() * 100,
      delay: next() * 1.4,
      duration: 3.4 + next() * 2.2,
      size: 18 + Math.floor(next() * 16),
      drift: (next() * 48 - 24).toFixed(1),
      spin: Math.floor(next() * 80 - 40),
      start: (-8 + next() * 42).toFixed(1),
      color: CROSS_COLORS[Math.floor(next() * CROSS_COLORS.length)],
      kind: "cross",
    });
  }
  return list;
}

export default function ConfettiBurst({
  play = true,
  burstKey = "ok",
  variant = "confetti",
}) {
  const pieces = useMemo(
    () =>
      variant === "crosses" ? crossPieces(burstKey) : confettiPieces(burstKey),
    [burstKey, variant]
  );
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    setAlive(true);
    const timer = window.setTimeout(() => setAlive(false), 7000);
    return () => window.clearTimeout(timer);
  }, [burstKey, variant]);

  if (!play || !alive || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`confetti-layer ${variant === "crosses" ? "confetti-crosses" : ""}`}
      aria-hidden="true"
      key={`${variant}-${burstKey}`}
    >
      {pieces.map((piece) =>
        piece.kind === "cross" ? (
          <span
            key={`${burstKey}-x-${piece.id}`}
            className="confetti-piece confetti-cross"
            style={{
              left: `${piece.left}vw`,
              background: piece.color,
              fontSize: `${piece.size}px`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--confetti-drift": `${piece.drift}vw`,
              "--confetti-spin": `${piece.spin}deg`,
              "--confetti-start": `${piece.start}vh`,
            }}
          >
            ✕
          </span>
        ) : (
          <span
            key={`${burstKey}-${piece.id}`}
            className={`confetti-piece confetti-${piece.kind}`}
            style={{
              left: `${piece.left}vw`,
              width: `${piece.size}px`,
              height:
                piece.kind === "dot"
                  ? `${piece.size}px`
                  : `${piece.size * 1.7}px`,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--confetti-drift": `${piece.drift}vw`,
              "--confetti-spin": `${piece.spin}deg`,
              "--confetti-start": `${piece.start}vh`,
            }}
          />
        )
      )}
    </div>,
    document.body
  );
}

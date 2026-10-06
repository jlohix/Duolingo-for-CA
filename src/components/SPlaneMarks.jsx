export function Pole({ x, y, size = 9 }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d={`M${x - size} ${y - size} L${x + size} ${y + size}`} />
      <path d={`M${x + size} ${y - size} L${x - size} ${y + size}`} />
    </g>
  );
}

export function Zero({ x, y, r = 9 }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    />
  );
}

export function SPlane({
  cx = 280,
  cy = 150,
  half = 96,
  xLabel = "Real",
  yLabel = "Imag",
}) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d={`M${cx - half} ${cy} H${cx + half}`} />
      <path d={`M${cx + half - 8} ${cy - 6} L${cx + half} ${cy} L${cx + half - 8} ${cy + 6}`} />
      <path d={`M${cx} ${cy + half} V${cy - half}`} />
      <path d={`M${cx - 6} ${cy - half + 8} L${cx} ${cy - half} L${cx + 6} ${cy - half + 8}`} />
      {xLabel ? (
        <text
          x={cx + half}
          y={cy + 22}
          textAnchor="end"
          className="circuit-label s-plane-label"
          fill="currentColor"
          stroke="none"
        >
          {xLabel}
        </text>
      ) : null}
      {yLabel ? (
        <text
          x={cx + 14}
          y={cy - half + 16}
          className="circuit-label s-plane-label"
          fill="currentColor"
          stroke="none"
        >
          {yLabel}
        </text>
      ) : null}
    </g>
  );
}

export function PzLegend({ x, y }) {
  return (
    <g>
      <Pole x={x} y={y} size={7} />
      <text x={x + 14} y={y + 4} className="circuit-label">
        pole
      </text>
      <Zero x={x + 78} y={y} r={7} />
      <text x={x + 92} y={y + 4} className="circuit-label">
        zero
      </text>
    </g>
  );
}

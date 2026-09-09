import { Frame } from "./LabDraw";

function VoltageSource({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="28" />
      <text x={x} y={y - 8} textAnchor="middle" className="circuit-part">+</text>
      <text x={x} y={y + 16} textAnchor="middle" className="circuit-part">−</text>
    </g>
  );
}

function CurrentSource({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="28" />
      <path d={`M${x} ${y + 14} V${y - 14}`} />
      <path d={`M${x - 7} ${y - 5} L${x} ${y - 15} L${x + 7} ${y - 5}`} />
    </g>
  );
}

function ResistorH({ x, y }) {
  return (
    <path
      d={`M${x} ${y} h12 l8 -13 l16 26 l16 -26 l16 26 l8 -13 h12`}
    />
  );
}

function ResistorV({ x, y }) {
  return (
    <path
      d={`M${x} ${y} v12 l-13 8 l26 16 l-26 16 l26 16 l-13 8 v12`}
    />
  );
}

export default function SourceTransformationSchematic() {
  return (
    <Frame label="Equivalent voltage and current source circuits">
      <text x={140} y={34} textAnchor="middle" className="board-title">
        Voltage form
      </text>
      <text x={420} y={34} textAnchor="middle" className="board-title">
        Current form
      </text>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M54 224 V92 H84" />
        <VoltageSource x={54} y={158} />
        <ResistorH x={84} y={92} />
        <path d="M172 92 H226 V224 H54" />

        <path d="M334 224 V92 H506 V224 H334" />
        <CurrentSource x={334} y={158} />
        <ResistorV x={438} y={108} />

        <path d="M250 158 H304" />
        <path d="M292 150 L304 158 L292 166" />
      </g>
      <text x={54} y={164} textAnchor="middle" className="circuit-part">
        Vₛ
      </text>
      <text x={128} y={74} textAnchor="middle" className="circuit-part">
        R
      </text>
      <text x={334} y={164} textAnchor="middle" className="circuit-part">
        Iₛ
      </text>
      <text x={460} y={164} textAnchor="middle" className="circuit-part">
        R
      </text>
      <text x={280} y={198} textAnchor="middle" className="board-formula-lg">
        Iₛ = Vₛ / R
      </text>
    </Frame>
  );
}

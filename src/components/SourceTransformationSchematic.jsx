import { Frame } from "./LabDraw";

function VoltageSource({ x, y, r = 24 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} className="circuit-source-fill" />
      <circle cx={x} cy={y} r={r} />
      <text x={x} y={y - 5} textAnchor="middle" className="circuit-part">
        +
      </text>
      <text x={x} y={y + 13} textAnchor="middle" className="circuit-part">
        −
      </text>
    </g>
  );
}

function CurrentSource({ x, y, r = 24 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} className="circuit-source-fill" />
      <circle cx={x} cy={y} r={r} />
      <path d={`M${x} ${y + 11} V${y - 11}`} />
      <path d={`M${x - 6} ${y - 3} L${x} ${y - 12} L${x + 6} ${y - 3}`} />
    </g>
  );
}

function Dot({ x, y }) {
  return <circle cx={x} cy={y} r="3.5" fill="currentColor" stroke="none" />;
}

/** Horizontal box resistor with leads from xLeft to xRight. */
function resH(cx, y, xLeft, xRight) {
  const w = 34;
  const h = 14;
  return `M${xLeft} ${y} H${cx - w / 2} M${cx - w / 2} ${y - h / 2} H${cx + w / 2} V${y + h / 2} H${cx - w / 2} V${y - h / 2} M${cx + w / 2} ${y} H${xRight}`;
}

/** Vertical box resistor with leads from yTop to yBot. */
function resV(x, cy, yTop, yBot) {
  const w = 14;
  const h = 34;
  return `M${x} ${yTop} V${cy - h / 2} M${x - w / 2} ${cy - h / 2} H${x + w / 2} V${cy + h / 2} H${x - w / 2} V${cy - h / 2} M${x} ${cy + h / 2} V${yBot}`;
}

export default function SourceTransformationSchematic() {
  const top = 78;
  const bot = 210;
  const mid = (top + bot) / 2;
  const rSrc = 24;

  const vsX = 56;
  const vNode = 148;
  const vLoad = 200;

  const isX = 320;
  const iR = 390;
  const iLoad = 470;

  return (
    <Frame label="Equivalent voltage and current source circuits" height={310}>
      <text x={128} y={28} textAnchor="middle" className="board-title">
        Voltage form
      </text>
      <text x={400} y={28} textAnchor="middle" className="board-title">
        Current form
      </text>

      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        {/* Voltage form: Vs — R — terminals — Rₗ */}
        <path d={`M${vsX} ${bot} V${mid + rSrc}`} />
        <VoltageSource x={vsX} y={mid} r={rSrc} />
        <path d={`M${vsX} ${mid - rSrc} V${top}`} />
        <path d={resH(102, top, vsX, vNode)} />
        <path d={`M${vNode} ${top} H${vLoad}`} />
        <path d={resV(vLoad, mid, top, bot)} />
        <path d={`M${vLoad} ${bot} H${vsX}`} />
        <Dot x={vsX} y={top} />
        <Dot x={vNode} y={top} />
        <Dot x={vLoad} y={top} />
        <Dot x={vLoad} y={bot} />
        <Dot x={vsX} y={bot} />

        <path d="M240 144 H268" />
        <path d="M260 138 L268 144 L260 150" />

        {/* Current form: Is || R, then Rₗ at a–b */}
        <path d={`M${isX} ${bot} V${mid + rSrc}`} />
        <CurrentSource x={isX} y={mid} r={rSrc} />
        <path d={`M${isX} ${mid - rSrc} V${top} H${iR}`} />
        <path d={resV(iR, mid, top, bot)} />
        <path d={`M${iR} ${top} H${iLoad}`} />
        <path d={resV(iLoad, mid, top, bot)} />
        <path d={`M${iLoad} ${bot} H${isX}`} />
        <Dot x={isX} y={top} />
        <Dot x={isX} y={bot} />
        <Dot x={iR} y={top} />
        <Dot x={iR} y={bot} />
        <Dot x={iLoad} y={top} />
        <Dot x={iLoad} y={bot} />
      </g>

      <text x={vsX - 34} y={mid + 5} textAnchor="middle" className="circuit-part">
        Vₛ
      </text>
      <text x={102} y={top - 12} textAnchor="middle" className="circuit-part">
        R
      </text>
      <text
        x={vLoad + 18}
        y={mid + 5}
        textAnchor="start"
        className="circuit-part"
      >
        Rₗ
      </text>
      <text x={vLoad - 12} y={top - 8} textAnchor="middle" className="circuit-part">
        a
      </text>
      <text x={vLoad - 12} y={bot + 18} textAnchor="middle" className="circuit-part">
        b
      </text>

      <text x={isX - 34} y={mid + 5} textAnchor="middle" className="circuit-part">
        Iₛ
      </text>
      <text
        x={iR + 16}
        y={mid - 10}
        textAnchor="start"
        className="circuit-part"
      >
        R
      </text>
      <text
        x={iLoad + 16}
        y={mid + 5}
        textAnchor="start"
        className="circuit-part"
      >
        Rₗ
      </text>
      <text x={iLoad - 12} y={top - 8} textAnchor="middle" className="circuit-part">
        a
      </text>
      <text x={iLoad - 12} y={bot + 18} textAnchor="middle" className="circuit-part">
        b
      </text>

      <text x={257} y={268} textAnchor="middle" className="board-formula-lg">
        Iₛ = Vₛ / R
      </text>
      <text x={280} y={292} textAnchor="middle" className="board-title">
        Same R · same load at a–b
      </text>
    </Frame>
  );
}

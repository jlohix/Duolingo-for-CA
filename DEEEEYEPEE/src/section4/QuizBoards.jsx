import {
  Battery,
  Capacitor,
  Frame,
  MathLabel,
  OpenGap,
  PlotAxes,
  Resistor,
  samplePath,
} from "../components/LabDraw";

function Wires({ children }) {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  );
}

function Node({ x, y }) {
  return <circle cx={x} cy={y} r="4.5" fill="currentColor" />;
}

function DecayPlot({ v0 }) {
  const points = samplePath((t) => ({
    x: 56 + t * 460,
    y: 220 - 155 * Math.exp(-3 * t),
  }));
  return (
    <Frame label="Source-free RC decay">
      <PlotAxes x0={56} y0={220} x1={528} y1={52} xLabel="t" yLabel="v(t)" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <text x={70} y={78} className="circuit-part">
        {v0}
      </text>
      <text x={118} y={36} className="board-title">
        Source-free dump
      </text>
    </Frame>
  );
}

export function QrcSimpleBoard() {
  const top = 110;
  const bot = 210;
  return (
    <Frame label="Source-free RC with labeled values">
      <text x={280} y={32} textAnchor="middle" className="board-title">
        t &gt; 0 · no battery
      </text>
      <Wires>
        <path d={`M80 ${bot} V${top} H120`} />
        <Capacitor x={120} y={top} />
        <path d={`M194 ${top} H250`} />
        <Resistor x={250} y={top} />
        <path d={`M362 ${top} H480 V${bot} H80`} />
      </Wires>
      <text x={157} y={top + 48} textAnchor="middle" className="circuit-part">
        4 μF
      </text>
      <text x={157} y={top - 28} textAnchor="middle" className="circuit-part">
        v(0) = 12 V
      </text>
      <text x={306} y={top + 48} textAnchor="middle" className="circuit-part">
        2 kΩ
      </text>
      <MathLabel
        x={140}
        y={bot + 8}
        w={280}
        h={40}
        tex="$\\tau=RC$"
        cls="board-formula"
      />
    </Frame>
  );
}

export function QrcSwitchBoard() {
  const top = 108;
  const bot = 214;
  return (
    <Frame label="Switch opens at t = 0, charged C dumps into R">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t &gt; 0 · switch has opened
      </text>
      <Wires>
        <path d={`M48 ${bot} V${top} H56`} />
        <Battery x={56} y={top} />
        <path d={`M128 ${top} H148`} />
        <OpenGap x={148} y={top} />
        <path d={`M222 ${top} H248`} />
        <Capacitor x={248} y={top} />
        <path d={`M322 ${top} H500 V${bot} H360`} />
        <Resistor x={248} y={bot} />
        <path d={`M248 ${bot} H48`} />
      </Wires>
      <text x={92} y={top + 48} textAnchor="middle" className="circuit-part">
        24 V
      </text>
      <text x={185} y={top - 22} textAnchor="middle" className="circuit-part">
        t = 0
      </text>
      <text x={285} y={top + 48} textAnchor="middle" className="circuit-part">
        2 μF
      </text>
      <text x={285} y={top - 22} textAnchor="middle" className="circuit-part">
        v(0⁻) = 24 V
      </text>
      <text x={304} y={bot + 40} textAnchor="middle" className="circuit-part">
        8 kΩ
      </text>
    </Frame>
  );
}

export function QrcParBoard() {
  const top = 88;
  const mid = 168;
  const bot = 228;
  return (
    <Frame label="Capacitor with two parallel resistors">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t &gt; 0 · find R seen by C
      </text>
      <Wires>
        <path d={`M56 ${bot} V${top} H88`} />
        <Capacitor x={88} y={top} />
        <path d={`M162 ${top} H196`} />
        <path d={`M196 ${top} H220`} />
        <Resistor x={220} y={top} />
        <path d={`M332 ${top} H420 V${bot}`} />
        <path d={`M196 ${top} V${mid} H220`} />
        <Resistor x={220} y={mid} />
        <path d={`M332 ${mid} H420`} />
        <path d={`M420 ${bot} H56`} />
      </Wires>
      <Node x={196} y={top} />
      <Node x={420} y={top} />
      <Node x={420} y={mid} />
      <text x={125} y={top + 48} textAnchor="middle" className="circuit-part">
        3 μF
      </text>
      <text x={125} y={top - 22} textAnchor="middle" className="circuit-part">
        v(0) = 10 V
      </text>
      <text x={276} y={top + 48} textAnchor="middle" className="circuit-part">
        4 kΩ
      </text>
      <text x={276} y={mid + 48} textAnchor="middle" className="circuit-part">
        4 kΩ
      </text>
    </Frame>
  );
}

export function QrcSeriesBoard() {
  const top = 110;
  const bot = 214;
  return (
    <Frame label="Capacitor with two series resistors">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t &gt; 0 · series dump path
      </text>
      <Wires>
        <path d={`M40 ${bot} V${top} H56`} />
        <Capacitor x={56} y={top} />
        <path d={`M130 ${top} H148`} />
        <Resistor x={148} y={top} />
        <path d={`M260 ${top} H276`} />
        <Resistor x={276} y={top} />
        <path d={`M388 ${top} H520 V${bot} H40`} />
      </Wires>
      <text x={93} y={top + 48} textAnchor="middle" className="circuit-part">
        5 μF
      </text>
      <text x={93} y={top - 24} textAnchor="middle" className="circuit-part">
        v(0) = 8 V
      </text>
      <text x={204} y={top + 48} textAnchor="middle" className="circuit-part">
        2 kΩ
      </text>
      <text x={332} y={top + 48} textAnchor="middle" className="circuit-part">
        6 kΩ
      </text>
    </Frame>
  );
}

export function QrcDecayBoard() {
  return <DecayPlot v0="v(0) = 15 V" />;
}

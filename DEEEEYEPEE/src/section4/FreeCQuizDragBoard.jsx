import {
  Battery,
  Capacitor,
  Frame,
  OpenGap,
  PlotAxes,
  Resistor,
  samplePath,
} from "../components/LabDraw";
import { freeCQuizDragLabel } from "../data/freeCQuizLab";

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

function DropSlot({
  slotRef,
  drag,
  placed,
  revealed,
  ok,
  empty,
  filled,
  x = 400,
  y = 94,
  w = 132,
  h = 44,
}) {
  return (
    <foreignObject x={x} y={y} width={w} height={h}>
      <div
        ref={slotRef}
        xmlns="http://www.w3.org/1999/xhtml"
        className={`resistor-slot compact ${drag?.over ? "hot" : ""} ${
          placed != null ? "filled" : ""
        } ${revealed ? (ok ? "ok" : "bad") : ""}`}
      >
        {placed != null ? filled : empty}
      </div>
    </foreignObject>
  );
}

function DecayPlot() {
  const points = samplePath((t) => ({
    x: 56 + t * 300,
    y: 210 - 130 * Math.exp(-3 * t),
  }));
  return (
    <>
      <PlotAxes x0={56} y0={210} x1={370} y1={68} xLabel="t" yLabel="v(t)" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </>
  );
}

export default function FreeCQuizDragBoard({
  question,
  placed,
  drag,
  revealed,
  ok,
  slotRef,
}) {
  const filled = freeCQuizDragLabel(question, placed);
  const empty =
    question.kind === "vtau"
      ? "drop v(τ)"
      : question.kind === "vinf"
        ? "drop v(∞)"
        : "drop τ";

  const slot = (
    <DropSlot
      slotRef={slotRef}
      drag={drag}
      placed={placed}
      revealed={revealed}
      ok={ok}
      empty={empty}
      filled={filled}
    />
  );

  if (question.kind === "tau") {
    const top = 110;
    const bot = 210;
    return (
      <Frame label="Find τ = RC">
        <text x={200} y={32} textAnchor="middle" className="board-title">
          Simple source-free RC
        </text>
        <Wires>
          <path d={`M48 ${bot} V${top} H80`} />
          <Capacitor x={80} y={top} />
          <path d={`M154 ${top} H200`} />
          <Resistor x={200} y={top} />
          <path d={`M312 ${top} H372 V${bot} H48`} />
        </Wires>
        <text x={117} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.cLabel}
        </text>
        <text x={256} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.rLabel}
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          τ
        </text>
        {slot}
      </Frame>
    );
  }

  if (question.kind === "seriesr") {
    const top = 110;
    const bot = 214;
    return (
      <Frame label="Find τ with series resistors">
        <text x={200} y={28} textAnchor="middle" className="board-title">
          Series dump path
        </text>
        <Wires>
          <path d={`M36 ${bot} V${top} H48`} />
          <Capacitor x={48} y={top} />
          <path d={`M122 ${top} H138`} />
          <Resistor x={138} y={top} />
          <path d={`M250 ${top} H262`} />
          <Resistor x={262} y={top} />
          <path d={`M374 ${top} H380 V${bot} H36`} />
        </Wires>
        <text x={85} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.cLabel}
        </text>
        <text x={194} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.r1Label}
        </text>
        <text x={318} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.r2Label}
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          τ
        </text>
        {slot}
      </Frame>
    );
  }

  if (question.kind === "parallelr") {
    const top = 88;
    const mid = 168;
    const bot = 228;
    return (
      <Frame label="Find τ with parallel resistors">
        <text x={200} y={26} textAnchor="middle" className="board-title">
          R seen by C
        </text>
        <Wires>
          <path d={`M40 ${bot} V${top} H64`} />
          <Capacitor x={64} y={top} />
          <path d={`M138 ${top} H168`} />
          <path d={`M168 ${top} H184`} />
          <Resistor x={184} y={top} />
          <path d={`M296 ${top} H372 V${bot}`} />
          <path d={`M168 ${top} V${mid} H184`} />
          <Resistor x={184} y={mid} />
          <path d={`M296 ${mid} H372`} />
          <path d={`M372 ${bot} H40`} />
        </Wires>
        <Node x={168} y={top} />
        <Node x={372} y={top} />
        <Node x={372} y={mid} />
        <text x={101} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.cLabel}
        </text>
        <text x={240} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.r1Label}
        </text>
        <text x={240} y={mid + 48} textAnchor="middle" className="circuit-part">
          {question.r2Label}
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          τ
        </text>
        {slot}
      </Frame>
    );
  }

  if (question.kind === "vinf") {
    const top = 108;
    const bot = 214;
    return (
      <Frame label="Find v(∞) after the switch opens">
        <text x={200} y={28} textAnchor="middle" className="board-title">
          t &gt; 0 · switch open
        </text>
        <Wires>
          <path d={`M36 ${bot} V${top} H44`} />
          <Battery x={44} y={top} />
          <path d={`M116 ${top} H128`} />
          <OpenGap x={128} y={top} />
          <path d={`M202 ${top} H220`} />
          <Capacitor x={220} y={top} />
          <path d={`M294 ${top} H372 V${bot} H256`} />
          <Resistor x={144} y={bot} />
          <path d={`M144 ${bot} H36`} />
        </Wires>
        <text x={80} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.vsLabel}
        </text>
        <text x={257} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.cLabel}
        </text>
        <text x={200} y={bot + 40} textAnchor="middle" className="circuit-part">
          {question.rLabel}
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          v(∞)
        </text>
        {slot}
      </Frame>
    );
  }

  return (
    <Frame label="Source-free RC decay">
      <DecayPlot />
      <text x={70} y={88} className="circuit-part">
        {question.v0} V
      </text>
      <text x={456} y={80} textAnchor="middle" className="board-step">
        v(τ)
      </text>
      {slot}
    </Frame>
  );
}

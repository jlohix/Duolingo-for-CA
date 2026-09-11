import {
  Battery,
  Frame,
  Inductor,
  OpenGap,
  PlotAxes,
  Resistor,
  samplePath,
} from "../components/LabDraw";
import { freeLQuizDragLabel } from "../data/freeLQuizLab";

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
      <PlotAxes x0={56} y0={210} x1={370} y1={68} xLabel="t" yLabel="i(t)" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </>
  );
}

export default function FreeLQuizDragBoard({
  question,
  placed,
  drag,
  revealed,
  ok,
  slotRef,
}) {
  const filled = freeLQuizDragLabel(question, placed);
  const empty =
    question.kind === "itau"
      ? "drop i(τ)"
      : question.kind === "iinf"
        ? "drop i(∞)"
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
      <Frame label="Find τ = L/R">
        <text x={200} y={32} textAnchor="middle" className="board-title">
          Simple source-free RL
        </text>
        <Wires>
          <path d={`M48 ${bot} V${top} H80`} />
          <Inductor x={80} y={top} />
          <path d={`M200 ${top} H220`} />
          <Resistor x={220} y={top} />
          <path d={`M332 ${top} H372 V${bot} H48`} />
        </Wires>
        <text x={140} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.lLabel}
        </text>
        <text x={276} y={top + 48} textAnchor="middle" className="circuit-part">
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
          <Inductor x={48} y={top} />
          <path d={`M168 ${top} H178`} />
          <Resistor x={178} y={top} />
          <path d={`M290 ${top} H300`} />
          <Resistor x={300} y={top} />
          <path d={`M412 ${top} H420 V${bot} H36`} />
        </Wires>
        <text x={108} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.lLabel}
        </text>
        <text x={234} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.r1Label}
        </text>
        <text x={356} y={top + 48} textAnchor="middle" className="circuit-part">
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
          R seen by L
        </text>
        <Wires>
          <path d={`M40 ${bot} V${top} H64`} />
          <Inductor x={64} y={top} />
          <path d={`M184 ${top} H200`} />
          <path d={`M200 ${top} H216`} />
          <Resistor x={216} y={top} />
          <path d={`M328 ${top} H372 V${bot}`} />
          <path d={`M200 ${top} V${mid} H216`} />
          <Resistor x={216} y={mid} />
          <path d={`M328 ${mid} H372`} />
          <path d={`M372 ${bot} H40`} />
        </Wires>
        <Node x={200} y={top} />
        <Node x={372} y={top} />
        <Node x={372} y={mid} />
        <text x={124} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.lLabel}
        </text>
        <text x={272} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.r1Label}
        </text>
        <text x={272} y={mid + 48} textAnchor="middle" className="circuit-part">
          {question.r2Label}
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          τ
        </text>
        {slot}
      </Frame>
    );
  }

  if (question.kind === "iinf") {
    const top = 108;
    const bot = 214;
    return (
      <Frame label="Find i(∞) after the switch opens">
        <text x={200} y={28} textAnchor="middle" className="board-title">
          t &gt; 0 · switch open
        </text>
        <Wires>
          <path d={`M36 ${bot} V${top} H44`} />
          <Battery x={44} y={top} />
          <path d={`M116 ${top} H128`} />
          <OpenGap x={128} y={top} />
          <path d={`M202 ${top} H220`} />
          <Inductor x={220} y={top} />
          <path d={`M340 ${top} H372 V${bot} H256`} />
          <Resistor x={144} y={bot} />
          <path d={`M144 ${bot} H36`} />
        </Wires>
        <text x={80} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.vsLabel}
        </text>
        <text x={280} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.lLabel}
        </text>
        <text x={200} y={bot + 40} textAnchor="middle" className="circuit-part">
          {question.rLabel}
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          i(∞)
        </text>
        {slot}
      </Frame>
    );
  }

  return (
    <Frame label="Source-free RL decay">
      <DecayPlot />
      <text x={70} y={88} className="circuit-part">
        {question.i0} A
      </text>
      <text x={456} y={80} textAnchor="middle" className="board-step">
        i(τ)
      </text>
      {slot}
    </Frame>
  );
}

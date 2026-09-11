import {
  Battery,
  Capacitor,
  Frame,
  OpenGap,
  PlotAxes,
  Resistor,
  samplePath,
} from "../components/LabDraw";
import { stepCQuizDragLabel } from "../data/stepCQuizLab";

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

function RisePlot() {
  const points = samplePath((t) => ({
    x: 56 + t * 300,
    y: 210 - 130 * (1 - Math.exp(-3 * t)),
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

export default function StepCQuizDragBoard({
  question,
  placed,
  drag,
  revealed,
  ok,
  slotRef,
}) {
  const filled = stepCQuizDragLabel(question, placed);
  const empty =
    question.kind === "vtau"
      ? "drop v(τ)"
      : question.kind === "vinf"
        ? "drop v(∞)"
        : question.kind === "v0"
          ? "drop v(0⁺)"
          : question.kind === "complete"
            ? "drop v(t)"
            : "drop τ";

  const wide = question.kind === "complete";
  const slot = (
    <DropSlot
      slotRef={slotRef}
      drag={drag}
      placed={placed}
      revealed={revealed}
      ok={ok}
      empty={empty}
      filled={filled}
      x={wide ? 360 : 400}
      w={wide ? 180 : 132}
    />
  );

  if (question.kind === "tau" || question.kind === "vinf") {
    const top = 110;
    const bot = 214;
    return (
      <Frame
        label={
          question.kind === "tau"
            ? "Find τ with the source on"
            : "Find v(∞) from rest"
        }
      >
        <text x={200} y={28} textAnchor="middle" className="board-title">
          RC step · source connected
        </text>
        <Wires>
          <path d={`M40 ${bot} V${top} H52`} />
          <Battery x={52} y={top} />
          <path d={`M124 ${top} H148`} />
          <Resistor x={148} y={top} />
          <path d={`M260 ${top} H280`} />
          <Capacitor x={280} y={top} />
          <path d={`M354 ${top} H400 V${bot} H40`} />
        </Wires>
        <text x={88} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.vsLabel}
        </text>
        <text x={204} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.rLabel}
        </text>
        <text x={317} y={top + 48} textAnchor="middle" className="circuit-part">
          {question.cLabel}
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          {question.kind === "tau" ? "τ" : "v(∞)"}
        </text>
        {slot}
      </Frame>
    );
  }

  if (question.kind === "v0") {
    const top = 108;
    const bot = 214;
    return (
      <Frame label="Find v(0⁺) when the switch closes">
        <text x={200} y={28} textAnchor="middle" className="board-title">
          Continuity of capacitor voltage
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
        <text x={257} y={top - 22} textAnchor="middle" className="circuit-part">
          v(0⁻) = {question.v0} V
        </text>
        <text x={200} y={bot + 40} textAnchor="middle" className="circuit-part">
          {question.rLabel}
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          v(0⁺)
        </text>
        {slot}
      </Frame>
    );
  }

  if (question.kind === "complete") {
    return (
      <Frame label="Complete RC step response">
        <RisePlot />
        <text x={70} y={88} className="circuit-part">
          V0 = {question.v0} V · Vs = {question.vs} V
        </text>
        <text x={456} y={80} textAnchor="middle" className="board-step">
          v(t)
        </text>
        {slot}
      </Frame>
    );
  }

  return (
    <Frame label="RC step from rest">
      <RisePlot />
      <text x={70} y={88} className="circuit-part">
        Vs = {question.vs} V
      </text>
      <text x={456} y={80} textAnchor="middle" className="board-step">
        v(τ)
      </text>
      {slot}
    </Frame>
  );
}

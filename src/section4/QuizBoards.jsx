import {
  Battery,
  Capacitor,
  Frame,
  Inductor,
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

function IndDecayPlot({ i0 }) {
  const points = samplePath((t) => ({
    x: 56 + t * 460,
    y: 220 - 155 * Math.exp(-3 * t),
  }));
  return (
    <Frame label="Source-free RL decay">
      <PlotAxes x0={56} y0={220} x1={528} y1={52} xLabel="t" yLabel="i(t)" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <text x={70} y={78} className="circuit-part">
        {i0}
      </text>
      <text x={118} y={36} className="board-title">
        Source-free dump
      </text>
    </Frame>
  );
}

function RisePlot({ topLabel, yLabel }) {
  const points = samplePath((t) => ({
    x: 56 + t * 460,
    y: 220 - 155 * (1 - Math.exp(-3 * t)),
  }));
  return (
    <Frame label="First-order step rise">
      <PlotAxes x0={56} y0={220} x1={528} y1={52} xLabel="t" yLabel={yLabel} />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <text x={70} y={78} className="circuit-part">
        {topLabel}
      </text>
    </Frame>
  );
}

export function QrlSimpleBoard() {
  const top = 110;
  const bot = 210;
  return (
    <Frame label="Source-free RL with labeled values">
      <text x={280} y={32} textAnchor="middle" className="board-title">
        t &gt; 0 · no battery
      </text>
      <Wires>
        <path d={`M80 ${bot} V${top} H120`} />
        <Inductor x={120} y={top} />
        <path d={`M240 ${top} H260`} />
        <Resistor x={260} y={top} />
        <path d={`M372 ${top} H480 V${bot} H80`} />
      </Wires>
      <text x={180} y={top + 48} textAnchor="middle" className="circuit-part">
        8 H
      </text>
      <text x={180} y={top - 28} textAnchor="middle" className="circuit-part">
        i(0) = 5 A
      </text>
      <text x={316} y={top + 48} textAnchor="middle" className="circuit-part">
        2 kΩ
      </text>
      <MathLabel
        x={140}
        y={bot + 8}
        w={280}
        h={40}
        tex="$\\tau=L/R$"
        cls="board-formula"
      />
    </Frame>
  );
}

export function QrlSwitchBoard() {
  const top = 108;
  const bot = 214;
  return (
    <Frame label="Switch opens at t = 0, charged L dumps into R">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t &gt; 0 · switch has opened
      </text>
      <Wires>
        <path d={`M48 ${bot} V${top} H56`} />
        <Battery x={56} y={top} />
        <path d={`M128 ${top} H148`} />
        <OpenGap x={148} y={top} />
        <path d={`M222 ${top} H248`} />
        <Inductor x={248} y={top} />
        <path d={`M368 ${top} H500 V${bot} H360`} />
        <Resistor x={248} y={bot} />
        <path d={`M248 ${bot} H48`} />
      </Wires>
      <text x={92} y={top + 48} textAnchor="middle" className="circuit-part">
        24 V
      </text>
      <text x={185} y={top - 22} textAnchor="middle" className="circuit-part">
        t = 0
      </text>
      <text x={308} y={top + 48} textAnchor="middle" className="circuit-part">
        4 H
      </text>
      <text x={308} y={top - 22} textAnchor="middle" className="circuit-part">
        i(0⁻) = 6 A
      </text>
      <text x={304} y={bot + 40} textAnchor="middle" className="circuit-part">
        8 kΩ
      </text>
    </Frame>
  );
}

export function QrlParBoard() {
  const top = 88;
  const mid = 168;
  const bot = 228;
  return (
    <Frame label="Inductor with two parallel resistors">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t &gt; 0 · find R seen by L
      </text>
      <Wires>
        <path d={`M56 ${bot} V${top} H88`} />
        <Inductor x={88} y={top} />
        <path d={`M208 ${top} H220`} />
        <path d={`M220 ${top} H236`} />
        <Resistor x={236} y={top} />
        <path d={`M348 ${top} H420 V${bot}`} />
        <path d={`M220 ${top} V${mid} H236`} />
        <Resistor x={236} y={mid} />
        <path d={`M348 ${mid} H420`} />
        <path d={`M420 ${bot} H56`} />
      </Wires>
      <Node x={220} y={top} />
      <Node x={420} y={top} />
      <Node x={420} y={mid} />
      <text x={148} y={top + 48} textAnchor="middle" className="circuit-part">
        6 H
      </text>
      <text x={148} y={top - 22} textAnchor="middle" className="circuit-part">
        i(0) = 4 A
      </text>
      <text x={292} y={top + 48} textAnchor="middle" className="circuit-part">
        4 kΩ
      </text>
      <text x={292} y={mid + 48} textAnchor="middle" className="circuit-part">
        4 kΩ
      </text>
    </Frame>
  );
}

export function QrlSeriesBoard() {
  const top = 110;
  const bot = 214;
  return (
    <Frame label="Inductor with two series resistors">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t &gt; 0 · series dump path
      </text>
      <Wires>
        <path d={`M40 ${bot} V${top} H56`} />
        <Inductor x={56} y={top} />
        <path d={`M176 ${top} H188`} />
        <Resistor x={188} y={top} />
        <path d={`M300 ${top} H312`} />
        <Resistor x={312} y={top} />
        <path d={`M424 ${top} H520 V${bot} H40`} />
      </Wires>
      <text x={116} y={top + 48} textAnchor="middle" className="circuit-part">
        8 H
      </text>
      <text x={116} y={top - 24} textAnchor="middle" className="circuit-part">
        i(0) = 3 A
      </text>
      <text x={244} y={top + 48} textAnchor="middle" className="circuit-part">
        2 kΩ
      </text>
      <text x={368} y={top + 48} textAnchor="middle" className="circuit-part">
        6 kΩ
      </text>
    </Frame>
  );
}

export function QrlDecayBoard() {
  return <IndDecayPlot i0="i(0) = 15 A" />;
}

export function QrcsSimpleBoard() {
  const top = 110;
  const bot = 214;
  return (
    <Frame label="RC step with source connected">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t &gt; 0 · Vs on
      </text>
      <Wires>
        <path d={`M56 ${bot} V${top} H72`} />
        <Battery x={72} y={top} />
        <path d={`M144 ${top} H176`} />
        <Resistor x={176} y={top} />
        <path d={`M288 ${top} H320`} />
        <Capacitor x={320} y={top} />
        <path d={`M394 ${top} H500 V${bot} H56`} />
      </Wires>
      <text x={108} y={top + 48} textAnchor="middle" className="circuit-part">
        Vs
      </text>
      <text x={232} y={top + 48} textAnchor="middle" className="circuit-part">
        2 kΩ
      </text>
      <text x={357} y={top + 48} textAnchor="middle" className="circuit-part">
        4 μF
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

export function QrcsSwitchBoard() {
  const top = 108;
  const bot = 214;
  return (
    <Frame label="Switch closes onto a rested capacitor">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        Just after t = 0
      </text>
      <Wires>
        <path d={`M48 ${bot} V${top} H56`} />
        <Battery x={56} y={top} />
        <path d={`M128 ${top} H148`} />
        <OpenGap x={148} y={top} />
        <path d={`M222 ${top} H248`} />
        <Resistor x={248} y={top} />
        <path d={`M360 ${top} H384`} />
        <Capacitor x={384} y={top} />
        <path d={`M458 ${top} H500 V${bot} H48`} />
      </Wires>
      <text x={92} y={top + 48} textAnchor="middle" className="circuit-part">
        Vs
      </text>
      <text x={185} y={top - 22} textAnchor="middle" className="circuit-part">
        closes
      </text>
      <text x={304} y={top + 48} textAnchor="middle" className="circuit-part">
        R
      </text>
      <text x={421} y={top + 48} textAnchor="middle" className="circuit-part">
        C
      </text>
      <text x={421} y={top - 22} textAnchor="middle" className="circuit-part">
        v(0⁻) = 0
      </text>
    </Frame>
  );
}

export function QrcsFinalBoard() {
  const top = 110;
  const bot = 214;
  return (
    <Frame label="Steady state of an RC step">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t → ∞ · C open
      </text>
      <Wires>
        <path d={`M80 ${bot} V${top} H120`} />
        <Battery x={120} y={top} />
        <path d={`M192 ${top} H240`} />
        <Resistor x={240} y={top} />
        <path d={`M352 ${top} H480 V${bot} H80`} />
      </Wires>
      <text x={156} y={top + 48} textAnchor="middle" className="circuit-part">
        12 V
      </text>
      <text x={296} y={top + 48} textAnchor="middle" className="circuit-part">
        R
      </text>
      <text x={420} y={top - 8} textAnchor="middle" className="circuit-part">
        v(∞) = ?
      </text>
    </Frame>
  );
}

export function QrcsRiseBoard() {
  return <RisePlot topLabel="Vs = 12 V · from rest" yLabel="v(t)" />;
}

export function QrcsCompleteBoard() {
  const top = 110;
  const bot = 214;
  return (
    <Frame label="Complete RC step response">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        V0 = 5 V · Vs = 15 V
      </text>
      <Wires>
        <path d={`M56 ${bot} V${top} H72`} />
        <Battery x={72} y={top} />
        <path d={`M144 ${top} H176`} />
        <Resistor x={176} y={top} />
        <path d={`M288 ${top} H320`} />
        <Capacitor x={320} y={top} />
        <path d={`M394 ${top} H500 V${bot} H56`} />
      </Wires>
      <MathLabel
        x={100}
        y={bot + 4}
        w={360}
        h={44}
        tex="$v=V_s+(V_0-V_s)e^{-t/\\tau}$"
        cls="board-formula"
      />
    </Frame>
  );
}

export function QrlsSimpleBoard() {
  const top = 110;
  const bot = 214;
  return (
    <Frame label="RL step with source connected">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t &gt; 0 · Vs on
      </text>
      <Wires>
        <path d={`M56 ${bot} V${top} H72`} />
        <Battery x={72} y={top} />
        <path d={`M144 ${top} H176`} />
        <Resistor x={176} y={top} />
        <path d={`M288 ${top} H320`} />
        <Inductor x={320} y={top} />
        <path d={`M440 ${top} H500 V${bot} H56`} />
      </Wires>
      <text x={108} y={top + 48} textAnchor="middle" className="circuit-part">
        Vs
      </text>
      <text x={232} y={top + 48} textAnchor="middle" className="circuit-part">
        2 kΩ
      </text>
      <text x={380} y={top + 48} textAnchor="middle" className="circuit-part">
        8 H
      </text>
      <MathLabel
        x={140}
        y={bot + 8}
        w={280}
        h={40}
        tex="$\\tau=L/R$"
        cls="board-formula"
      />
    </Frame>
  );
}

export function QrlsSwitchBoard() {
  const top = 108;
  const bot = 214;
  return (
    <Frame label="Switch closes onto a rested inductor">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        Just after t = 0
      </text>
      <Wires>
        <path d={`M48 ${bot} V${top} H56`} />
        <Battery x={56} y={top} />
        <path d={`M128 ${top} H148`} />
        <OpenGap x={148} y={top} />
        <path d={`M222 ${top} H248`} />
        <Resistor x={248} y={top} />
        <path d={`M360 ${top} H384`} />
        <Inductor x={384} y={top} />
        <path d={`M504 ${top} H520 V${bot} H48`} />
      </Wires>
      <text x={92} y={top + 48} textAnchor="middle" className="circuit-part">
        Vs
      </text>
      <text x={185} y={top - 22} textAnchor="middle" className="circuit-part">
        closes
      </text>
      <text x={304} y={top + 48} textAnchor="middle" className="circuit-part">
        R
      </text>
      <text x={444} y={top + 48} textAnchor="middle" className="circuit-part">
        L
      </text>
      <text x={444} y={top - 22} textAnchor="middle" className="circuit-part">
        i(0⁻) = 0
      </text>
    </Frame>
  );
}

export function QrlsFinalBoard() {
  const top = 110;
  const bot = 214;
  return (
    <Frame label="Steady state of an RL step">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        t → ∞ · L short
      </text>
      <Wires>
        <path d={`M80 ${bot} V${top} H120`} />
        <Battery x={120} y={top} />
        <path d={`M192 ${top} H240`} />
        <Resistor x={240} y={top} />
        <path d={`M352 ${top} H480 V${bot} H80`} />
      </Wires>
      <text x={156} y={top + 48} textAnchor="middle" className="circuit-part">
        12 V
      </text>
      <text x={296} y={top + 48} textAnchor="middle" className="circuit-part">
        4 kΩ
      </text>
      <text x={420} y={top - 8} textAnchor="middle" className="circuit-part">
        i(∞) = ?
      </text>
    </Frame>
  );
}

export function QrlsRiseBoard() {
  return <RisePlot topLabel="I∞ = 10 mA · from rest" yLabel="i(t)" />;
}

export function QrlsCompleteBoard() {
  const top = 110;
  const bot = 214;
  return (
    <Frame label="Complete RL step response">
      <text x={280} y={28} textAnchor="middle" className="board-title">
        I0 = 2 mA · Vs/R = 8 mA
      </text>
      <Wires>
        <path d={`M56 ${bot} V${top} H72`} />
        <Battery x={72} y={top} />
        <path d={`M144 ${top} H176`} />
        <Resistor x={176} y={top} />
        <path d={`M288 ${top} H320`} />
        <Inductor x={320} y={top} />
        <path d={`M440 ${top} H500 V${bot} H56`} />
      </Wires>
      <MathLabel
        x={80}
        y={bot + 4}
        w={400}
        h={44}
        tex="$i=V_s/R+(I_0-V_s/R)e^{-t/\\tau}$"
        cls="board-formula"
      />
    </Frame>
  );
}

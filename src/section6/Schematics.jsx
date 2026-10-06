import {
  Box,
  ConceptFlow,
  FlowArrow,
  Frame,
  MathLabel,
  PlotAxes,
  samplePath,
} from "../components/LabDraw";
import { Pole, PzLegend, SPlane, Zero } from "../components/SPlaneMarks";

function MiniCurve({ x, y, kind }) {
  const w = 128;
  const h = 58;
  const path =
    kind === "decay"
      ? samplePath((t) => ({
          x: x + t * w,
          y: y + 6 + (h - 10) * (1 - Math.exp(-t * 4)),
        }))
      : kind === "grow"
        ? samplePath((t) => ({
            x: x + t * w,
            y: y + h - 6 - Math.min(h - 12, (h - 12) * (Math.exp(t * 1.8) - 1) / 3.2),
          }))
        : samplePath((t) => ({
            x: x + t * w,
            y: y + h / 2 + (h / 2 - 8) * Math.exp(-t * 2.2) * Math.sin(t * 10 * Math.PI),
          }));
  return (
    <g>
      <path
        d={`M${x} ${y} V${y + h} H${x + w}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2.4" />
    </g>
  );
}

function FractionView() {
  const cx = 400;
  const cy = 128;
  const s = 20;
  return (
    <Frame label="Zeros from N(s), poles from D(s)" height={232}>
      <Box
        x={12}
        y={12}
        w={250}
        h={88}
        cls="hot"
        title={"$H(s)=\\dfrac{s+2}{(s+1)(s+4)}$"}
      />
      <Box x={12} y={108} w={118} h={64} cls="hot" title="zero" sub="$s=-2$" />
      <Box x={144} y={108} w={118} h={64} cls="hot" title="poles" sub="$s=-1,-4$" />
      <SPlane cx={cx} cy={cy} half={84} />
      <Zero x={cx - 2 * s} y={cy} />
      <Pole x={cx - 1 * s} y={cy} />
      <Pole x={cx - 4 * s} y={cy} />
      <PzLegend x={16} y={196} />
      <text x={cx - 2 * s} y={cy + 24} textAnchor="middle" className="circuit-label">
        −2
      </text>
      <text x={cx - s} y={cy - 14} textAnchor="middle" className="circuit-label">
        −1
      </text>
      <text x={cx - 4 * s} y={cy - 14} textAnchor="middle" className="circuit-label">
        −4
      </text>
    </Frame>
  );
}

function PlaneView() {
  const cx = 280;
  const cy = 124;
  const s = 22;
  return (
    <Frame label="s-plane for (s+2)/[(s+1)(s+4)]" height={232}>
      <MathLabel
        x={12}
        y={8}
        w={160}
        h={32}
        tex="$s=\\sigma+j\\omega$"
        cls="board-formula"
        inline
      />
      <SPlane cx={cx} cy={cy} half={96} />
      <Zero x={cx - 2 * s} y={cy} />
      <Pole x={cx - 1 * s} y={cy} />
      <Pole x={cx - 4 * s} y={cy} />
      <text x={cx - 2 * s} y={cy + 26} textAnchor="middle" className="circuit-label">
        −2
      </text>
      <text x={cx - s} y={cy - 16} textAnchor="middle" className="circuit-label">
        −1
      </text>
      <text x={cx - 4 * s} y={cy - 16} textAnchor="middle" className="circuit-label">
        −4
      </text>
      <PzLegend x={16} y={204} />
      <text x={430} y={40} className="circuit-label">
        real-axis points have ω = 0
      </text>
    </Frame>
  );
}

function PoleTimeView() {
  return (
    <Frame label="Pole location to time behavior" height={248}>
      <Pole x={48} y={40} />
      <text x={64} y={44} className="circuit-label">
        s = −2
      </text>
      <MiniCurve x={24} y={56} kind="decay" />
      <text x={88} y={132} textAnchor="middle" className="circuit-label">
        LHP · decays
      </text>
      <Pole x={232} y={40} />
      <text x={248} y={44} className="circuit-label">
        s = +2
      </text>
      <MiniCurve x={208} y={56} kind="grow" />
      <text x={272} y={132} textAnchor="middle" className="circuit-label">
        RHP · grows
      </text>
      <Pole x={416} y={28} size={7} />
      <Pole x={416} y={52} size={7} />
      <text x={432} y={44} className="circuit-label">
        −α ± jβ
      </text>
      <MiniCurve x={392} y={56} kind="osc" />
      <text x={456} y={132} textAnchor="middle" className="circuit-label">
        LHP pair
      </text>
      <MathLabel
        x={40}
        y={152}
        w={480}
        h={56}
        tex="$e^{(-\\alpha+j\\beta)t}=e^{-\\alpha t}e^{j\\beta t}$"
        cls="board-formula"
      />
    </Frame>
  );
}

function StabilityView() {
  const cx = 188;
  const cy = 118;
  const half = 86;
  return (
    <Frame label="Left half plane versus right half plane" height={232}>
      <rect
        x={cx - half}
        y={cy - half}
        width={half}
        height={2 * half}
        fill="currentColor"
        opacity="0.12"
      />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.3"
        strokeDasharray="4 6"
      >
        {[-60, -36, -12, 12, 36, 60].map((dy) => (
          <path
            key={dy}
            d={`M${cx} ${cy + dy} L${cx + half} ${cy + dy - 22}`}
          />
        ))}
      </g>
      <SPlane cx={cx} cy={cy} half={half} xLabel="" yLabel="" />
      <path
        d={`M${cx} ${cy - half} V${cy + half}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.45"
      />
      <Pole x={cx - 46} y={cy} />
      <Pole x={cx + 46} y={cy} />
      <Pole x={cx} y={cy - 36} />
      <text x={cx - 48} y={cy + half - 8} textAnchor="middle" className="circuit-label" fontSize="15">
        LHP
      </text>
      <text x={cx + 48} y={cy + half - 8} textAnchor="middle" className="circuit-label" fontSize="15">
        RHP
      </text>
      <text x={cx + 14} y={cy - half + 16} className="circuit-label" fontSize="15">
        jω
      </text>
      <MiniCurve x={330} y={28} kind="decay" />
      <text x={394} y={98} textAnchor="middle" className="circuit-label">
        decays
      </text>
      <MiniCurve x={330} y={118} kind="grow" />
      <text x={394} y={192} textAnchor="middle" className="circuit-label">
        grows
      </text>
    </Frame>
  );
}

function MiniPlane({ cx, cy, poles, label }) {
  const s = 18;
  return (
    <g>
      <SPlane cx={cx} cy={cy} half={72} xLabel="" yLabel="" />
      {poles.map(([re, im], i) => (
        <Pole key={`${label}-${i}`} x={cx + re * s} y={cy - im * s} size={7} />
      ))}
      <text x={cx} y={cy + 92} textAnchor="middle" className="circuit-label">
        {label}
      </text>
    </g>
  );
}

function MuView() {
  return (
    <Frame label="Poles as μ changes" height={248}>
      <MiniPlane
        cx={90}
        cy={108}
        poles={[
          [-1, 2],
          [-1, -2],
        ]}
        label="μ=2  LHP"
      />
      <MiniPlane
        cx={280}
        cy={108}
        poles={[
          [0, Math.sqrt(5)],
          [0, -Math.sqrt(5)],
        ]}
        label="μ=3  jω axis"
      />
      <MiniPlane
        cx={470}
        cy={108}
        poles={[
          [1, 2],
          [1, -2],
        ]}
        label="μ=4  RHP"
      />
      <text x={280} y={224} textAnchor="middle" className="circuit-label">
        real part of the pair is μ − 3
      </text>
    </Frame>
  );
}

function ZerosVsPolesView() {
  return (
    <div className="concept-board">
      <ConceptFlow
        steps={[{ items: ["$$H(s)=\\dfrac{N(s)}{D(s)}$$"] }]}
      />
      <ConceptFlow
        steps={[
          { title: "zeros", footer: "suppress or shape" },
          { title: "poles", footer: "natural modes / stability" },
        ]}
      />
      <p className="concept-flow-caption is-plain">
        judge stability from remaining poles
      </p>
    </div>
  );
}

function ComplexVectorView() {
  const cx = 230;
  const cy = 150;
  const s = 48;
  return (
    <Frame label="2+j as a vector" height={248}>
      <SPlane cx={cx} cy={cy} half={110} xLabel="Real" yLabel="Imag" />
      <path
        d={`M${cx} ${cy} L${cx + 2 * s} ${cy - s}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d={`M${cx + 2 * s - 12} ${cy - s + 2} L${cx + 2 * s} ${cy - s} L${cx + 2 * s - 2} ${cy - s + 14}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d={`M${cx + 26} ${cy} A26 26 0 0 0 ${cx + 22} ${cy - 12}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <MathLabel
        x={cx + 2 * s + 4}
        y={cy - s - 28}
        w={70}
        h={28}
        tex="$2+j$"
        cls="board-formula"
        inline
      />
      <text x={cx + s} y={cy + 18} className="circuit-label">
        2
      </text>
      <text x={cx - 16} y={cy - s / 2} textAnchor="end" className="circuit-label">
        1
      </text>
      <text x={cx + 40} y={cy - 28} className="circuit-label">
        θ
      </text>
      <MathLabel
        x={372}
        y={64}
        w={170}
        h={36}
        tex="$|z|=\\sqrt{5}$"
        cls="board-formula"
        inline
      />
      <MathLabel
        x={372}
        y={100}
        w={170}
        h={36}
        tex="$\\angle 26.6^{\\circ}$"
        cls="board-formula"
        inline
      />
      <text x={450} y={188} textAnchor="middle" className="circuit-label">
        from + real axis
      </text>
    </Frame>
  );
}

function unitCircleMarks(cx, cy, pts) {
  return pts.map(([x, y, label]) => {
    const dx = x - cx;
    const dy = y - cy;
    const onReal = Math.abs(dx) >= Math.abs(dy);
    const lx = onReal ? x + (dx >= 0 ? 16 : -16) : x + (dy < 0 ? 16 : -18);
    const ly = onReal ? y + 18 : y + 5;
    const anchor = (onReal ? dx < 0 : dy > 0) ? "end" : "start";
    return (
      <g key={label}>
        <circle cx={x} cy={y} r="5" fill="currentColor" />
        <text x={lx} y={ly} textAnchor={anchor} className="circuit-label">
          {label}
        </text>
      </g>
    );
  });
}

function JRotationView() {
  const cx = 220;
  const cy = 124;
  const r = 68;
  const pts = [
    [cx + r, cy, "1"],
    [cx, cy - r, "j"],
    [cx - r, cy, "−1"],
    [cx, cy + r, "−j"],
  ];
  return (
    <Frame label="Multiplying by j" height={272}>
      <SPlane cx={cx} cy={cy} half={88} xLabel="" yLabel="" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.45"
      />
      {unitCircleMarks(cx, cy, pts)}
      <path
        d={`M${cx + r - 8} ${cy - 18} A${r} ${r} 0 0 0 ${cx + 18} ${cy - r + 8}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <text x={cx + r + 8} y={cy - r + 8} className="circuit-label">
        +90°
      </text>
      <Box x={360} y={48} w={176} h={140} cls="hot" title="$j^2=-1$" sub="two turns = 180°" />
      <text x={220} y={258} textAnchor="middle" className="circuit-label">
        1 → j → −1 → −j → 1
      </text>
    </Frame>
  );
}

function EulerView() {
  const cx = 220;
  const cy = 124;
  const r = 72;
  const pts = [
    [0, "1"],
    [Math.PI / 2, "j"],
    [Math.PI, "−1"],
    [(3 * Math.PI) / 2, "−j"],
  ].map(([ang, label]) => [
    cx + r * Math.cos(ang),
    cy - r * Math.sin(ang),
    label,
  ]);
  return (
    <Frame label="Euler on the unit circle" height={272}>
      <SPlane cx={cx} cy={cy} half={88} xLabel="" yLabel="" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {unitCircleMarks(cx, cy, pts)}
      <MathLabel
        x={348}
        y={28}
        w={200}
        h={40}
        tex="$e^{j\\theta}=\\cos\\theta+j\\sin\\theta$"
        cls="board-formula"
        inline
      />
      <MathLabel
        x={360}
        y={72}
        w={176}
        h={32}
        tex="$e^{j\\pi}=-1$"
        cls="board-formula"
        inline
      />
      <MathLabel
        x={360}
        y={108}
        w={176}
        h={32}
        tex="$e^{j\\pi/2}=j$"
        cls="board-formula"
        inline
      />
      <MathLabel
        x={360}
        y={144}
        w={176}
        h={32}
        tex="$e^{j2\\pi}=1$"
        cls="board-formula"
        inline
      />
      <text x={220} y={258} textAnchor="middle" className="circuit-label">
        angle from the + real axis
      </text>
    </Frame>
  );
}

function SComponentsView() {
  const decay = samplePath((t) => ({
    x: 292 + t * 230,
    y: 128 + 72 * Math.exp(-t * 2.2) * Math.sin(t * 12 * Math.PI),
  }));
  return (
    <Frame label="Envelope and oscillation" height={248}>
      <Box x={16} y={28} w={240} h={70} cls="hot" title="$e^{\\sigma t}$" sub="envelope" />
      <Box
        x={16}
        y={112}
        w={240}
        h={70}
        cls="hot"
        title="$e^{j\\omega t}$"
        sub="rotation / oscillation"
      />
      <PlotAxes x0={292} y0={196} x1={536} y1={36} xLabel="t" yLabel="" />
      <polyline points={decay} fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x={414} y={228} textAnchor="middle" className="circuit-label">
        σ &lt; 0 decays
      </text>
    </Frame>
  );
}

function JwAxisView() {
  const cx = 180;
  const cy = 128;
  return (
    <Frame label="Sinusoidal steady state on s = jω" height={248}>
      <SPlane cx={cx} cy={cy} half={100} />
      <path
        d={`M${cx} ${cy - 100} V${cy + 100}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        opacity="0.35"
      />
      <circle cx={cx} cy={cy - 44} r="6" fill="currentColor" />
      <MathLabel
        x={cx + 10}
        y={cy - 72}
        w={90}
        h={28}
        tex="$s=j\\omega$"
        cls="board-formula"
        inline
      />
      <FlowArrow x1={210} x2={280} y={84} />
      <g fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M320 150 L470 78" />
        <path d="M456 86 L470 78 L458 94" />
        <path d="M338 150 A28 28 0 0 0 352 128" />
      </g>
      <MathLabel
        x={300}
        y={168}
        w={230}
        h={44}
        tex="$H(j\\omega)=M\\angle\\phi$"
        cls="board-formula"
      />
      <text x={180} y={228} textAnchor="middle" className="circuit-label">
        σ = 0 on this axis
      </text>
    </Frame>
  );
}

function MagnitudePhaseView() {
  const vin = samplePath((t) => ({
    x: 24 + t * 200,
    y: 70 - 28 * Math.cos(t * 4 * Math.PI),
  }));
  const vout = samplePath((t) => ({
    x: 24 + t * 200,
    y: 168 - 16 * Math.cos(t * 4 * Math.PI - Math.PI / 6),
  }));
  return (
    <Frame label="Magnitude scales, angle shifts phase" height={248}>
      <polyline points={vin} fill="none" stroke="currentColor" strokeWidth="2.4" />
      <MathLabel
        x={24}
        y={8}
        w={200}
        h={28}
        tex="$A\\cos(\\omega t)$"
        cls="board-formula"
        inline
      />
      <polyline points={vout} fill="none" stroke="currentColor" strokeWidth="2.4" />
      <MathLabel
        x={24}
        y={108}
        w={200}
        h={28}
        tex="$AM\\cos(\\omega t+\\phi)$"
        cls="board-formula"
        inline
      />
      <FlowArrow x1={240} x2={300} y={70} />
      <Box x={308} y={36} w={228} h={80} cls="hot" title="$H(j\\omega)=M\\angle\\phi$" titleSize={15} />
      <Box x={308} y={132} w={228} h={80} cls="hot" title="same ω" sub="amplitude × M, phase + φ" titleSize={16} />
    </Frame>
  );
}

function PhaseExampleView() {
  const inWave = samplePath((t) => ({
    x: 340 + t * 190,
    y: 78 - 24 * Math.cos(t * 4 * Math.PI),
  }));
  const outWave = samplePath((t) => ({
    x: 340 + t * 190,
    y: 168 - 24 * Math.cos(t * 4 * Math.PI + Math.PI / 2),
  }));
  return (
    <Frame label="H(j2000)=j shifts by +90°" height={248}>
      <Box x={12} y={20} w={200} h={70} cls="hot" title="$H(s)$" sub="$s=j2000$" titleSize={16} />
      <Box x={12} y={104} w={200} h={70} cls="hot" title="$H(j2000)=j=1\\angle 90^{\\circ}$" />
      <SPlane cx={254} cy={128} half={64} xLabel="" yLabel="" />
      <path d="M254 128 V72" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x={262} y={78} className="circuit-label">
        j
      </text>
      <polyline points={inWave} fill="none" stroke="currentColor" strokeWidth="2.3" />
      <MathLabel
        x={340}
        y={8}
        w={200}
        h={28}
        tex="$10\\cos(2000t)$"
        cls="board-formula"
        inline
      />
      <polyline points={outWave} fill="none" stroke="currentColor" strokeWidth="2.3" />
      <MathLabel
        x={330}
        y={108}
        w={220}
        h={28}
        tex="$10\\cos(2000t+90^{\\circ})$"
        cls="board-formula"
        inline
      />
    </Frame>
  );
}

const VIEWS = {
  "pz-fraction": FractionView,
  "pz-plane": PlaneView,
  "pole-time": PoleTimeView,
  stability: StabilityView,
  "mu-stability": MuView,
  "zeros-vs-poles": ZerosVsPolesView,
  "complex-vector": ComplexVectorView,
  "j-rotation": JRotationView,
  euler: EulerView,
  "s-components": SComponentsView,
  "jw-axis": JwAxisView,
  "magnitude-phase": MagnitudePhaseView,
  "phase-example": PhaseExampleView,
};

export default function Section6Schematic({ view }) {
  const View = VIEWS[view] || FractionView;
  return <View />;
}

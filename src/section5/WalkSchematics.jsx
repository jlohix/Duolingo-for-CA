import {
  Arrow,
  Box,
  Capacitor,
  ConceptFlow,
  FlowArrow,
  Frame,
  Inductor,
  MathLabel,
  OpenGap,
  PlotAxes,
  Resistor,
  samplePath,
} from "../components/LabDraw";
import MathText from "../components/MathText";
import { Pole, PzLegend, SPlane, Zero } from "../components/SPlaneMarks";

function Ground({ x, y }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d={`M${x} ${y} V${y + 16}`} />
      <path d={`M${x - 12} ${y + 16} H${x + 12}`} />
      <path d={`M${x - 8} ${y + 22} H${x + 8}`} />
      <path d={`M${x - 4} ${y + 28} H${x + 4}`} />
    </g>
  );
}

function Dot({ x, y }) {
  return <circle cx={x} cy={y} r="3.5" fill="currentColor" />
}

function CapacitorV({ x, y }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3">
      <path d={`M${x} ${y} V${y + 20}`} />
      <path d={`M${x - 16} ${y + 22} H${x + 16}`} />
      <path d={`M${x - 16} ${y + 34} H${x + 16}`} />
      <path d={`M${x} ${y + 36} V${y + 54}`} />
    </g>
  );
}

function VCircle({ cx, cy, plusOn = "right" }) {
  const plus =
    plusOn === "right"
      ? { x: cx + 11, y: cy + 5 }
      : plusOn === "left"
        ? { x: cx - 11, y: cy + 5 }
        : plusOn === "top"
          ? { x: cx, y: cy - 6 }
          : { x: cx, y: cy + 16 };
  const minus =
    plusOn === "right"
      ? { x: cx - 11, y: cy + 5 }
      : plusOn === "left"
        ? { x: cx + 11, y: cy + 5 }
        : plusOn === "top"
          ? { x: cx, y: cy + 16 }
          : { x: cx, y: cy - 6 };
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx={cx} cy={cy} r="18" />
      <text x={plus.x} y={plus.y} textAnchor="middle" className="circuit-label" fontSize="13">
        +
      </text>
      <text x={minus.x} y={minus.y} textAnchor="middle" className="circuit-label" fontSize="13">
        −
      </text>
    </g>
  );
}

function PanelRule({ x = 280, y1 = 12, y2 = 220 }) {
  return (
    <path
      d={`M${x} ${y1} V${y2}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.28"
    />
  );
}

function TinyWave({ x, y, kind }) {
  const w = 70;
  const pts =
    kind === "impulse"
      ? `${x},${y + 18} ${x + 28},${y + 18} ${x + 32},${y} ${x + 36},${y + 18} ${x + w},${y + 18}`
      : kind === "step"
        ? `${x},${y + 18} ${x + 24},${y + 18} ${x + 24},${y + 2} ${x + w},${y + 2}`
          : kind === "exp"
          ? samplePath((t) => ({
              x: x + t * w,
              y: y + 2 + 16 * (1 - Math.exp(-t * 4)),
            }))
          : kind === "ramp"
            ? `${x},${y + 18} ${x + w},${y + 2}`
            : kind === "sine"
              ? samplePath((t) => ({
                  x: x + t * w,
                  y: y + 10 - 10 * Math.sin(t * 4 * Math.PI),
                }))
              : samplePath((t) => ({
                  x: x + t * w,
                  y: y + 10 - 10 * Math.cos(t * 4 * Math.PI),
                }));
  return (
    <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
  );
}

function MapView() {
  return (
    <>
      <ConceptFlow
        dual
        steps={[
          {
            title: "TIME DOMAIN",
            items: ["$f(t)$"],
            footer: ["derivatives, integrals", "differential equations"],
          },
          {
            arrow: "LT",
            back: "inverse LT",
            title: "s-DOMAIN",
            items: ["$F(s)$"],
            footer: ["multiply by s", "algebraic equations"],
          },
        ]}
      />
      <p className="concept-flow-caption">
        <MathText text="$s=\\sigma+j\\omega$" />
      </p>
    </>
  );
}

const UNILATERAL_EQ =
  "$$F(s)=\\displaystyle\\int_{0^{-}}^{\\infty} f(t)\\,e^{-st}\\,dt$$";

function UnilateralView() {
  const y = 148;
  const origin = 176;
  const history = samplePath((t) => ({
    x: 48 + t * (origin - 48),
    y: 104 - 18 * Math.sin(t * 3.2 * Math.PI) - 10 * Math.cos(t * 5.4 * Math.PI),
  }));
  const wave = samplePath((t) => ({
    x: origin + t * 300,
    y: 100 - 36 * Math.exp(-t * 2.4) * Math.cos(t * 8 * Math.PI),
  }));
  return (
    <>
      <Frame label="Unilateral transform region" height={188}>
        <rect
          x={origin}
          y={36}
          width={308}
          height={y - 36}
          fill="currentColor"
          opacity="0.12"
        />
        <polyline
          points={history}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          opacity="0.32"
        />
        <polyline points={wave} fill="none" stroke="currentColor" strokeWidth="2.5" />
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M48 148 H528" />
          <path d="M518 141 L528 148 L518 155" />
          <path d={`M${origin} 36 V168`} />
        </g>
        <text x={origin - 10} y={176} textAnchor="end" className="circuit-label">
          0⁻
        </text>
        <text x={origin + 10} y={176} className="circuit-label">
          t = 0
        </text>
        <text x={528} y={172} textAnchor="end" className="circuit-part">
          t
        </text>
        <text x={96} y={52} textAnchor="middle" className="circuit-label">
          not integrated
        </text>
        <text x={360} y={52} textAnchor="middle" className="circuit-label">
          used by unilateral LT
        </text>
      </Frame>
      <p className="focus-eq lab-board-eq">
        <MathText text={UNILATERAL_EQ} />
      </p>
    </>
  );
}

function PairsView() {
  const rows = [
    ["impulse", "$\\delta(t)$", "$1$"],
    ["step", "$u(t)$", "$\\frac{1}{s}$"],
    ["exp", "$e^{-at}u(t)$", "$\\frac{1}{s+a}$"],
    ["ramp", "$t\\,u(t)$", "$\\frac{1}{s^2}$"],
  ];
  return (
    <Frame label="Core transform pairs" height={248}>
      <text x={58} y={22} className="circuit-part">
        shape
      </text>
      <text x={198} y={22} className="circuit-part">
        time
      </text>
      <text x={400} y={22} className="circuit-part">
        s-domain
      </text>
      {rows.map(([kind, time, s], i) => {
        const y = 28 + i * 54;
        return (
          <g key={time}>
            <TinyWave x={16} y={y + 12} kind={kind} />
            <MathLabel x={92} y={y} w={150} h={50} tex={time} cls="board-formula" inline />
            <Arrow x1={250} y={y + 24} x2={292} cls="hot" />
            <MathLabel x={300} y={y} w={240} h={50} tex={s} cls="board-formula" inline />
          </g>
        );
      })}
    </Frame>
  );
}

function TrigPairsView() {
  return (
    <Frame label="Sine and cosine pairs" height={232}>
      <TinyWave x={16} y={40} kind="sine" />
      <MathLabel
        x={96}
        y={24}
        w={200}
        h={56}
        tex="$\\sin(\\omega t)u(t)$"
        cls="board-formula"
        inline
      />
      <Arrow x1={300} y={48} x2={348} cls="hot" />
      <MathLabel
        x={356}
        y={24}
        w={190}
        h={56}
        tex="$\\frac{\\omega}{s^2+\\omega^2}$"
        cls="board-formula"
        inline
      />
      <text x={54} y={88} textAnchor="middle" className="circuit-label">
        ω on top
      </text>
      <TinyWave x={16} y={148} kind="cosine" />
      <MathLabel
        x={96}
        y={132}
        w={200}
        h={56}
        tex="$\\cos(\\omega t)u(t)$"
        cls="board-formula"
        inline
      />
      <Arrow x1={300} y={156} x2={348} cls="hot" />
      <MathLabel
        x={356}
        y={132}
        w={190}
        h={56}
        tex="$\\frac{s}{s^2+\\omega^2}$"
        cls="board-formula"
        inline
      />
      <text x={54} y={196} textAnchor="middle" className="circuit-label">
        s on top
      </text>
    </Frame>
  );
}

function ShiftsView() {
  const delayed = "40,108 40,108 112,108 112,56 244,56";
  const env = samplePath((t) => ({
    x: 304 + t * 216,
    y: 84 - 28 * Math.exp(-t * 3) * Math.cos(t * 10 * Math.PI),
  }));
  return (
    <Frame label="Time shift versus frequency shift" height={232}>
      <text x={142} y={22} textAnchor="middle" className="circuit-part">
        TIME SHIFT
      </text>
      <polyline points={delayed} fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x={142} y={134} textAnchor="middle" className="circuit-label">
        waits until t = a
      </text>
      <MathLabel x={16} y={142} w={248} h={32} tex="$f(t-a)u(t-a)$" cls="board-formula" inline />
      <MathLabel
        x={16}
        y={186}
        w={248}
        h={36}
        tex="$\\rightarrow\\,e^{-as}F(s)$"
        cls="board-formula"
        inline
      />
      <PanelRule />
      <text x={418} y={22} textAnchor="middle" className="circuit-part">
        FREQUENCY SHIFT
      </text>
      <polyline points={env} fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text x={418} y={134} textAnchor="middle" className="circuit-label">
        multiply by e^(-at)
      </text>
      <MathLabel x={296} y={142} w={248} h={32} tex="$e^{-at}f(t)$" cls="board-formula" inline />
      <MathLabel
        x={296}
        y={186}
        w={248}
        h={36}
        tex="$\\rightarrow\\,F(s+a)$"
        cls="board-formula"
        inline
      />
    </Frame>
  );
}

function DerivativeView() {
  return (
    <div className="concept-board">
      <ConceptFlow
        compact
        steps={[
          { items: ["$f'(t)$"] },
          { arrow: "LT", items: ["$sF(s)-f(0^-)$"] },
        ]}
      />
      <ConceptFlow
        compact
        steps={[
          { items: ["$f''(t)$"] },
          { arrow: "LT", items: ["$s^2F-sf(0^-)-f'(0^-)$"] },
        ]}
      />
    </div>
  );
}

function InitialFinalView() {
  const settle = samplePath((t) => ({
    x: 48 + t * 464,
    y: 140 - 52 * Math.exp(-t * 3.2),
  }));
  return (
    <Frame label="Initial and final value theorems" height={248}>
      <polyline points={settle} fill="none" stroke="currentColor" strokeWidth="2.4" />
      <g fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M48 156 H520" />
        <path d="M510 149 L520 156 L510 163" />
      </g>
      <circle cx={48} cy={88} r="6" fill="currentColor" />
      <circle cx={512} cy={140} r="6" fill="currentColor" />
      <text x={110} y={80} textAnchor="middle" className="circuit-part">
        INITIAL
      </text>
      <text x={450} y={128} textAnchor="middle" className="circuit-part">
        FINAL
      </text>
      <MathLabel
        x={12}
        y={158}
        w={260}
        h={56}
        tex={"$$f(0^+)=\\lim_{s\\to\\infty}sF(s)$$"}
        cls="board-formula"
      />
      <MathLabel
        x={288}
        y={158}
        w={260}
        h={56}
        tex={"$$f(\\infty)=\\lim_{s\\to 0}sF(s)$$"}
        cls="board-formula"
      />
      <text x={280} y={218} textAnchor="middle" className="circuit-label">
        final value only if a finite limit exists
      </text>
      <text x={528} y={148} textAnchor="end" className="circuit-part">
        t
      </text>
    </Frame>
  );
}

function PfeView() {
  return (
    <div className="concept-board">
      <ConceptFlow
        steps={[
          { items: ["$$F(s)=\\dfrac{3}{(s+1)(s+2)}$$"] },
          { arrow: "PFE", items: ["$$F(s)=\\dfrac{3}{s+1}-\\dfrac{3}{s+2}$$"] },
        ]}
      />
      <ConceptFlow
        stacked
        steps={[{ arrow: "inverse LT", items: ["$$f(t)=3\\left(e^{-t}-e^{-2t}\\right)u(t)$$"] }]}
      />
    </div>
  );
}

function InverseShapesView() {
  const rows = [
    [
      (t, y) => {
        const u = Math.max(0.02, t * 5);
        return { x: 16 + t * 96, y: y + 50 - 130 * u * Math.exp(-u) };
      },
      "$(s+a)^2$",
      "$t e^{-at}u(t)$",
    ],
    [
      (t, y) => ({
        x: 16 + t * 96,
        y: y + 32 - 20 * Math.exp(-t * 2.4) * Math.cos(t * 10 * Math.PI),
      }),
      "cosine form",
      "$e^{-at}\\cos(\\omega t)u(t)$",
    ],
    [
      (t, y) => ({
        x: 16 + t * 96,
        y: y + 32 - 20 * Math.exp(-t * 2.4) * Math.sin(t * 10 * Math.PI),
      }),
      "sine form",
      "$e^{-at}\\sin(\\omega t)u(t)$",
    ],
  ];
  return (
    <Frame label="Repeated and quadratic table shapes" height={236}>
      {rows.map(([waveFn, left, right], i) => {
        const y = 16 + i * 72;
        return (
          <g key={left}>
            <polyline
              points={samplePath((t) => waveFn(t, y))}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <Box x={122} y={y} w={148} h={58} cls="hot" title={left} titleSize={15} />
            <FlowArrow x1={278} x2={318} y={y + 29} />
            <Box x={326} y={y} w={218} h={58} cls="hot" title={right} titleSize={14} />
          </g>
        );
      })}
    </Frame>
  );
}

function WorkflowView() {
  return (
    <ConceptFlow
      steps={[
        {
          title: "TIME CIRCUIT",
          items: ["$R,\\;L,\\;C$", "$v(t),\\;i(t)$"],
        },
        {
          arrow: "LT",
          title: "s-DOMAIN",
          items: ["$R$", "$sL$", "$$\\dfrac{1}{sC}$$"],
          footer: "Apply KCL / KVL",
        },
        {
          arrow: "inverse LT",
          title: "TIME RESPONSE",
          items: ["$v(t),\\;i(t)$"],
        },
      ]}
    />
  );
}

function DownArrow({ x, y1, y2 }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d={`M${x} ${y1} V${y2}`} />
      <path d={`M${x - 7} ${y2 - 10} L${x} ${y2} L${x + 7} ${y2 - 10}`} />
    </g>
  );
}

function ElementsView() {
  return (
    <Frame label="Zero-IC element impedances" height={248}>
      <text x={100} y={24} textAnchor="middle" className="circuit-part">
        R
      </text>
      <Resistor x={44} y={58} cls="hot" />
      <DownArrow x={100} y1={86} y2={118} />
      <Box x={28} y={128} w={144} h={70} cls="hot" title="$Z_R=R$" />
      <text x={280} y={24} textAnchor="middle" className="circuit-part">
        L
      </text>
      <Inductor x={220} y={58} cls="hot" />
      <DownArrow x={280} y1={86} y2={118} />
      <Box x={208} y={128} w={144} h={70} cls="hot" title="$Z_L=sL$" />
      <text x={460} y={24} textAnchor="middle" className="circuit-part">
        C
      </text>
      <Capacitor x={424} y={58} cls="hot" />
      <DownArrow x={460} y1={86} y2={118} />
      <Box x={388} y={128} w={148} h={70} cls="hot" title="$Z_C=\\dfrac{1}{sC}$" />
      <MathLabel
        x={160}
        y={204}
        w={240}
        h={36}
        tex="$V(s)=I(s)Z(s)$"
        cls="board-formula"
      />
    </Frame>
  );
}

function InductorIcView() {
  const y = 88;
  return (
    <Frame label="Inductor with initial current" height={232}>
      <text x={140} y={22} textAnchor="middle" className="circuit-part">
        time
      </text>
      <text x={40} y={y - 16} className="circuit-label">
        +
      </text>
      <text x={240} y={y - 16} className="circuit-label">
        −
      </text>
      <Dot x={40} y={y} />
      <path d={`M40 ${y} H64`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Inductor x={64} y={y} cls="hot" />
      <path d={`M184 ${y} H240`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Dot x={240} y={y} />
      <text x={100} y={y - 16} className="circuit-label">
        i(t) →
      </text>
      <MathLabel x={84} y={y + 8} w={56} h={30} tex="$L$" inline />
      <MathLabel
        x={40}
        y={188}
        w={200}
        h={32}
        tex="$v=L\\,di/dt$"
        cls="board-formula"
        inline
      />
      <PanelRule />
      <text x={420} y={22} textAnchor="middle" className="circuit-part">
        s-domain
      </text>
      <Dot x={300} y={y} />
      <path d={`M300 ${y} H316`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Inductor x={316} y={y} cls="hot" />
      <VCircle cx={454} cy={y} plusOn="right" />
      <path d={`M472 ${y} H536`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Dot x={536} y={y} />
      <MathLabel x={336} y={y + 8} w={60} h={30} tex="$sL$" inline />
      <MathLabel x={430} y={y + 28} w={80} h={32} tex="$Li(0^-)$" inline />
      <MathLabel
        x={320}
        y={188}
        w={200}
        h={32}
        tex="$V=sLI-Li(0^-)$"
        cls="board-formula"
        inline
      />
    </Frame>
  );
}

function CapacitorIcView() {
  const y = 88;
  return (
    <Frame label="Capacitor with initial voltage" height={232}>
      <text x={140} y={22} textAnchor="middle" className="circuit-part">
        time
      </text>
      <text x={40} y={y - 16} className="circuit-label">
        +
      </text>
      <text x={240} y={y - 16} className="circuit-label">
        −
      </text>
      <Dot x={40} y={y} />
      <path d={`M40 ${y} H64`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Capacitor x={64} y={y} cls="hot" />
      <path d={`M138 ${y} H240`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Dot x={240} y={y} />
      <MathLabel x={80} y={y + 8} w={52} h={30} tex="$C$" inline />
      <MathLabel
        x={40}
        y={188}
        w={200}
        h={32}
        tex="$i=C\\,dv/dt$"
        cls="board-formula"
        inline
      />
      <PanelRule />
      <text x={420} y={22} textAnchor="middle" className="circuit-part">
        s-domain
      </text>
      <Dot x={300} y={y} />
      <path d={`M300 ${y} H320`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Capacitor x={320} y={y} cls="hot" />
      <VCircle cx={412} cy={y} plusOn="left" />
      <path d={`M430 ${y} H536`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Dot x={536} y={y} />
      <MathLabel x={324} y={y + 8} w={80} h={30} tex="$\\frac{1}{sC}$" inline />
      <MathLabel x={400} y={y + 28} w={90} h={32} tex="$v_C(0^-)/s$" inline />
      <MathLabel
        x={300}
        y={188}
        w={240}
        h={32}
        tex="$V=I/(sC)+v_C(0^-)/s$"
        cls="board-formula"
        inline
      />
    </Frame>
  );
}

function InitialDcView() {
  return (
    <Frame label="DC initial conditions" height={232}>
      <text x={140} y={22} textAnchor="middle" className="circuit-part">
        capacitor → open
      </text>
      <path d="M36 64 H80" fill="none" stroke="currentColor" strokeWidth="3" />
      <OpenGap x={80} y={64} cls="hot" />
      <path d="M154 64 H228 V140 H36 V64" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x={140} y={56} textAnchor="middle" className="circuit-label">
        open
      </text>
      <MathLabel x={40} y={152} w={200} h={36} tex="$v_C(0^-)$" cls="board-formula" inline />
      <text x={140} y={210} textAnchor="middle" className="circuit-label">
        then build t &gt; 0 s-model
      </text>
      <PanelRule />
      <text x={420} y={22} textAnchor="middle" className="circuit-part">
        inductor → short
      </text>
      <path d="M316 64 H516 V140 H316 V64" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x={420} y={56} textAnchor="middle" className="circuit-label">
        wire
      </text>
      <MathLabel x={320} y={152} w={200} h={36} tex="$i_L(0^-)$" cls="board-formula" inline />
      <text x={420} y={210} textAnchor="middle" className="circuit-label">
        then build t &gt; 0 s-model
      </text>
    </Frame>
  );
}

function RcSrc({ x, y }) {
  return (
    <g className="hot" fill="none" stroke="currentColor" strokeWidth="3">
      <path d={`M${x} ${y} H${x + 28}`} />
      <path d={`M${x + 30} ${y - 12} V${y + 12}`} />
      <path d={`M${x + 42} ${y - 22} V${y + 22}`} />
      <path d={`M${x + 44} ${y} H${x + 72}`} />
      <text x={x + 26} y={y - 16} textAnchor="middle" className="circuit-label">
        −
      </text>
      <text x={x + 50} y={y - 16} textAnchor="middle" className="circuit-label">
        +
      </text>
    </g>
  );
}

function RcLoop({ x, top, bot, srcLabel, rLabel, cLabel, outLabel }) {
  const src = x + 12;
  const batX = x + 18;
  const resX = batX + 70;
  const node = resX + 112;
  return (
    <g>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d={`M${src} ${top} V${bot} H${node} V${top + 54}`} />
        <path d={`M${src} ${top} H${batX}`} />
      </g>
      <RcSrc x={batX} y={top} />
      <path
        d={`M${batX + 72} ${top} H${resX}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <Resistor x={resX} y={top} cls="hot" />
      <CapacitorV x={node} y={top} />
      <Dot x={node} y={top} />
      <Ground x={node} y={bot} />
      <MathLabel x={batX - 8} y={top - 40} w={88} h={30} tex={srcLabel} inline />
      <text x={resX + 56} y={top + 22} textAnchor="middle" className="circuit-label" fontSize="15">
        {rLabel}
      </text>
      <text x={node + 38} y={top + 28} textAnchor="start" className="circuit-label" fontSize="15">
        {cLabel}
      </text>
      <text x={node - 8} y={top - 10} textAnchor="end" className="circuit-label" fontSize="15">
        {outLabel}
      </text>
    </g>
  );
}

function RcWorkedView() {
  return (
    <Frame label="RC step in time and s" height={232}>
      <text x={140} y={20} textAnchor="middle" className="circuit-part">
        time
      </text>
      <RcLoop
        x={0}
        top={68}
        bot={186}
        srcLabel="$10u(t)$"
        rLabel="2 Ω"
        cLabel="0.5 F"
        outLabel="vC"
      />
      <PanelRule />
      <text x={420} y={20} textAnchor="middle" className="circuit-part">
        s-domain
      </text>
      <RcLoop
        x={280}
        top={68}
        bot={186}
        srcLabel="$10/s$"
        rLabel="2 Ω"
        cLabel="2/s"
        outLabel="VC(s)"
      />
    </Frame>
  );
}

function RcResponseView() {
  const curve = samplePath((t) => ({
    x: 292 + t * 230,
    y: 196 - 128 * (1 - Math.exp(-t * 2.4)),
  }));
  return (
    <Frame label="PFE and charging curve" height={248}>
      <Box x={12} y={36} w={250} h={70} cls="hot" title="$\\dfrac{10}{s}-\\dfrac{10}{s+1}$" />
      <DownArrow x={137} y1={110} y2={136} />
      <Box
        x={12}
        y={140}
        w={250}
        h={70}
        cls="hot"
        title="$10(1-e^{-t})u(t)$"
        titleSize={16}
      />
      <PlotAxes x0={292} y0={196} x1={536} y1={36} xLabel="t" yLabel="v_C" />
      <polyline points={curve} fill="none" stroke="currentColor" strokeWidth="3" />
      <path
        d="M388 196 V122"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <text x={388} y={216} textAnchor="middle" className="circuit-label">
        τ=1 s
      </text>
      <text x={500} y={64} className="circuit-label">
        10 V
      </text>
      <text x={396} y={114} className="circuit-label">
        ≈6.32 V
      </text>
    </Frame>
  );
}

function BatteryV({ x, y1, y2 }) {
  const mid = (y1 + y2) / 2;
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d={`M${x} ${y1} V${mid - 8}`} />
      <path d={`M${x - 14} ${mid - 8} H${x + 14}`} />
      <path d={`M${x - 8} ${mid + 8} H${x + 8}`} />
      <path d={`M${x} ${mid + 8} V${y2}`} />
      <text x={x - 22} y={mid - 2} className="circuit-label">
        +
      </text>
      <text x={x - 22} y={mid + 18} className="circuit-label">
        −
      </text>
    </g>
  );
}

function RlWorkedView() {
  const top = 60;
  const bot = 156;
  return (
    <Frame label="RL with initial current" height={232}>
      <text x={140} y={20} textAnchor="middle" className="circuit-part">
        time
      </text>
      <BatteryV x={40} y1={top} y2={bot} />
      <path d={`M40 ${top} H56`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Inductor x={56} y={top} cls="hot" />
      <path
        d={`M176 ${top} H228 V${bot} H152`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <Resistor x={40} y={bot} cls="hot" />
      <Dot x={40} y={top} />
      <Dot x={228} y={top} />
      <MathLabel x={8} y={top + 32} w={64} h={30} tex="$6u(t)$" inline />
      <MathLabel x={80} y={top + 6} w={52} h={30} tex="$1\\,H$" inline />
      <text x={84} y={bot + 22} className="circuit-label" fontSize="15">
        2 Ω
      </text>
      <text x={84} y={top - 10} className="circuit-label">
        i(0⁻)=1 A →
      </text>
      <PanelRule />
      <text x={420} y={20} textAnchor="middle" className="circuit-part">
        s-domain
      </text>
      <BatteryV x={320} y1={top} y2={bot} />
      <path d={`M320 ${top} H336`} fill="none" stroke="currentColor" strokeWidth="3" />
      <Inductor x={336} y={top} cls="hot" />
      <VCircle cx={474} cy={top} plusOn="right" />
      <path
        d={`M492 ${top} H540 V${bot} H432`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <Resistor x={320} y={bot} cls="hot" />
      <Dot x={320} y={top} />
      <Dot x={492} y={top} />
      <MathLabel x={284} y={top + 32} w={56} h={30} tex="$6/s$" inline />
      <MathLabel x={364} y={top + 6} w={40} h={30} tex="$s$" inline />
      <text x={364} y={bot + 22} className="circuit-label" fontSize="15">
        2 Ω
      </text>
      <MathLabel x={448} y={top + 26} w={56} h={30} tex="$1$" inline />
    </Frame>
  );
}

function TfBlockView() {
  return (
    <div className="concept-board">
      <ConceptFlow
        compact
        steps={[
          { title: "INPUT", items: ["$X(s)$"] },
          { title: "SYSTEM", items: ["$H(s)$"] },
          { title: "OUTPUT", items: ["$Y(s)$"] },
        ]}
      />
      <p className="concept-flow-caption">
        <MathText text={"$$H(s)=\\dfrac{Y(s)}{X(s)}$$"} />
      </p>
      <p className="concept-flow-caption is-plain">zero initial conditions</p>
    </div>
  );
}

function TfTypesView() {
  const cards = [
    ["Voltage gain", "$\\frac{V_o}{V_i}$"],
    ["Current gain", "$\\frac{I_o}{I_i}$"],
    ["Impedance", "$\\frac{V}{I}$"],
    ["Admittance", "$\\frac{I}{V}$"],
  ];
  return (
    <Frame label="Input-output ratio types" height={248}>
      {cards.map(([title, sub], i) => (
        <Box
          key={title}
          x={24 + (i % 2) * 268}
          y={24 + Math.floor(i / 2) * 108}
          w={244}
          h={92}
          cls="hot"
          title={title}
          sub={sub}
          titleSize={16}
        />
      ))}
    </Frame>
  );
}

function TfRcView() {
  const node = 236;
  return (
    <Frame label="RC low-pass in s" height={232}>
      <path d="M20 72 H64" fill="none" stroke="currentColor" strokeWidth="3" />
      <Resistor x={64} y={72} cls="hot" />
      <path d={`M176 72 H${node}`} fill="none" stroke="currentColor" strokeWidth="3" />
      <CapacitorV x={node} y={72} />
      <path
        d={`M${node} 126 V196 H20`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <Ground x={node} y={196} />
      <Dot x={20} y={72} />
      <Dot x={20} y={196} />
      <Dot x={node} y={72} />
      <MathLabel x={4} y={36} w={64} h={30} tex="$V_i$" inline />
      <text x={8} y={188} className="circuit-label">
        ref
      </text>
      <MathLabel x={84} y={78} w={52} h={30} tex="$R$" inline />
      <MathLabel x={node + 8} y={88} w={90} h={36} tex="$\\frac{1}{sC}$" inline />
      <MathLabel x={node - 22} y={34} w={70} h={30} tex="$V_o$" inline />
      <MathLabel
        x={290}
        y={72}
        w={250}
        h={70}
        tex="$H(s)=\\dfrac{1}{1+sRC}$"
        cls="board-formula"
      />
    </Frame>
  );
}

function ImpulseView() {
  const decay = samplePath((t) => ({
    x: 292 + t * 230,
    y: 56 + 128 * (1 - Math.exp(-t * 3.2)),
  }));
  return (
    <Frame label="Impulse response from H(s)" height={232}>
      <Box x={12} y={36} w={110} h={80} cls="hot" title="$H(s)$" />
      <FlowArrow x1={128} x2={176} y={76} label="inverse LT" />
      <Box x={180} y={36} w={90} h={80} cls="hot" title="$h(t)$" />
      <PlotAxes x0={292} y0={188} x1={536} y1={28} xLabel="t" yLabel="h" />
      <polyline points={decay} fill="none" stroke="currentColor" strokeWidth="3" />
      <MathLabel
        x={20}
        y={132}
        w={250}
        h={56}
        tex="$h(t)=\\mathcal{L}^{-1}\\{H(s)\\}$"
        cls="board-formula"
      />
    </Frame>
  );
}

function TfOutputView() {
  return (
    <div className="concept-board">
      <p className="concept-flow-kicker">multiply in s</p>
      <ConceptFlow
        compact
        steps={[
          { items: ["$X(s)$"] },
          { items: ["$H(s)$"] },
          { items: ["$Y(s)=H(s)X(s)$"] },
        ]}
      />
      <p className="concept-flow-kicker">convolve in t</p>
      <ConceptFlow
        compact
        steps={[
          { items: ["$x(t)$"] },
          { arrow: "∗", items: ["$h(t)$"] },
          { items: ["$y(t)$"] },
        ]}
      />
    </div>
  );
}

function TfBridgeView() {
  const cx = 430;
  const cy = 128;
  const s = 20;
  return (
    <Frame label="Zeros and poles from H(s)" height={232}>
      <Box
        x={12}
        y={16}
        w={250}
        h={64}
        cls="hot"
        title="$H(s)=\\dfrac{N(s)}{D(s)}$"
        titleSize={16}
      />
      <Box x={12} y={96} w={118} h={68} cls="hot" title="zeros" sub="from $N(s)$" />
      <Box x={144} y={96} w={118} h={68} cls="hot" title="poles" sub="from $D(s)$" />
      <SPlane cx={cx} cy={cy} half={88} />
      <Zero x={cx - 2 * s} y={cy} />
      <Pole x={cx - 1 * s} y={cy} />
      <Pole x={cx - 4 * s} y={cy} />
      <PzLegend x={16} y={196} />
    </Frame>
  );
}

const VIEWS = {
  map: MapView,
  "lt-map": MapView,
  unilateral: UnilateralView,
  pairs: PairsView,
  "trig-pairs": TrigPairsView,
  shifts: ShiftsView,
  derivative: DerivativeView,
  "initial-final": InitialFinalView,
  pfe: PfeView,
  "inverse-shapes": InverseShapesView,
  workflow: WorkflowView,
  elements: ElementsView,
  "inductor-ic": InductorIcView,
  "capacitor-ic": CapacitorIcView,
  "initial-dc": InitialDcView,
  "rc-worked": RcWorkedView,
  "rc-response": RcResponseView,
  "rl-worked": RlWorkedView,
  "tf-block": TfBlockView,
  "tf-types": TfTypesView,
  "tf-rc": TfRcView,
  "impulse-response": ImpulseView,
  "tf-output": TfOutputView,
  "tf-bridge": TfBridgeView,
};

export default function Section5Schematic({ view }) {
  const View = VIEWS[view] || MapView;
  return <View />;
}

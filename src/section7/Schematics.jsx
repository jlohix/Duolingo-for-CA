import {
  Arrow,
  Box,
  ConceptFlow,
  FlowArrow,
  Frame,
  Inductor,
  MathLabel,
  PlotAxes,
  Resistor,
  samplePath,
  SplitFrame,
} from "../components/LabDraw";
import MathText from "../components/MathText";

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
  return <circle cx={x} cy={y} r="3.5" fill="currentColor" />;
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

function Wire({ d }) {
  return <path d={d} fill="none" stroke="currentColor" strokeWidth="3" />;
}

function LcNetwork({ sDomain }) {
  const top = 56;
  const bot = 168;
  const left = 28;
  const node = 196;
  return (
    <g>
      <Wire d={`M${left} ${top} H52`} />
      <Inductor x={52} y={top} cls="hot" />
      <Wire d={`M172 ${top} H${node}`} />
      <CapacitorV x={node} y={top} />
      <Wire d={`M${node} 110 V${bot} H${left}`} />
      <Dot x={left} y={top} />
      <Dot x={left} y={bot} />
      <Dot x={node} y={top} />
      <Ground x={node} y={bot} />
      <text x={left - 12} y={top + 6} className="circuit-label">+</text>
      <text x={left - 12} y={bot + 6} className="circuit-label">−</text>
      <MathLabel x={left - 8} y={88} w={40} h={24} tex="$V_1$" inline />
      <text x={node - 20} y={top + 8} className="circuit-label">+</text>
      <text x={node - 20} y={bot - 4} className="circuit-label">−</text>
      <MathLabel x={node - 58} y={88} w={40} h={24} tex="$V_2$" inline />
      <Arrow x1={left + 4} y={top - 18} x2={left + 22} cls="hot" />
      <MathLabel x={left + 8} y={top - 46} w={40} h={22} tex="$I_1$" inline />
      <MathLabel
        x={78}
        y={top + 8}
        w={72}
        h={26}
        tex={sDomain ? "$5s$" : "$5\\,\\mathrm{H}$"}
        inline
      />
      <MathLabel
        x={node + 8}
        y={top + 16}
        w={70}
        h={36}
        tex={sDomain ? "$\\dfrac{1}{2s}$" : "$2\\,\\mathrm{F}$"}
        inline
      />
    </g>
  );
}

function NetworkFunctionView() {
  return (
    <div className="concept-board">
      <ConceptFlow
        compact
        steps={[
          { title: "INPUT", items: ["$X(s)$"] },
          { title: "NETWORK", items: ["zero ICs"] },
          { title: "OUTPUT", items: ["$Y(s)$"] },
        ]}
      />
      <p className="concept-flow-caption">
        <MathText text={"$$H(s)=\\dfrac{Y(s)}{X(s)}$$"} />
      </p>
    </div>
  );
}

function VSrcV({ cx, cy }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx={cx} cy={cy} r="18" />
      <text x={cx} y={cy - 22} textAnchor="middle" className="circuit-label">
        +
      </text>
      <text x={cx} y={cy + 34} textAnchor="middle" className="circuit-label">
        −
      </text>
    </g>
  );
}

function SameNetworkView() {
  const top = 72;
  const bot = 200;
  const src = 46;
  const midY = (top + bot) / 2;
  const r0 = 118;
  const node = 256;
  return (
    <Frame label="Same RC circuit, two outputs" height={268}>
      <Wire d={`M${src} ${top} H${r0}`} />
      <Resistor x={r0} y={top} cls="hot" />
      <Wire d={`M${r0 + 112} ${top} H${node}`} />
      <CapacitorV x={node} y={top} />
      <Wire d={`M${node} 126 V${bot} H${src} V${midY + 18}`} />
      <Wire d={`M${src} ${top} V${midY - 18}`} />
      <VSrcV cx={src} cy={midY} />
      <Dot x={node} y={top} />
      <Ground x={node} y={bot} />
      <Arrow x1={70} y={50} x2={118} cls="hot" />
      <MathLabel x={78} y={22} w={28} h={22} tex="$I$" inline />
      <MathLabel x={src - 44} y={midY - 14} w={44} h={24} tex="$V_{in}$" inline />
      <MathLabel x={r0 + 38} y={top + 18} w={36} h={24} tex="$R$" inline />
      <MathLabel x={node + 20} y={top + 18} w={40} h={24} tex="$C$" inline />
      <text x={node - 18} y={top + 8} className="circuit-label">+</text>
      <text x={node - 18} y={bot - 8} className="circuit-label">−</text>
      <MathLabel x={node - 58} y={132} w={40} h={24} tex="$V_C$" inline />
      <Box
        x={318}
        y={16}
        w={224}
        h={110}
        cls="hot"
        title={"OUTPUT $=V_C$"}
        sub={"$\\dfrac{1}{1+sRC}$"}
      />
      <Box
        x={318}
        y={140}
        w={224}
        h={110}
        cls="hot"
        title={"OUTPUT $=I$"}
        sub={"$\\dfrac{sC}{1+sRC}$"}
      />
    </Frame>
  );
}

function DrivingTransferView() {
  return (
    <SplitFrame
      label="Driving-point versus transfer"
      height={236}
      left={
        <>
          <rect
            x={136}
            y={20}
            width={120}
            height={118}
            rx="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <text x={196} y={86} textAnchor="middle" className="circuit-label" fontSize="20">
            N
          </text>
          <Wire d="M52 42 H136" />
          <Wire d="M52 116 H136" />
          <Dot x={52} y={42} />
          <Dot x={52} y={116} />
          <Dot x={136} y={42} />
          <Dot x={136} y={116} />
          <Arrow x1={60} y={22} x2={118} cls="hot" />
          <MathLabel x={72} y={0} w={28} h={22} tex="$I$" inline />
          <text x={18} y={48} className="circuit-label">+</text>
          <text x={18} y={122} className="circuit-label">−</text>
          <MathLabel x={6} y={68} w={32} h={24} tex="$V$" inline />
          <MathLabel
            x={16}
            y={148}
            w={240}
            h={40}
            tex={"$Z(s)=\\dfrac{V(s)}{I(s)}$"}
            cls="board-formula"
          />
          <text x={196} y={208} textAnchor="middle" className="circuit-label">
            same port
          </text>
        </>
      }
      right={
        <>
          <Box x={8} y={20} w={62} h={72} cls="hot" title={"$X(s)$"} />
          <Arrow x1={76} y={56} x2={100} cls="hot" />
          <Box x={104} y={20} w={62} h={72} cls="hot" title="N" />
          <Arrow x1={172} y={56} x2={196} cls="hot" />
          <Box x={200} y={20} w={60} h={72} cls="hot" title={"$Y(s)$"} />
          <MathLabel
            x={16}
            y={108}
            w={240}
            h={72}
            tex={"$H(s)=\\dfrac{Y(s)}{X(s)}$"}
            cls="board-formula"
          />
          <text x={136} y={208} textAnchor="middle" className="circuit-label">
            different ports
          </text>
        </>
      }
    />
  );
}

function FunctionTypesView() {
  const cards = [
    ["$V_2/V_1$", "voltage ratio · dimensionless"],
    ["$I_1/I_2$", "current ratio · dimensionless"],
    ["$V_2/I_1$", "transfer impedance · Ω"],
    ["$I_2/V_1$", "transfer admittance · S"],
  ];
  return (
    <Frame label="Four transfer-function types" height={248}>
      {cards.map(([title, sub], i) => (
        <Box
          key={title}
          x={20 + (i % 2) * 270}
          y={18 + Math.floor(i / 2) * 110}
          w={250}
          h={96}
          cls="hot"
          title={title}
          sub={sub}
        />
      ))}
    </Frame>
  );
}

function LcTransformView() {
  return (
    <SplitFrame
      label="Time-domain and s-domain LC network"
      height={220}
      left={<LcNetwork sDomain={false} />}
      right={<LcNetwork sDomain />}
    />
  );
}

function LcTransferView() {
  return (
    <Frame label="Voltage transfer and transfer impedance" height={248}>
      <LcNetwork sDomain />
      <Box
        x={340}
        y={24}
        w={204}
        h={92}
        cls="hot"
        title={"$H_{21}=V_2/V_1$"}
        sub={"$\\dfrac{1}{10s^2+1}$"}
      />
      <Box
        x={340}
        y={132}
        w={204}
        h={92}
        cls="hot"
        title={"$Z_{21}=V_2/I_1$"}
        sub={"$\\dfrac{1}{2s}$"}
      />
    </Frame>
  );
}

function LcDrivingView() {
  return (
    <Frame label="Driving-point impedance and admittance" height={248}>
      <LcNetwork sDomain />
      <Box
        x={340}
        y={28}
        w={204}
        h={88}
        cls="hot"
        title={"$Z_{11}$"}
        sub={"$\\dfrac{10s^2+1}{2s}$"}
      />
      <Box
        x={340}
        y={132}
        w={204}
        h={88}
        cls="hot"
        title={"$Y_{11}=1/Z_{11}$"}
        sub={"$\\dfrac{2s}{10s^2+1}$"}
      />
    </Frame>
  );
}

function ImpulseLinkView() {
  return (
    <Frame label="Impulse in, impulse response out" height={200}>
      <Box x={6} y={32} w={100} h={128} cls="hot" title={"$\\delta(t)$"} sub="time" />
      <FlowArrow x1={114} x2={144} y={110} />
      <text x={129} y={56} textAnchor="middle" className="flow-arrow-label">
        LT
      </text>
      <Box x={152} y={32} w={104} h={128} cls="hot" title={"$X(s)=1$"} sub="s-domain" />
      <FlowArrow x1={264} x2={294} y={110} />
      <text x={279} y={56} textAnchor="middle" className="flow-arrow-label">
        ×H(s)
      </text>
      <Box x={302} y={32} w={118} h={128} cls="hot" title={"$Y(s)=H(s)$"} />
      <FlowArrow x1={428} x2={460} y={110} />
      <text x={444} y={56} textAnchor="middle" className="flow-arrow-label">
        inverse LT
      </text>
      <Box
        x={468}
        y={32}
        w={86}
        h={128}
        cls="hot"
        title={"$h(t)$"}
        sub={"$\\mathcal{L}^{-1}\\{H\\}$"}
      />
    </Frame>
  );
}

function ImpulseWorkedView() {
  const axisY = 228;
  const curve = samplePath((t) => {
    const tau = t * 4.2;
    const h = 2 * Math.exp(-tau) - 2 * Math.exp(-2 * tau);
    return { x: 300 + t * 220, y: axisY - h * 120 };
  });
  return (
    <Frame label="Partial fractions to impulse response" height={268}>
      <Box
        x={12}
        y={12}
        w={170}
        h={88}
        cls="hot"
        title={"$H(s)$"}
        sub={"$\\dfrac{2}{(s+1)(s+2)}$"}
      />
      <FlowArrow x1={188} x2={228} y={56} label="PFE" />
      <Box
        x={232}
        y={12}
        w={180}
        h={88}
        cls="hot"
        title={"$\\dfrac{2}{s+1}-\\dfrac{2}{s+2}$"}
      />
      <g className="hot" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M322 104 V140" />
        <path d="M314 132 L322 140 L330 132" />
      </g>
      <text x={338} y={124} className="flow-arrow-label">
        inverse LT
      </text>
      <Box
        x={12}
        y={148}
        w={270}
        h={68}
        cls="hot"
        title={"$h(t)=(2e^{-t}-2e^{-2t})u(t)$"}
      />
      <PlotAxes x0={300} y0={axisY} x1={536} y1={148} xLabel="t" yLabel="h" />
      <polyline points={curve} fill="none" stroke="currentColor" strokeWidth="3" />
    </Frame>
  );
}

function NaturalForcedView() {
  return (
    <Frame label="Natural poles from H(s), forced poles from X(s)" height={232}>
      <Box x={20} y={24} w={150} h={88} cls="hot" title={"$H(s)$ poles"} sub="network / NATURAL" />
      <Box x={20} y={128} w={150} h={88} cls="hot" title={"$X(s)$ poles"} sub="input / FORCED" />
      <Arrow x1={178} y={68} x2={250} cls="hot" />
      <Arrow x1={178} y={172} x2={250} cls="hot" />
      <Box x={258} y={76} w={270} h={88} cls="hot" title={"$Y(s)=H(s)X(s)$"} />
    </Frame>
  );
}

function StepLinkView() {
  return (
    <Frame label="Step to time-domain response" height={188}>
      <Box x={6} y={32} w={96} h={124} cls="hot" title={"$Au(t)$"} sub="step input" />
      <FlowArrow x1={110} x2={144} y={108} />
      <text x={127} y={54} textAnchor="middle" className="flow-arrow-label">
        LT
      </text>
      <Box x={152} y={32} w={76} h={124} cls="hot" title={"$A/s$"} />
      <FlowArrow x1={236} x2={262} y={94} />
      <Box x={270} y={32} w={100} h={124} cls="hot" title={"$AH(s)/s$"} />
      <FlowArrow x1={378} x2={454} y={108} />
      <text x={416} y={54} textAnchor="middle" className="flow-arrow-label">
        inverse LT
      </text>
      <Box x={462} y={32} w={90} h={124} cls="hot" title={"$y(t)$"} sub="step response" />
    </Frame>
  );
}

function StepWorkedView() {
  const curve = samplePath((t) => {
    const tau = t * 4.5;
    const y = 1 - 2 * Math.exp(-tau) + Math.exp(-2 * tau);
    return { x: 48 + t * 470, y: 188 - y * 120 };
  });
  return (
    <Frame label="Unit-step response rising toward 1" height={232}>
      <PlotAxes x0={48} y0={188} x1={530} y1={28} xLabel="t" yLabel="y" />
      <polyline points={curve} fill="none" stroke="currentColor" strokeWidth="3" />
      <MathLabel x={56} y={40} w={120} h={28} tex={"$y(0)=0$"} inline />
      <MathLabel x={300} y={40} w={180} h={28} tex={"$y(\\infty)=1$"} inline />
    </Frame>
  );
}

function StableSplitView() {
  return (
    <Frame label="Forced remains after natural terms decay" height={220}>
      <Box x={20} y={36} w={200} h={140} cls="hot" title="stable, t = 0" sub="forced + natural" />
      <Arrow x1={232} y={106} x2={310} cls="hot" />
      <Box x={318} y={36} w={220} h={140} cls="hot" title={"stable, $t\\to\\infty$"} sub="forced only" />
    </Frame>
  );
}

function DcRuleView() {
  return (
    <Frame label="Final-value theorem for a stable step" height={188}>
      <Box x={6} y={32} w={96} h={124} cls="hot" title="stable step" sub={"$Au(t)$"} />
      <FlowArrow x1={110} x2={146} y={108} />
      <text x={128} y={54} textAnchor="middle" className="flow-arrow-label">
        LT
      </text>
      <Box x={154} y={32} w={84} h={124} cls="hot" title={"$X=A/s$"} />
      <FlowArrow x1={246} x2={272} y={94} />
      <Box x={280} y={32} w={108} h={124} cls="hot" title={"$Y=AH(s)/s$"} />
      <FlowArrow x1={396} x2={458} y={108} />
      <text x={427} y={54} textAnchor="middle" className="flow-arrow-label">
        FVT
      </text>
      <Box x={466} y={24} w={86} h={140} cls="hot" title={"$y_{ss}$"} sub={"$AH(0)$"} />
    </Frame>
  );
}

function DcWorkedView() {
  return (
    <Frame label="Worked DC value from H(0)" height={176}>
      <Box x={16} y={28} w={140} h={120} cls="hot" title={"$A=4$"} sub={"$4u(t)$"} />
      <FlowArrow x1={164} x2={196} y={88} />
      <Box x={204} y={28} w={140} h={120} cls="hot" title={"$H(0)=1$"} />
      <FlowArrow x1={352} x2={388} y={88} />
      <Box
        x={396}
        y={20}
        w={148}
        h={136}
        cls="hot"
        title={"$y_{ss}=4$"}
        sub={"$A\\,H(0)$"}
      />
    </Frame>
  );
}

function AcRuleView() {
  return (
    <Frame label="Same frequency, scaled amplitude and added phase" height={236}>
      <Box
        x={12}
        y={20}
        w={156}
        h={120}
        cls="hot"
        title={"$A\\cos(\\omega t+\\phi)$"}
        sub="input"
      />
      <Arrow x1={176} y={80} x2={214} cls="hot" />
      <Box
        x={220}
        y={20}
        w={140}
        h={120}
        cls="hot"
        title={"$H(j\\omega)$"}
        sub={"$|H|\\angle\\theta$"}
      />
      <Arrow x1={368} y={80} x2={406} cls="hot" />
      <Box
        x={412}
        y={20}
        w={136}
        h={120}
        cls="hot"
        title={"$A|H|,\\;\\phi+\\theta$"}
        sub={"$\\omega$ unchanged"}
      />
      <MathLabel
        x={24}
        y={156}
        w={512}
        h={64}
        tex={"$A|H(j\\omega)|\\cos(\\omega t+\\phi+\\theta)$"}
        cls="board-formula"
      />
    </Frame>
  );
}

function AcWorkedView() {
  return (
    <Frame label="Substitute s = j2000" height={236}>
      <Box
        x={8}
        y={20}
        w={156}
        h={120}
        cls="hot"
        title={"$10\\cos(2000t)$"}
        sub="input"
      />
      <Arrow x1={172} y={80} x2={196} cls="hot" />
      <Box
        x={204}
        y={20}
        w={156}
        h={120}
        cls="hot"
        title={"$H(j2000)=j$"}
        sub={"$1\\angle 90^{\\circ}$"}
      />
      <Arrow x1={368} y={80} x2={392} cls="hot" />
      <Box
        x={400}
        y={20}
        w={152}
        h={120}
        cls="hot"
        title={"$10\\cos(2000t+90^{\\circ})$"}
        sub="output"
      />
      <MathLabel
        x={24}
        y={156}
        w={512}
        h={60}
        tex={"$|H|=1,\\;\\omega=2000,\\;\\angle H=+90^{\\circ}$"}
        cls="board-formula"
      />
    </Frame>
  );
}

function DcZeroView() {
  return (
    <SplitFrame
      label="DC rejects, AC at 2000 rad/s does not"
      height={220}
      left={
        <>
          <Box x={16} y={24} w={240} h={70} cls="hot" title="same $H(s)$, DC" sub={"$s=0$"} />
          <Box x={16} y={112} w={240} h={80} cls="hot" title={"$H(0)=0$"} sub="output 0" />
        </>
      }
      right={
        <>
          <Box x={16} y={24} w={240} h={70} cls="hot" title="same $H(s)$, AC" sub={"$s=j2000$"} />
          <Box x={16} y={112} w={240} h={80} cls="hot" title={"$H=j$"} sub="nonzero" />
        </>
      }
    />
  );
}

const VIEWS = {
  "network-function": NetworkFunctionView,
  "same-network": SameNetworkView,
  "driving-transfer": DrivingTransferView,
  "function-types": FunctionTypesView,
  "lc-transform": LcTransformView,
  "lc-transfer": LcTransferView,
  "lc-driving": LcDrivingView,
  "impulse-link": ImpulseLinkView,
  "impulse-worked": ImpulseWorkedView,
  "natural-forced": NaturalForcedView,
  "step-link": StepLinkView,
  "step-worked": StepWorkedView,
  "stable-split": StableSplitView,
  "dc-rule": DcRuleView,
  "dc-worked": DcWorkedView,
  "ac-rule": AcRuleView,
  "ac-worked": AcWorkedView,
  "dc-zero": DcZeroView,
};

export const SECTION7_BOARD_VIEWS = Object.keys(VIEWS);

export default function Section7Schematic({ view }) {
  const View = VIEWS[view] || NetworkFunctionView;
  return <View />;
}

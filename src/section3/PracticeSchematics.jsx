import {
  Wire,
  Node,
  BatteryV,
  ResistorH,
  ResistorV,
  CapacitorH,
  InductorH,
  SwitchH,
  CurrentArrow,
  ResponseGraph,
} from "./PracticeDraw";

export function MiniGraph({ kind, yTop, yBot, yLabel, className = "" }) {
  if (kind === "flat0") {
    return (
      <div className={`practice-mini-graph ${className}`.trim()}>
        <svg
          className="walk-graph is-compact"
          viewBox="0 0 390 156"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="constant zero"
        >
          <line x1={70} y1={114} x2={350} y2={114} />
          <line x1={70} y1={114} x2={70} y2={22} />
          <line x1={70} y1={114} x2={350} y2={114} className="walk-curve" />
          <text x={58} y={26} textAnchor="end" className="walk-mark">
            {yTop}
          </text>
          <text x={58} y={118} textAnchor="end" className="walk-mark">
            {yBot}
          </text>
        </svg>
      </div>
    );
  }
  return (
    <div className={`practice-mini-graph ${className}`.trim()}>
      <ResponseGraph
        kind={kind}
        yTop={yTop}
        yBot={yBot}
        yLabel={yLabel}
      />
    </div>
  );
}

function StateCard({ title, children }) {
  return (
    <figure className="walk-state">
      <figcaption className="walk-state-label">{title}</figcaption>
      {children}
    </figure>
  );
}

function PairBoard({ left, right, caption }) {
  return (
    <div className="practice-schematic">
      <div className={`walk-board-states practice-pair${right ? "" : " is-single"}`}>
        {left}
        {right}
      </div>
      {caption ? <p className="practice-schematic-caption">{caption}</p> : null}
    </div>
  );
}

function DividerStore({
  store = "C",
  vsLabel = "12 V",
  rSeries = "2 kΩ",
  rPar = "4 kΩ",
  storeLabel = "C",
  showSwitch = false,
  arrow = "v_C",
}) {
  const T = 42;
  const B = 152;
  const Xb = 44;
  const Xs1 = 78;
  const Xs2 = 112;
  const R1a = showSwitch ? 124 : 86;
  const R1b = 204;
  const A = 230;
  const Store = store === "C" ? CapacitorH : InductorH;
  const Ca = 250;
  const Cb = 324;
  const Xr = 352;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 420 214" preserveAspectRatio="xMidYMid meet" role="img">
      <BatteryV x={Xb} y1={72} y2={118} />
      <Wire x1={Xb} y1={T} x2={Xb} y2={72} />
      <Wire x1={Xb} y1={118} x2={Xb} y2={B} />
      <Node x={Xb} y={T} />
      <Node x={Xb} y={B} />
      <text x={Xb} y={190} textAnchor="middle" className="walk-part">
        {vsLabel}
      </text>
      {showSwitch ? (
        <>
          <Wire x1={Xb} y1={T} x2={Xs1} y2={T} />
          <SwitchH x1={Xs1} x2={Xs2} y={T} open={false} />
          <text x={(Xs1 + Xs2) / 2} y={16} textAnchor="middle" className="walk-part">
            closed, t &lt; 0
          </text>
          <Wire x1={Xs2} y1={T} x2={R1a} y2={T} />
        </>
      ) : (
        <Wire x1={Xb} y1={T} x2={R1a} y2={T} />
      )}
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rSeries}
      </text>
      <Wire x1={R1b} y1={T} x2={A} y2={T} />
      <Node x={A} y={T} />
      <text x={A - 12} y={T - 14} textAnchor="end" className="walk-part">
        A
      </text>
      <ResistorV x={A} y1={T} y2={B} />
      <text x={A - 22} y={(T + B) / 2 + 4} textAnchor="end" className="walk-part">
        {rPar}
      </text>
      <Node x={A} y={B} />
      <Wire x1={A} y1={T} x2={Ca} y2={T} />
      <Store x1={Ca} x2={Cb} y={T} />
      <text x={(Ca + Cb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Cb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <Wire x1={Xb} y1={B} x2={A} y2={B} />
      <Wire x1={A} y1={B} x2={Xr} y2={B} />
      <CurrentArrow x={Cb + 4} y={T - 14} label={arrow} />
    </svg>
  );
}

function SeriesParStore({
  store = "L",
  vsLabel = "12 V",
  rSeries = "3 Ω",
  rPar = "6 Ω",
  storeLabel = "L",
  switchOpen = false,
  arrow = "i_L",
  hideSource = false,
}) {
  const T = 44;
  const B = 148;
  const Xb = 48;
  const Xs1 = 84;
  const Xs2 = 118;
  const R1a = 138;
  const R1b = 210;
  const N = 230;
  const Store = store === "C" ? CapacitorH : InductorH;
  const Sa = 250;
  const Sb = 324;
  const Xr = 348;
  const RpT = 70;
  const RpB = 122;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 420 210" preserveAspectRatio="xMidYMid meet" role="img">
      {hideSource ? null : (
        <g className={switchOpen ? "walk-dim" : undefined}>
          <BatteryV x={Xb} y1={72} y2={118} />
          <Wire x1={Xb} y1={T} x2={Xb} y2={72} />
          <Wire x1={Xb} y1={118} x2={Xb} y2={B} />
          <Wire x1={Xb} y1={T} x2={Xs1} y2={T} />
          <Node x={Xb} y={T} />
          <Node x={Xb} y={B} />
          <text x={Xb} y={186} textAnchor="middle" className="walk-part">
            {switchOpen ? "source out" : vsLabel}
          </text>
        </g>
      )}
      {!hideSource ? <SwitchH x1={Xs1} x2={Xs2} y={T} open={switchOpen} /> : null}
      {!hideSource ? (
        <text x={(Xs1 + Xs2) / 2} y={16} textAnchor="middle" className="walk-part">
          {switchOpen ? "open at t = 0" : "closed, long time"}
        </text>
      ) : null}
      <Wire x1={hideSource ? N : Xs2} y1={T} x2={R1a} y2={T} />
      {!hideSource ? null : <Wire x1={N} y1={T} x2={R1a} y2={T} />}
      {hideSource ? (
        <>
          <Wire x1={Sa} y1={B} x2={Xr} y2={B} />
          <Wire x1={N} y1={B} x2={Sa} y2={B} />
        </>
      ) : null}
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rSeries}
      </text>
      <Wire x1={R1b} y1={T} x2={N} y2={T} />
      <Node x={N} y={T} />
      <Wire x1={N} y1={T} x2={Sa} y2={T} />
      <Store x1={Sa} x2={Sb} y={T} />
      <text x={(Sa + Sb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Sb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Wire x1={Xr} y1={B} x2={N} y2={B} />
      <Wire x1={N} y1={T} x2={N} y2={RpT} />
      <ResistorV x={N} y1={RpT} y2={RpB} />
      <Wire x1={N} y1={RpB} x2={N} y2={B} />
      <text x={N - 28} y={(RpT + RpB) / 2 + 4} textAnchor="end" className="walk-part">
        {rPar}
      </text>
      <Node x={N} y={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      {hideSource ? null : <Wire x1={Xb} y1={B} x2={N} y2={B} />}
      <CurrentArrow x={Sb + 6} y={T - 14} label={arrow} weak={switchOpen || hideSource} />
    </svg>
  );
}

function ParallelDump({ store = "C", rA = "3 kΩ", rB = "6 kΩ", storeLabel = "C", arrow = "v_C" }) {
  const T = 40;
  const M = 96;
  const B = 152;
  const Xl = 64;
  const Xr = 316;
  const Store = store === "C" ? CapacitorH : InductorH;
  const Ca = 88;
  const Cb = 168;
  const Ra1 = 96;
  const Ra2 = 196;
  const Rb1 = 96;
  const Rb2 = 196;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 400 200" preserveAspectRatio="xMidYMid meet" role="img">
      <Wire x1={Xl} y1={T} x2={Xl} y2={B} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Node x={Xl} y={T} />
      <Node x={Xl} y={M} />
      <Node x={Xl} y={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={M} />
      <Node x={Xr} y={B} />
      <Wire x1={Xl} y1={T} x2={Ca} y2={T} />
      <Store x1={Ca} x2={Cb} y={T} />
      <Wire x1={Cb} y1={T} x2={Xr} y2={T} />
      <text x={(Ca + Cb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Xl} y1={M} x2={Ra1} y2={M} />
      <ResistorH x1={Ra1} x2={Ra2} y={M} />
      <Wire x1={Ra2} y1={M} x2={Xr} y2={M} />
      <text x={(Ra1 + Ra2) / 2} y={M - 16} textAnchor="middle" className="walk-part">
        {rA}
      </text>
      <Wire x1={Xl} y1={B} x2={Rb1} y2={B} />
      <ResistorH x1={Rb1} x2={Rb2} y={B} />
      <Wire x1={Rb2} y1={B} x2={Xr} y2={B} />
      <text x={(Rb1 + Rb2) / 2} y={B + 26} textAnchor="middle" className="walk-part">
        {rB}
      </text>
      <CurrentArrow x={Cb + 8} y={T - 14} label={arrow} />
    </svg>
  );
}

function InsertResistor({
  vsLabel = "12 V",
  rStay = "4 Ω",
  rInsert = "8 Ω",
  storeLabel = "L",
  insertShorted = true,
  arrow = "i_L",
}) {
  const T = 40;
  const B = 156;
  const Xb = 48;
  const R1a = 96;
  const R1b = 172;
  const N1 = 196;
  const N2 = 300;
  const Ria = 214;
  const Rib = 282;
  const Ry = 96;
  const Sl = 320;
  const Sr = 394;
  const Xr = 416;
  return (
    <svg className="walk-circuit" viewBox="-12 -8 490 214" preserveAspectRatio="xMidYMid meet" role="img">
      <BatteryV x={Xb} y1={74} y2={122} />
      <Wire x1={Xb} y1={T} x2={Xb} y2={74} />
      <Wire x1={Xb} y1={122} x2={Xb} y2={B} />
      <Wire x1={Xb} y1={T} x2={R1a} y2={T} />
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rStay}
      </text>
      <Wire x1={R1b} y1={T} x2={N1} y2={T} />
      <Node x={N1} y={T} />
      <SwitchH x1={N1} x2={N2} y={T} open={!insertShorted} />
      <text x={(N1 + N2) / 2} y={16} textAnchor="middle" className="walk-part">
        {insertShorted ? "closed: extra R shorted" : "open at t = 0"}
      </text>
      <Wire x1={N1} y1={T} x2={N1} y2={Ry} />
      <ResistorH x1={Ria} x2={Rib} y={Ry} />
      <text x={(Ria + Rib) / 2} y={Ry + 26} textAnchor="middle" className="walk-part">
        {rInsert}
      </text>
      <Wire x1={N1} y1={Ry} x2={Ria} y2={Ry} />
      <Wire x1={Rib} y1={Ry} x2={N2} y2={Ry} />
      <Wire x1={N2} y1={Ry} x2={N2} y2={T} />
      <Node x={N2} y={T} />
      <Wire x1={N2} y1={T} x2={Sl} y2={T} />
      <InductorH x1={Sl} x2={Sr} y={T} />
      <text x={(Sl + Sr) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Sr} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Wire x1={Xr} y1={B} x2={Xb} y2={B} />
      <text x={Xb} y={192} textAnchor="middle" className="walk-part">
        {vsLabel}
      </text>
      <Node x={Xb} y={T} />
      <Node x={Xb} y={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <CurrentArrow x={Sr + 4} y={T - 14} label={arrow} />
    </svg>
  );
}

function SeriesStore({
  store = "C",
  vsLabel = "20 V",
  rLabel = "4 kΩ",
  storeLabel = "C",
  arrow = "v_C",
}) {
  const T = 48;
  const B = 148;
  const Xb = 56;
  const R1a = 108;
  const R1b = 196;
  const Store = store === "C" ? CapacitorH : InductorH;
  const Sa = 220;
  const Sb = 304;
  const Xr = 348;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 420 200" preserveAspectRatio="xMidYMid meet" role="img">
      <BatteryV x={Xb} y1={74} y2={122} />
      <Wire x1={Xb} y1={T} x2={Xb} y2={74} />
      <Wire x1={Xb} y1={122} x2={Xb} y2={B} />
      <Wire x1={Xb} y1={T} x2={R1a} y2={T} />
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rLabel}
      </text>
      <Wire x1={R1b} y1={T} x2={Sa} y2={T} />
      <Store x1={Sa} x2={Sb} y={T} />
      <text x={(Sa + Sb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Sb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Wire x1={Xr} y1={B} x2={Xb} y2={B} />
      <text x={Xb} y={186} textAnchor="middle" className="walk-part">
        {vsLabel}
      </text>
      <Node x={Xb} y={T} />
      <Node x={Xb} y={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <CurrentArrow x={Sb + 6} y={T - 14} label={arrow} />
    </svg>
  );
}

function OneRDump({ store = "L", rLabel = "6 Ω", storeLabel = "L", arrow = "i_L" }) {
  const T = 48;
  const B = 148;
  const Xl = 80;
  const Store = store === "C" ? CapacitorH : InductorH;
  const Sa = 100;
  const Sb = 186;
  const Xr = 320;
  const Ra = 140;
  const Rb = 230;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 400 200" preserveAspectRatio="xMidYMid meet" role="img">
      <Store x1={Sa} x2={Sb} y={T} />
      <Wire x1={Xl} y1={T} x2={Sa} y2={T} />
      <Wire x1={Xl} y1={T} x2={Xl} y2={B} />
      <Wire x1={Sb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Wire x1={Xr} y1={B} x2={Rb} y2={B} />
      <ResistorH x1={Ra} x2={Rb} y={B} />
      <Wire x1={Ra} y1={B} x2={Xl} y2={B} />
      <text x={(Sa + Sb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <text x={(Ra + Rb) / 2} y={B + 26} textAnchor="middle" className="walk-part">
        {rLabel}
      </text>
      <Node x={Xl} y={T} />
      <Node x={Xl} y={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <CurrentArrow x={Sb + 10} y={T - 14} label={arrow} />
    </svg>
  );
}

function DividerChainStore({
  vsLabel = "21 V",
  rSeries = "2 kΩ",
  rTop = "4 kΩ",
  rBot = "8 kΩ",
  storeLabel = "C",
  arrow = "v_C",
}) {
  const T = 42;
  const M = 96;
  const B = 152;
  const Xb = 44;
  const R1a = 86;
  const R1b = 196;
  const A = 226;
  const Ca = 250;
  const Cb = 324;
  const Xr = 352;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 420 214" preserveAspectRatio="xMidYMid meet" role="img">
      <BatteryV x={Xb} y1={72} y2={118} />
      <Wire x1={Xb} y1={T} x2={Xb} y2={72} />
      <Wire x1={Xb} y1={118} x2={Xb} y2={B} />
      <Node x={Xb} y={T} />
      <Node x={Xb} y={B} />
      <text x={Xb} y={190} textAnchor="middle" className="walk-part">
        {vsLabel}
      </text>
      <Wire x1={Xb} y1={T} x2={R1a} y2={T} />
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rSeries}
      </text>
      <Wire x1={R1b} y1={T} x2={A} y2={T} />
      <Node x={A} y={T} />
      <text x={A - 12} y={T - 14} textAnchor="end" className="walk-part">
        A
      </text>
      <ResistorV x={A} y1={T} y2={M} />
      <text x={A - 22} y={(T + M) / 2 + 4} textAnchor="end" className="walk-part">
        {rTop}
      </text>
      <Node x={A} y={M} />
      <ResistorV x={A} y1={M} y2={B} />
      <text x={A - 22} y={(M + B) / 2 + 4} textAnchor="end" className="walk-part">
        {rBot}
      </text>
      <Node x={A} y={B} />
      <Wire x1={A} y1={T} x2={Ca} y2={T} />
      <CapacitorH x1={Ca} x2={Cb} y={T} />
      <text x={(Ca + Cb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Cb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <Wire x1={Xb} y1={B} x2={A} y2={B} />
      <Wire x1={A} y1={B} x2={Xr} y2={B} />
      <CurrentArrow x={Cb + 4} y={T - 14} label={arrow} />
    </svg>
  );
}

function SourceFeedDump({
  vsLabel = "18 V",
  rSeries = "3 kΩ",
  rA = "6 kΩ",
  rB = "6 kΩ",
  storeLabel = "C",
  arrow = "v_C",
}) {
  const T = 40;
  const M = 96;
  const B = 152;
  const Xb = 36;
  const R1a = 58;
  const R1b = 118;
  const Xl = 138;
  const Xr = 352;
  const Ca = 158;
  const Cb = 238;
  const Ra1 = 168;
  const Ra2 = 268;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 420 214" preserveAspectRatio="xMidYMid meet" role="img">
      <BatteryV x={Xb} y1={72} y2={118} />
      <Wire x1={Xb} y1={T} x2={Xb} y2={72} />
      <Wire x1={Xb} y1={118} x2={Xb} y2={B} />
      <Node x={Xb} y={T} />
      <Node x={Xb} y={B} />
      <text x={Xb} y={190} textAnchor="middle" className="walk-part">
        {vsLabel}
      </text>
      <Wire x1={Xb} y1={T} x2={R1a} y2={T} />
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rSeries}
      </text>
      <Wire x1={R1b} y1={T} x2={Xl} y2={T} />
      <Wire x1={Xl} y1={T} x2={Xl} y2={B} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Node x={Xl} y={T} />
      <Node x={Xl} y={M} />
      <Node x={Xl} y={B} />
      <text x={Xl - 10} y={T - 12} textAnchor="end" className="walk-part">
        A
      </text>
      <Node x={Xr} y={T} />
      <Node x={Xr} y={M} />
      <Node x={Xr} y={B} />
      <Wire x1={Xl} y1={T} x2={Ca} y2={T} />
      <CapacitorH x1={Ca} x2={Cb} y={T} />
      <Wire x1={Cb} y1={T} x2={Xr} y2={T} />
      <text x={(Ca + Cb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Xl} y1={M} x2={Ra1} y2={M} />
      <ResistorH x1={Ra1} x2={Ra2} y={M} />
      <Wire x1={Ra2} y1={M} x2={Xr} y2={M} />
      <text x={(Ra1 + Ra2) / 2} y={M - 16} textAnchor="middle" className="walk-part">
        {rA}
      </text>
      <Wire x1={Xl} y1={B} x2={Ra1} y2={B} />
      <ResistorH x1={Ra1} x2={Ra2} y={B} />
      <Wire x1={Ra2} y1={B} x2={Xr} y2={B} />
      <text x={(Ra1 + Ra2) / 2} y={B + 26} textAnchor="middle" className="walk-part">
        {rB}
      </text>
      <Wire x1={Xb} y1={B} x2={Xl} y2={B} />
      <CurrentArrow x={Cb + 8} y={T - 14} label={arrow} />
    </svg>
  );
}

function DualSourceStore({
  store = "C",
  v1 = "12 V",
  r1 = "2 kΩ",
  v2 = "6 V",
  r2 = "4 kΩ",
  storeLabel = "C",
  nodeLabel = "A",
  arrow = "v_C",
}) {
  const T = 40;
  const B = 152;
  const X1 = 40;
  const X2 = 118;
  const R1a = 62;
  const R1b = 148;
  const R2a = 140;
  const R2b = 210;
  const A = 236;
  const Store = store === "C" ? CapacitorH : InductorH;
  const Sa = 258;
  const Sb = 332;
  const Xr = 356;
  const Mid = 96;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 430 214" preserveAspectRatio="xMidYMid meet" role="img">
      <BatteryV x={X1} y1={62} y2={108} />
      <Wire x1={X1} y1={T} x2={X1} y2={62} />
      <Wire x1={X1} y1={108} x2={X1} y2={B} />
      <text x={X1} y={190} textAnchor="middle" className="walk-part">
        {v1}
      </text>
      <Wire x1={X1} y1={T} x2={R1a} y2={T} />
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {r1}
      </text>
      <Wire x1={R1b} y1={T} x2={A} y2={T} />
      <BatteryV x={X2} y1={Mid} y2={136} />
      <Wire x1={X2} y1={Mid} x2={X2} y2={62} />
      <Wire x1={X2} y1={62} x2={R2a} y2={62} />
      <ResistorH x1={R2a} x2={R2b} y={62} />
      <text x={(R2a + R2b) / 2} y={62 - 16} textAnchor="middle" className="walk-part">
        {r2}
      </text>
      <Wire x1={R2b} y1={62} x2={A} y2={62} />
      <Wire x1={A} y1={62} x2={A} y2={T} />
      <Wire x1={X2} y1={136} x2={X2} y2={B} />
      <text x={X2 + 18} y={128} className="walk-part">
        {v2}
      </text>
      <Node x={A} y={T} />
      <text x={A - 12} y={T - 14} textAnchor="end" className="walk-part">
        {nodeLabel}
      </text>
      <Wire x1={A} y1={T} x2={Sa} y2={T} />
      <Store x1={Sa} x2={Sb} y={T} />
      <text x={(Sa + Sb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Sb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Wire x1={Xr} y1={B} x2={X1} y2={B} />
      <Node x={X1} y={T} />
      <Node x={X1} y={B} />
      <Node x={X2} y={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <CurrentArrow x={Sb + 4} y={T - 14} label={arrow} />
    </svg>
  );
}

function DualSeriesParStore({
  vsLabel = "30 V",
  rSeriesA = "3 Ω",
  rSeriesB = "2 Ω",
  rPar = "10 Ω",
  storeLabel = "L",
  arrow = "i_L",
}) {
  const T = 44;
  const B = 148;
  const Xb = 40;
  const Xs1 = 72;
  const Xs2 = 104;
  const R1a = 118;
  const R1b = 176;
  const R2a = 188;
  const R2b = 246;
  const N = 266;
  const Sa = 284;
  const Sb = 350;
  const Xr = 372;
  const RpT = 70;
  const RpB = 122;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 440 210" preserveAspectRatio="xMidYMid meet" role="img">
      <g>
        <BatteryV x={Xb} y1={72} y2={118} />
        <Wire x1={Xb} y1={T} x2={Xb} y2={72} />
        <Wire x1={Xb} y1={118} x2={Xb} y2={B} />
        <Wire x1={Xb} y1={T} x2={Xs1} y2={T} />
        <Node x={Xb} y={T} />
        <Node x={Xb} y={B} />
        <text x={Xb} y={186} textAnchor="middle" className="walk-part">
          {vsLabel}
        </text>
      </g>
      <SwitchH x1={Xs1} x2={Xs2} y={T} open={false} />
      <text x={(Xs1 + Xs2) / 2} y={16} textAnchor="middle" className="walk-part">
        closed, long time
      </text>
      <Wire x1={Xs2} y1={T} x2={R1a} y2={T} />
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rSeriesA}
      </text>
      <Wire x1={R1b} y1={T} x2={R2a} y2={T} />
      <ResistorH x1={R2a} x2={R2b} y={T} />
      <text x={(R2a + R2b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rSeriesB}
      </text>
      <Wire x1={R2b} y1={T} x2={N} y2={T} />
      <Node x={N} y={T} />
      <text x={N - 10} y={T - 12} textAnchor="end" className="walk-part">
        N
      </text>
      <Wire x1={N} y1={T} x2={Sa} y2={T} />
      <InductorH x1={Sa} x2={Sb} y={T} />
      <text x={(Sa + Sb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Sb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Wire x1={Xr} y1={B} x2={Xb} y2={B} />
      <Wire x1={N} y1={T} x2={N} y2={RpT} />
      <ResistorV x={N} y1={RpT} y2={RpB} />
      <Wire x1={N} y1={RpB} x2={N} y2={B} />
      <text x={N - 24} y={(RpT + RpB) / 2 + 4} textAnchor="end" className="walk-part">
        {rPar}
      </text>
      <Node x={N} y={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <CurrentArrow x={Sb + 4} y={T - 14} label={arrow} />
    </svg>
  );
}

function ParallelFeedL({
  vsLabel = "24 V",
  rA = "4 Ω",
  rB = "12 Ω",
  storeLabel = "L",
  arrow = "i_L",
}) {
  const T = 40;
  const M = 96;
  const B = 152;
  const Xb = 40;
  const Xl = 86;
  const Ra1 = 104;
  const Ra2 = 188;
  const N = 220;
  const Sa = 240;
  const Sb = 314;
  const Xr = 340;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 420 210" preserveAspectRatio="xMidYMid meet" role="img">
      <BatteryV x={Xb} y1={72} y2={118} />
      <Wire x1={Xb} y1={T} x2={Xb} y2={72} />
      <Wire x1={Xb} y1={118} x2={Xb} y2={B} />
      <Node x={Xb} y={T} />
      <Node x={Xb} y={B} />
      <text x={Xb} y={190} textAnchor="middle" className="walk-part">
        {vsLabel}
      </text>
      <Wire x1={Xb} y1={T} x2={Xl} y2={T} />
      <Wire x1={Xl} y1={T} x2={Xl} y2={M} />
      <Node x={Xl} y={T} />
      <Node x={Xl} y={M} />
      <Wire x1={Xl} y1={T} x2={Ra1} y2={T} />
      <ResistorH x1={Ra1} x2={Ra2} y={T} />
      <text x={(Ra1 + Ra2) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rA}
      </text>
      <Wire x1={Ra2} y1={T} x2={N} y2={T} />
      <Wire x1={Xl} y1={M} x2={Ra1} y2={M} />
      <ResistorH x1={Ra1} x2={Ra2} y={M} />
      <text x={(Ra1 + Ra2) / 2} y={M - 16} textAnchor="middle" className="walk-part">
        {rB}
      </text>
      <Wire x1={Ra2} y1={M} x2={N} y2={M} />
      <Wire x1={N} y1={M} x2={N} y2={T} />
      <Node x={N} y={T} />
      <text x={N - 10} y={T - 12} textAnchor="end" className="walk-part">
        N
      </text>
      <Wire x1={N} y1={T} x2={Sa} y2={T} />
      <InductorH x1={Sa} x2={Sb} y={T} />
      <text x={(Sa + Sb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Sb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Wire x1={Xr} y1={B} x2={Xb} y2={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <CurrentArrow x={Sb + 4} y={T - 14} label={arrow} />
    </svg>
  );
}

function SplitShuntL({
  vsLabel = "24 V",
  rSeries = "6 Ω",
  rShunt = "12 Ω",
  rThen = "4 Ω",
  storeLabel = "L",
  arrow = "i_L",
}) {
  const T = 42;
  const B = 152;
  const Xb = 40;
  const R1a = 78;
  const R1b = 156;
  const N = 178;
  const R2a = 198;
  const R2b = 262;
  const Sa = 276;
  const Sb = 340;
  const Xr = 364;
  const RpT = 70;
  const RpB = 122;
  return (
    <svg className="walk-circuit" viewBox="-8 -8 430 214" preserveAspectRatio="xMidYMid meet" role="img">
      <BatteryV x={Xb} y1={72} y2={118} />
      <Wire x1={Xb} y1={T} x2={Xb} y2={72} />
      <Wire x1={Xb} y1={118} x2={Xb} y2={B} />
      <Node x={Xb} y={T} />
      <Node x={Xb} y={B} />
      <text x={Xb} y={190} textAnchor="middle" className="walk-part">
        {vsLabel}
      </text>
      <Wire x1={Xb} y1={T} x2={R1a} y2={T} />
      <ResistorH x1={R1a} x2={R1b} y={T} />
      <text x={(R1a + R1b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rSeries}
      </text>
      <Wire x1={R1b} y1={T} x2={N} y2={T} />
      <Node x={N} y={T} />
      <text x={N - 10} y={T - 12} textAnchor="end" className="walk-part">
        N
      </text>
      <Wire x1={N} y1={T} x2={N} y2={RpT} />
      <ResistorV x={N} y1={RpT} y2={RpB} />
      <Wire x1={N} y1={RpB} x2={N} y2={B} />
      <text x={N - 24} y={(RpT + RpB) / 2 + 4} textAnchor="end" className="walk-part">
        {rShunt}
      </text>
      <Wire x1={N} y1={T} x2={R2a} y2={T} />
      <ResistorH x1={R2a} x2={R2b} y={T} />
      <text x={(R2a + R2b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {rThen}
      </text>
      <Wire x1={R2b} y1={T} x2={Sa} y2={T} />
      <InductorH x1={Sa} x2={Sb} y={T} />
      <text x={(Sa + Sb) / 2} y={T - 16} textAnchor="middle" className="walk-part">
        {storeLabel}
      </text>
      <Wire x1={Sb} y1={T} x2={Xr} y2={T} />
      <Wire x1={Xr} y1={T} x2={Xr} y2={B} />
      <Wire x1={Xr} y1={B} x2={Xb} y2={B} />
      <Node x={N} y={B} />
      <Node x={Xr} y={T} />
      <Node x={Xr} y={B} />
      <CurrentArrow x={Sb + 4} y={T - 14} label={arrow} />
    </svg>
  );
}

function insertPair(vs, rStay, rInsert, storeLabel, caption) {
  return (
    <PairBoard
      caption={caption}
      left={
        <StateCard title="t < 0, extra R shorted">
          <InsertResistor insertShorted vsLabel={vs} rStay={rStay} rInsert={rInsert} storeLabel={storeLabel} />
        </StateCard>
      }
      right={
        <StateCard title="t > 0, extra R in the loop">
          <InsertResistor insertShorted={false} vsLabel={vs} rStay={rStay} rInsert={rInsert} storeLabel={storeLabel} />
        </StateCard>
      }
    />
  );
}

function dcDivider(vs, rSeries, rPar, storeLabel, caption) {
  return (
    <PairBoard
      caption={caption}
      left={
        <StateCard title="DC steady state">
          <DividerStore vsLabel={vs} rSeries={rSeries} rPar={rPar} storeLabel={storeLabel} arrow="v_C" />
        </StateCard>
      }
      right={null}
    />
  );
}

function dcSeries(store, vs, rLabel, storeLabel, arrow, caption) {
  return (
    <PairBoard
      caption={caption}
      left={
        <StateCard title="DC steady state">
          <SeriesStore store={store} vsLabel={vs} rLabel={rLabel} storeLabel={storeLabel} arrow={arrow} />
        </StateCard>
      }
      right={null}
    />
  );
}

function dcParL(vs, rSeries, rPar, storeLabel, caption) {
  return (
    <PairBoard
      caption={caption}
      left={
        <StateCard title="DC steady state">
          <SeriesParStore vsLabel={vs} rSeries={rSeries} rPar={rPar} storeLabel={storeLabel} arrow="i_L" />
        </StateCard>
      }
      right={null}
    />
  );
}

export function PracticeBoard({ view }) {
  switch (view) {
    case "s3-c1":
      return dcDivider("15 V", "1 kΩ", "5 kΩ", "C", "Long time DC. 15 V feeds 1 kΩ into node A. 5 kΩ and C are in parallel from A to ground.");
    case "s3-c2":
      return dcSeries("C", "20 V", "4 kΩ", "C", "v_C", "Long time DC. V_s, R, and C in one loop.");
    case "s3-c3":
      return dcDivider("9 V", "3 kΩ", "6 kΩ", "C", "Long time DC. 9 V feeds 3 kΩ into node A. 6 kΩ and C are in parallel from A to ground.");
    case "s3-c4":
      return dcDivider("24 V", "8 kΩ", "24 kΩ", "5 μF", "Long time DC. C = 5 μF. 24 V feeds 8 kΩ into node A. 24 kΩ and C are in parallel from A to ground.");
    case "s3-c5":
      return dcDivider("10 V", "2 kΩ", "8 kΩ", "C", "Long time DC. 10 V feeds 2 kΩ into node A. 8 kΩ and C are in parallel from A to ground.");
    case "s3-c6":
      return dcDivider("18 V", "3 kΩ", "6 kΩ", "C", "Long time DC. 18 V feeds 3 kΩ into node A. 6 kΩ and C are in parallel from A to ground.");
    case "s3-c7":
      return (
        <PairBoard
          caption="Long time DC. 21 V feeds 2 kΩ into node A. From A to ground: 4 kΩ then 8 kΩ in series. C is from A directly to ground, across the whole chain."
          left={
            <StateCard title="DC steady state">
              <DividerChainStore vsLabel="21 V" rSeries="2 kΩ" rTop="4 kΩ" rBot="8 kΩ" storeLabel="C" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-c8":
      return dcDivider("12 V", "2 kΩ", "4 kΩ", "C", "Long time DC. 12 V feeds 2 kΩ into node A. 4 kΩ and C are in parallel from A to ground.");
    case "s3-c9":
      return dcDivider("30 V", "5 kΩ", "10 kΩ", "8 μF", "Long time DC. C = 8 μF. 30 V feeds 5 kΩ into node A. 10 kΩ and C are in parallel from A to ground.");
    case "s3-c10":
      return (
        <PairBoard
          caption="Long time DC. 18 V feeds 3 kΩ into node A. From A to ground: 6 kΩ, another 6 kΩ, and C as three parallel branches."
          left={
            <StateCard title="DC steady state">
              <SourceFeedDump vsLabel="18 V" rSeries="3 kΩ" rA="6 kΩ" rB="6 kΩ" storeLabel="C" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-c11":
      return (
        <PairBoard
          caption="Long time DC. 12 V feeds A through 2 kΩ. A separate 6 V source feeds A through 4 kΩ. Both negatives are grounded. C is from A to ground."
          left={
            <StateCard title="DC steady state">
              <DualSourceStore v1="12 V" r1="2 kΩ" v2="6 V" r2="4 kΩ" storeLabel="C" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-l1":
      return dcParL("18 V", "2 Ω", "4 Ω", "L", "Long time DC. V_s = 18 V, 2 Ω in series, 4 Ω in parallel with L.");
    case "s3-l2":
      return dcSeries("L", "10 V", "5 Ω", "L", "i_L", "Long time DC. V_s, R, and L in one loop.");
    case "s3-l3":
      return dcParL("24 V", "6 Ω", "12 Ω", "L", "Long time DC. V_s = 24 V, 6 Ω in series, 12 Ω in parallel with L.");
    case "s3-l4":
      return dcSeries("L", "12 V", "4 Ω", "8 mH", "i_L", "Long time DC. L = 8 mH. V_s = 12 V and 4 Ω in series with L.");
    case "s3-l5":
      return dcParL("15 V", "5 Ω", "10 Ω", "L", "Long time DC. V_s = 15 V, 5 Ω in series, 10 Ω in parallel with L.");
    case "s3-l6":
      return dcParL("20 V", "4 Ω", "8 Ω", "L", "Long time DC. 20 V, 4 Ω in series, then L to ground. 8 Ω from N to ground.");
    case "s3-l7":
      return (
        <PairBoard
          caption="Long time DC. 30 V, then 3 Ω, then 2 Ω, then L to ground. 10 Ω from N to ground."
          left={
            <StateCard title="DC steady state">
              <DualSeriesParStore vsLabel="30 V" rSeriesA="3 Ω" rSeriesB="2 Ω" rPar="10 Ω" storeLabel="L" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-l8":
      return dcParL("24 V", "6 Ω", "12 Ω", "20 mH", "Long time DC. L = 20 mH. 24 V, 6 Ω in series, 12 Ω in parallel with L.");
    case "s3-l9":
      return (
        <PairBoard
          caption="Long time DC. 18 V feeds N through 3 Ω. A separate 6 V source feeds N through 6 Ω. Both negatives are grounded. L is from N to ground."
          left={
            <StateCard title="DC steady state">
              <DualSourceStore
                store="L"
                v1="18 V"
                r1="3 Ω"
                v2="6 V"
                r2="6 Ω"
                storeLabel="L"
                nodeLabel="N"
                arrow="i_L"
              />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-l10":
      return (
        <PairBoard
          caption="Long time DC. 24 V feeds a parallel pair of 4 Ω and 12 Ω. The branches rejoin at N, then L goes to ground."
          left={
            <StateCard title="DC steady state">
              <ParallelFeedL vsLabel="24 V" rA="4 Ω" rB="12 Ω" storeLabel="L" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-l11":
      return (
        <PairBoard
          caption="Long time DC. 24 V, 6 Ω to node N. From N to ground: a 12 Ω branch. A second branch is 4 Ω then L to ground."
          left={
            <StateCard title="DC steady state">
              <SplitShuntL vsLabel="24 V" rSeries="6 Ω" rShunt="12 Ω" rThen="4 Ω" storeLabel="L" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-f1":
      return (
        <PairBoard
          caption="t > 0. No source. C, 4 kΩ, and 12 kΩ share both terminals."
          left={
            <StateCard title="t > 0, C || 4 kΩ || 12 kΩ">
              <ParallelDump rA="4 kΩ" rB="12 kΩ" storeLabel="20 μF" arrow="v_C" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-f2":
      return (
        <PairBoard
          caption="t < 0: 16 V, 1 kΩ to node A, then 3 kΩ || C to ground. At t = 0 the source is replaced by a short, so both resistors stay across C."
          left={
            <StateCard title="t < 0, long time">
              <DividerStore showSwitch vsLabel="16 V" rSeries="1 kΩ" rPar="3 kΩ" storeLabel="C" arrow="v_C" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, C || 1 kΩ || 3 kΩ">
              <ParallelDump rA="1 kΩ" rB="3 kΩ" storeLabel="C" arrow="v_C" />
            </StateCard>
          }
        />
      );
    case "s3-f3":
      return (
        <PairBoard
          caption="t < 0: 24 V, 2 kΩ to node A, then 6 kΩ || C to ground. At t = 0 the source is replaced by a short, so both resistors stay across C."
          left={
            <StateCard title="t < 0, long time">
              <DividerStore showSwitch vsLabel="24 V" rSeries="2 kΩ" rPar="6 kΩ" storeLabel="4 μF" arrow="v_C" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, C || 2 kΩ || 6 kΩ">
              <ParallelDump rA="2 kΩ" rB="6 kΩ" storeLabel="4 μF" arrow="v_C" />
            </StateCard>
          }
        />
      );
    case "s3-f4":
      return (
        <PairBoard
          caption="C = 8 μF is already charged to 20 V. At t = 0 it dumps into 5 kΩ only. No source remains."
          left={
            <StateCard title="t > 0">
              <OneRDump store="C" rLabel="5 kΩ" storeLabel="8 μF" arrow="v_C" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-f5":
      return (
        <PairBoard
          caption="t < 0: 30 V, 3 kΩ to node A, then 9 kΩ || C to ground. At t = 0 the source is replaced by a short, so both resistors stay across C."
          left={
            <StateCard title="t < 0, long time">
              <DividerStore showSwitch vsLabel="30 V" rSeries="3 kΩ" rPar="9 kΩ" storeLabel="10 μF" arrow="v_C" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, C || 3 kΩ || 9 kΩ">
              <ParallelDump rA="3 kΩ" rB="9 kΩ" storeLabel="10 μF" arrow="v_C" />
            </StateCard>
          }
        />
      );
    case "s3-f6":
      return (
        <PairBoard
          caption="t < 0: 10 V, 4 kΩ to node A, then 4 kΩ || C to ground. At t = 0 the source branch opens, so the series 4 kΩ leaves. C dumps only through the 4 kΩ that was already across it."
          left={
            <StateCard title="t < 0, long time">
              <DividerStore showSwitch vsLabel="10 V" rSeries="4 kΩ" rPar="4 kΩ" storeLabel="2 μF" arrow="v_C" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, C || 4 kΩ only">
              <OneRDump store="C" rLabel="4 kΩ" storeLabel="2 μF" arrow="v_C" />
            </StateCard>
          }
        />
      );
    case "s3-f7":
      return (
        <PairBoard
          caption="t < 0: 18 V, 2 kΩ to node A, then 4 kΩ || C to ground. At t = 0 the source branch opens, so the 2 kΩ leaves. C dumps only through the 4 kΩ."
          left={
            <StateCard title="t < 0, long time">
              <DividerStore showSwitch vsLabel="18 V" rSeries="2 kΩ" rPar="4 kΩ" storeLabel="6 μF" arrow="v_C" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, C || 4 kΩ only">
              <OneRDump store="C" rLabel="4 kΩ" storeLabel="6 μF" arrow="v_C" />
            </StateCard>
          }
        />
      );
    case "s3-f8":
      return (
        <PairBoard
          caption="t < 0: 20 V, 5 kΩ to node A, then 15 kΩ || C to ground. At t = 0 the source is replaced by a short, so both resistors stay across C."
          left={
            <StateCard title="t < 0, long time">
              <DividerStore showSwitch vsLabel="20 V" rSeries="5 kΩ" rPar="15 kΩ" storeLabel="4 μF" arrow="v_C" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, C || 5 kΩ || 15 kΩ">
              <ParallelDump rA="5 kΩ" rB="15 kΩ" storeLabel="4 μF" arrow="v_C" />
            </StateCard>
          }
        />
      );
    case "s3-f9":
      return (
        <PairBoard
          caption="t > 0. No source. C = 10 μF is in parallel with 6 kΩ and unknown Rx."
          left={
            <StateCard title="t > 0, C || 6 kΩ || Rx">
              <ParallelDump rA="6 kΩ" rB="Rx" storeLabel="10 μF" arrow="v_C" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-f10":
      return (
        <PairBoard
          caption="Two separate source-free circuits. Both start at the same initial voltage."
          left={
            <StateCard title="Circuit A: 8 μF || 2 kΩ">
              <OneRDump store="C" rLabel="2 kΩ" storeLabel="8 μF" arrow="v_C" />
            </StateCard>
          }
          right={
            <StateCard title="Circuit B: 4 μF || 4 kΩ">
              <OneRDump store="C" rLabel="4 kΩ" storeLabel="4 μF" arrow="v_C" />
            </StateCard>
          }
        />
      );
    case "s3-f11":
      return (
        <PairBoard
          caption="t < 0: 12 V, 3 kΩ to node A, then 9 kΩ || C to ground. At t = 0 the source is replaced by a short, so both resistors stay across C."
          left={
            <StateCard title="t < 0, long time">
              <DividerStore showSwitch vsLabel="12 V" rSeries="3 kΩ" rPar="9 kΩ" storeLabel="5 μF" arrow="v_C" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, C || 3 kΩ || 9 kΩ">
              <ParallelDump rA="3 kΩ" rB="9 kΩ" storeLabel="5 μF" arrow="v_C" />
            </StateCard>
          }
        />
      );
    case "s3-f12":
      return (
        <PairBoard
          caption="C = 10 μF is already charged to 10 V. At t = 0 it dumps into 2 kΩ only. No source remains."
          left={
            <StateCard title="t > 0">
              <OneRDump store="C" rLabel="2 kΩ" storeLabel="10 μF" arrow="v_C" />
            </StateCard>
          }
          right={null}
        />
      );
    case "s3-s1":
      return dcParL("20 V", "5 Ω", "15 Ω", "L", "The source stays on. Long time DC. V_s = 20 V, 5 Ω in series, 15 Ω in parallel with L.");
    case "s3-s2":
      return (
        <PairBoard
          caption="t < 0 the extra 9 Ω is shorted. At t = 0 that short opens, so 3 Ω and 9 Ω are both in series with L. V_s stays 36 V."
          left={
            <StateCard title="t < 0, extra R shorted">
              <InsertResistor insertShorted vsLabel="36 V" rStay="3 Ω" rInsert="9 Ω" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, extra R in the loop">
              <InsertResistor insertShorted={false} vsLabel="36 V" rStay="3 Ω" rInsert="9 Ω" />
            </StateCard>
          }
        />
      );
    case "s3-s3":
      return (
        <PairBoard
          caption="t < 0: 30 V, 4 Ω in series, 12 Ω in parallel with L. At t = 0 the source is removed; L is left with the 12 Ω."
          left={
            <StateCard title="t < 0, long time">
              <SeriesParStore vsLabel="30 V" rSeries="4 Ω" rPar="12 Ω" storeLabel="L" arrow="i_L" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, source-free">
              <OneRDump store="L" rLabel="12 Ω" storeLabel="L" arrow="i_L" />
            </StateCard>
          }
        />
      );
    case "s3-s4":
      return dcSeries("L", "16 V", "8 Ω", "L", "i_L", "The source stays on. Long time. V_s = 16 V and 8 Ω in series with L.");
    case "s3-s5":
      return (
        <PairBoard
          caption="t < 0 the extra 10 Ω is shorted. At t = 0 that short opens, so 5 Ω and 10 Ω are both in series with L. V_s stays 15 V."
          left={
            <StateCard title="t < 0, extra R shorted">
              <InsertResistor insertShorted vsLabel="15 V" rStay="5 Ω" rInsert="10 Ω" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, extra R in the loop">
              <InsertResistor insertShorted={false} vsLabel="15 V" rStay="5 Ω" rInsert="10 Ω" />
            </StateCard>
          }
        />
      );
    case "s3-s6":
      return (
        <PairBoard
          caption="t < 0: 48 V, 6 Ω in series, 18 Ω in parallel with L. At t = 0 the source is removed; L is left with the 18 Ω."
          left={
            <StateCard title="t < 0, long time">
              <SeriesParStore vsLabel="48 V" rSeries="6 Ω" rPar="18 Ω" storeLabel="L" arrow="i_L" />
            </StateCard>
          }
          right={
            <StateCard title="t > 0, source-free">
              <OneRDump store="L" rLabel="18 Ω" storeLabel="L" arrow="i_L" />
            </StateCard>
          }
        />
      );
    case "s3-s7":
      return insertPair(
        "24 V",
        "4 Ω",
        "8 Ω",
        "6 H",
        "t < 0 the extra 8 Ω is shorted. At t = 0 that short opens, so 4 Ω and 8 Ω are both in series with L = 6 H. V_s stays 24 V."
      );
    case "s3-s8":
      return insertPair(
        "18 V",
        "3 Ω",
        "6 Ω",
        "4.5 H",
        "t < 0 the extra 6 Ω is shorted. At t = 0 that short opens, so 3 Ω and 6 Ω are both in series with L = 4.5 H. V_s stays 18 V."
      );
    case "s3-s9":
      return insertPair(
        "12 V",
        "2 Ω",
        "4 Ω",
        "3 H",
        "t < 0 the extra 4 Ω is shorted. At t = 0 that short opens, so 2 Ω and 4 Ω are both in series with L = 3 H. V_s stays 12 V."
      );
    case "s3-s10":
      return insertPair(
        "40 V",
        "5 Ω",
        "15 Ω",
        "L",
        "t < 0 the extra 15 Ω is shorted. At t = 0 that short opens, so 5 Ω and 15 Ω are both in series with L. V_s stays 40 V."
      );
    case "s3-s11":
      return insertPair(
        "30 V",
        "5 Ω",
        "Rx",
        "10 H",
        "t < 0 extra Rx is shorted. At t = 0 that short opens, so 5 Ω and Rx are both in series with L = 10 H. V_s stays 30 V."
      );
    case "s3-s12":
      return insertPair(
        "24 V",
        "4 Ω",
        "8 Ω",
        "3 H",
        "t < 0 the extra 8 Ω is shorted. At t = 0 that short opens, so 4 Ω and 8 Ω are both in series with L = 3 H. V_s stays 24 V."
      );
    default:
      return null;
  }
}

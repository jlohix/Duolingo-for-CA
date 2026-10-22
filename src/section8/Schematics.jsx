import {
  Arrow,
  Box,
  CurrentSrc,
  Frame,
  MathLabel,
  Resistor,
  SplitFrame,
} from "../components/LabDraw";

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

function Wire({ d, ...extra }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      {...extra}
    />
  );
}

function PortOpen({ x, y, dir = 1, cls = "hot" }) {
  const c1 = x + dir * 8;
  const c2 = x + dir * 26;
  return (
    <g className={cls} fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx={c1} cy={y} r="4.5" />
      <circle cx={c2} cy={y} r="4.5" />
    </g>
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

function ResistorV({ x, y, cls }) {
  return (
    <path
      className={cls}
      d={`M${x} ${y} V${y + 12} l14 7 l-28 14 l28 14 l-28 14 l28 14 l-14 7 V${y + 112}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

function IArrow({ x1, x2, y, label, cls = "hot", faint = false, labelDy, labelX }) {
  const forward = x2 >= x1;
  const dy = labelDy ?? (y < 36 ? 10 : -26);
  return (
    <g opacity={faint ? 0.35 : 1}>
      {forward ? (
        <Arrow x1={x1} y={y} x2={x2} cls={cls} />
      ) : (
        <g className={cls} fill="none" stroke="currentColor" strokeWidth="3">
          <path d={`M${x1} ${y} H${x2}`} />
          <path d={`M${x2 + 12} ${y - 8} L${x2} ${y} L${x2 + 12} ${y + 8}`} />
        </g>
      )}
      {label ? (
        <MathLabel
          x={labelX ?? (x1 + x2) / 2 - 22}
          y={y + dy}
          w={48}
          h={24}
          tex={label}
          inline
        />
      ) : null}
    </g>
  );
}

function TwoPortBox({
  x = 170,
  y = 36,
  w = 220,
  h = 132,
  label = "N",
  showI1 = true,
  showI2 = true,
  outputCurrentMode = "entering",
  port1 = "normal",
  port2 = "normal",
  faintI2 = false,
  showV1 = true,
  showV2 = true,
  lead = 48,
  showFaintIncomingI2 = false,
  swapPorts = false,
}) {
  const top = y + 30;
  const bot = y + h - 30;
  const left = x;
  const right = x + w;
  const midY = (top + bot) / 2;

  function polarity(boxX, outward, vLabel) {
    if (!vLabel) return null;
    const px = boxX + outward * 18;
    const vx = outward < 0 ? boxX - 50 : boxX + 8;
    return (
      <>
        <text
          x={px}
          y={top + 8}
          textAnchor="middle"
          className="circuit-label"
        >
          +
        </text>
        <text
          x={px}
          y={bot + 6}
          textAnchor="middle"
          className="circuit-label"
        >
          −
        </text>
        <MathLabel
          x={vx}
          y={midY - 12}
          w={44}
          h={24}
          tex={vLabel}
          inline
        />
      </>
    );
  }

  function currentArrow(boxX, outward, iLabel, showI, iEnter, faint) {
    if (!showI) return null;
    const xLead = boxX + outward * lead;
    const yArr = top - 22;
    return (
      <IArrow
        x1={iEnter ? xLead : boxX}
        x2={iEnter ? boxX : xLead}
        y={yArr}
        label={iLabel}
        faint={faint}
        labelDy={yArr < 20 ? 12 : -24}
      />
    );
  }

  function side(state, boxX, outward, iLabel, vLabel, showI, iEnter, faint) {
    const xLead = boxX + outward * lead;
    const nodes = (
      <>
        <Dot x={boxX} y={top} />
        <Dot x={boxX} y={bot} />
      </>
    );
    const vZero = outward < 0 ? "$V_1=0$" : "$V_2=0$";
    const iZero = outward < 0 ? "$I_1=0$" : "$I_2=0$";

    if (state === "short") {
      const stub = Math.max(18, Math.min(lead - 4, 40));
      const xMid = boxX + outward * stub;
      const compact = lead < 36;
      const zeroX = compact
        ? outward < 0
          ? Math.max(2, boxX - 72)
          : boxX - 8
        : outward < 0
          ? Math.max(2, xMid - 72)
          : xMid + 8;
      const zeroY = compact ? bot + 6 : midY - 12;
      return (
        <g>
          {nodes}
          <Wire d={`M${boxX} ${top} H${xMid} V${bot} H${boxX}`} />
          {currentArrow(boxX, outward, iLabel, showI, iEnter, faint)}
          <MathLabel
            x={zeroX}
            y={zeroY}
            w={70}
            h={24}
            tex={vZero}
            inline
          />
        </g>
      );
    }
    if (state === "open") {
      const gapX = boxX + outward * 16;
      const iZeroX =
        outward < 0 ? Math.max(2, gapX - 78) : Math.min(500, gapX + 12);
      const iZeroY = bot + 16;
      const px = boxX + outward * 8;
      const vx = outward < 0 ? boxX - 52 : boxX + 6;
      return (
        <g>
          {nodes}
          <Wire d={`M${boxX} ${top} H${gapX}`} />
          <Wire d={`M${boxX} ${bot} H${gapX}`} />
          <PortOpen x={gapX} y={top} dir={outward} cls="hot" />
          <PortOpen x={gapX} y={bot} dir={outward} cls="hot" />
          {vLabel ? (
            <>
              <text
                x={px}
                y={top + 8}
                textAnchor="middle"
                className="circuit-label"
              >
                +
              </text>
              <text
                x={px}
                y={bot + 6}
                textAnchor="middle"
                className="circuit-label"
              >
                −
              </text>
              <MathLabel
                x={vx}
                y={midY - 12}
                w={44}
                h={24}
                tex={vLabel}
                inline
              />
            </>
          ) : null}
          <MathLabel
            x={iZeroX}
            y={iZeroY}
            w={56}
            h={24}
            tex={iZero}
            inline
          />
        </g>
      );
    }
    if (state === "vsource") {
      return (
        <g>
          {nodes}
          <Wire d={`M${boxX} ${top} H${xLead} V${midY - 18}`} />
          <Wire d={`M${boxX} ${bot} H${xLead} V${midY + 18}`} />
          <VSrcV cx={xLead} cy={midY} />
          {currentArrow(boxX, outward, iLabel, showI, iEnter, faint)}
          {vLabel ? (
            <MathLabel
              x={Math.max(2, xLead + (outward < 0 ? -52 : 24))}
              y={midY - 12}
              w={40}
              h={24}
              tex={vLabel}
              inline
            />
          ) : null}
        </g>
      );
    }
    if (state === "isource") {
      return (
        <g>
          {nodes}
          <Wire d={`M${boxX} ${top} H${xLead} V${midY - 18}`} />
          <Wire d={`M${boxX} ${bot} H${xLead} V${midY + 18}`} />
          <g transform={`translate(${xLead - 28} ${midY})`}>
            <CurrentSrc x={0} y={0} cls="hot" />
          </g>
          {currentArrow(boxX, outward, iLabel, showI, iEnter, faint)}
          {vLabel ? (
            <>
              <text
                x={boxX + outward * 18}
                y={top + 8}
                textAnchor="middle"
                className="circuit-label"
              >
                +
              </text>
              <text
                x={boxX + outward * 18}
                y={bot + 6}
                textAnchor="middle"
                className="circuit-label"
              >
                −
              </text>
              <MathLabel
                x={Math.max(2, xLead + (outward < 0 ? -64 : 36))}
                y={midY - 12}
                w={40}
                h={24}
                tex={vLabel}
                inline
              />
            </>
          ) : null}
        </g>
      );
    }
    return (
      <g>
        {nodes}
        <Wire d={`M${boxX} ${top} H${xLead}`} />
        <Wire d={`M${boxX} ${bot} H${xLead}`} />
        {currentArrow(boxX, outward, iLabel, showI, iEnter, faint)}
        {polarity(boxX, outward, vLabel)}
      </g>
    );
  }

  const i2Enter = outputCurrentMode === "entering";
  const leftI = swapPorts ? "$I_2$" : "$I_1$";
  const leftV = swapPorts ? "$V_2$" : "$V_1$";
  const rightI = swapPorts
    ? "$I_1$"
    : i2Enter
      ? "$I_2$"
      : "$-I_2$";
  const rightV = swapPorts ? "$V_1$" : "$V_2$";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 6}
        textAnchor="middle"
        className="circuit-label"
        fontSize="22"
      >
        {label}
      </text>
      {side(
        port1,
        left,
        -1,
        leftI,
        showV1 ? leftV : null,
        showI1,
        true,
        false
      )}
      {side(
        port2,
        right,
        1,
        rightI,
        showV2 ? rightV : null,
        showI2,
        i2Enter,
        faintI2
      )}
      {showFaintIncomingI2 ? (
        <IArrow
          x1={right + lead}
          x2={right}
          y={top - 48}
          label="$I_2$"
          faint
          labelDy={-22}
        />
      ) : null}
    </g>
  );
}

function OnePortView() {
  const left = 64;
  const boxX = 196;
  const top = 58;
  const bot = 154;
  return (
    <Frame label="One-port with matching terminal currents" height={220}>
      <rect
        x={boxX}
        y={36}
        width={200}
        height={140}
        rx="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <text
        x={boxX + 100}
        y={114}
        textAnchor="middle"
        className="circuit-label"
        fontSize="22"
      >
        N
      </text>
      <Wire d={`M${left} ${top} H${boxX}`} />
      <Wire d={`M${left} ${bot} H${boxX}`} />
      <Dot x={left} y={top} />
      <Dot x={left} y={bot} />
      <Dot x={boxX} y={top} />
      <Dot x={boxX} y={bot} />
      <IArrow x1={left} x2={boxX - 8} y={top - 16} label="$I$" />
      <IArrow x1={boxX - 8} x2={left} y={bot + 16} />
      <text x={left - 14} y={top + 6} className="circuit-label">
        +
      </text>
      <text x={left - 14} y={bot + 6} className="circuit-label">
        −
      </text>
      <MathLabel x={left - 6} y={88} w={40} h={24} tex="$V$" inline />
    </Frame>
  );
}

function TwoPortView() {
  return (
    <Frame label="Standard two-port reference directions" height={248}>
      <TwoPortBox x={148} y={44} w={240} h={140} lead={56} />
    </Frame>
  );
}

function CommonGroundView() {
  return (
    <SplitFrame
      label="Four terminals versus common ground"
      height={236}
      left={
        <>
          <TwoPortBox x={68} y={28} w={136} h={132} lead={40} />
          <text x={136} y={210} textAnchor="middle" className="circuit-label">
            4 terminals
          </text>
        </>
      }
      right={
        <>
          <rect
            x={76}
            y={40}
            width={120}
            height={96}
            rx="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <text x={136} y={96} textAnchor="middle" className="circuit-label" fontSize="20">
            N
          </text>
          <Wire d="M40 60 H76" />
          <Wire d="M196 60 H232" />
          <Wire d="M136 136 V172" />
          <Dot x={40} y={60} />
          <Dot x={232} y={60} />
          <Dot x={136} y={172} />
          <Ground x={136} y={172} />
          <IArrow x1={16} x2={70} y={44} label="$I_1$" />
          <IArrow x1={256} x2={202} y={44} label="$I_2$" />
          <text x={28} y={66} className="circuit-label">+</text>
          <text x={148} y={168} className="circuit-label">−</text>
          <MathLabel x={8} y={100} w={40} h={22} tex="$V_1$" inline />
          <text x={240} y={66} className="circuit-label">+</text>
          <MathLabel x={220} y={100} w={40} h={22} tex="$V_2$" inline />
          <text x={136} y={210} textAnchor="middle" className="circuit-label">
            3 terminals
          </text>
        </>
      }
    />
  );
}

function PortVariablesView() {
  return (
    <Frame label="Four external port variables" height={248}>
      <TwoPortBox x={148} y={28} w={240} h={132} lead={56} />
      <Box x={16} y={184} w={140} h={52} cls="hot" title={"$V_1,\\,I_1$"} sub="port 1" />
      <Box x={404} y={184} w={140} h={52} cls="hot" title={"$V_2,\\,I_2$"} sub="port 2" />
    </Frame>
  );
}

function ParameterFamiliesView() {
  const cards = [
    ["Y", "$[I]=[Y][V]$", "short-circuit family"],
    ["Z", "$[V]=[Z][I]$", "open-circuit family"],
    ["h", "$[V_1,I_2]^{T}=[h][I_1,V_2]^{T}$", "hybrid"],
    ["ABCD", "$[V_1,I_1]^{T}=[T][V_2,-I_2]^{T}$", "transmission"],
  ];
  return (
    <Frame label="Four parameter families" height={256}>
      {cards.map(([title, map, sub], i) => (
        <Box
          key={title}
          x={16 + (i % 2) * 268}
          y={12 + Math.floor(i / 2) * 118}
          w={256}
          h={108}
          cls="hot"
          title={map}
          sub={`${title}: ${sub}`}
        />
      ))}
    </Frame>
  );
}

function OpenShortView() {
  return (
    <SplitFrame
      label="Open gap versus shorting wire"
      height={220}
      left={
        <>
          <rect x={36} y={16} width={200} height={184} rx="14" fill="none" stroke="currentColor" strokeWidth="3" />
          <text x={136} y={40} textAnchor="middle" className="circuit-label">OPEN</text>
          <Dot x={88} y={72} />
          <Dot x={88} y={148} />
          <text x={54} y={78} className="circuit-label">+</text>
          <text x={54} y={154} className="circuit-label">−</text>
          <MathLabel x={44} y={98} w={40} h={24} tex={"$V$"} inline />
          <MathLabel x={128} y={98} w={70} h={24} tex={"$I=0$"} inline />
          <text x={136} y={186} textAnchor="middle" className="circuit-label">
            no connection across port
          </text>
        </>
      }
      right={
        <>
          <rect x={36} y={16} width={200} height={184} rx="14" fill="none" stroke="currentColor" strokeWidth="3" />
          <text x={136} y={40} textAnchor="middle" className="circuit-label">SHORT</text>
          <Wire d="M64 72 H176 V148 H64" />
          <Dot x={64} y={72} />
          <Dot x={64} y={148} />
          <text x={54} y={78} className="circuit-label">+</text>
          <text x={54} y={154} className="circuit-label">−</text>
          <MathLabel x={88} y={96} w={70} h={24} tex={"$V=0$"} inline />
          <text x={136} y={186} textAnchor="middle" className="circuit-label">direct wire</text>
        </>
      }
    />
  );
}

function YDefinitionView() {
  return (
    <Frame label="Y parameters map voltages to currents" height={220}>
      <Box
        x={16}
        y={16}
        w={268}
        h={188}
        cls="hot"
        title={"$[I]=[Y][V]$"}
        sub={"Siemens · short-circuit tests"}
      />
      <Box
        x={300}
        y={16}
        w={244}
        h={88}
        cls="hot"
        title={"$V_2=0\\to y_{11},y_{21}$"}
      />
      <Box
        x={300}
        y={116}
        w={244}
        h={88}
        cls="hot"
        title={"$V_1=0\\to y_{12},y_{22}$"}
      />
    </Frame>
  );
}

function YShort2View() {
  return (
    <Frame label="Port 2 shorted, V1 applied" height={248}>
      <TwoPortBox x={148} y={40} w={240} h={140} lead={56} port1="vsource" port2="short" />
    </Frame>
  );
}

function YShort1View() {
  return (
    <Frame label="Port 1 shorted, V2 applied" height={248}>
      <TwoPortBox x={148} y={40} w={240} h={140} lead={56} port1="short" port2="vsource" />
    </Frame>
  );
}

function YMeaningView() {
  return (
    <SplitFrame
      label="Short-circuit tests for Y parameters"
      height={292}
      left={
        <>
          <TwoPortBox x={88} y={16} w={120} h={118} lead={24} port1="vsource" port2="short" />
          <text x={136} y={176} textAnchor="middle" className="circuit-label">PORT 2 SHORTED</text>
          <MathLabel x={24} y={196} w={224} h={28} tex={"$y_{11}=I_1/V_1$"} inline />
          <MathLabel x={24} y={226} w={224} h={28} tex={"$y_{21}=I_2/V_1$"} inline />
        </>
      }
      right={
        <>
          <TwoPortBox x={88} y={16} w={120} h={118} lead={24} port1="short" port2="vsource" />
          <text x={136} y={176} textAnchor="middle" className="circuit-label">PORT 1 SHORTED</text>
          <MathLabel x={24} y={196} w={224} h={28} tex={"$y_{12}=I_1/V_2$"} inline />
          <MathLabel x={24} y={226} w={224} h={28} tex={"$y_{22}=I_2/V_2$"} inline />
        </>
      }
    />
  );
}

function PiNetwork() {
  const l = 100;
  const r = 400;
  const top = 56;
  const bot = 176;
  const ls = 168;
  const rs = 328;
  return (
    <g>
      <Wire d={`M${l} ${top} H${ls}`} />
      <Resistor x={ls} y={top} cls="hot" />
      <Wire d={`M${ls + 112} ${top} H${rs}`} />
      <Wire d={`M${rs} ${top} H${r}`} />
      <ResistorV x={ls} y={top} cls="hot" />
      <ResistorV x={rs} y={top} cls="hot" />
      <Wire d={`M${ls} ${top + 112} V${bot}`} />
      <Wire d={`M${rs} ${top + 112} V${bot}`} />
      <Wire d={`M${l} ${bot} H${r}`} />
      <Dot x={l} y={top} />
      <Dot x={l} y={bot} />
      <Dot x={r} y={top} />
      <Dot x={r} y={bot} />
      <Dot x={ls} y={top} />
      <Dot x={rs} y={top} />
      <Ground x={250} y={bot} />
      <Wire d={`M${l - 40} ${top} H${l}`} />
      <Wire d={`M${r} ${top} H${r + 40}`} />
      <IArrow x1={l - 36} x2={l - 8} y={top - 18} label="$I_1$" />
      <IArrow x1={r + 36} x2={r + 8} y={top - 18} label="$I_2$" />
      <text x={l - 22} y={top + 8} className="circuit-label">+</text>
      <text x={l - 22} y={bot + 6} className="circuit-label">−</text>
      <text x={r + 22} y={top + 8} className="circuit-label">+</text>
      <text x={r + 22} y={bot + 6} className="circuit-label">−</text>
      <MathLabel x={l - 52} y={108} w={40} h={24} tex="$V_1$" inline />
      <MathLabel x={r + 18} y={108} w={40} h={24} tex="$V_2$" inline />
      <MathLabel x={208} y={18} w={70} h={24} tex={"$2\\Omega$"} inline />
      <MathLabel x={ls - 50} y={100} w={70} h={24} tex={"$2\\Omega$"} inline />
      <MathLabel x={rs + 10} y={100} w={70} h={24} tex={"$2\\Omega$"} inline />
    </g>
  );
}

function YPiView() {
  return (
    <Frame label="Pi resistor network for Y parameters" height={248}>
      <PiNetwork />
    </Frame>
  );
}

function YMatrixView() {
  return (
    <Frame label="Coefficients become the Y matrix" height={232}>
      <Box
        x={16}
        y={24}
        w={250}
        h={180}
        cls="hot"
        title={"$I_1=V_1-\\frac12 V_2$"}
        sub={"$I_2=-\\frac12 V_1+V_2$"}
      />
      <Arrow x1={276} y={114} x2={318} cls="hot" />
      <Box
        x={326}
        y={40}
        w={214}
        h={148}
        cls="hot"
        title={"$[Y]$ S"}
        sub={"$\\begin{bmatrix}1&-1/2\\\\ -1/2&1\\end{bmatrix}$"}
      />
    </Frame>
  );
}

function ZDefinitionView() {
  return (
    <Frame label="Z parameters map currents to voltages" height={220}>
      <Box
        x={16}
        y={16}
        w={268}
        h={188}
        cls="hot"
        title={"$[V]=[Z][I]$"}
        sub={"Ohms · open-circuit tests"}
      />
      <Box
        x={300}
        y={16}
        w={244}
        h={88}
        cls="hot"
        title={"$I_2=0\\to z_{11},z_{21}$"}
      />
      <Box
        x={300}
        y={116}
        w={244}
        h={88}
        cls="hot"
        title={"$I_1=0\\to z_{12},z_{22}$"}
      />
    </Frame>
  );
}

function ZOpen2View() {
  return (
    <Frame label="Port 2 open, I1 applied" height={248}>
      <TwoPortBox x={140} y={40} w={240} h={140} lead={56} port1="isource" port2="open" />
    </Frame>
  );
}

function ZOpen1View() {
  return (
    <Frame label="Port 1 open, I2 applied" height={248}>
      <TwoPortBox x={140} y={40} w={240} h={140} lead={56} port1="open" port2="isource" />
    </Frame>
  );
}

function ZMeaningView() {
  return (
    <Frame label="Open-circuit Z-parameter names" height={248}>
      {[
        ["$z_{11}$", "open-circuit input"],
        ["$z_{21}$", "open-circuit forward"],
        ["$z_{12}$", "open-circuit reverse"],
        ["$z_{22}$", "open-circuit output"],
      ].map(([title, sub], i) => (
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

function TNetwork({ leftR = "2", rightR = "4", shuntR = "3" }) {
  const l = 92;
  const r = 468;
  const top = 64;
  const bot = 180;
  const c = 270;
  return (
    <g>
      <Wire d={`M${l} ${top} H128`} />
      <Resistor x={128} y={top} cls="hot" />
      <Wire d={`M240 ${top} H${c}`} />
      <Wire d={`M${c} ${top} H${c + 18}`} />
      <Resistor x={c + 18} y={top} cls="hot" />
      <Wire d={`M${c + 130} ${top} H${r}`} />
      <ResistorV x={c} y={top} cls="hot" />
      <Wire d={`M${c} ${top + 112} V${bot}`} />
      <Wire d={`M${l} ${bot} H${r}`} />
      <Dot x={l} y={top} />
      <Dot x={l} y={bot} />
      <Dot x={r} y={top} />
      <Dot x={r} y={bot} />
      <Dot x={c} y={top} />
      <Ground x={c} y={bot} />
      <Wire d={`M${l - 40} ${top} H${l}`} />
      <Wire d={`M${r} ${top} H${r + 40}`} />
      <IArrow x1={l - 36} x2={l - 8} y={top - 16} label="$I_1$" />
      <IArrow x1={r + 36} x2={r + 8} y={top - 16} label="$I_2$" />
      <text x={l - 14} y={top + 6} className="circuit-label">+</text>
      <text x={l - 14} y={bot + 6} className="circuit-label">−</text>
      <text x={r + 14} y={top + 6} className="circuit-label">+</text>
      <text x={r + 14} y={bot + 6} className="circuit-label">−</text>
      <MathLabel x={l - 44} y={96} w={40} h={24} tex="$V_1$" inline />
      <MathLabel x={r + 8} y={96} w={40} h={24} tex="$V_2$" inline />
      <MathLabel x={150} y={18} w={70} h={24} tex={`$${leftR}\\Omega$`} inline />
      <MathLabel x={c + 30} y={18} w={70} h={24} tex={`$${rightR}\\Omega$`} inline />
      <MathLabel x={c + 12} y={100} w={70} h={24} tex={`$${shuntR}\\Omega$`} inline />
    </g>
  );
}

function ZTView() {
  return (
    <Frame label="T resistor network for Z parameters" height={248}>
      <TNetwork />
    </Frame>
  );
}

function ZMatrixView() {
  return (
    <Frame label="Voltage coefficients become the Z matrix" height={232}>
      <Box
        x={16}
        y={24}
        w={250}
        h={180}
        cls="hot"
        title={"$V_1=5I_1+3I_2$"}
        sub={"$V_2=3I_1+7I_2$"}
      />
      <Arrow x1={276} y={114} x2={318} cls="hot" />
      <Box
        x={326}
        y={40}
        w={214}
        h={148}
        cls="hot"
        title={"$[Z]$ Ω"}
        sub={"$\\begin{bmatrix}5&3\\\\ 3&7\\end{bmatrix}$"}
      />
    </Frame>
  );
}

function HDefinitionView() {
  const units = [
    ["$h_{11}$", "Ohm"],
    ["$h_{12}$", "dimensionless"],
    ["$h_{21}$", "dimensionless"],
    ["$h_{22}$", "S"],
  ];
  return (
    <Frame label="Hybrid parameters mix V and I" height={220}>
      <Box
        x={12}
        y={16}
        w={268}
        h={188}
        cls="hot"
        title={"$\\begin{bmatrix}V_1\\\\ I_2\\end{bmatrix}=[h]\\begin{bmatrix}I_1\\\\ V_2\\end{bmatrix}$"}
        sub="mixed units"
      />
      {units.map(([title, sub], i) => (
        <Box
          key={title}
          x={292 + (i % 2) * 130}
          y={16 + Math.floor(i / 2) * 96}
          w={122}
          h={88}
          cls="hot"
          title={title}
          sub={sub}
        />
      ))}
    </Frame>
  );
}

function HShort2View() {
  return (
    <Frame label="Port 2 shorted for h11 and h21" height={248}>
      <TwoPortBox x={148} y={40} w={240} h={140} lead={56} port2="short" />
    </Frame>
  );
}

function HOpen1View() {
  return (
    <Frame label="Port 1 open for h12 and h22" height={248}>
      <TwoPortBox x={140} y={40} w={240} h={140} lead={56} port1="open" />
    </Frame>
  );
}

function AbcdConventionView() {
  return (
    <Frame label="Transmission current leaves port 2" height={248}>
      <TwoPortBox
        x={148}
        y={56}
        w={240}
        h={140}
        lead={56}
        outputCurrentMode="leaving"
        showFaintIncomingI2
      />
    </Frame>
  );
}

function AbcdDefinitionView() {
  return (
    <Frame label="ABCD matrix uses V2 and -I2" height={220}>
      <Box
        x={16}
        y={16}
        w={360}
        h={188}
        cls="hot"
        title={"$\\begin{bmatrix}V_1\\\\ I_1\\end{bmatrix}=[T]\\begin{bmatrix}V_2\\\\ -I_2\\end{bmatrix}$"}
        sub={"$-I_2$ leaves port 2"}
      />
      <Box x={392} y={16} w={152} h={88} cls="hot" title={"$[T]=\\begin{bmatrix}A&B\\\\ C&D\\end{bmatrix}$"} />
      <Box x={392} y={116} w={152} h={88} cls="hot" title={"$A,D$ unitless"} sub={"$B$ Ω, $C$ S"} />
    </Frame>
  );
}

function AbcdOpenView() {
  return (
    <Frame label="Port 2 open for A and C" height={248}>
      <TwoPortBox x={140} y={40} w={240} h={140} lead={56} port2="open" outputCurrentMode="leaving" />
    </Frame>
  );
}

function AbcdShortView() {
  return (
    <Frame label="Port 2 shorted for B and D" height={248}>
      <TwoPortBox x={148} y={40} w={240} h={140} lead={56} port2="short" outputCurrentMode="leaving" />
    </Frame>
  );
}

function SeriesZBlock({ x, zLabel, showV = true }) {
  const top = 70;
  const bot = 168;
  return (
    <g>
      <rect
        className="board-ghost"
        x={x}
        y={40}
        width={180}
        height={150}
        rx="14"
        fill="none"
      />
      <Wire d={`M${x} ${top} H${x + 34}`} />
      <Resistor x={x + 34} y={top} cls="hot" />
      <Wire d={`M${x + 146} ${top} H${x + 180}`} />
      <Wire d={`M${x} ${bot} H${x + 180}`} />
      <Dot x={x} y={top} />
      <Dot x={x} y={bot} />
      <Dot x={x + 180} y={top} />
      <Dot x={x + 180} y={bot} />
      {showV ? (
        <>
          <text x={x + 18} y={top + 32} className="circuit-label">+</text>
          <text x={x + 18} y={bot - 16} className="circuit-label">−</text>
          <text x={x + 160} y={top + 32} className="circuit-label">+</text>
          <text x={x + 160} y={bot - 16} className="circuit-label">−</text>
          <MathLabel x={x + 22} y={108} w={36} h={22} tex="$V_1$" inline />
          <MathLabel x={x + 122} y={108} w={36} h={22} tex="$V_2$" inline />
        </>
      ) : null}
      <MathLabel x={x + 60} y={24} w={70} h={24} tex={zLabel} inline />
    </g>
  );
}

function AbcdSeriesView() {
  return (
    <Frame label="Series 4-ohm element" height={232}>
      <SeriesZBlock x={190} zLabel={"$4\\Omega$"} />
      <Wire d="M140 70 H190" />
      <Wire d="M370 70 H430" />
      <Wire d="M140 168 H190" />
      <Wire d="M370 168 H430" />
      <IArrow x1={146} x2={180} y={50} label="$I_1$" />
      <IArrow x1={376} x2={424} y={50} label="$-I_2$" />
    </Frame>
  );
}

function ParameterRelationsView() {
  return (
    <Frame label="Y is the inverse of Z when it exists" height={220}>
      <Box
        x={16}
        y={20}
        w={320}
        h={180}
        cls="hot"
        title={"$[Y]=[Z]^{-1}$"}
        sub={"when $\\Delta_z\\neq 0$"}
      />
      <Box
        x={352}
        y={20}
        w={192}
        h={180}
        cls="hot"
        title="other sets"
        sub="rearrange equations"
      />
    </Frame>
  );
}

function ZToYView() {
  return (
    <Frame label="Invert the worked Z matrix" height={232}>
      <Box
        x={12}
        y={20}
        w={140}
        h={188}
        cls="hot"
        title={"$[Z]$"}
        sub={"$\\begin{bmatrix}5&3\\\\ 3&7\\end{bmatrix}$"}
      />
      <Arrow x1={160} y={114} x2={188} cls="hot" />
      <Box x={196} y={52} w={96} h={124} cls="hot" title={"$\\Delta=26$"} />
      <Arrow x1={300} y={114} x2={328} cls="hot" />
      <Box
        x={336}
        y={16}
        w={212}
        h={196}
        cls="hot"
        title={"$[Y]=\\dfrac{1}{26}\\begin{bmatrix}7&-3\\\\ -3&5\\end{bmatrix}\\mathrm{S}$"}
      />
    </Frame>
  );
}

function ReciprocityView() {
  return (
    <Frame label="Reciprocity conditions" height={248}>
      {[
        ["Z", "$z_{12}=z_{21}$"],
        ["Y", "$y_{12}=y_{21}$"],
        ["h", "$h_{12}=-h_{21}$"],
        ["ABCD", "$AD-BC=1$"],
      ].map(([title, sub], i) => (
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

function SymmetryView() {
  return (
    <Frame label="Symmetry is port interchange" height={248}>
      <TwoPortBox x={40} y={36} w={148} h={118} lead={36} label="N" />
      <text x={280} y={84} textAnchor="middle" className="circuit-label">
        interchange
      </text>
      <text x={280} y={106} textAnchor="middle" className="circuit-label">
        ports 1 ↔ 2
      </text>
      <TwoPortBox
        x={372}
        y={36}
        w={148}
        h={118}
        lead={36}
        label="N"
        swapPorts
      />
      <text x={114} y={180} textAnchor="middle" className="circuit-label">original</text>
      <text x={446} y={180} textAnchor="middle" className="circuit-label">ports swapped</text>
      <text x={280} y={220} textAnchor="middle" className="circuit-label">
        electrically unchanged after interchange
      </text>
    </Frame>
  );
}

function ClassifyZView() {
  return (
    <Frame label="Reciprocal yes, symmetrical no" height={232}>
      <Box
        x={16}
        y={16}
        w={160}
        h={200}
        cls="hot"
        title={"$[Z]$"}
        sub={"$\\begin{bmatrix}5&3\\\\ 3&7\\end{bmatrix}\\Omega$"}
      />
      <Box
        x={192}
        y={16}
        w={168}
        h={92}
        cls="hot"
        title={"$z_{12}=z_{21}=3$"}
        sub="reciprocal YES"
      />
      <Box
        x={376}
        y={16}
        w={168}
        h={92}
        cls="hot"
        title={"$z_{11}\\neq z_{22}$"}
        sub="symmetrical NO"
      />
      <Box
        x={192}
        y={124}
        w={352}
        h={92}
        cls="hot"
        title="reciprocal, not symmetrical"
      />
    </Frame>
  );
}

function SymmetricExampleView() {
  return (
    <Frame label="Symmetric T network" height={296}>
      <g transform="translate(0 -10)">
        <TNetwork leftR="3" rightR="3" shuntR="2" />
      </g>
      <Box
        x={150}
        y={216}
        w={260}
        h={70}
        cls="hot"
        title={"$[Z]=\\begin{bmatrix}5&2\\\\ 2&5\\end{bmatrix}\\Omega$"}
      />
    </Frame>
  );
}

function StackedPorts({ x, y, series, labels = ["N1", "N2"], compact = false }) {
  const w = compact ? 70 : 88;
  const h = compact ? 36 : 44;
  const gap = compact ? 14 : 18;
  const lead = series ? (compact ? 26 : 40) : (compact ? 14 : 20);
  const x2 = x + w;
  const y2 = y + h + gap;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x={x} y={y2} width={w} height={h} rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x={x + w / 2} y={y + (compact ? 24 : 28)} textAnchor="middle" className="circuit-label">{labels[0]}</text>
      <text x={x + w / 2} y={y2 + (compact ? 24 : 28)} textAnchor="middle" className="circuit-label">{labels[1]}</text>
      {series ? (
        <>
          <Wire d={`M${x - lead} ${y + 10} H${x}`} />
          <Wire d={`M${x - lead} ${y + h - 10} V${y2 + 10} H${x}`} />
          <Wire d={`M${x} ${y2 + h - 10} H${x - lead}`} />
          <Wire d={`M${x2 + lead} ${y + 10} H${x2}`} />
          <Wire d={`M${x2 + lead} ${y + h - 10} V${y2 + 10} H${x2}`} />
          <Wire d={`M${x2} ${y2 + h - 10} H${x2 + lead}`} />
        </>
      ) : (
        <>
          <Wire d={`M${x - lead} ${y + 10} H${x} M${x - lead} ${y + 10} V${y2 + 10} H${x}`} />
          <Wire d={`M${x - lead} ${y + h - 10} H${x} M${x - lead} ${y + h - 10} V${y2 + h - 10} H${x}`} />
          <Wire d={`M${x2} ${y + 10} H${x2 + lead} V${y2 + 10} H${x2}`} />
          <Wire d={`M${x2} ${y + h - 10} H${x2 + lead} V${y2 + h - 10} H${x2}`} />
        </>
      )}
    </g>
  );
}

function InterconnectionConditionView() {
  return (
    <Frame label="Series, parallel, cascade" height={236}>
      <StackedPorts x={28} y={24} series compact />
      <text x={63} y={150} textAnchor="middle" className="circuit-label">SERIES</text>
      <text x={63} y={170} textAnchor="middle" className="circuit-label">common ground</text>
      <text x={63} y={188} textAnchor="middle" className="circuit-label">required</text>
      <StackedPorts x={196} y={24} series={false} compact />
      <text x={231} y={150} textAnchor="middle" className="circuit-label">PARALLEL</text>
      <text x={231} y={170} textAnchor="middle" className="circuit-label">common ground</text>
      <text x={231} y={188} textAnchor="middle" className="circuit-label">required</text>
      <rect x={392} y={32} width={64} height={80} rx="10" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x={468} y={32} width={64} height={80} rx="10" fill="none" stroke="currentColor" strokeWidth="3" />
      <Wire d="M456 52 H468" />
      <Wire d="M456 92 H468" />
      <text x={424} y={80} textAnchor="middle" className="circuit-label">T1</text>
      <text x={500} y={80} textAnchor="middle" className="circuit-label">T2</text>
      <text x={462} y={150} textAnchor="middle" className="circuit-label">CASCADE</text>
      <text x={462} y={170} textAnchor="middle" className="circuit-label">common ground</text>
      <text x={462} y={188} textAnchor="middle" className="circuit-label">not required</text>
    </Frame>
  );
}

function SeriesConnectionView() {
  return (
    <Frame label="Series connection adds Z matrices" height={248}>
      <StackedPorts x={116} y={44} series />
      <IArrow x1={76} x2={112} y={30} label="$I_1$" labelDy={-24} />
      <IArrow x1={288} x2={248} y={30} label="$I_2$" labelDy={-24} />
      <text x={44} y={100} textAnchor="middle" className="circuit-label">same I1</text>
      <text x={226} y={104} textAnchor="middle" className="circuit-label">same I2</text>
      <text x={44} y={176} textAnchor="middle" className="circuit-label">V1 total</text>
      <text x={268} y={176} textAnchor="middle" className="circuit-label">V2 total</text>
      <Arrow x1={300} y={96} x2={334} cls="hot" />
      <Box
        x={338}
        y={40}
        w={206}
        h={120}
        cls="hot"
        title={"$[Z]=[Z_1]+[Z_2]$"}
      />
    </Frame>
  );
}

function ParallelConnectionView() {
  return (
    <Frame label="Parallel connection adds Y matrices" height={248}>
      <StackedPorts x={116} y={40} series={false} />
      <IArrow x1={70} x2={108} y={26} label="$I_1$" labelDy={-24} />
      <IArrow x1={268} x2={230} y={26} label="$I_2$" labelDy={-24} />
      <text x={90} y={176} textAnchor="middle" className="circuit-label">V1 common</text>
      <text x={220} y={176} textAnchor="middle" className="circuit-label">V2 common</text>
      <text x={156} y={204} textAnchor="middle" className="circuit-label">
        port currents add
      </text>
      <Arrow x1={276} y={88} x2={322} cls="hot" />
      <Box
        x={330}
        y={36}
        w={214}
        h={120}
        cls="hot"
        title={"$[Y]=[Y_1]+[Y_2]$"}
      />
    </Frame>
  );
}

function CascadeConnectionView() {
  return (
    <Frame label="Cascade multiplies ABCD in order" height={200}>
      <Wire d="M8 58 H24" />
      <Wire d="M8 114 H24" />
      <rect x={24} y={36} width={130} height={100} rx="14" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x={186} y={36} width={130} height={100} rx="14" fill="none" stroke="currentColor" strokeWidth="3" />
      <text x={89} y={94} textAnchor="middle" className="circuit-label" fontSize="22">T1</text>
      <text x={251} y={94} textAnchor="middle" className="circuit-label" fontSize="22">T2</text>
      <Wire d="M154 58 H186" />
      <Wire d="M154 114 H186" />
      <Wire d="M316 58 H332" />
      <Wire d="M316 114 H332" />
      <Dot x={8} y={58} />
      <Dot x={8} y={114} />
      <Dot x={154} y={58} />
      <Dot x={186} y={58} />
      <Dot x={154} y={114} />
      <Dot x={186} y={114} />
      <Dot x={332} y={58} />
      <Dot x={332} y={114} />
      <Arrow x1={340} y={86} x2={376} cls="hot" />
      <Box x={384} y={40} w={156} h={92} cls="hot" title={"$[T]=[T_1][T_2]$"} />
    </Frame>
  );
}

function SeriesParallelWorkedView() {
  return (
    <SplitFrame
      label="Series Z add, parallel Y add"
      height={252}
      left={
        <>
          <Box x={12} y={4} w={248} h={40} cls="hot" title="SERIES $[Z]=[Z_1]+[Z_2]$" />
          <Box
            x={12}
            y={48}
            w={120}
            h={92}
            cls="hot"
            title={"$[Z_1]$"}
            sub={"$\\begin{bmatrix}2&1\\\\ 1&3\\end{bmatrix}$"}
          />
          <Box
            x={140}
            y={48}
            w={120}
            h={92}
            cls="hot"
            title={"$[Z_2]$"}
            sub={"$\\begin{bmatrix}1&1/2\\\\ 1/2&2\\end{bmatrix}$"}
          />
          <Box
            x={12}
            y={146}
            w={248}
            h={96}
            cls="hot"
            title={"$[Z]$"}
            sub={"$\\begin{bmatrix}3&3/2\\\\ 3/2&5\\end{bmatrix}$"}
          />
        </>
      }
      right={
        <>
          <Box x={12} y={4} w={248} h={40} cls="hot" title="PARALLEL $[Y]=2[Y_1]$" />
          <Box
            x={12}
            y={48}
            w={248}
            h={92}
            cls="hot"
            title={"$[Y_1]$"}
            sub={"$\\begin{bmatrix}1&-1/2\\\\ -1/2&1\\end{bmatrix}$"}
          />
          <Box
            x={12}
            y={146}
            w={248}
            h={96}
            cls="hot"
            title={"$[Y]$ S"}
            sub={"$\\begin{bmatrix}2&-1\\\\ -1&2\\end{bmatrix}$"}
          />
        </>
      }
    />
  );
}

function CascadeWorkedView() {
  return (
    <Frame label="2 ohm then 3 ohm series cascade" height={232}>
      <SeriesZBlock x={16} zLabel={"$2\\Omega$"} showV={false} />
      <Wire d="M196 70 H216" />
      <Wire d="M196 168 H216" />
      <SeriesZBlock x={216} zLabel={"$3\\Omega$"} showV={false} />
      <Arrow x1={404} y={110} x2={436} cls="hot" />
      <Box
        x={444}
        y={36}
        w={108}
        h={156}
        cls="hot"
        title={"$[T]$"}
        sub={"$\\begin{bmatrix}1&5\\\\ 0&1\\end{bmatrix}$"}
      />
      <MathLabel x={444} y={198} w={108} h={24} tex={"$5\\Omega$"} inline />
    </Frame>
  );
}

const VIEWS = {
  "one-port": OnePortView,
  "two-port": TwoPortView,
  "common-ground": CommonGroundView,
  "port-variables": PortVariablesView,
  "parameter-families": ParameterFamiliesView,
  "open-short": OpenShortView,
  "y-definition": YDefinitionView,
  "y-short2": YShort2View,
  "y-short1": YShort1View,
  "y-meaning": YMeaningView,
  "y-pi": YPiView,
  "y-matrix": YMatrixView,
  "z-definition": ZDefinitionView,
  "z-open2": ZOpen2View,
  "z-open1": ZOpen1View,
  "z-meaning": ZMeaningView,
  "z-t": ZTView,
  "z-matrix": ZMatrixView,
  "h-definition": HDefinitionView,
  "h-short2": HShort2View,
  "h-open1": HOpen1View,
  "abcd-convention": AbcdConventionView,
  "abcd-definition": AbcdDefinitionView,
  "abcd-open": AbcdOpenView,
  "abcd-short": AbcdShortView,
  "abcd-series": AbcdSeriesView,
  "parameter-relations": ParameterRelationsView,
  "z-to-y": ZToYView,
  reciprocity: ReciprocityView,
  symmetry: SymmetryView,
  "classify-z": ClassifyZView,
  "symmetric-example": SymmetricExampleView,
  "interconnection-condition": InterconnectionConditionView,
  "series-connection": SeriesConnectionView,
  "parallel-connection": ParallelConnectionView,
  "cascade-connection": CascadeConnectionView,
  "series-parallel-worked": SeriesParallelWorkedView,
  "cascade-worked": CascadeWorkedView,
};

export const SECTION8_BOARD_VIEWS = Object.keys(VIEWS);

export default function Section8Schematic({ view }) {
  const View = VIEWS[view] || OnePortView;
  return <View />;
}

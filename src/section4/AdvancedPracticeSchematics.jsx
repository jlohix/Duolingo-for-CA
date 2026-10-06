import {
  Wire,
  Node,
  BatteryV,
  ResistorH,
  ResistorV,
  InductorV,
  CapacitorV,
  SwitchH,
  CurrentArrow,
  CurrentArrowV,
} from "../section3/PracticeDraw";
import { PairBoard, StateCard } from "../section3/PracticeSchematics";

const T = 50;
const VIEW_W = 380;
const LEFT_X = 70;
const SINGLE_H = 72;
const STACK_H = 54;
const STACK_GAP = 14;
const BRANCH_GAP = 116;

function Sub({ base, sub }) {
  return (
    <>
      {base}
      <tspan dy="4" fontSize="0.78em">
        {sub}
      </tspan>
    </>
  );
}

const I_L = <Sub base="i" sub="L" />;
const V_C = <Sub base="v" sub="C" />;
const V_L = <Sub base="v" sub="L" />;
const I_R1 = <Sub base="i" sub="R1" />;

const GAP_BEFORE = {
  R: { left: 44, R: 20, switch: 22, shunt: 30, none: 0 },
  switch: { left: 34, R: 22, switch: 22, shunt: 30, none: 0 },
  shunt: { left: BRANCH_GAP, R: 36, switch: 36, shunt: BRANCH_GAP, none: 0 },
};

function Element({ el, x, y1, y2 }) {
  const mid = (y1 + y2) / 2;
  const Part = el.kind === "L" ? InductorV : el.kind === "C" ? CapacitorV : ResistorV;
  const valueLeft = el.kind !== "R";
  return (
    <g>
      <Part x={x} y1={y1} y2={y2} />
      <text
        x={valueLeft ? x - 20 : x + 18}
        y={mid + 4}
        textAnchor={valueLeft ? "end" : "start"}
        className="walk-part"
      >
        {el.label}
      </text>
      {el.polarity ? (
        <>
          <text x={x + 22} y={mid - 14} textAnchor="middle" className="walk-tiny">
            +
          </text>
          <text x={x + 22} y={mid + 26} textAnchor="middle" className="walk-tiny">
            −
          </text>
          <text x={x + 34} y={mid + 5} className="walk-part">
            {el.polarity}
          </text>
        </>
      ) : null}
    </g>
  );
}

function Branch({ elements, arrow, x, B }) {
  const regionTop = T + 34;
  const regionBot = B - 22;
  const center = (regionTop + regionBot) / 2;
  const spans =
    elements.length === 1
      ? [[center - SINGLE_H / 2, center + SINGLE_H / 2]]
      : (() => {
          const start = center - (2 * STACK_H + STACK_GAP) / 2;
          return [
            [start, start + STACK_H],
            [start + STACK_H + STACK_GAP, start + 2 * STACK_H + STACK_GAP],
          ];
        })();
  return (
    <g>
      <Wire x1={x} y1={T} x2={x} y2={spans[0][0]} />
      {elements.map((el, i) => (
        <Element key={i} el={el} x={x} y1={spans[i][0]} y2={spans[i][1]} />
      ))}
      {spans.length === 2 ? (
        <Wire x1={x} y1={spans[0][1]} x2={x} y2={spans[1][0]} />
      ) : null}
      <Wire x1={x} y1={spans[spans.length - 1][1]} x2={x} y2={B} />
      {arrow ? (
        <CurrentArrowV
          x={arrow.side === "left" ? x - 14 : x + 14}
          y={T + 5}
          len={26}
          side={arrow.side}
          label={arrow.label}
        />
      ) : null}
    </g>
  );
}

/**
 * A first-order ladder: optional source on the left, then series parts on the
 * top rail and vertical shunt branches down to the bottom (ground) rail.
 * The last item must be a shunt so both rails terminate on a component lead.
 */
function Ladder({ source, items, tall = false, label }) {
  const B = tall ? 232 : 178;
  const out = [];
  let x = LEFT_X;
  let prev = "none";
  let railStart = null;

  if (source) {
    const mid = (T + B) / 2;
    out.push(
      <g key="src">
        <Wire x1={LEFT_X} y1={T} x2={LEFT_X} y2={mid - 24} />
        <BatteryV x={LEFT_X} y1={mid - 24} y2={mid + 24} />
        <Wire x1={LEFT_X} y1={mid + 24} x2={LEFT_X} y2={B} />
        <text x={LEFT_X} y={B + 24} textAnchor="middle" className="walk-part">
          {source}
        </text>
      </g>
    );
    prev = "left";
    railStart = LEFT_X;
  }

  const lastShunt = items.length - 1;
  items.forEach((item, i) => {
    const a = x + GAP_BEFORE[item.type][prev];
    if (railStart !== null && a > x) {
      out.push(<Wire key={`w${i}`} x1={x} y1={T} x2={a} y2={T} />);
    }
    if (item.type === "R") {
      const b = a + 76;
      out.push(
        <g key={`r${i}`}>
          <ResistorH x1={a} x2={b} y={T} />
          <text x={(a + b) / 2} y={T - 16} textAnchor="middle" className="walk-part">
            {item.label}
          </text>
          {item.arrow ? (
            <CurrentArrow x={a + 18} y={T + 24} label={item.arrow} />
          ) : null}
        </g>
      );
      x = b;
    } else if (item.type === "switch") {
      const b = a + 40;
      out.push(
        <g key={`s${i}`}>
          <SwitchH x1={a} x2={b} y={T} open={item.open} hollow />
          <text x={(a + b) / 2} y={T - 30} textAnchor="middle" className="walk-part">
            {item.caption}
          </text>
        </g>
      );
      x = b;
    } else {
      if (railStart === null) railStart = a;
      const junction = railStart < a && i < lastShunt;
      out.push(
        <g key={`b${i}`}>
          <Branch elements={item.elements} arrow={item.arrow} x={a} B={B} />
          {junction ? (
            <>
              <Node x={a} y={T} />
              <Node x={a} y={B} />
            </>
          ) : null}
          {item.node ? (
            <text x={a - 10} y={T - 12} textAnchor="end" className="walk-part">
              {item.node}
            </text>
          ) : null}
        </g>
      );
      x = a;
    }
    if (railStart === null) railStart = a;
    prev = item.type;
  });

  out.push(<Wire key="ground" x1={railStart} y1={B} x2={x} y2={B} />);

  const minX = (source ? LEFT_X : railStart) - 52;
  const maxX = x + 64;
  const width = Math.max(VIEW_W, maxX - minX);
  const viewX = (minX + maxX) / 2 - width / 2;
  const height = B + 38;
  return (
    <svg
      className="walk-circuit"
      viewBox={`${viewX} 4 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
    >
      {out}
    </svg>
  );
}

const R = (label, extra = {}) => ({ type: "R", label, ...extra });
const sw = (open, caption) => ({ type: "switch", open, caption });
const shunt = (elements, extra = {}) => ({ type: "shunt", elements, ...extra });
const r = (label) => ({ kind: "R", label });
const ind = (label, polarity) => ({ kind: "L", label, polarity });
const cap = (label) => ({ kind: "C", label, polarity: V_C });
const iL = { label: I_L };

function Pair({ before, after, caption }) {
  return (
    <PairBoard
      caption={caption}
      left={<StateCard title={before.title}>{before.board}</StateCard>}
      right={after ? <StateCard title={after.title}>{after.board}</StateCard> : null}
    />
  );
}

export function AdvancedPracticeBoard({ view }) {
  switch (view) {
    case "s4-fl-01-board":
      return (
        <Pair
          caption="At t = 0 the switch removes the 24 V source and the 4 Ω. Only L and 8 Ω remain."
          before={{
            title: "Before t = 0 · long-time DC",
            board: (
              <Ladder
                label="24 V source, 4 ohm, and 2 H inductor in one series loop"
                source="24 V"
                items={[R("4 Ω"), shunt([ind("2 H")], { arrow: iL })]}
              />
            ),
          }}
          after={{
            title: "After t = 0 · source-free",
            board: (
              <Ladder
                label="2 H inductor in a loop with 8 ohm only"
                items={[shunt([r("8 Ω")]), shunt([ind("2 H")], { arrow: iL })]}
              />
            ),
          }}
        />
      );
    case "s4-fl-02-board":
      return (
        <Pair
          caption="At t = 0 the 30 V source and 5 Ω are disconnected. L, 6 Ω, and 12 Ω share the same two nodes."
          before={{
            title: "Before t = 0 · long-time DC",
            board: (
              <Ladder
                label="30 V, 5 ohm to node A, then 10 ohm and 3 H inductor in parallel to ground"
                source="30 V"
                items={[
                  R("5 Ω"),
                  shunt([r("10 Ω")], { node: "A" }),
                  shunt([ind("3 H")], { arrow: iL }),
                ]}
              />
            ),
          }}
          after={{
            title: "After t = 0 · source-free",
            board: (
              <Ladder
                label="3 H inductor in parallel with 6 ohm and 12 ohm"
                items={[
                  shunt([r("6 Ω")]),
                  shunt([r("12 Ω")]),
                  shunt([ind("3 H")], { arrow: iL }),
                ]}
              />
            ),
          }}
        />
      );
    case "s4-fl-03-board":
      return (
        <Pair
          caption="At t = 0 the whole charging network is disconnected. L then sees 4 Ω in series with 6 Ω ∥ 12 Ω."
          before={{
            title: "Before t = 0 · long-time DC",
            board: (
              <Ladder
                tall
                label="18 V, 3 ohm to node A. From A to ground: 6 ohm, and 3 ohm in series with a 2 H inductor"
                source="18 V"
                items={[
                  R("3 Ω"),
                  shunt([r("6 Ω")], { node: "A" }),
                  shunt([r("3 Ω"), ind("2 H")], { arrow: iL }),
                ]}
              />
            ),
          }}
          after={{
            title: "After t = 0 · source-free",
            board: (
              <Ladder
                tall
                label="2 H inductor, then 4 ohm, then 6 ohm parallel 12 ohm back to the inductor"
                items={[
                  shunt([r("6 Ω")]),
                  shunt([r("12 Ω")]),
                  R("4 Ω"),
                  shunt([ind("2 H")], { arrow: iL }),
                ]}
              />
            ),
          }}
        />
      );
    case "s4-rc-01-board": {
      const network = (open) => (
        <Ladder
          label={`Switch ${open ? "open" : "closed"}: 12 V, 2 kilohm to node A, 4 kilohm and 3 microfarad from A to ground`}
          source="12 V"
          items={[
            sw(open, open ? "open, t < 0" : "closed at t = 0"),
            R("2 kΩ"),
            shunt([r("4 kΩ")], { node: "A" }),
            shunt([cap("3 μF")]),
          ]}
        />
      );
      return (
        <Pair
          caption="C starts uncharged. At t = 0 the switch closes and connects the 12 V source."
          before={{ title: "Before t = 0 · vC(0−) = 0 V", board: network(true) }}
          after={{ title: "After t = 0 · switch closed", board: network(false) }}
        />
      );
    }
    case "s4-rc-02-board":
      return (
        <Pair
          caption="At t = 0 the switch moves C from the 18 V network (position A) to the 6 V network (position B)."
          before={{
            title: "Before t = 0 · switch at A, long-time DC",
            board: (
              <Ladder
                label="18 V, 3 kilohm to the capacitor node, 6 kilohm and 3 microfarad to ground"
                source="18 V"
                items={[R("3 kΩ"), shunt([r("6 kΩ")]), shunt([cap("3 μF")])]}
              />
            ),
          }}
          after={{
            title: "After t = 0 · switch at B",
            board: (
              <Ladder
                label="6 V, 2 kilohm to the capacitor node, 4 kilohm and 3 microfarad to ground"
                source="6 V"
                items={[R("2 kΩ"), shunt([r("4 kΩ")]), shunt([cap("3 μF")])]}
              />
            ),
          }}
        />
      );
    case "s4-rc-03-board": {
      const network = (open) => (
        <Ladder
          label={`Switch ${open ? "open" : "closed"}: 20 V, 4 kilohm to node A, 6 kilohm from A to ground, then the 2 microfarad capacitor`}
          source="20 V"
          items={[
            R("4 kΩ", open ? {} : { arrow: I_R1 }),
            shunt([r("6 kΩ")], { node: "A" }),
            sw(open, open ? "open, t < 0" : "closed at t = 0"),
            shunt([cap("2 μF")]),
          ]}
        />
      );
      return (
        <Pair
          caption="C is already charged to 5 V, top plate positive. At t = 0 the switch connects C to node A."
          before={{ title: "Before t = 0 · vC(0−) = 5 V", board: network(true) }}
          after={{ title: "After t = 0 · switch closed", board: network(false) }}
        />
      );
    }
    case "s4-rl-01-board": {
      const network = (open) => (
        <Ladder
          label={`Switch ${open ? "open" : "closed"}: 24 V, 4 ohm to node A, 12 ohm and 3 H inductor from A to ground`}
          source="24 V"
          items={[
            sw(open, open ? "open, t < 0" : "closed at t = 0"),
            R("4 Ω"),
            shunt([r("12 Ω")], { node: "A" }),
            shunt([ind("3 H")], { arrow: iL }),
          ]}
        />
      );
      return (
        <Pair
          caption="L starts with zero current. At t = 0 the switch closes and connects the 24 V source."
          before={{ title: "Before t = 0 · iL(0−) = 0 A", board: network(true) }}
          after={{ title: "After t = 0 · switch closed", board: network(false) }}
        />
      );
    }
    case "s4-rl-02-board":
      return (
        <Pair
          caption="At t = 0 the switch moves the top of L from the 10 V branch (position A) to node B of the 24 V network. The bottom of L stays grounded."
          before={{
            title: "Before t = 0 · switch at A, long-time DC",
            board: (
              <Ladder
                label="10 V, 5 ohm, and 3 H inductor in one series loop"
                source="10 V"
                items={[R("5 Ω"), shunt([ind("3 H", V_L)], { arrow: { label: I_L, side: "left" } })]}
              />
            ),
          }}
          after={{
            title: "After t = 0 · switch at B",
            board: (
              <Ladder
                label="24 V, 4 ohm to node B, 12 ohm and 3 H inductor from B to ground"
                source="24 V"
                items={[
                  R("4 Ω"),
                  shunt([r("12 Ω")], { node: "B" }),
                  shunt([ind("3 H", V_L)], { arrow: { label: I_L, side: "left" } }),
                ]}
              />
            ),
          }}
        />
      );
    case "s4-fl-04-board":
      return (
        <Pair
          caption="For t ≥ 0. L starts at 5 A. The 6 Ω and 3 Ω branches share both inductor terminals. No source remains."
          before={{
            title: "t ≥ 0 · iL(0+) = 5 A",
            board: (
              <Ladder
                label="4 H inductor in parallel with 6 ohm and 3 ohm"
                items={[
                  shunt([r("6 Ω")]),
                  shunt([r("3 Ω")]),
                  shunt([ind("4 H")], { arrow: iL }),
                ]}
              />
            ),
          }}
        />
      );
    case "s4-fl-05-board":
      return (
        <Pair
          caption="At t = 0 the 12 V source and 4 Ω are disconnected. L then sees (6 Ω + 3 Ω) in parallel with 18 Ω."
          before={{
            title: "Before t = 0 · switch at A, long-time DC",
            board: (
              <Ladder
                label="12 V source, 4 ohm, and 2 H inductor in one series loop"
                source="12 V"
                items={[R("4 Ω"), shunt([ind("2 H")], { arrow: iL })]}
              />
            ),
          }}
          after={{
            title: "After t = 0 · source-free",
            board: (
              <Ladder
                tall
                label="2 H inductor across 6 ohm in series with 3 ohm, in parallel with 18 ohm"
                items={[
                  shunt([r("6 Ω"), r("3 Ω")]),
                  shunt([r("18 Ω")]),
                  shunt([ind("2 H")], { arrow: iL }),
                ]}
              />
            ),
          }}
        />
      );
    case "s4-fl-06-board":
      return (
        <Pair
          caption="For t ≥ 0. Simple source-free RL loop. L starts at 8 A. No source remains."
          before={{
            title: "t ≥ 0 · iL(0+) = 8 A",
            board: (
              <Ladder
                label="2 H inductor in a loop with 4 ohm only"
                items={[shunt([r("4 Ω")]), shunt([ind("2 H")], { arrow: iL })]}
              />
            ),
          }}
        />
      );
    case "s4-rc-04-board": {
      const network = (open) => (
        <Ladder
          label={`Switch ${open ? "open" : "closed"}: 4 V, 2 kilohm, and 5 microfarad in one series loop`}
          source="4 V"
          items={[
            sw(open, open ? "open, t < 0" : "closed at t = 0"),
            R("2 kΩ"),
            shunt([cap("5 μF")]),
          ]}
        />
      );
      return (
        <Pair
          caption="C is already charged to 10 V, top plate positive. At t = 0 the switch closes onto the 4 V source through 2 kΩ."
          before={{ title: "Before t = 0 · vC(0−) = 10 V", board: network(true) }}
          after={{ title: "After t = 0 · switch closed", board: network(false) }}
        />
      );
    }
    case "s4-rc-05-board": {
      const network = (open) => (
        <Ladder
          label={`Switch ${open ? "open" : "closed"}: 15 V, 3 kilohm to node A, 6 kilohm and 2 microfarad from A to ground`}
          source="15 V"
          items={[
            sw(open, open ? "open, t < 0" : "closed at t = 0"),
            R("3 kΩ"),
            shunt([r("6 kΩ")], { node: "A" }),
            shunt([cap("2 μF")]),
          ]}
        />
      );
      return (
        <Pair
          caption="C starts uncharged. At t = 0 the switch closes and connects the 15 V source."
          before={{ title: "Before t = 0 · vC(0−) = 0 V", board: network(true) }}
          after={{ title: "After t = 0 · switch closed", board: network(false) }}
        />
      );
    }
    case "s4-rc-06-board":
      return (
        <Pair
          caption="At t = 0 the switch moves C from the 12 V / 1 kΩ branch (position A) to the 3 V / 2 kΩ branch (position B)."
          before={{
            title: "Before t = 0 · switch at A, long-time DC",
            board: (
              <Ladder
                label="12 V, 1 kilohm, and 4 microfarad in one series loop"
                source="12 V"
                items={[R("1 kΩ"), shunt([cap("4 μF")])]}
              />
            ),
          }}
          after={{
            title: "After t = 0 · switch at B",
            board: (
              <Ladder
                label="3 V, 2 kilohm, and 4 microfarad in one series loop"
                source="3 V"
                items={[R("2 kΩ"), shunt([cap("4 μF")])]}
              />
            ),
          }}
        />
      );
    case "s4-rl-03-board":
      return (
        <Pair
          caption="For t ≥ 0. Simple series RL. L already carries 1 A in the source-driven direction."
          before={{
            title: "t ≥ 0 · iL(0+) = 1 A",
            board: (
              <Ladder
                label="18 V, 6 ohm, and 3 H inductor in one series loop"
                source="18 V"
                items={[R("6 Ω"), shunt([ind("3 H")], { arrow: iL })]}
              />
            ),
          }}
        />
      );
    case "s4-rl-04-board": {
      const network = (open) => (
        <Ladder
          label={`Switch ${open ? "open" : "closed"}: 30 V, 5 ohm to node A, 10 ohm and 2 H inductor from A to ground`}
          source="30 V"
          items={[
            sw(open, open ? "open, t < 0" : "closed at t = 0"),
            R("5 Ω"),
            shunt([r("10 Ω")], { node: "A" }),
            shunt([ind("2 H")], { arrow: iL }),
          ]}
        />
      );
      return (
        <Pair
          caption="L starts with zero current. At t = 0 the switch closes and connects the 30 V source."
          before={{ title: "Before t = 0 · iL(0−) = 0 A", board: network(true) }}
          after={{ title: "After t = 0 · switch closed", board: network(false) }}
        />
      );
    }
    case "s4-rl-05-board":
      return (
        <Pair
          caption="At t = 0 the switch disconnects the 12 V / 4 Ω branch and connects the same L to 24 V through 8 Ω."
          before={{
            title: "Before t = 0 · switch at A, long-time DC",
            board: (
              <Ladder
                label="12 V, 4 ohm, and 2 H inductor in one series loop"
                source="12 V"
                items={[R("4 Ω"), shunt([ind("2 H")], { arrow: iL })]}
              />
            ),
          }}
          after={{
            title: "After t = 0 · switch at B",
            board: (
              <Ladder
                label="24 V, 8 ohm, and 2 H inductor in one series loop"
                source="24 V"
                items={[R("8 Ω"), shunt([ind("2 H")], { arrow: iL })]}
              />
            ),
          }}
        />
      );
    default:
      return null;
  }
}

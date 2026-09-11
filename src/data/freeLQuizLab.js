export const FREEL_QUIZ = [
  {
    id: "p1",
    view: "qrl-simple",
    highlight: "all",
    boardHint: "Only L and R remain. τ = L/R.",
    prompt: "$R=2\\,\\mathrm{k}\\Omega$, $L=8\\,\\mathrm{H}$. The time constant $\\tau$ is",
    options: {
      a: "$4\\,\\mathrm{ms}$.",
      b: "$16\\,\\mathrm{ms}$.",
      c: "$4\\,\\mathrm{s}$.",
    },
    answer: "a",
    why: "$\\tau=L/R=8/2000=4\\,\\mathrm{ms}$. $16\\,\\mathrm{ms}$ used $RC$ with wrong units. $4\\,\\mathrm{s}$ forgot kiloohms.",
  },
  {
    id: "p2",
    view: "qrl-switch",
    highlight: "all",
    boardHint: "L was carrying 6 A. Current cannot jump.",
    prompt: "Just after the switch opens, $i_L(0^+)$ is",
    options: {
      a: "$0$, because the battery is gone.",
      b: "$6\\,\\mathrm{A}$, same as $i(0^-)$.",
      c: "$6\\,\\mathrm{V}$ across $L$.",
    },
    answer: "b",
    why: "Inductor current is continuous: $i(0^+)=i(0^-)=6\\,\\mathrm{A}$. The battery being out only sets $i(\\infty)=0$.",
  },
  {
    id: "p3",
    view: "qrl-par",
    highlight: "all",
    boardHint: "Collapse the two resistors into one R seen by L.",
    prompt: "Two $4\\,\\mathrm{k}\\Omega$ resistors in parallel, $L=6\\,\\mathrm{H}$. $\\tau$ is",
    options: {
      a: "$3\\,\\mathrm{ms}$.",
      b: "$1.5\\,\\mathrm{ms}$.",
      c: "$6\\,\\mathrm{ms}$.",
    },
    answer: "a",
    why: "$R_{Th}=4\\parallel 4=2\\,\\mathrm{k}\\Omega$. $\\tau=L/R=6/2000=3\\,\\mathrm{ms}$. $1.5\\,\\mathrm{ms}$ used one $4\\,\\mathrm{k}\\Omega$. $6\\,\\mathrm{ms}$ added the resistors.",
  },
  {
    id: "p4",
    view: "qrl-series",
    highlight: "all",
    boardHint: "The dump path is both resistors in series.",
    prompt: "$L=8\\,\\mathrm{H}$ dumps through $2\\,\\mathrm{k}\\Omega$ then $6\\,\\mathrm{k}\\Omega$. $\\tau$ is",
    options: {
      a: "$4\\,\\mathrm{ms}$.",
      b: "$1\\,\\mathrm{ms}$.",
      c: "$1.33\\,\\mathrm{ms}$.",
    },
    answer: "b",
    why: "$R=2+6=8\\,\\mathrm{k}\\Omega$. $\\tau=8/8000=1\\,\\mathrm{ms}$. $4\\,\\mathrm{ms}$ used only $2\\,\\mathrm{k}\\Omega$. $1.33\\,\\mathrm{ms}$ used only $6\\,\\mathrm{k}\\Omega$.",
  },
  {
    id: "p5",
    view: "qrl-decay",
    highlight: "curve",
    boardHint: "At t = τ the curve is at i(0)/e, not half.",
    prompt: "$i(0)=15\\,\\mathrm{A}$. At $t=\\tau$ the current is about",
    options: {
      a: "$7.5\\,\\mathrm{A}$.",
      b: "$5.5\\,\\mathrm{A}$.",
      c: "$0$.",
    },
    answer: "b",
    why: "$i(\\tau)=15/e\\approx 5.5\\,\\mathrm{A}$. $7.5\\,\\mathrm{A}$ is half. $0$ is $t\\to\\infty$, not one time constant.",
  },
];

export const FREEL_QUIZ_DRAG = [
  {
    id: "tau-4k-8h",
    kind: "tau",
    rLabel: "4 kΩ",
    lLabel: "8 H",
    correct: 2,
    choices: [1, 2, 4, 32],
    unit: "ms",
    why: "$\\tau=L/R=8/4000=2\\,\\mathrm{ms}$.",
  },
  {
    id: "tau-series-1k-3k",
    kind: "seriesr",
    r1Label: "1 kΩ",
    r2Label: "3 kΩ",
    lLabel: "8 H",
    correct: 2,
    choices: [1, 2, 2.7, 8],
    unit: "ms",
    why: "$R=1+3=4\\,\\mathrm{k}\\Omega$. $\\tau=8/4000=2\\,\\mathrm{ms}$.",
  },
  {
    id: "tau-par-6k-3k",
    kind: "parallelr",
    r1Label: "6 kΩ",
    r2Label: "3 kΩ",
    lLabel: "10 H",
    correct: 5,
    choices: [1.1, 1.7, 5, 30],
    unit: "ms",
    why: "$R_{Th}=6\\parallel 3=2\\,\\mathrm{k}\\Omega$. $\\tau=10/2000=5\\,\\mathrm{ms}$. $30\\,\\mathrm{ms}$ added the resistors.",
  },
  {
    id: "i-at-tau-20",
    kind: "itau",
    i0: 20,
    correct: 7.4,
    choices: [7.4, 10, 12.6, 20],
    unit: "A",
    why: "At $t=\\tau$, $i=i(0)/e\\approx 7.4\\,\\mathrm{A}$. $12.6\\,\\mathrm{A}$ is $20(1-1/e)$. $10\\,\\mathrm{A}$ is half.",
  },
  {
    id: "i-inf-switch",
    kind: "iinf",
    i0: 18,
    vsLabel: "18 V",
    rLabel: "5 kΩ",
    lLabel: "2 H",
    correct: 0,
    choices: [0, 3.6, 18],
    unit: "A",
    why: "No source remains after the switch opens, so $i(\\infty)=0$. $18\\,\\mathrm{A}$ is $i(0)$. $3.6\\,\\mathrm{mA}$ would be a steady source current.",
  },
];

export function freeLQuizDragLabel(question, value) {
  return `${value} ${question.unit}`;
}

export function freeLQuizDragPrompt(question) {
  if (question.kind === "tau") {
    return `$R=${question.rLabel}$, $L=${question.lLabel}$. Drag $\\tau=L/R$.`;
  }
  if (question.kind === "seriesr") {
    return `$L=${question.lLabel}$ dumps through ${question.r1Label} then ${question.r2Label}. Drag $\\tau$.`;
  }
  if (question.kind === "parallelr") {
    return `$L=${question.lLabel}$ sees ${question.r1Label} $\\parallel$ ${question.r2Label}. Drag $\\tau$.`;
  }
  if (question.kind === "itau") {
    return `$i(0)=${question.i0}\\,\\mathrm{A}$. Drag $i(\\tau)$.`;
  }
  return `Switch opened. $i(0)=${question.i0}\\,\\mathrm{A}$. Drag $i(\\infty)$.`;
}

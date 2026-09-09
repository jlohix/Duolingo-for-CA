export const FREEC_QUIZ = [
  {
    id: "p1",
    view: "qrc-simple",
    highlight: "all",
    boardHint: "Only C and R remain. τ = RC.",
    prompt: "$R=2\\,\\mathrm{k}\\Omega$, $C=4\\,\\mu\\mathrm{F}$. The time constant $\\tau$ is",
    options: {
      a: "$8\\,\\mathrm{ms}$.",
      b: "$2\\,\\mathrm{ms}$.",
      c: "$8\\,\\mathrm{s}$.",
    },
    answer: "a",
    why: "$\\tau=RC=2\\times 10^3\\times 4\\times 10^{-6}=8\\,\\mathrm{ms}$. $2\\,\\mathrm{ms}$ swapped $R$ and $C$. $8\\,\\mathrm{s}$ skipped the microfarads.",
  },
  {
    id: "p2",
    view: "qrc-switch",
    highlight: "all",
    boardHint: "C was charged to 24 V. Voltage cannot jump.",
    prompt: "Just after the switch opens, $v_C(0^+)$ is",
    options: {
      a: "$0$, because the battery is gone.",
      b: "$24\\,\\mathrm{V}$, same as $v(0^-)$.",
      c: "$3\\,\\mathrm{mA}$ through $C$.",
    },
    answer: "b",
    why: "Capacitor voltage is continuous: $v(0^+)=v(0^-)=24\\,\\mathrm{V}$. The battery being out only sets $v(\\infty)=0$.",
  },
  {
    id: "p3",
    view: "qrc-par",
    highlight: "all",
    boardHint: "Collapse the two resistors into one R seen by C.",
    prompt: "Two $4\\,\\mathrm{k}\\Omega$ resistors in parallel, $C=3\\,\\mu\\mathrm{F}$. $\\tau$ is",
    options: {
      a: "$24\\,\\mathrm{ms}$.",
      b: "$12\\,\\mathrm{ms}$.",
      c: "$6\\,\\mathrm{ms}$.",
    },
    answer: "c",
    why: "$R_{Th}=4\\parallel 4=2\\,\\mathrm{k}\\Omega$. $\\tau=RC=2\\times 10^3\\times 3\\times 10^{-6}=6\\,\\mathrm{ms}$. $12\\,\\mathrm{ms}$ used one $4\\,\\mathrm{k}\\Omega$. $24\\,\\mathrm{ms}$ added the resistors.",
  },
  {
    id: "p4",
    view: "qrc-series",
    highlight: "all",
    boardHint: "The dump path is both resistors in series.",
    prompt: "$C=5\\,\\mu\\mathrm{F}$ dumps through $2\\,\\mathrm{k}\\Omega$ then $6\\,\\mathrm{k}\\Omega$. $\\tau$ is",
    options: {
      a: "$10\\,\\mathrm{ms}$.",
      b: "$40\\,\\mathrm{ms}$.",
      c: "$30\\,\\mathrm{ms}$.",
    },
    answer: "b",
    why: "$R=2+6=8\\,\\mathrm{k}\\Omega$. $\\tau=8\\times 10^3\\times 5\\times 10^{-6}=40\\,\\mathrm{ms}$. $10\\,\\mathrm{ms}$ used only $2\\,\\mathrm{k}\\Omega$. $30\\,\\mathrm{ms}$ used only $6\\,\\mathrm{k}\\Omega$.",
  },
  {
    id: "p5",
    view: "qrc-decay",
    highlight: "curve",
    boardHint: "At t = τ the curve is at v(0)/e, not half.",
    prompt: "$v(0)=15\\,\\mathrm{V}$. At $t=\\tau$ the voltage is about",
    options: {
      a: "$7.5\\,\\mathrm{V}$.",
      b: "$5.5\\,\\mathrm{V}$.",
      c: "$0$.",
    },
    answer: "b",
    why: "$v(\\tau)=15/e\\approx 5.5\\,\\mathrm{V}$. $7.5\\,\\mathrm{V}$ is half. $0$ is $t\\to\\infty$, not one time constant.",
  },
];

export const FREEC_QUIZ_DRAG = [
  {
    id: "tau-4k-2u",
    kind: "tau",
    rLabel: "4 kΩ",
    cLabel: "2 μF",
    correct: 8,
    choices: [2, 6, 8, 16],
    unit: "ms",
    why: "$\\tau=RC=4\\times 10^3\\times 2\\times 10^{-6}=8\\,\\mathrm{ms}$.",
  },
  {
    id: "tau-series-1k-3k",
    kind: "seriesr",
    r1Label: "1 kΩ",
    r2Label: "3 kΩ",
    cLabel: "4 μF",
    correct: 16,
    choices: [4, 8, 12, 16],
    unit: "ms",
    why: "$R=1+3=4\\,\\mathrm{k}\\Omega$. $\\tau=4\\times 10^3\\times 4\\times 10^{-6}=16\\,\\mathrm{ms}$.",
  },
  {
    id: "tau-par-6k-3k",
    kind: "parallelr",
    r1Label: "6 kΩ",
    r2Label: "3 kΩ",
    cLabel: "5 μF",
    correct: 10,
    choices: [5, 10, 15, 45],
    unit: "ms",
    why: "$R_{Th}=6\\parallel 3=2\\,\\mathrm{k}\\Omega$. $\\tau=2\\times 10^3\\times 5\\times 10^{-6}=10\\,\\mathrm{ms}$. $45\\,\\mathrm{ms}$ added the resistors.",
  },
  {
    id: "v-at-tau-20",
    kind: "vtau",
    v0: 20,
    correct: 7.4,
    choices: [7.4, 10, 12.6, 20],
    unit: "V",
    why: "At $t=\\tau$, $v=v(0)/e\\approx 7.4\\,\\mathrm{V}$. $12.6\\,\\mathrm{V}$ is $20(1-1/e)$. $10\\,\\mathrm{V}$ is half.",
  },
  {
    id: "v-inf-switch",
    kind: "vinf",
    v0: 18,
    vsLabel: "18 V",
    rLabel: "5 kΩ",
    cLabel: "2 μF",
    correct: 0,
    choices: [0, 6.6, 18],
    unit: "V",
    why: "No source remains after the switch opens, so $v(\\infty)=0$. $18\\,\\mathrm{V}$ is $v(0)$. $6.6\\,\\mathrm{V}$ is $v(\\tau)$.",
  },
];

export function freeCQuizDragLabel(question, value) {
  return `${value} ${question.unit}`;
}

export function freeCQuizDragPrompt(question) {
  if (question.kind === "tau") {
    return `$R=${question.rLabel}$, $C=${question.cLabel}$. Drag $\\tau=RC$.`;
  }
  if (question.kind === "seriesr") {
    return `$C=${question.cLabel}$ dumps through ${question.r1Label} then ${question.r2Label}. Drag $\\tau$.`;
  }
  if (question.kind === "parallelr") {
    return `$C=${question.cLabel}$ sees ${question.r1Label} $\\parallel$ ${question.r2Label}. Drag $\\tau$.`;
  }
  if (question.kind === "vtau") {
    return `$v(0)=${question.v0}\\,\\mathrm{V}$. Drag $v(\\tau)$.`;
  }
  return `Switch opened. $v(0)=${question.v0}\\,\\mathrm{V}$. Drag $v(\\infty)$.`;
}

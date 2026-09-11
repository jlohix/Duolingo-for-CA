export const STEPC_QUIZ = [
  {
    id: "p1",
    view: "qrcs-simple",
    highlight: "all",
    boardHint: "With the source on, τ is still RC.",
    prompt: "$R=2\\,\\mathrm{k}\\Omega$, $C=4\\,\\mu\\mathrm{F}$. With $V_s$ connected, $\\tau$ is",
    options: {
      a: "$8\\,\\mathrm{ms}$.",
      b: "$2\\,\\mathrm{ms}$.",
      c: "$8\\,\\mathrm{s}$.",
    },
    answer: "a",
    why: "$\\tau=RC=2\\times 10^3\\times 4\\times 10^{-6}=8\\,\\mathrm{ms}$. The source sets the forced value, not $\\tau$.",
  },
  {
    id: "p2",
    view: "qrcs-switch",
    highlight: "all",
    boardHint: "C starts from rest. Voltage cannot jump.",
    prompt: "Switch closes at $t=0$ onto a rested capacitor. $v_C(0^+)$ is",
    options: {
      a: "$V_s$, because the battery is now on.",
      b: "$0$, same as $v(0^-)$.",
      c: "Undefined — C shorts the battery.",
    },
    answer: "b",
    why: "From rest, $v(0^-)=0$, so $v(0^+)=0$. $V_s$ is the long-term target $v(\\infty)$, not the jump.",
  },
  {
    id: "p3",
    view: "qrcs-final",
    highlight: "all",
    boardHint: "At DC, C is open. Find the steady voltage.",
    prompt: "$V_s=12\\,\\mathrm{V}$ charges $C$ through $R$. From rest, $v(\\infty)$ is",
    options: {
      a: "$0$.",
      b: "$12\\,\\mathrm{V}$.",
      c: "$12/e\\,\\mathrm{V}$.",
    },
    answer: "b",
    why: "In DC steady state the capacitor is open, so $v(\\infty)=V_s=12\\,\\mathrm{V}$.",
  },
  {
    id: "p4",
    view: "qrcs-rise",
    highlight: "curve",
    boardHint: "From rest, at t = τ you have climbed 63% of the way to Vs.",
    prompt: "From rest toward $V_s=12\\,\\mathrm{V}$. At $t=\\tau$, $v$ is about",
    options: {
      a: "$4.4\\,\\mathrm{V}$.",
      b: "$6\\,\\mathrm{V}$.",
      c: "$7.6\\,\\mathrm{V}$.",
    },
    answer: "c",
    why: "$v(\\tau)=V_s(1-1/e)\\approx 0.632\\times 12\\approx 7.6\\,\\mathrm{V}$. $4.4\\,\\mathrm{V}$ is $V_s/e$. $6\\,\\mathrm{V}$ is half.",
  },
  {
    id: "p5",
    view: "qrcs-complete",
    highlight: "all",
    boardHint: "Natural + forced: Vs + (V0 − Vs)e^{−t/τ}.",
    prompt: "$V_0=5\\,\\mathrm{V}$, $V_s=15\\,\\mathrm{V}$. The complete response is",
    options: {
      a: "$v=15+(5-15)e^{-t/\\tau}$.",
      b: "$v=5+(15-5)e^{-t/\\tau}$.",
      c: "$v=15e^{-t/\\tau}$.",
    },
    answer: "a",
    why: "$v=V_s+(V_0-V_s)e^{-t/\\tau}=15+(5-15)e^{-t/\\tau}$. Option b swaps the roles of $V_0$ and $V_s$.",
  },
];

export const STEPC_QUIZ_DRAG = [
  {
    id: "tau-3k-2u",
    kind: "tau",
    rLabel: "3 kΩ",
    cLabel: "2 μF",
    vsLabel: "10 V",
    correct: 6,
    choices: [2, 3, 6, 15],
    unit: "ms",
    why: "$\\tau=RC=3\\times 10^3\\times 2\\times 10^{-6}=6\\,\\mathrm{ms}$.",
  },
  {
    id: "v-inf-12",
    kind: "vinf",
    vsLabel: "12 V",
    rLabel: "4 kΩ",
    cLabel: "1 μF",
    correct: 12,
    choices: [0, 4.4, 7.6, 12],
    unit: "V",
    why: "From rest with a DC source, $v(\\infty)=V_s=12\\,\\mathrm{V}$.",
  },
  {
    id: "v-tau-rest-10",
    kind: "vtau",
    vs: 10,
    correct: 6.3,
    choices: [3.7, 5, 6.3, 10],
    unit: "V",
    why: "From rest, $v(\\tau)=V_s(1-1/e)\\approx 6.3\\,\\mathrm{V}$.",
  },
  {
    id: "v0-continuity",
    kind: "v0",
    v0: 4,
    vsLabel: "20 V",
    rLabel: "5 kΩ",
    cLabel: "2 μF",
    correct: 4,
    choices: [0, 4, 12.6, 20],
    unit: "V",
    why: "$v(0^+)=v(0^-)=4\\,\\mathrm{V}$. The source does not force an instant jump.",
  },
  {
    id: "complete-8-20",
    kind: "complete",
    v0: 8,
    vs: 20,
    correct: "20+(8-20)e",
    choices: ["20+(8-20)e", "8+(20-8)e", "20e", "8e"],
    unit: "",
    why: "$v=V_s+(V_0-V_s)e^{-t/\\tau}=20+(8-20)e^{-t/\\tau}$.",
  },
];

export function stepCQuizDragLabel(question, value) {
  if (question.kind === "complete") {
    if (value === "20+(8-20)e") return "20+(8−20)e^{−t/τ}";
    if (value === "8+(20-8)e") return "8+(20−8)e^{−t/τ}";
    if (value === "20e") return "20 e^{−t/τ}";
    if (value === "8e") return "8 e^{−t/τ}";
  }
  return question.unit ? `${value} ${question.unit}` : String(value);
}

export function stepCQuizDragPrompt(question) {
  if (question.kind === "tau") {
    return `$R=${question.rLabel}$, $C=${question.cLabel}$, $V_s=${question.vsLabel}$. Drag $\\tau$.`;
  }
  if (question.kind === "vinf") {
    return `From rest, $V_s=${question.vsLabel}$. Drag $v(\\infty)$.`;
  }
  if (question.kind === "vtau") {
    return `From rest toward $V_s=${question.vs}\\,\\mathrm{V}$. Drag $v(\\tau)$.`;
  }
  if (question.kind === "v0") {
    return `$v(0^-)=${question.v0}\\,\\mathrm{V}$, then $V_s$ connects. Drag $v(0^+)$.`;
  }
  return `$V_0=${question.v0}\\,\\mathrm{V}$, $V_s=${question.vs}\\,\\mathrm{V}$. Drag the complete $v(t)$ form.`;
}

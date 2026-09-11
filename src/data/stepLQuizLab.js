export const STEPL_QUIZ = [
  {
    id: "p1",
    view: "qrls-simple",
    highlight: "all",
    boardHint: "With the source on, τ is still L/R.",
    prompt: "$R=2\\,\\mathrm{k}\\Omega$, $L=8\\,\\mathrm{H}$. With $V_s$ connected, $\\tau$ is",
    options: {
      a: "$4\\,\\mathrm{ms}$.",
      b: "$16\\,\\mathrm{ms}$.",
      c: "$4\\,\\mathrm{s}$.",
    },
    answer: "a",
    why: "$\\tau=L/R=8/2000=4\\,\\mathrm{ms}$. The source sets $i(\\infty)=V_s/R$, not $\\tau$.",
  },
  {
    id: "p2",
    view: "qrls-switch",
    highlight: "all",
    boardHint: "L starts from rest. Current cannot jump.",
    prompt: "Switch closes at $t=0$ onto a rested inductor. $i_L(0^+)$ is",
    options: {
      a: "$V_s/R$, because the battery is now on.",
      b: "$0$, same as $i(0^-)$.",
      c: "Infinite — L is a short.",
    },
    answer: "b",
    why: "From rest, $i(0^-)=0$, so $i(0^+)=0$. $V_s/R$ is the long-term target $i(\\infty)$.",
  },
  {
    id: "p3",
    view: "qrls-final",
    highlight: "all",
    boardHint: "At DC, L is a short. Find the steady current.",
    prompt: "$V_s=12\\,\\mathrm{V}$, $R=4\\,\\mathrm{k}\\Omega$. From rest, $i(\\infty)$ is",
    options: {
      a: "$0$.",
      b: "$3\\,\\mathrm{mA}$.",
      c: "$12\\,\\mathrm{A}$.",
    },
    answer: "b",
    why: "In DC steady state the inductor is a short, so $i(\\infty)=V_s/R=12/4000=3\\,\\mathrm{mA}$.",
  },
  {
    id: "p4",
    view: "qrls-rise",
    highlight: "curve",
    boardHint: "From rest, at t = τ you have climbed 63% of the way to Vs/R.",
    prompt: "From rest toward $I_\\infty=10\\,\\mathrm{mA}$. At $t=\\tau$, $i$ is about",
    options: {
      a: "$3.7\\,\\mathrm{mA}$.",
      b: "$5\\,\\mathrm{mA}$.",
      c: "$6.3\\,\\mathrm{mA}$.",
    },
    answer: "c",
    why: "$i(\\tau)=(V_s/R)(1-1/e)\\approx 0.632\\times 10\\approx 6.3\\,\\mathrm{mA}$. $3.7\\,\\mathrm{mA}$ is $I_\\infty/e$.",
  },
  {
    id: "p5",
    view: "qrls-complete",
    highlight: "all",
    boardHint: "Natural + forced: Vs/R + (I0 − Vs/R)e^{−t/τ}.",
    prompt: "$I_0=2\\,\\mathrm{mA}$, $V_s/R=8\\,\\mathrm{mA}$. The complete response is",
    options: {
      a: "$i=8+(2-8)e^{-t/\\tau}\\,\\mathrm{mA}$.",
      b: "$i=2+(8-2)e^{-t/\\tau}\\,\\mathrm{mA}$.",
      c: "$i=8e^{-t/\\tau}\\,\\mathrm{mA}$.",
    },
    answer: "a",
    why: "$i=V_s/R+(I_0-V_s/R)e^{-t/\\tau}=8+(2-8)e^{-t/\\tau}$ mA. Option b swaps $I_0$ and $V_s/R$.",
  },
];

export const STEPL_QUIZ_DRAG = [
  {
    id: "tau-4k-8h",
    kind: "tau",
    rLabel: "4 kΩ",
    lLabel: "8 H",
    vsLabel: "10 V",
    correct: 2,
    choices: [1, 2, 4, 32],
    unit: "ms",
    why: "$\\tau=L/R=8/4000=2\\,\\mathrm{ms}$.",
  },
  {
    id: "i-inf-12-4k",
    kind: "iinf",
    vsLabel: "12 V",
    rLabel: "4 kΩ",
    lLabel: "2 H",
    correct: 3,
    choices: [0, 3, 4.8, 12],
    unit: "mA",
    why: "From rest with a DC source, $i(\\infty)=V_s/R=12/4000=3\\,\\mathrm{mA}$.",
  },
  {
    id: "i-tau-rest-10",
    kind: "itau",
    iInf: 10,
    correct: 6.3,
    choices: [3.7, 5, 6.3, 10],
    unit: "mA",
    why: "From rest, $i(\\tau)=(V_s/R)(1-1/e)\\approx 6.3\\,\\mathrm{mA}$.",
  },
  {
    id: "i0-continuity",
    kind: "i0",
    i0: 1,
    vsLabel: "20 V",
    rLabel: "5 kΩ",
    lLabel: "2 H",
    correct: 1,
    choices: [0, 1, 2.5, 4],
    unit: "mA",
    why: "$i(0^+)=i(0^-)=1\\,\\mathrm{mA}$. The source does not force an instant jump.",
  },
  {
    id: "complete-2-8",
    kind: "complete",
    i0: 2,
    iInf: 8,
    correct: "8+(2-8)e",
    choices: ["8+(2-8)e", "2+(8-2)e", "8e", "2e"],
    unit: "",
    why: "$i=V_s/R+(I_0-V_s/R)e^{-t/\\tau}=8+(2-8)e^{-t/\\tau}$ mA.",
  },
];

export function stepLQuizDragLabel(question, value) {
  if (question.kind === "complete") {
    if (value === "8+(2-8)e") return "8+(2−8)e^{−t/τ} mA";
    if (value === "2+(8-2)e") return "2+(8−2)e^{−t/τ} mA";
    if (value === "8e") return "8 e^{−t/τ} mA";
    if (value === "2e") return "2 e^{−t/τ} mA";
  }
  return question.unit ? `${value} ${question.unit}` : String(value);
}

export function stepLQuizDragPrompt(question) {
  if (question.kind === "tau") {
    return `$R=${question.rLabel}$, $L=${question.lLabel}$, $V_s=${question.vsLabel}$. Drag $\\tau$.`;
  }
  if (question.kind === "iinf") {
    return `From rest, $V_s=${question.vsLabel}$, $R=${question.rLabel}$. Drag $i(\\infty)$.`;
  }
  if (question.kind === "itau") {
    return `From rest toward $I_\\infty=${question.iInf}\\,\\mathrm{mA}$. Drag $i(\\tau)$.`;
  }
  if (question.kind === "i0") {
    return `$i(0^-)=${question.i0}\\,\\mathrm{mA}$, then $V_s$ connects. Drag $i(0^+)$.`;
  }
  return `$I_0=${question.i0}\\,\\mathrm{mA}$, $V_s/R=${question.iInf}\\,\\mathrm{mA}$. Drag the complete $i(t)$ form.`;
}

const DIFFICULTY = { 1: "easy", 2: "medium", 3: "harder" };

function group(groupId, difficulty, parts) {
  return parts.map((part, i) => ({
    id: `${groupId}-p${i + 1}`,
    type: "schematic",
    groupId,
    part: i + 1,
    partCount: parts.length,
    difficulty: DIFFICULTY[difficulty],
    view: `${groupId}-board`,
    ...part,
  }));
}

const FL_01 = group("s4-fl-01", 1, [
  {
    prompt:
      "Immediately before switching, what is $i_L(0^-)$, and therefore $i_L(0^+)$?",
    options: {
      a: "$0\\,\\mathrm{A}$",
      b: "$3\\,\\mathrm{A}$",
      c: "$6\\,\\mathrm{A}$",
      d: "$8\\,\\mathrm{A}$",
    },
    answer: "c",
    why: "At long-time DC the ideal inductor is a short. Before switching the source sees only the $4\\,\\Omega$ resistor, so $i_L(0^-)=24/4=6\\,\\mathrm{A}$. Inductor current cannot jump, so $i_L(0^+)=6\\,\\mathrm{A}$.",
  },
  {
    prompt: "For $t>0$, what is the time constant $\\tau$?",
    options: {
      a: "$0.125\\,\\mathrm{s}$",
      b: "$0.25\\,\\mathrm{s}$",
      c: "$4\\,\\mathrm{s}$",
      d: "$16\\,\\mathrm{s}$",
    },
    answer: "b",
    why: "The source-free inductor sees $R=8\\,\\Omega$. $\\tau=L/R=2/8=0.25\\,\\mathrm{s}$.",
  },
  {
    prompt: "Which expression correctly describes $i_L(t)$ for $t\\ge 0$?",
    options: {
      a: "$6\\left(1-e^{-4t}\\right)\\,\\mathrm{A}$",
      b: "$3e^{-4t}\\,\\mathrm{A}$",
      c: "$6e^{-t/8}\\,\\mathrm{A}$",
      d: "$6e^{-4t}\\,\\mathrm{A}$",
    },
    answer: "d",
    why: "For a source-free RL circuit, $i_L(t)=i_L(0^+)e^{-t/\\tau}$. Here $i_L(0^+)=6\\,\\mathrm{A}$ and $\\tau=0.25\\,\\mathrm{s}$, so $1/\\tau=4$ and $i_L(t)=6e^{-4t}\\,\\mathrm{A}$.",
  },
]);

const FL_02 = group("s4-fl-02", 2, [
  {
    prompt: "What is $i_L(0^+)$?",
    options: {
      a: "$3\\,\\mathrm{A}$",
      b: "$6\\,\\mathrm{A}$",
      c: "$2\\,\\mathrm{A}$",
      d: "$10\\,\\mathrm{A}$",
    },
    answer: "b",
    why: "Before switching the inductor is a short at DC, so it bypasses the $10\\,\\Omega$ resistor. The $30\\,\\mathrm{V}$ source sees $5\\,\\Omega$, giving $i_L(0^-)=30/5=6\\,\\mathrm{A}$. Therefore $i_L(0^+)=6\\,\\mathrm{A}$.",
  },
  {
    prompt:
      "Which pair correctly gives the post-switch resistance seen by $L$ and the time constant?",
    options: {
      a: "$R_{th}=18\\,\\Omega$, $\\tau=1/6\\,\\mathrm{s}$",
      b: "$R_{th}=8\\,\\Omega$, $\\tau=0.375\\,\\mathrm{s}$",
      c: "$R_{th}=2\\,\\Omega$, $\\tau=1.5\\,\\mathrm{s}$",
      d: "$R_{th}=4\\,\\Omega$, $\\tau=0.75\\,\\mathrm{s}$",
    },
    answer: "d",
    why: "The two discharge resistors are parallel: $6\\parallel 12=4\\,\\Omega$. Therefore $\\tau=L/R_{th}=3/4=0.75\\,\\mathrm{s}$.",
  },
  {
    prompt: "Which expression is $i_L(t)$ for $t\\ge 0$?",
    options: {
      a: "$6e^{-t/0.75}\\,\\mathrm{A}$",
      b: "$6\\left(1-e^{-t/0.75}\\right)\\,\\mathrm{A}$",
      c: "$4e^{-t/3}\\,\\mathrm{A}$",
      d: "$6e^{-0.75t}\\,\\mathrm{A}$",
    },
    answer: "a",
    why: "This is source-free, so the current decays from $6\\,\\mathrm{A}$ toward $0$: $i_L(t)=6e^{-t/0.75}\\,\\mathrm{A}$.",
  },
  {
    prompt: "What is $i_L$ at $t=1.5\\,\\mathrm{s}$?",
    options: {
      a: "$2.21\\,\\mathrm{A}$",
      b: "$0.30\\,\\mathrm{A}$",
      c: "$0.812\\,\\mathrm{A}$",
      d: "$3.00\\,\\mathrm{A}$",
    },
    answer: "c",
    why: "$1.5\\,\\mathrm{s}=2\\tau$. Therefore $i_L=6e^{-2}\\approx 0.812\\,\\mathrm{A}$.",
  },
]);

const FL_03 = group("s4-fl-03", 3, [
  {
    prompt: "Using the long-time DC circuit before switching, what is $i_L(0^+)$?",
    options: {
      a: "$1.2\\,\\mathrm{A}$",
      b: "$3.6\\,\\mathrm{A}$",
      c: "$2.4\\,\\mathrm{A}$",
      d: "$6\\,\\mathrm{A}$",
    },
    answer: "c",
    why: "At DC, $L$ is a short, so Branch 2 becomes $3\\,\\Omega$. The load at node $A$ is $6\\parallel 3=2\\,\\Omega$. Total resistance is $3+2=5\\,\\Omega$, so the source current is $18/5=3.6\\,\\mathrm{A}$ and node $A$ is $3.6\\times 2=7.2\\,\\mathrm{V}$. The Branch-2 current is $7.2/3=2.4\\,\\mathrm{A}$. By continuity, $i_L(0^+)=2.4\\,\\mathrm{A}$.",
  },
  {
    prompt: "What resistance does the inductor see after switching?",
    options: {
      a: "$8\\,\\Omega$",
      b: "$4\\,\\Omega$",
      c: "$10\\,\\Omega$",
      d: "$22\\,\\Omega$",
    },
    answer: "a",
    why: "$6\\parallel 12=4\\,\\Omega$, and this is in series with $4\\,\\Omega$. Therefore $R_{th}=8\\,\\Omega$.",
  },
  {
    prompt: "Which pair correctly gives $\\tau$ and $i_L(t)$?",
    options: {
      a: "$\\tau=4\\,\\mathrm{s}$, $i_L=2.4e^{-t/4}\\,\\mathrm{A}$",
      b: "$\\tau=0.25\\,\\mathrm{s}$, $i_L=2.4e^{-4t}\\,\\mathrm{A}$",
      c: "$\\tau=0.5\\,\\mathrm{s}$, $i_L=2.4\\left(1-e^{-2t}\\right)\\,\\mathrm{A}$",
      d: "$\\tau=0.25\\,\\mathrm{s}$, $i_L=8e^{-4t}\\,\\mathrm{A}$",
    },
    answer: "b",
    why: "$\\tau=L/R_{th}=2/8=0.25\\,\\mathrm{s}$. Source-free current decays from $2.4\\,\\mathrm{A}$, so $i_L(t)=2.4e^{-t/0.25}=2.4e^{-4t}\\,\\mathrm{A}$.",
  },
  {
    prompt: "What is $i_L$ at $t=0.5\\,\\mathrm{s}$?",
    options: {
      a: "$0.883\\,\\mathrm{A}$",
      b: "$1.20\\,\\mathrm{A}$",
      c: "$0.325\\,\\mathrm{A}$",
      d: "$2.40\\,\\mathrm{A}$",
    },
    answer: "c",
    why: "$0.5\\,\\mathrm{s}=2\\tau$. $i_L=2.4e^{-2}\\approx 0.325\\,\\mathrm{A}$.",
  },
]);

const RC_01 = group("s4-rc-01", 2, [
  {
    prompt: "Which pair correctly gives $v_C(0^+)$ and $v_C(\\infty)$?",
    options: {
      a: "$12\\,\\mathrm{V}$, $12\\,\\mathrm{V}$",
      b: "$0\\,\\mathrm{V}$, $8\\,\\mathrm{V}$",
      c: "$0\\,\\mathrm{V}$, $12\\,\\mathrm{V}$",
      d: "$8\\,\\mathrm{V}$, $8\\,\\mathrm{V}$",
    },
    answer: "b",
    why: "The capacitor is initially uncharged and its voltage cannot jump, so $v_C(0^+)=0$. At final DC the capacitor is open, leaving the $2\\,\\mathrm{k}\\Omega$ / $4\\,\\mathrm{k}\\Omega$ divider: $v_C(\\infty)=12\\times 4/(2+4)=8\\,\\mathrm{V}$.",
  },
  {
    prompt: "Which pair correctly gives $R_{th}$ seen by $C$ and $\\tau$?",
    options: {
      a: "$6\\,\\mathrm{k}\\Omega$, $18\\,\\mathrm{ms}$",
      b: "$2\\,\\mathrm{k}\\Omega$, $6\\,\\mathrm{ms}$",
      c: "$1.333\\,\\mathrm{k}\\Omega$, $4\\,\\mathrm{ms}$",
      d: "$4\\,\\mathrm{k}\\Omega$, $12\\,\\mathrm{ms}$",
    },
    answer: "c",
    why: "To find $R_{th}$, turn off the $12\\,\\mathrm{V}$ source: an independent voltage source is replaced by a short for this analysis only. $C$ then sees $2\\,\\mathrm{k}\\Omega\\parallel 4\\,\\mathrm{k}\\Omega=1.333\\,\\mathrm{k}\\Omega$, and $\\tau=R_{th}C=1.333\\,\\mathrm{k}\\Omega\\times 3\\,\\mu\\mathrm{F}=4\\,\\mathrm{ms}$.",
  },
  {
    prompt: "Which expression correctly describes $v_C(t)$ for $t\\ge 0$?",
    options: {
      a: "$8\\left(1-e^{-t/4\\,\\mathrm{ms}}\\right)\\,\\mathrm{V}$",
      b: "$12\\left(1-e^{-t/4\\,\\mathrm{ms}}\\right)\\,\\mathrm{V}$",
      c: "$8e^{-t/4\\,\\mathrm{ms}}\\,\\mathrm{V}$",
      d: "$8+4e^{-t/4\\,\\mathrm{ms}}\\,\\mathrm{V}$",
    },
    answer: "a",
    why: "Use $v_C(t)=V_\\infty+[V_0-V_\\infty]e^{-t/\\tau}=8+(0-8)e^{-t/4\\,\\mathrm{ms}}=8\\left(1-e^{-t/4\\,\\mathrm{ms}}\\right)\\,\\mathrm{V}$.",
  },
  {
    prompt: "Approximately what is $v_C$ at $t=\\tau$?",
    options: {
      a: "$2.94\\,\\mathrm{V}$",
      b: "$4.00\\,\\mathrm{V}$",
      c: "$8.00\\,\\mathrm{V}$",
      d: "$5.06\\,\\mathrm{V}$",
    },
    answer: "d",
    why: "At one time constant the capacitor has completed about $63.2\\%$ of the change from $0$ to $8\\,\\mathrm{V}$: $8(1-1/e)\\approx 5.06\\,\\mathrm{V}$.",
  },
]);

const RC_02 = group("s4-rc-02", 3, [
  {
    prompt: "What is $v_C(0^+)$?",
    options: {
      a: "$4\\,\\mathrm{V}$",
      b: "$18\\,\\mathrm{V}$",
      c: "$12\\,\\mathrm{V}$",
      d: "$0\\,\\mathrm{V}$",
    },
    answer: "c",
    why: "Before switching, $C$ is open at DC. The A-side divider gives $v_C(0^-)=18\\times 6/(3+6)=12\\,\\mathrm{V}$. Capacitor voltage cannot jump, so $v_C(0^+)=12\\,\\mathrm{V}$.",
  },
  {
    prompt: "What is the final value $v_C(\\infty)$ after the switch moves to B?",
    options: {
      a: "$4\\,\\mathrm{V}$",
      b: "$6\\,\\mathrm{V}$",
      c: "$12\\,\\mathrm{V}$",
      d: "$2\\,\\mathrm{V}$",
    },
    answer: "a",
    why: "At final DC, $C$ is open and the new $6\\,\\mathrm{V}$ source sees a $2\\,\\mathrm{k}\\Omega$ / $4\\,\\mathrm{k}\\Omega$ divider. $v_C(\\infty)=6\\times 4/(2+4)=4\\,\\mathrm{V}$.",
  },
  {
    prompt: "Which pair correctly gives $R_{th}$ and $\\tau$ in the $t>0$ circuit?",
    options: {
      a: "$6\\,\\mathrm{k}\\Omega$, $18\\,\\mathrm{ms}$",
      b: "$4\\,\\mathrm{k}\\Omega$, $12\\,\\mathrm{ms}$",
      c: "$2\\,\\mathrm{k}\\Omega$, $6\\,\\mathrm{ms}$",
      d: "$1.333\\,\\mathrm{k}\\Omega$, $4\\,\\mathrm{ms}$",
    },
    answer: "d",
    why: "To find $R_{th}$, turn off the $6\\,\\mathrm{V}$ source (a short for this analysis only). $C$ sees $2\\,\\mathrm{k}\\Omega\\parallel 4\\,\\mathrm{k}\\Omega=1.333\\,\\mathrm{k}\\Omega$. $\\tau=1.333\\,\\mathrm{k}\\Omega\\times 3\\,\\mu\\mathrm{F}=4\\,\\mathrm{ms}$.",
  },
  {
    prompt: "Which expression correctly gives $v_C(t)$ for $t\\ge 0$?",
    options: {
      a: "$12e^{-t/4\\,\\mathrm{ms}}\\,\\mathrm{V}$",
      b: "$4+8e^{-t/4\\,\\mathrm{ms}}\\,\\mathrm{V}$",
      c: "$4\\left(1-e^{-t/4\\,\\mathrm{ms}}\\right)\\,\\mathrm{V}$",
      d: "$12-4e^{-t/4\\,\\mathrm{ms}}\\,\\mathrm{V}$",
    },
    answer: "b",
    why: "$v_C(t)=V_\\infty+[V_0-V_\\infty]e^{-t/\\tau}=4+(12-4)e^{-t/4\\,\\mathrm{ms}}=4+8e^{-t/4\\,\\mathrm{ms}}\\,\\mathrm{V}$.",
  },
  {
    prompt: "Approximately what is $v_C$ at $t=\\tau$?",
    options: {
      a: "$4.00\\,\\mathrm{V}$",
      b: "$8.00\\,\\mathrm{V}$",
      c: "$6.94\\,\\mathrm{V}$",
      d: "$9.06\\,\\mathrm{V}$",
    },
    answer: "c",
    why: "$v_C(\\tau)=4+8/e\\approx 6.94\\,\\mathrm{V}$.",
  },
]);

const RC_03 = group("s4-rc-03", 3, [
  {
    prompt: "What is $v_C(\\infty)$?",
    options: {
      a: "$5\\,\\mathrm{V}$",
      b: "$20\\,\\mathrm{V}$",
      c: "$8\\,\\mathrm{V}$",
      d: "$12\\,\\mathrm{V}$",
    },
    answer: "d",
    why: "At final DC the capacitor is open. The resistor divider gives $v_C(\\infty)=20\\times 6/(4+6)=12\\,\\mathrm{V}$.",
  },
  {
    prompt: "Which pair correctly gives $R_{th}$ and $\\tau$?",
    options: {
      a: "$10\\,\\mathrm{k}\\Omega$, $20\\,\\mathrm{ms}$",
      b: "$2.4\\,\\mathrm{k}\\Omega$, $4.8\\,\\mathrm{ms}$",
      c: "$4\\,\\mathrm{k}\\Omega$, $8\\,\\mathrm{ms}$",
      d: "$6\\,\\mathrm{k}\\Omega$, $12\\,\\mathrm{ms}$",
    },
    answer: "b",
    why: "To find $R_{th}$, turn off the $20\\,\\mathrm{V}$ source (a short for this analysis only). The capacitor sees $4\\,\\mathrm{k}\\Omega\\parallel 6\\,\\mathrm{k}\\Omega=2.4\\,\\mathrm{k}\\Omega$. $\\tau=2.4\\,\\mathrm{k}\\Omega\\times 2\\,\\mu\\mathrm{F}=4.8\\,\\mathrm{ms}$.",
  },
  {
    prompt: "Which expression correctly gives $v_C(t)$?",
    options: {
      a: "$12-7e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{V}$",
      b: "$12+7e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{V}$",
      c: "$5+7e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{V}$",
      d: "$20-15e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{V}$",
    },
    answer: "a",
    why: "$v_C(t)=12+(5-12)e^{-t/4.8\\,\\mathrm{ms}}=12-7e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{V}$.",
  },
  {
    prompt:
      "Using the indicated direction from the source through $R_1$ toward node $A$, what is $i_{R1}(t)$?",
    options: {
      a: "$3.75e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{mA}$",
      b: "$2-1.75e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{mA}$",
      c: "$2+1.75e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{mA}$",
      d: "$5-3e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{mA}$",
    },
    answer: "c",
    why: "$i_{R1}=[20-v_C(t)]/4\\,\\mathrm{k}\\Omega=[20-(12-7e^{-t/4.8\\,\\mathrm{ms}})]/4\\,\\mathrm{k}\\Omega=[8+7e^{-t/4.8\\,\\mathrm{ms}}]/4\\,\\mathrm{k}\\Omega=2+1.75e^{-t/4.8\\,\\mathrm{ms}}\\,\\mathrm{mA}$.",
  },
]);

const RL_01 = group("s4-rl-01", 2, [
  {
    prompt: "Which pair correctly gives $i_L(0^+)$ and $i_L(\\infty)$?",
    options: {
      a: "$0\\,\\mathrm{A}$, $6\\,\\mathrm{A}$",
      b: "$6\\,\\mathrm{A}$, $6\\,\\mathrm{A}$",
      c: "$0\\,\\mathrm{A}$, $2\\,\\mathrm{A}$",
      d: "$2\\,\\mathrm{A}$, $6\\,\\mathrm{A}$",
    },
    answer: "a",
    why: "The inductor starts from rest, so $i_L(0^+)=0$. At final DC the inductor is a short, bypassing the $12\\,\\Omega$ resistor, so $i_L(\\infty)=24/4=6\\,\\mathrm{A}$.",
  },
  {
    prompt: "Which pair correctly gives $R_{th}$ seen by $L$ and $\\tau$?",
    options: {
      a: "$16\\,\\Omega$, $0.1875\\,\\mathrm{s}$",
      b: "$4\\,\\Omega$, $0.75\\,\\mathrm{s}$",
      c: "$12\\,\\Omega$, $0.25\\,\\mathrm{s}$",
      d: "$3\\,\\Omega$, $1\\,\\mathrm{s}$",
    },
    answer: "d",
    why: "To find $R_{th}$, turn off the $24\\,\\mathrm{V}$ source (a short for this analysis only). The inductor then sees $4\\,\\Omega\\parallel 12\\,\\Omega=3\\,\\Omega$. $\\tau=L/R_{th}=3/3=1\\,\\mathrm{s}$.",
  },
  {
    prompt: "Which expression correctly describes $i_L(t)$?",
    options: {
      a: "$6e^{-t}\\,\\mathrm{A}$",
      b: "$3\\left(1-e^{-t}\\right)\\,\\mathrm{A}$",
      c: "$6\\left(1-e^{-t}\\right)\\,\\mathrm{A}$",
      d: "$6-3e^{-t}\\,\\mathrm{A}$",
    },
    answer: "c",
    why: "$i_L(t)=I_\\infty+[I_0-I_\\infty]e^{-t/\\tau}=6+(0-6)e^{-t}=6\\left(1-e^{-t}\\right)\\,\\mathrm{A}$.",
  },
  {
    prompt: "Approximately what is $i_L$ at $t=\\tau$?",
    options: {
      a: "$2.21\\,\\mathrm{A}$",
      b: "$3.79\\,\\mathrm{A}$",
      c: "$6.00\\,\\mathrm{A}$",
      d: "$3.00\\,\\mathrm{A}$",
    },
    answer: "b",
    why: "At one time constant the current has completed about $63.2\\%$ of its rise: $6(1-1/e)\\approx 3.79\\,\\mathrm{A}$.",
  },
]);

const FL_04 = group("s4-fl-04", 2, [
  {
    prompt: "What is $i_L$ at $t=1\\,\\mathrm{s}$?",
    options: {
      a: "$1.84\\,\\mathrm{A}$",
      b: "$3.03\\,\\mathrm{A}$",
      c: "$4.09\\,\\mathrm{A}$",
      d: "$2.50\\,\\mathrm{A}$",
    },
    answer: "b",
    why: "The resistance seen by the inductor is $R_{th}=6\\parallel 3=2\\,\\Omega$. Then $\\tau=L/R_{th}=4/2=2\\,\\mathrm{s}$. For a source-free RL circuit, $i_L(t)=i_L(0^+)e^{-t/\\tau}$, so $i_L(1)=5e^{-1/2}\\approx 3.03\\,\\mathrm{A}$.",
  },
]);

const FL_05 = group("s4-fl-05", 3, [
  {
    prompt: "Which expression correctly describes $i_L(t)$ for $t\\ge 0$?",
    options: {
      a: "$3\\left(1-e^{-3t}\\right)\\,\\mathrm{A}$",
      b: "$3e^{-t/3}\\,\\mathrm{A}$",
      c: "$2e^{-3t}\\,\\mathrm{A}$",
      d: "$3e^{-3t}\\,\\mathrm{A}$",
    },
    answer: "d",
    why: "Before switching, the inductor is a short at long-time DC: $i_L(0^-)=12/4=3\\,\\mathrm{A}$. By continuity, $i_L(0^+)=3\\,\\mathrm{A}$. After switching, $6+3=9\\,\\Omega$ and $R_{th}=9\\parallel 18=6\\,\\Omega$, so $\\tau=L/R_{th}=2/6=1/3\\,\\mathrm{s}$. Therefore $i_L(t)=3e^{-t/(1/3)}=3e^{-3t}\\,\\mathrm{A}$.",
  },
]);

const FL_06 = group("s4-fl-06", 1, [
  {
    prompt: "What is the inductor current after exactly one time constant?",
    options: {
      a: "$2.94\\,\\mathrm{A}$",
      b: "$5.06\\,\\mathrm{A}$",
      c: "$4.00\\,\\mathrm{A}$",
      d: "$8.00\\,\\mathrm{A}$",
    },
    answer: "a",
    why: "For a source-free first-order response, $i_L(\\tau)=i_L(0^+)e^{-1}=8/e\\approx 2.94\\,\\mathrm{A}$. The $5.06\\,\\mathrm{A}$ option is $63.2\\%$ of the initial value, which is the amount that has changed, not the remaining current.",
  },
]);

const RC_04 = group("s4-rc-04", 2, [
  {
    prompt: "Which expression correctly describes $v_C(t)$ for $t\\ge 0$?",
    options: {
      a: "$10e^{-t/10\\,\\mathrm{ms}}\\,\\mathrm{V}$",
      b: "$4\\left(1-e^{-t/10\\,\\mathrm{ms}}\\right)\\,\\mathrm{V}$",
      c: "$4+6e^{-t/10\\,\\mathrm{ms}}\\,\\mathrm{V}$",
      d: "$10-4e^{-t/10\\,\\mathrm{ms}}\\,\\mathrm{V}$",
    },
    answer: "c",
    why: "Capacitor voltage cannot jump, so $v_C(0^+)=10\\,\\mathrm{V}$. At final DC, $v_C(\\infty)=4\\,\\mathrm{V}$. The time constant is $\\tau=RC=(2\\,\\mathrm{k}\\Omega)(5\\,\\mu\\mathrm{F})=10\\,\\mathrm{ms}$. Then $v_C(t)=V_\\infty+[V_0-V_\\infty]e^{-t/\\tau}=4+(10-4)e^{-t/10\\,\\mathrm{ms}}=4+6e^{-t/10\\,\\mathrm{ms}}\\,\\mathrm{V}$.",
  },
]);

const RC_05 = group("s4-rc-05", 2, [
  {
    prompt: "What is $v_C$ at $t=8\\,\\mathrm{ms}$?",
    options: {
      a: "$10.0\\,\\mathrm{V}$",
      b: "$6.32\\,\\mathrm{V}$",
      c: "$3.68\\,\\mathrm{V}$",
      d: "$8.65\\,\\mathrm{V}$",
    },
    answer: "d",
    why: "At final DC the capacitor is open, so the divider sets $V_\\infty=15\\times 6/(3+6)=10\\,\\mathrm{V}$. Deactivate the $15\\,\\mathrm{V}$ source to find $R_{th}=3\\,\\mathrm{k}\\Omega\\parallel 6\\,\\mathrm{k}\\Omega=2\\,\\mathrm{k}\\Omega$. Then $\\tau=R_{th}C=(2\\,\\mathrm{k}\\Omega)(2\\,\\mu\\mathrm{F})=4\\,\\mathrm{ms}$. Since $8\\,\\mathrm{ms}=2\\tau$, $v_C=10(1-e^{-2})\\approx 8.65\\,\\mathrm{V}$.",
  },
]);

const RC_06 = group("s4-rc-06", 3, [
  {
    prompt: "What is $v_C$ at $t=8\\,\\mathrm{ms}$?",
    options: {
      a: "$3.00\\,\\mathrm{V}$",
      b: "$6.31\\,\\mathrm{V}$",
      c: "$7.41\\,\\mathrm{V}$",
      d: "$12.00\\,\\mathrm{V}$",
    },
    answer: "b",
    why: "Capacitor voltage is continuous, so $v_C(0^+)=12\\,\\mathrm{V}$. The new final voltage is $V_\\infty=3\\,\\mathrm{V}$ and $\\tau=(2\\,\\mathrm{k}\\Omega)(4\\,\\mu\\mathrm{F})=8\\,\\mathrm{ms}$. At $t=8\\,\\mathrm{ms}=\\tau$, $v_C(\\tau)=3+(12-3)e^{-1}=3+9/e\\approx 6.31\\,\\mathrm{V}$.",
  },
]);

const RL_03 = group("s4-rl-03", 2, [
  {
    prompt: "Which expression correctly describes $i_L(t)$?",
    options: {
      a: "$3-2e^{-2t}\\,\\mathrm{A}$",
      b: "$3+2e^{-2t}\\,\\mathrm{A}$",
      c: "$1+2e^{-2t}\\,\\mathrm{A}$",
      d: "$3\\left(1-e^{-2t}\\right)\\,\\mathrm{A}$",
    },
    answer: "a",
    why: "The final current is $I_\\infty=V_s/R=18/6=3\\,\\mathrm{A}$ and $\\tau=L/R=3/6=0.5\\,\\mathrm{s}$. Then $i_L(t)=I_\\infty+[I_0-I_\\infty]e^{-t/\\tau}=3+(1-3)e^{-t/0.5}=3-2e^{-2t}\\,\\mathrm{A}$.",
  },
]);

const RL_04 = group("s4-rl-04", 3, [
  {
    prompt:
      "What is $i_L$ at exactly one time constant after the switch closes?",
    options: {
      a: "$6.00\\,\\mathrm{A}$",
      b: "$2.21\\,\\mathrm{A}$",
      c: "$3.79\\,\\mathrm{A}$",
      d: "$0\\,\\mathrm{A}$",
    },
    answer: "c",
    why: "At final DC the inductor is a short, so node $A$ is at ground and the $10\\,\\Omega$ branch is bypassed: $I_\\infty=30/5=6\\,\\mathrm{A}$. Deactivate the $30\\,\\mathrm{V}$ source to find $R_{th}=5\\parallel 10=10/3\\,\\Omega$, so $\\tau=L/R_{th}=2/(10/3)=0.6\\,\\mathrm{s}$. From rest, $i_L(\\tau)=6(1-e^{-1})\\approx 3.79\\,\\mathrm{A}$.",
  },
]);

const RL_05 = group("s4-rl-05", 2, [
  {
    prompt: "Which statement correctly describes $i_L(t)$ for $t\\ge 0$?",
    options: {
      a: "It decays exponentially from $3\\,\\mathrm{A}$ to $0\\,\\mathrm{A}$.",
      b: "It rises exponentially from $3\\,\\mathrm{A}$ to $6\\,\\mathrm{A}$.",
      c: "It instantaneously becomes $0\\,\\mathrm{A}$ and then rises to $3\\,\\mathrm{A}$.",
      d: "It remains constant at $3\\,\\mathrm{A}$.",
    },
    answer: "d",
    why: "Before switching, the inductor is a short at long-time DC: $i_L(0^-)=12/4=3\\,\\mathrm{A}$. Current cannot jump, so $i_L(0^+)=3\\,\\mathrm{A}$. In the new circuit, $I_\\infty=24/8=3\\,\\mathrm{A}$. Then $i_L(t)=I_\\infty+[I_0-I_\\infty]e^{-t/\\tau}=3+(3-3)e^{-t/\\tau}=3\\,\\mathrm{A}$. Switching occurs, but there is no transient change in the inductor current.",
  },
]);

const RL_02 = group("s4-rl-02", 3, [
  {
    prompt: "What is $i_L(0^+)$?",
    options: {
      a: "$0\\,\\mathrm{A}$",
      b: "$2\\,\\mathrm{A}$",
      c: "$6\\,\\mathrm{A}$",
      d: "$4\\,\\mathrm{A}$",
    },
    answer: "b",
    why: "Before switching the inductor is a DC short, so $i_L(0^-)=10/5=2\\,\\mathrm{A}$. Inductor current cannot jump, so $i_L(0^+)=2\\,\\mathrm{A}$.",
  },
  {
    prompt: "What is $i_L(\\infty)$ in the new B-side circuit?",
    options: {
      a: "$2\\,\\mathrm{A}$",
      b: "$8\\,\\mathrm{A}$",
      c: "$6\\,\\mathrm{A}$",
      d: "$1.5\\,\\mathrm{A}$",
    },
    answer: "c",
    why: "At final DC the inductor is a short, so node $B$ is at ground and the $12\\,\\Omega$ resistor has zero voltage. The source current through $4\\,\\Omega$ is $24/4=6\\,\\mathrm{A}$ and all of it flows through $L$.",
  },
  {
    prompt: "Which pair correctly gives $R_{th}$ and $\\tau$ for the post-switch circuit?",
    options: {
      a: "$R_{th}=3\\,\\Omega$, $\\tau=1\\,\\mathrm{s}$",
      b: "$R_{th}=16\\,\\Omega$, $\\tau=0.1875\\,\\mathrm{s}$",
      c: "$R_{th}=4\\,\\Omega$, $\\tau=0.75\\,\\mathrm{s}$",
      d: "$R_{th}=12\\,\\Omega$, $\\tau=0.25\\,\\mathrm{s}$",
    },
    answer: "a",
    why: "To find $R_{th}$, turn off the $24\\,\\mathrm{V}$ source (a short for this analysis only). $L$ sees $4\\,\\Omega\\parallel 12\\,\\Omega=3\\,\\Omega$. $\\tau=L/R_{th}=3/3=1\\,\\mathrm{s}$.",
  },
  {
    prompt: "Which expression correctly describes $i_L(t)$ for $t\\ge 0$?",
    options: {
      a: "$2+4e^{-t}\\,\\mathrm{A}$",
      b: "$6+4e^{-t}\\,\\mathrm{A}$",
      c: "$6\\left(1-e^{-t}\\right)\\,\\mathrm{A}$",
      d: "$6-4e^{-t}\\,\\mathrm{A}$",
    },
    answer: "d",
    why: "$i_L(t)=I_\\infty+[I_0-I_\\infty]e^{-t/\\tau}=6+(2-6)e^{-t}=6-4e^{-t}\\,\\mathrm{A}$.",
  },
  {
    prompt: "With $v_L$ defined positive at the top of $L$, what is $v_L(t)$?",
    options: {
      a: "$-12e^{-t}\\,\\mathrm{V}$",
      b: "$12e^{-t}\\,\\mathrm{V}$",
      c: "$24e^{-t}\\,\\mathrm{V}$",
      d: "$4e^{-t}\\,\\mathrm{V}$",
    },
    answer: "b",
    why: "$v_L=L\\,di_L/dt$. Since $i_L=6-4e^{-t}$, $di_L/dt=4e^{-t}\\,\\mathrm{A/s}$. Therefore $v_L=3\\times 4e^{-t}=12e^{-t}\\,\\mathrm{V}$. The positive sign is consistent with the stated top-positive polarity.",
  },
]);

export const SECTION4_TESTS = {
  freel: [...FL_01, ...FL_02, ...FL_03, ...FL_04, ...FL_05, ...FL_06],
  stepc: [...RC_01, ...RC_02, ...RC_03, ...RC_04, ...RC_05, ...RC_06],
  stepl: [...RL_01, ...RL_02, ...RL_03, ...RL_04, ...RL_05],
};

export function testForLab(labId) {
  return SECTION4_TESTS[labId] || [];
}

export function testGroupCount(questions) {
  return new Set(questions.map((q) => q.groupId || q.id)).size;
}

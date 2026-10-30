const TOPIC_HINTS = {
  1: "Name the nodes and loops first, then pick Ohm, KCL, or KVL. Do not reach for a formula yet.",
  2: "Start from the two ideal rules: no current into the pins, and the input voltages match when the loop is closed.",
  3: "Ask what the capacitor or inductor looks like at this instant, then write the time constant before any number.",
  4: "Copy the stored value across the switching instant, then find the new final value and the time constant.",
  5: "Swap each part for its s-domain model, then treat the drawing like ordinary circuit algebra.",
  6: "Read zeros from the numerator and poles from the denominator. The real part of each pole tells you if it dies away.",
  7: "Write the output over the input with zero stored energy, then evaluate what the question actually asked.",
  8: "Choose the parameter set from how the ports are opened or shorted, then fill the matrix from that test.",
  9: "Move sources and impedances into the frequency domain first, then use ordinary circuit laws.",
  10: "Name the governing rule, then drop the choice that breaks it. Skip the arithmetic.",
};

const NUDGES = [
  {
    test: /\bmatch\b|drag each|pair each/,
    hint: "Pair each idea with its definition. Leave the lookalike formula alone.",
  },
  {
    test: /what (circuit )?concept|which (of the following )?(concept|method|theorem|principle)|which statement/,
    hint: "Look at the structure of the circuit first, then pick the idea that matches that structure. Do not start with a formula.",
  },
  {
    test: /superposition|independent sources?/,
    hint: "Count the independent sources. Turn extras off one at a time: a voltage source becomes a short, a current source an open.",
  },
  {
    test: /thevenin|v_\{th\}|r_\{th\}|vth|rth/,
    hint: "Work at the load terminals. Find the open-circuit voltage, then the resistance with independent sources off.",
  },
  {
    test: /norton|i_n\b|r_n\b/,
    hint: "Work at the load terminals. Find the short-circuit current, then the resistance with independent sources off.",
  },
  {
    test: /source transformation|transform.*source/,
    hint: "Keep the same resistor. Swap series voltage for parallel current, or the other way, so the terminals still match.",
  },
  {
    test: /max(imum)? power|pmax|p_\{max\}/,
    hint: "The load that draws the most power is the one that matches the resistance the rest of the circuit shows it.",
  },
  {
    test: /supernode/,
    hint: "Treat the two nodes across the voltage source as one region, write KCL for the region, and keep the source constraint.",
  },
  {
    test: /supermesh/,
    hint: "Skip the current-source branch, write KVL around the combined loop, and keep the source constraint.",
  },
  {
    test: /\bnodal\b|kcl at/,
    hint: "Write KCL at each unknown node. Dependent sources stay on.",
  },
  {
    test: /\bmesh\b|\bkvl\b/,
    hint: "Write KVL around each loop. Watch shared branches.",
  },
  {
    test: /voltage divider|current divider|branch divider/,
    hint: "Collapse parallels first, then split voltage or current with the divider that matches the sketch.",
  },
  {
    test: /non-?invert/,
    hint: "See which pin the input meets. If it is the plus pin, the minus-pin divider sets the gain.",
  },
  {
    test: /invert/,
    hint: "See which pin the input meets. If it is the minus pin, write KCL there and use the virtual-short idea.",
  },
  {
    test: /op-?amp|virtual (ground|short)/,
    hint: "No current enters the pins. With negative feedback, the two input voltages are forced equal.",
  },
  {
    test: /time constant|\\tau\b|\btau\b/,
    hint: "Find the resistance the capacitor or inductor actually sees after switching, then write τ from that resistance.",
  },
  {
    test: /source-free|natural response|discharg/,
    hint: "After the source is gone, the stored value decays through the resistance the element sees.",
  },
  {
    test: /step response|final value|t\\to\\infty|t → ∞|steady state/,
    hint: "The jump (if any) comes from continuity. The value it heads toward is the new DC circuit.",
  },
  {
    test: /capacitor|v_c|v_\{c\}/,
    hint: "Capacitor voltage cannot jump. At DC it looks like an open.",
  },
  {
    test: /inductor|i_l|i_\{l\}/,
    hint: "Inductor current cannot jump. At DC it looks like a short.",
  },
  {
    test: /partial fraction|residues?|cover-up/,
    hint: "Factor the denominator first, then find each residue from the matching pole.",
  },
  {
    test: /laplace|s-domain|transform/,
    hint: "Replace L with sL and C with 1/sC. Put initial conditions in as sources if they are not zero.",
  },
  {
    test: /pole|zero|stability/,
    hint: "Zeros come from the numerator, poles from the denominator. Left-half-plane poles die away.",
  },
  {
    test: /phase|angle|complex/,
    hint: "Write the complex value in polar form. Magnitude scales size; the angle shifts phase.",
  },
  {
    test: /transfer function|h\(s\)|network function/,
    hint: "Form output over input with zero stored energy, then read the value the question asked for.",
  },
  {
    test: /two-?port|y-parameter|z-parameter|h-parameter|abcd/,
    hint: "Open or short the far port the way that parameter is defined, then read the ratio at the near port.",
  },
  {
    test: /rms|reactance|frequency domain|phasor/,
    hint: "Change each source and impedance into the frequency domain first, then use ordinary circuit laws.",
  },
];

function stemOf(question) {
  return [
    question?.question,
    question?.prompt,
    question?.mainQuestion,
    question?.walkthroughTag,
    question?.kind,
  ]
    .map((part) => String(part || ""))
    .join(" ")
    .toLowerCase();
}

function plain(text) {
  return String(text || "")
    .replace(/\$[^$]*\$/g, " ")
    .replace(/\\[a-zA-Z]+\{?\}?/g, " ")
    .replace(/[^a-z]+/gi, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function leaksAnswer(hint, question) {
  const blob = ` ${plain(hint)} `;
  const options = Object.values(question?.options || {});
  for (const opt of options) {
    const optionText = plain(opt);
    if (!optionText) continue;
    if (optionText.length >= 6 && blob.includes(` ${optionText} `)) return true;
    const words = optionText.split(" ").filter((word) => word.length >= 5);
    if (
      words.length > 0 &&
      words.length <= 2 &&
      words.some((word) => blob.includes(` ${word} `))
    ) {
      return true;
    }
  }
  if (/\d/.test(String(hint))) return true;
  return /the answer is\b|option [a-d]\b|correct (choice|option|answer)\b/i.test(
    String(hint)
  );
}

function topicHint(question) {
  return (
    TOPIC_HINTS[Number(question?.topicId)] ||
    "Re-read the circuit and write the governing law before you look at the choices."
  );
}

export function hintForQuestion(question) {
  const stem = stemOf(question);
  for (const row of NUDGES) {
    if (!row.test.test(stem)) continue;
    if (!leaksAnswer(row.hint, question)) return row.hint;
  }
  return topicHint(question);
}

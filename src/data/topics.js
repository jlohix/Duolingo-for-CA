export const TOPICS = [
  { id: 1, name: "Basic Laws", short: "Laws", blurb: "Ohm, KCL, KVL, dividers, and power" },
  { id: 2, name: "Op-amps", short: "Op-amp", blurb: "Ideal op-amps, inverting and non-inverting amps" },
  { id: 3, name: "Transients", short: "RC/RL", blurb: "RC and RL time constants, natural and step response" },
  { id: 4, name: "First-order Circuits", short: "1st", blurb: "Source-free and step response of RC and RL" },
  { id: 5, name: "Laplace Transform", short: "Laplace", blurb: "Transform time-domain circuits into algebra in s, solve them, and map the result back." },
  { id: 6, name: "Poles and Zeros", short: "P/Z", blurb: "Read pole-zero locations, judge stability, and connect complex values to phase." },
  { id: 7, name: "Network Functions", short: "H(s)", blurb: "Driving-point and transfer functions, impulse/step response, and steady state." },
  { id: 8, name: "Two-Port Networks", short: "2-port", blurb: "Y, Z, h, and ABCD parameters, reciprocity, symmetry, and interconnections." },
  { id: 9, name: "Frequency Domain", short: "Freq", blurb: "RMS, reactance, mixed sources", comingSoon: true },
  { id: 10, name: "No Pen, Just Brains", short: "Brain", blurb: "Conceptual questions from every Learn section. No pen-and-paper working.", tagline: "If you need a pen, you're cooked" },
];

export const DIFFICULTIES = [
  { id: 1, name: "Easy", icon: "1" },
  { id: 2, name: "Average", icon: "2" },
  { id: 3, name: "Challenging", icon: "3" },
];

export function lessonKey(topicId, difficulty) {
  return `${topicId}-${difficulty}`;
}

/** Topic-level Easy/Average/Challenging "test your knowledge" quizzes are no longer used. */
export function hasTopicQuiz() {
  return false;
}

// Chat-analytics topic registry.
// ---------------------------------------------------------------------------
// This is the SINGLE place that defines the topics shown in the tutor-usage
// dashboard and how retrieved lecture sources map to a topic. It is designed
// to be extended: to add a future topic, add it to CHAT_TOPICS and (optionally)
// map more lecture weeks to it in WEEK_TO_TOPIC. Nothing else needs to change —
// the tally, charts, and gap views read from here.
//
// For now we surface the app's 7 course topics. The course actually spans ~13
// lecture weeks; WEEK_TO_TOPIC collapses those weeks into these topics. As the
// course/content grows, extend both structures below.

export const UNCATEGORIZED = "Uncategorized";

// The ordered list of topics shown in the dashboard. Topics with zero queries
// still appear (at 0) so newly added topics are visible immediately.
// `id` matches the app's TOPICS ids where applicable; `name` is the label.
export const CHAT_TOPICS = [
  { id: 1, name: "Basic laws" },
  { id: 2, name: "Op-amps" },
  { id: 3, name: "Transients" },
  { id: 4, name: "First-order circuits" },
  { id: 5, name: "Laplace transforms" },
  { id: 6, name: "Network functions" },
  { id: 7, name: "Frequency domain" },
  // Future topics go here, e.g.:
  // { id: 8, name: "Two-port networks" },
  // { id: 9, name: "AC power" },
  // { id: 10, name: "Three-phase circuits" },
];

// Lecture week number -> topic name. Based on the course outline:
//   L1: Basic laws (Ohm, KCL/KVL, power, nodal/mesh, supernode)
//   L2: Superposition, source transform, Thevenin/Norton, max power, op-amp intro
//   L3: Op-amps (real/ideal/feedback), capacitor, inductor, first-order intro
//   L4: First-order (source-free, step), second-order intro
//   L5: Second-order, Laplace basics
//   L6: Laplace (partial fractions), s-domain analysis
//   L7: Poles/zeros/stability, complex numbers & phase
//   L8: Network functions, transfer function H(s), pole-zero, stability
//   L9: One/two-port networks
//   L10: Sinusoids, phasors, impedance/admittance
//   L11: AC-domain analysis, op-amp AC
//   L12: AC power
//   L13: Three-phase circuits
// These weeks collapse into the current 7 app topics. Extend as topics are added.
export const WEEK_TO_TOPIC = {
  1: "Basic laws",
  2: "Basic laws",
  3: "Op-amps",
  4: "First-order circuits",
  5: "Laplace transforms",
  6: "Laplace transforms",
  7: "Laplace transforms",
  8: "Network functions",
  9: "Network functions",
  10: "Frequency domain",
  11: "Frequency domain",
  12: "Frequency domain",
  13: "Frequency domain",
};

// Keyword fallback: if a source filename names a concept rather than a week,
// map obvious keywords to a topic. Checked only when no week number is found.
const KEYWORD_TO_TOPIC = [
  [/\b(ohm|kcl|kvl|nodal|mesh|supernode|basic)\b/i, "Basic laws"],
  [/\b(op[-\s]?amp|opamp)\b/i, "Op-amps"],
  [/\b(transient|rc|rl)\b/i, "Transients"],
  [/\b(first[-\s]?order)\b/i, "First-order circuits"],
  [/\b(laplace|s[-\s]?domain)\b/i, "Laplace transforms"],
  [/\b(network function|transfer function|two[-\s]?port|one[-\s]?port|pole|zero)\b/i, "Network functions"],
  [/\b(phasor|sinusoid|impedance|admittance|frequency|ac power|three[-\s]?phase)\b/i, "Frequency domain"],
];

// Extract a lecture week number from a source filename, e.g.
// "EE2101_Lecture_Week03.pdf" -> 3, "week 7" -> 7.
function weekFromSource(source) {
  const m = String(source || "").match(/week\s*0*(\d+)/i);
  return m ? Number(m[1]) : null;
}

// Map a single source filename to a topic name (or null if unknown).
function topicFromSource(source) {
  const week = weekFromSource(source);
  if (week && WEEK_TO_TOPIC[week]) return WEEK_TO_TOPIC[week];
  for (const [re, topic] of KEYWORD_TO_TOPIC) {
    if (re.test(String(source || ""))) return topic;
  }
  return null;
}

// Given the array of sources the tutor cited for an answer, pick the single
// best topic. Uses the most common mapped topic across the sources; falls back
// to UNCATEGORIZED when nothing maps. This is the function the Edge Function
// uses when writing a chat_logs row.
export function topicFromSources(sources) {
  const list = Array.isArray(sources) ? sources : [];
  const counts = new Map();
  for (const s of list) {
    const t = topicFromSource(s);
    if (t) counts.set(t, (counts.get(t) || 0) + 1);
  }
  if (counts.size === 0) return UNCATEGORIZED;
  let best = UNCATEGORIZED;
  let bestN = -1;
  for (const [topic, n] of counts) {
    if (n > bestN) {
      best = topic;
      bestN = n;
    }
  }
  return best;
}

// The ordered topic names for display, always including every registered topic
// plus an explicit Uncategorized bucket at the end.
export function orderedTopicNames() {
  return [...CHAT_TOPICS.map((t) => t.name), UNCATEGORIZED];
}

// Chat-analytics topic registry (frontend).
// ---------------------------------------------------------------------------
// This defines the topics shown in the tutor-usage dashboard. The ACTUAL
// per-query classification happens server-side in the chat Edge Function
// (supabase/functions/chat/index.ts, classifyTopic) because that is where the
// retrieved slide text + on-screen question topicId are available. The keyword
// rules there mirror KEYWORD_RULES below — keep the two in sync when editing.
//
// Why keyword/topicId classification (not filename): the lecture slides all
// share ONE source filename (a textbook, "CAD_3rd_ed_OA"), so the source name
// can't distinguish topics. We classify from the on-screen question's topicId
// (exact) when available, else from keywords in the retrieved slide text.
//
// To add a future topic: add it to CHAT_TOPICS here AND add a keyword rule in
// the Edge Function's KEYWORD_RULES (and TOPIC_ID_TO_NAME if it maps to an app
// topic id). The dashboard shows every topic below, including zero-count ones.

export const UNCATEGORIZED = "Uncategorized";

// The ordered list of topics shown in the dashboard (matches src/data/topics.js
// ids where applicable). Topics with zero queries still appear at 0.
export const CHAT_TOPICS = [
  { id: 1, name: "Basic laws" },
  { id: 2, name: "Op-amps" },
  { id: 3, name: "Transients" },
  { id: 4, name: "First-order circuits" },
  { id: 5, name: "Laplace Transform" },
  { id: 6, name: "Poles and Zeros" },
  { id: 7, name: "Network functions" },
  { id: 8, name: "Frequency domain" },
  // Future topics go here, e.g.:
  // { id: 8, name: "Two-port networks" },
];

// Keyword rules over text — MIRROR of the Edge Function's KEYWORD_RULES.
// Kept here for reference / potential client-side reuse. Ordered by specificity.
export const KEYWORD_RULES = [
  [/\b(op[-\s]?amp|opamp|operational amplifier|inverting|non[-\s]?inverting|feedback)\b/i, "Op-amps"],
  [/\b(pole|zero|stability|left half plane|right half plane|complex plane|phase angle|euler|sigma\s*\+\s*j\s*omega)\b/i, "Poles and Zeros"],
  [/\b(laplace|s[-\s]?domain|inverse transform|partial fraction|initial condition|transfer function)\b/i, "Laplace Transform"],
  [/\b(network function|two[-\s]?port|one[-\s]?port|transfer parameter|network parameter)\b/i, "Network functions"],
  [/\b(phasor|sinusoid|impedance|admittance|reactance|ac power|rms|power factor|three[-\s]?phase|frequency[-\s]?domain)\b/i, "Frequency domain"],
  [/\b(first[-\s]?order|source[-\s]?free|natural response|time constant|charging|discharging)\b/i, "First-order circuits"],
  [/\b(transient|capacitor|inductor|second[-\s]?order|rc circuit|rl circuit|rlc)\b/i, "Transients"],
  [/\b(ohm|kcl|kvl|kirchhoff|nodal|mesh|supernode|supermesh|thevenin|norton|superposition|source transformation|max(imum)? power|voltage divider|current divider)\b/i, "Basic laws"],
];

// The ordered topic names for display, always including every registered topic
// plus an explicit Uncategorized bucket at the end.
export function orderedTopicNames() {
  return [...CHAT_TOPICS.map((t) => t.name), UNCATEGORIZED];
}

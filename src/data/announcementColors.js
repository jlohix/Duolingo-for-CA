// Colour palette for announcement accents. Each entry has an `accent` (the bar
// colour) and `on` (readable text colour to pair with it). Split into the app's
// own brand colours and a set of standard notice colours.

export const BRAND_COLORS = [
  { id: "green", label: "Brand green", accent: "#58cc02", on: "#ffffff" },
  { id: "red", label: "Alert red", accent: "#ff4b4b", on: "#ffffff" },
  { id: "streak", label: "Streak orange", accent: "#ff9600", on: "#ffffff" },
  { id: "xp", label: "XP gold", accent: "#ce8a00", on: "#ffffff" },
  { id: "neutral", label: "Neutral", accent: "#eef3ec", on: "#1c2b24" },
];

export const STANDARD_COLORS = [
  { id: "amber", label: "Amber", accent: "#ffd43b", on: "#4a3800" },
  { id: "blue", label: "Blue", accent: "#1cb0f6", on: "#ffffff" },
  { id: "purple", label: "Purple", accent: "#9b59b6", on: "#ffffff" },
  { id: "slate", label: "Slate", accent: "#2b2b35", on: "#ffffff" },
];

export const ALL_COLORS = [...BRAND_COLORS, ...STANDARD_COLORS];

// Default accent when an announcement has no colour set.
export const DEFAULT_ACCENT = "#ffd43b";

// Given a stored accent hex, return its paired text colour (falls back to a
// sensible default by rough luminance if it's an unknown custom value).
export function textOn(accent) {
  const hit = ALL_COLORS.find(
    (c) => c.accent.toLowerCase() === String(accent || "").toLowerCase()
  );
  if (hit) return hit.on;
  // Unknown colour: pick black/white by luminance.
  const hex = String(accent || "").replace("#", "");
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? "#1c2b24" : "#ffffff";
  }
  return "#1c2b24";
}

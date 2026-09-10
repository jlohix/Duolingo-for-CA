export const CLASS_COUNT = 22;
export const PART_TIME_CLASS = "EEPT";

export const CLASS_IDS = [
  ...Array.from(
    { length: CLASS_COUNT },
    (_, i) => `EE${String(i + 1).padStart(2, "0")}`
  ),
  PART_TIME_CLASS,
];

export const DEFAULT_CLASS = "EE01";

export function classLabel(classId) {
  const id = String(classId || "").toUpperCase();
  if (id === PART_TIME_CLASS) return "EEPT";
  return id;
}

export function isPartTimeClass(classId) {
  return String(classId || "").toUpperCase() === PART_TIME_CLASS;
}

export function normalizeClassId(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");
  if (
    raw === PART_TIME_CLASS ||
    raw === "PT" ||
    raw === "PARTTIME" ||
    raw === "PARTTIMESTUDENT" ||
    raw === "PARTTIMESTUDENTS"
  ) {
    return PART_TIME_CLASS;
  }
  const match = raw.match(/^EE0*([1-9]|1\d|2[0-2])$/);
  if (!match) return DEFAULT_CLASS;
  return `EE${String(Number(match[1])).padStart(2, "0")}`;
}

import { walkLessonKey } from "../state/progress";

const SECTION1 = [
  ["walk-lab-ohm", "R = V/I"],
  ["walk-lab-dividers", "Dividers"],
  ["walk-lab-branches", "Branch dividers"],
  ["walk-lab-power", "Power"],
  ["walk-lab-maxpower", "Max power"],
  ["walk-lab-nodal", "Nodal"],
  ["walk-lab-source-transformation", "Source Transformation"],
  ["walk-lab-mesh", "Mesh"],
  ["walk-lab-supermesh", "Supermesh"],
  ["walk-lab-supernode", "Supernode"],
  ["walk-lab-superposition", "Superposition"],
];

const SECTION2 = [
  ["opamp", "Op-amp: Real, Ideal, Feedback"],
  ["inverting", "Inverting Amp"],
  ["noninv", "Non-inverting Amp"],
  ["walk-lab-thevenin", "Thevenin"],
  ["walk-lab-norton", "Norton"],
  ["walk-lab-dependent", "Dependent sources"],
  ["walk-lab-invopamp", "Inverting Amp lab"],
  ["walk-lab-ninvopamp", "Non-inverting Amp lab"],
];

const SECTION3 = [
  ["capacitor", "Capacitor"],
  ["test-3-capacitor", "Capacitor test"],
  ["inductor", "Inductor"],
  ["test-3-inductor", "Inductor test"],
  ["freec", "Source-Free Capacitor"],
  ["test-3-freec", "Source-Free Capacitor test"],
  ["lsource", "Inductor with a Source"],
  ["test-3-lsource", "Inductor with a Source test"],
  ["walk-lab-dc", "DC capacitors and inductors"],
];

const SECTION4 = [
  ["freec", "Source-Free Capacitor"],
  ["freecq", "Source-Free Capacitor Practice"],
  ["freel", "Source-Free Inductor"],
  ["test-4-freel", "Source-Free Inductor test"],
  ["stepc", "Step Response of RC"],
  ["test-4-stepc", "Step Response of RC test"],
  ["stepl", "Step Response of RL"],
  ["test-4-stepl", "Step Response of RL test"],
];

const SECTION5 = [
  ["laplace-basics", "Laplace Basics"],
  ["laplace-circuit", "Laplace Circuit Application"],
  ["transfer-functions", "Transfer Functions"],
];

const SECTION6 = [
  ["poles-zeros-stability", "Zeros, Poles, and Stability"],
  ["complex-phase", "Complex Numbers and Phase Angles"],
];

function fromPairs(section, pairs) {
  return pairs.map(([idOrKey, title]) => {
    const key = idOrKey.startsWith("walk-") || idOrKey.startsWith("test-")
      ? idOrKey
      : walkLessonKey(section, idOrKey);
    return { key, title, section };
  });
}

export const WALK_TITLES = [
  ...fromPairs(1, SECTION1),
  ...fromPairs(2, SECTION2),
  ...fromPairs(3, SECTION3.filter(([id]) => !id.startsWith("walk-"))),
  ...SECTION3.filter(([id]) => id.startsWith("walk-")).map(([key, title]) => ({
    key,
    title,
    section: 3,
  })),
  ...fromPairs(4, SECTION4),
  ...fromPairs(5, SECTION5),
  ...fromPairs(6, SECTION6),
];

const TITLE_BY_KEY = new Map(WALK_TITLES.map((row) => [row.key, row]));

export function walkTitleForKey(key) {
  return TITLE_BY_KEY.get(key)?.title || key;
}

export function summarizeWalkFeedback(students) {
  const tallies = new Map(
    WALK_TITLES.map((row) => [
      row.key,
      { ...row, up: 0, down: 0, voters: [] },
    ])
  );
  for (const student of students || []) {
    const votes = student.walkFeedback || {};
    for (const [key, vote] of Object.entries(votes)) {
      if (vote !== "up" && vote !== "down") continue;
      if (!tallies.has(key)) {
        tallies.set(key, {
          key,
          title: walkTitleForKey(key),
          section: "",
          up: 0,
          down: 0,
          voters: [],
        });
      }
      const row = tallies.get(key);
      if (vote === "up") row.up += 1;
      else row.down += 1;
      row.voters.push({
        name: student.display || student.username,
        vote,
      });
    }
  }
  return [...tallies.values()].sort((a, b) => {
    const aN = a.up + a.down;
    const bN = b.up + b.down;
    if (bN !== aN) return bN - aN;
    const sec = Number(a.section) - Number(b.section);
    if (sec) return sec;
    return a.title.localeCompare(b.title);
  });
}

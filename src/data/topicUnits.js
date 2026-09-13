import { DIFFICULTIES, lessonKey, TOPICS } from "./topics";
import { QUESTION_BANKS, bankLessonKey } from "./questionBanks";
import { WALK_TITLES } from "./walkTitles";

/** Not wired on Learn, so Profile/Progress should not list it. */
const HIDDEN_WALK_KEYS = new Set(["walk-lab-dc"]);

function walkKind(walk) {
  if (walk.key.startsWith("test-")) return "test";
  if (walk.key.endsWith("q") || /practice/i.test(walk.title)) return "practice";
  return "walk";
}

function sectionForBank(bank) {
  const walk = WALK_TITLES.find((row) => row.key === bank.walkthroughKey);
  return walk?.section || bank.topicId;
}

function pushBankUnits(units, bank, bankCounts) {
  for (const diff of DIFFICULTIES) {
    const key = bankLessonKey(bank.id, diff.id);
    const n = bankCounts[key] || 0;
    if (!n) continue;
    units.push({
      key,
      label: `${bank.title} · ${diff.name}`,
      kind: "bank",
      n,
    });
  }
}

export function unitsForTopic(topicId, counts = {}, bankCounts = {}) {
  const units = [];
  const placedBanks = new Set();

  for (const walk of WALK_TITLES) {
    if (walk.section !== topicId) continue;
    if (HIDDEN_WALK_KEYS.has(walk.key)) continue;
    units.push({
      key: walk.key,
      label: walk.title,
      kind: walkKind(walk),
    });
    const bank = QUESTION_BANKS.find((row) => row.walkthroughKey === walk.key);
    if (bank) {
      placedBanks.add(bank.id);
      pushBankUnits(units, bank, bankCounts);
    }
  }

  for (const diff of DIFFICULTIES) {
    const key = lessonKey(topicId, diff.id);
    const n = counts[key] || 0;
    if (!n) continue;
    units.push({
      key,
      label: diff.name,
      kind: "quiz",
      n,
    });
  }

  for (const bank of QUESTION_BANKS) {
    if (placedBanks.has(bank.id)) continue;
    if (sectionForBank(bank) !== topicId) continue;
    pushBankUnits(units, bank, bankCounts);
  }

  return units;
}

export function topicsWithQuestions(topics = TOPICS, counts = {}, bankCounts = {}) {
  return topics.filter(
    (topic) => unitsForTopic(topic.id, counts, bankCounts).length > 0
  );
}

export function unitPillText(unit, done) {
  if (done) return `${unit.label} · done`;
  if (unit.kind === "walk") return `${unit.label} · walkthrough`;
  if (unit.kind === "test") return `${unit.label} · test`;
  if (unit.kind === "practice") return `${unit.label} · quiz + drag`;
  if (unit.kind === "bank") return `${unit.label} · step-by-step`;
  if (unit.n) return `${unit.label} · ${unit.n} Qs`;
  return unit.label;
}

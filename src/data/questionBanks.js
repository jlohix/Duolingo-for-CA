export const QUESTION_BANKS = [
  {
    id: "source-transformation",
    title: "Source Transformation",
    csv: "SourceTransformation.csv",
    assetFolder: "st",
    walkthroughKey: "walk-lab-source-transformation",
    topicId: 1,
  },
  {
    id: "thevenin",
    title: "Thevenin",
    csv: "Thevenin.csv",
    assetFolder: "thevenin",
    walkthroughKey: "walk-lab-thevenin",
    topicId: 1,
  },
  {
    id: "norton",
    title: "Norton",
    csv: "Norton.csv",
    assetFolder: "norton",
    walkthroughKey: "walk-lab-norton",
    topicId: 1,
  },
  {
    id: "max-power",
    title: "Max power",
    csv: "maxp.csv",
    assetFolder: "maxp",
    walkthroughKey: "walk-lab-maxpower",
    topicId: 1,
  },
  {
    id: "superposition",
    title: "Superposition",
    csv: "superposition.csv",
    assetFolder: "sp",
    walkthroughKey: "walk-lab-superposition",
    topicId: 1,
  },
  {
    id: "opamp",
    title: "Op-amp",
    csv: "Opamp.csv",
    assetFolder: "opamp",
    walkthroughKey: "walk-lab-invopamp",
    topicId: 2,
  },
];

/** Asset folders we ship under public/question-bank/ */
export const LOCAL_BANK_FOLDERS = new Set(["st", "thevenin", "sp"]);

export function questionBankForId(id) {
  return QUESTION_BANKS.find((bank) => bank.id === id);
}

export function bankLessonKey(bankId, difficulty) {
  return `bank-${bankId}-${difficulty}`;
}

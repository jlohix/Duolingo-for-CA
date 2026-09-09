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
    id: "superposition",
    title: "Superposition",
    csv: "superposition.csv",
    assetFolder: "sp",
    walkthroughKey: "walk-lab-superposition",
    topicId: 1,
  },
];

export function questionBankForId(id) {
  return QUESTION_BANKS.find((bank) => bank.id === id);
}

export function bankLessonKey(bankId, difficulty) {
  return `bank-${bankId}-${difficulty}`;
}

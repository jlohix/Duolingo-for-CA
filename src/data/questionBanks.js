export const QUESTION_BANKS = [
  {
    id: "ohms-law",
    title: "Ohm's law",
    csv: "ohmslaw.csv",
    assetFolder: "ohmslaw",
    walkthroughKey: "walk-lab-ohm",
    topicId: 1,
  },
  {
    id: "kcl-kvl",
    title: "KCL/KVL",
    csv: "kclkvl.csv",
    assetFolder: "kclkvl",
    walkthroughKey: "walk-lab-ohm",
    topicId: 1,
  },
  {
    id: "power",
    title: "Power",
    csv: "power.csv",
    assetFolder: "power",
    walkthroughKey: "walk-lab-power",
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
    id: "nodal-mesh",
    title: "Nodal & mesh",
    csv: "nmanalysis.csv",
    assetFolder: "nmanalysis",
    walkthroughKey: "walk-lab-mesh",
    topicId: 1,
  },
  {
    id: "supernode",
    title: "Supernode",
    csv: "supernode.csv",
    assetFolder: "supernode",
    walkthroughKey: "walk-lab-supernode",
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
  {
    id: "transients",
    title: "Transients",
    csv: "Transient.csv",
    assetFolder: "transients",
    walkthroughKey: "test-3-lsource",
    topicId: 3,
  },
];

/** Asset folders we ship under public/question-bank/ */
export const LOCAL_BANK_FOLDERS = new Set([
  "st",
  "thevenin",
  "sp",
  "opamp",
  "transients",
  "kclkvl",
]);

export function questionBankForId(id) {
  return QUESTION_BANKS.find((bank) => bank.id === id);
}

export function bankLessonKey(bankId, difficulty) {
  return `bank-${bankId}-${difficulty}`;
}

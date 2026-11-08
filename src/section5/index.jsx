import { useMemo } from "react";
import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Lesson from "../pages/Lesson";
import Section5Schematic from "./WalkSchematics";
import { BASICS, CIRCUIT, TRANSFER } from "./labs";
import { walkLessonKey } from "../state/progress";
import { questionsForBank } from "../data/loadQuestions";

// The three question banks that belong to Section 5
const SECTION5_BANK_IDS = ["lapbasics", "laplaceinca", "laptransf"];

export const SECTION5_LABS = [
  {
    id: "laplace-basics",
    title: "Laplace Basics",
    icon: "L",
    count: "Walkthrough",
    boardHint: "",
    formula: "$f(t)\\Longleftrightarrow F(s)$",
    doneBlurb: "Use transform pairs and properties to move between time and s.",
    steps: BASICS.steps,
    practice: [],
  },
  {
    id: "laplace-circuit",
    title: "Laplace Circuit Application",
    icon: "s",
    count: "Walkthrough",
    boardHint: "",
    formula: "$Z_R=R,\\;Z_L=sL,\\;Z_C=1/(sC)$",
    doneBlurb: "Transform the circuit, solve it with normal circuit laws, then invert.",
    steps: CIRCUIT.steps,
    practice: [],
  },
  {
    id: "transfer-functions",
    title: "Transfer Functions",
    icon: "H",
    count: "Walkthrough",
    boardHint: "",
    formula: "$H(s)=Y(s)/X(s)$",
    doneBlurb: "H(s) describes how a zero-initial-condition circuit maps input to output.",
    steps: TRANSFER.steps,
    practice: [],
  },
  // Combined step-by-step nodes: one per difficulty, merging all 3 banks
  {
    id: "laplace-easy",
    title: "Easy",
    icon: "1",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$f(t)\\Longleftrightarrow F(s)$",
    doneBlurb: "Easy questions across Laplace Basics, Circuit Application and Transfer Functions.",
    combinedBanks: SECTION5_BANK_IDS,
    difficultyId: 1,
    difficultyName: "Easy",
    topicName: "Laplace Transform",
    showBack: true,
  },
  {
    id: "laplace-average",
    title: "Average",
    icon: "2",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$H(s)=Y(s)/X(s)$",
    doneBlurb: "Average questions across Laplace Basics, Circuit Application and Transfer Functions.",
    combinedBanks: SECTION5_BANK_IDS,
    difficultyId: 2,
    difficultyName: "Average",
    topicName: "Laplace Transform",
    showBack: true,
  },
  {
    id: "laplace-challenging",
    title: "Challenging",
    icon: "3",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$H(s)=Y(s)/X(s)$",
    doneBlurb: "Challenging questions across Laplace Basics, Circuit Application and Transfer Functions.",
    combinedBanks: SECTION5_BANK_IDS,
    difficultyId: 3,
    difficultyName: "Challenging",
    topicName: "Laplace Transform",
    showBack: true,
  },
];

export const section5Catalog = makeCatalog("Laplace Transform", SECTION5_LABS);

export default function Section5Lesson({ labId, allQuestions, onExit, onContinue, ...rest }) {
  const lab = section5Catalog.getLab(labId);

  // Build a merged pack from all 3 Section 5 banks for the given difficulty
  const combinedPack = useMemo(() => {
    if (!lab.combinedBanks || !allQuestions?.length) return null;
    const merged = lab.combinedBanks.flatMap((bankId) =>
      questionsForBank(allQuestions, bankId, lab.difficultyId)
    );
    return {
      key: `section5-${lab.id}`,
      topicName: lab.topicName,
      difficultyName: lab.difficultyName,
      questions: merged,
    };
  }, [lab, allQuestions]);

  if (lab.combinedBanks) {
    if (!combinedPack || combinedPack.questions.length === 0) {
      // Questions not yet loaded — return nothing (App will re-render once loaded)
      return null;
    }
    return (
      <Lesson
        pack={combinedPack}
        topicId={5}
        progress={rest.progress}
        setProgress={rest.setProgress}
        preview={rest.preview}
        showBack={rest.showBack !== undefined ? rest.showBack : lab.showBack}
        onBack={rest.onBack}
        onExit={onExit}
        onFinished={rest.onFinished}
      />
    );
  }

  return (
    <WalkLesson
      labId={labId}
      catalog={section5Catalog}
      Schematic={Section5Schematic}
      topicId={5}
      section={5}
      onExit={onExit}
      onContinue={onContinue}
      walkKey={walkLessonKey(5, lab.id)}
      {...rest}
    />
  );
}

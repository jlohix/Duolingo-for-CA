import { useMemo } from "react";
import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Lesson from "../pages/Lesson";
import Section6Schematic from "./Schematics";
import { POLES, PHASE } from "./labs";
import { walkLessonKey } from "../state/progress";
import { questionsForBank } from "../data/loadQuestions";

const SECTION6_BANK_IDS = ["poles", "complexlap"];

export const SECTION6_LABS = [
  {
    id: "poles-zeros-stability",
    title: "Zeros, Poles, and Stability",
    icon: "x/o",
    count: "Walkthrough",
    boardHint: "",
    formula: "$H(s)=N(s)/D(s)$",
    doneBlurb: "Zeros come from N(s); poles come from D(s); LHP poles decay.",
    steps: POLES.steps,
    practice: [],
  },
  {
    id: "complex-phase",
    title: "Complex Numbers and Phase Angles",
    icon: "j",
    count: "Walkthrough",
    boardHint: "",
    formula: "$s=\\sigma+j\\omega$",
    doneBlurb: "Magnitude scales amplitude; angle shifts phase.",
    steps: PHASE.steps,
    practice: [],
  },
  {
    id: "poles-easy",
    title: "Easy",
    icon: "1",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$H(s)=N(s)/D(s)$",
    doneBlurb: "Easy questions across Poles & Zeros and Complex Impedance.",
    combinedBanks: SECTION6_BANK_IDS,
    difficultyId: 1,
    difficultyName: "Easy",
    topicName: "Poles and Zeros",
    showBack: true,
  },
  {
    id: "poles-average",
    title: "Average",
    icon: "2",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$H(s)=N(s)/D(s)$",
    doneBlurb: "Average questions across Poles & Zeros and Complex Impedance.",
    combinedBanks: SECTION6_BANK_IDS,
    difficultyId: 2,
    difficultyName: "Average",
    topicName: "Poles and Zeros",
    showBack: true,
  },
  {
    id: "poles-challenging",
    title: "Challenging",
    icon: "3",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$H(s)=N(s)/D(s)$",
    doneBlurb: "Challenging questions across Poles & Zeros and Complex Impedance.",
    combinedBanks: SECTION6_BANK_IDS,
    difficultyId: 3,
    difficultyName: "Challenging",
    topicName: "Poles and Zeros",
    showBack: true,
  },
];

export const section6Catalog = makeCatalog("Poles and Zeros", SECTION6_LABS);

export default function Section6Lesson({ labId, allQuestions, onExit, onContinue, ...rest }) {
  const lab = section6Catalog.getLab(labId);

  const combinedPack = useMemo(() => {
    if (!lab.combinedBanks || !allQuestions?.length) return null;
    const merged = lab.combinedBanks.flatMap((bankId) =>
      questionsForBank(allQuestions, bankId, lab.difficultyId)
    );
    return {
      key: `section6-${lab.id}`,
      topicName: lab.topicName,
      difficultyName: lab.difficultyName,
      questions: merged,
    };
  }, [lab, allQuestions]);

  if (lab.combinedBanks) {
    if (!combinedPack || combinedPack.questions.length === 0) return null;
    return (
      <Lesson
        pack={combinedPack}
        topicId={6}
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
      catalog={section6Catalog}
      Schematic={Section6Schematic}
      topicId={6}
      section={6}
      onExit={onExit}
      onContinue={onContinue}
      walkKey={walkLessonKey(6, lab.id)}
      {...rest}
    />
  );
}

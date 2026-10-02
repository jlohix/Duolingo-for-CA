import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Section4Schematic from "./Schematics";
import FreeCQuizDragBoard from "./FreeCQuizDragBoard";
import FreeLQuizDragBoard from "./FreeLQuizDragBoard";
import StepCQuizDragBoard from "./StepCQuizDragBoard";
import StepLQuizDragBoard from "./StepLQuizDragBoard";
import { FREEC, FREEL, STEPRC, STEPRL } from "./labs";
import {
  FREEC_QUIZ,
  FREEC_QUIZ_DRAG,
  freeCQuizDragLabel,
  freeCQuizDragPrompt,
} from "../data/freeCQuizLab";
import {
  FREEL_QUIZ,
  FREEL_QUIZ_DRAG,
  freeLQuizDragLabel,
  freeLQuizDragPrompt,
} from "../data/freeLQuizLab";
import {
  STEPC_QUIZ,
  STEPC_QUIZ_DRAG,
  stepCQuizDragLabel,
  stepCQuizDragPrompt,
} from "../data/stepCQuizLab";
import {
  STEPL_QUIZ,
  STEPL_QUIZ_DRAG,
  stepLQuizDragLabel,
  stepLQuizDragPrompt,
} from "../data/stepLQuizLab";
import { testForLab, testGroupCount } from "./advancedPractice";
import { AdvancedPracticeBoard } from "./AdvancedPracticeSchematics";
import { walkLessonKey } from "../state/progress";

function testLab(id, title, icon, formula, doneBlurb) {
  const questions = testForLab(id);
  return {
    id: `${id}-test`,
    progressId: id,
    testOnly: true,
    title: `${title} test`,
    icon,
    count: `${testGroupCount(questions)} Qs · XP`,
    formula,
    doneBlurb,
    standalonePractice: questions,
    PracticeBoard: AdvancedPracticeBoard,
  };
}

function withPractice(walkPractice, quiz, prefix) {
  return [
    ...walkPractice,
    ...quiz.map((question) => ({ ...question, id: `${prefix}-${question.id}` })),
  ];
}

export const SECTION4_LABS = [
  {
    id: "freec",
    title: "Source-Free Capacitor",
    icon: "τC",
    count: "Walkthrough",
    boardHint: "",
    formula: "$v(t)=v(0)e^{-t/RC}$",
    doneBlurb: "Reduce the network to one R if you need to.",
    steps: FREEC.steps,
    practice: FREEC.practice,
  },
  {
    id: "freecq",
    title: "Source-Free Capacitor Practice",
    icon: "C?",
    count: "5 quiz + 5 drag",
    boardHint: "",
    formula: "$v(t)=v(0)e^{-t/RC}$",
    doneBlurb: "Use the R that C actually sees. τ is the 1/e time.",
    practice: FREEC_QUIZ,
    drag: FREEC_QUIZ_DRAG,
    DragBoard: FreeCQuizDragBoard,
    dragPrompt: freeCQuizDragPrompt,
    dragLabel: freeCQuizDragLabel,
    dragHint: "Hold a value and drop it on the gap, or tap it.",
  },
  {
    id: "freel",
    title: "Source-Free Inductor",
    icon: "τL",
    count: "Walkthrough",
    boardHint: "",
    formula: "$i(t)=i(0)e^{-(R/L)t}$",
    doneBlurb: "Dual of the capacitor dump.",
    steps: FREEL.steps,
    practice: withPractice(FREEL.practice, FREEL_QUIZ, "quiz"),
    drag: FREEL_QUIZ_DRAG,
    DragBoard: FreeLQuizDragBoard,
    dragPrompt: freeLQuizDragPrompt,
    dragLabel: freeLQuizDragLabel,
    dragHint: "Hold a value and drop it on the gap, or tap it.",
  },
  testLab(
    "freel",
    "Source-Free Inductor",
    "τL?",
    "$i(t)=i(0)e^{-t/\\tau},\\ \\tau=L/R_{th}$",
    "iL cannot jump. Find the R that L sees after switching."
  ),
  {
    id: "stepc",
    title: "Step Response of RC",
    icon: "uC",
    count: "Walkthrough",
    boardHint: "",
    formula: "$v=V_s+(V_0-V_s)e^{-t/\\tau}$",
    doneBlurb: "Rest case is Vs (1 − e^{−t/τ}).",
    steps: STEPRC.steps,
    practice: withPractice(STEPRC.practice, STEPC_QUIZ, "quiz"),
    drag: STEPC_QUIZ_DRAG,
    DragBoard: StepCQuizDragBoard,
    dragPrompt: stepCQuizDragPrompt,
    dragLabel: stepCQuizDragLabel,
    dragHint: "Hold a value and drop it on the gap, or tap it.",
  },
  testLab(
    "stepc",
    "Step Response of RC",
    "uC?",
    "$v_C(t)=v_C(\\infty)+[v_C(0^+)-v_C(\\infty)]e^{-t/\\tau}$",
    "vC cannot jump. Final value from the DC circuit, τ = Rth·C."
  ),
  {
    id: "stepl",
    title: "Step Response of RL",
    icon: "uL",
    count: "Walkthrough",
    boardHint: "",
    formula: "$i=V_s/R+(I_0-V_s/R)e^{-t/\\tau}$",
    doneBlurb: "Same DE as inductor-with-source.",
    steps: STEPRL.steps,
    practice: withPractice(STEPRL.practice, STEPL_QUIZ, "quiz"),
    drag: STEPL_QUIZ_DRAG,
    DragBoard: StepLQuizDragBoard,
    dragPrompt: stepLQuizDragPrompt,
    dragLabel: stepLQuizDragLabel,
    dragHint: "Hold a value and drop it on the gap, or tap it.",
  },
  testLab(
    "stepl",
    "Step Response of RL",
    "uL?",
    "$i_L(t)=i_L(\\infty)+[i_L(0^+)-i_L(\\infty)]e^{-t/\\tau}$",
    "iL cannot jump. Final value from the DC circuit, τ = L/Rth."
  ),
];

export const section4Catalog = makeCatalog("First-order circuits", SECTION4_LABS);

export default function Section4Lesson({ labId, onExit, onContinue, ...rest }) {
  const lab = section4Catalog.getLab(labId);
  return (
    <WalkLesson
      labId={labId}
      catalog={section4Catalog}
      Schematic={Section4Schematic}
      topicId={4}
      section={4}
      onExit={onExit}
      onContinue={onContinue}
      walkKey={lab.testOnly ? undefined : walkLessonKey(4, lab.id)}
      {...rest}
    />
  );
}

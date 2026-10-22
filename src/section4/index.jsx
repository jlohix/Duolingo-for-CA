import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Lesson from "../pages/Lesson";
import Section4Schematic from "./Schematics";
import FreeCQuizDragBoard from "./FreeCQuizDragBoard";
import FreeLQuizDragBoard from "./FreeLQuizDragBoard";
import StepCQuizDragBoard from "./StepCQuizDragBoard";
import StepLQuizDragBoard from "./StepLQuizDragBoard";
import { FREEC, FREEL, STEPRC, STEPRL } from "./labs";
import { FOC_EASY, FOC_AVERAGE, FOC_CHALLENGING } from "./focLabs";
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
    title: `${title} Test`,
    icon,
    count: `${testGroupCount(questions)} Qs · XP`,
    formula,
    doneBlurb,
    standalonePractice: questions,
    PracticeBoard: AdvancedPracticeBoard,
    showBack: true,
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
    showBack: true,
  },
  {
    id: "freecq",
    progressId: "freecq",
    testOnly: true,
    title: "Source-Free Capacitor Test",
    icon: "C?",
    count: `${FREEC_QUIZ.length} Qs · XP`,
    boardHint: "",
    formula: "$v(t)=v(0)e^{-t/RC}$",
    doneBlurb: "Use the R that C actually sees. τ is the 1/e time.",
    standalonePractice: FREEC_QUIZ,
    PracticeBoard: Section4Schematic,
    showBack: true,
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
    showBack: true,
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
    showBack: true,
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
    showBack: true,
  },
  testLab(
    "stepl",
    "Step Response of RL",
    "uL?",
    "$i_L(t)=i_L(\\infty)+[i_L(0^+)-i_L(\\infty)]e^{-t/\\tau}$",
    "iL cannot jump. Final value from the DC circuit, τ = L/Rth."
  ),
  {
    id: "foc-easy",
    title: "Easy",
    icon: "1",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$v_C(t)=v_C(0)e^{-t/\\tau}$",
    doneBlurb: "Source-free RC discharge: voltage decays through one R.",
    pack: FOC_EASY,
    showBack: true,
  },
  {
    id: "foc-average",
    title: "Average",
    icon: "2",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$i_L(t)=i_L(0)e^{-t/\\tau},\\ \\tau=L/R$",
    doneBlurb: "Source-free RL discharge: current decays, cannot jump.",
    pack: FOC_AVERAGE,
    showBack: true,
  },
  {
    id: "foc-challenging",
    title: "Challenging",
    icon: "3",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$v_C(t)=v_C(\\infty)+[v_C(0)-v_C(\\infty)]e^{-t/\\tau}$",
    doneBlurb: "RC step response: charge from initial toward final value.",
    pack: FOC_CHALLENGING,
    showBack: true,
  },
];

export const section4Catalog = makeCatalog("First-order circuits", SECTION4_LABS);

export default function Section4Lesson({ labId, onExit, onContinue, ...rest }) {
  const lab = section4Catalog.getLab(labId);
  if (lab.pack) {
    // FOC step-by-step subsections run as a quiz (progress bar + leave prompt).
    return (
      <Lesson
        pack={lab.pack}
        topicId={4}
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

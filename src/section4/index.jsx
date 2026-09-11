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
    practice: FREEL.practice,
  },
  {
    id: "freelq",
    title: "Source-Free Inductor Practice",
    icon: "L?",
    count: "5 quiz + 5 drag",
    boardHint: "",
    formula: "$i(t)=i(0)e^{-(R/L)t}$",
    doneBlurb: "Use the R that L actually sees. τ = L/R is the 1/e time.",
    practice: FREEL_QUIZ,
    drag: FREEL_QUIZ_DRAG,
    DragBoard: FreeLQuizDragBoard,
    dragPrompt: freeLQuizDragPrompt,
    dragLabel: freeLQuizDragLabel,
    dragHint: "Hold a value and drop it on the gap, or tap it.",
  },
  {
    id: "stepc",
    title: "Step Response of RC",
    icon: "uC",
    count: "Walkthrough",
    boardHint: "",
    formula: "$v=V_s+(V_0-V_s)e^{-t/\\tau}$",
    doneBlurb: "Rest case is Vs (1 − e^{−t/τ}).",
    steps: STEPRC.steps,
    practice: STEPRC.practice,
  },
  {
    id: "stepcq",
    title: "Step Response of RC Practice",
    icon: "RC?",
    count: "5 quiz + 5 drag",
    boardHint: "",
    formula: "$v=V_s+(V_0-V_s)e^{-t/\\tau}$",
    doneBlurb: "v cannot jump. Forced value is Vs. From rest, climb 63% by τ.",
    practice: STEPC_QUIZ,
    drag: STEPC_QUIZ_DRAG,
    DragBoard: StepCQuizDragBoard,
    dragPrompt: stepCQuizDragPrompt,
    dragLabel: stepCQuizDragLabel,
    dragHint: "Hold a value and drop it on the gap, or tap it.",
  },
  {
    id: "stepl",
    title: "Step Response of RL",
    icon: "uL",
    count: "Walkthrough",
    boardHint: "",
    formula: "$i=V_s/R+(I_0-V_s/R)e^{-t/\\tau}$",
    doneBlurb: "Same DE as inductor-with-source.",
    steps: STEPRL.steps,
    practice: STEPRL.practice,
  },
  {
    id: "steplq",
    title: "Step Response of RL Practice",
    icon: "RL?",
    count: "5 quiz + 5 drag",
    boardHint: "",
    formula: "$i=V_s/R+(I_0-V_s/R)e^{-t/\\tau}$",
    doneBlurb: "i cannot jump. Forced value is Vs/R. From rest, climb 63% by τ.",
    practice: STEPL_QUIZ,
    drag: STEPL_QUIZ_DRAG,
    DragBoard: StepLQuizDragBoard,
    dragPrompt: stepLQuizDragPrompt,
    dragLabel: stepLQuizDragLabel,
    dragHint: "Hold a value and drop it on the gap, or tap it.",
  },
];

export const section4Catalog = makeCatalog("First-order circuits", SECTION4_LABS);

export default function Section4Lesson({ labId, onExit, onContinue, ...rest }) {
  return (
    <WalkLesson
      labId={labId}
      catalog={section4Catalog}
      Schematic={Section4Schematic}
      topicId={4}
      section={4}
      onExit={onExit}
      onContinue={onContinue}
      {...rest}
    />
  );
}

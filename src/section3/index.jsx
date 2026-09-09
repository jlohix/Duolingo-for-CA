import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Section3Schematic from "./Schematics";
import { CAPACITOR, INDUCTOR, FREEC, LSOURCE } from "./labs";
import { practiceForLab } from "./practice";
import { PracticeBoard as Section3PracticeBoard } from "./PracticeSchematics";
import { walkLessonKey } from "../state/progress";

function testLab(id, title, icon, formula, doneBlurb) {
  const questions = practiceForLab(id);
  return {
    id: `${id}-test`,
    progressId: id,
    testOnly: true,
    title: `${title} test`,
    icon,
    count: `${questions.length} Qs · XP`,
    formula,
    doneBlurb,
    standalonePractice: questions,
    PracticeBoard: Section3PracticeBoard,
  };
}

export const SECTION3_LABS = [
  {
    id: "capacitor",
    title: "Capacitor",
    icon: "C",
    count: "Walkthrough",
    boardHint: "The formula sits next to C on the board.",
    formula: "$i=C\\,dv/dt$",
    doneBlurb: "In DC, C is an open.",
    steps: CAPACITOR.steps,
    practice: CAPACITOR.practice,
  },
  testLab("capacitor", "Capacitor", "C?", "$i=C\\,dv/dt$", "In DC, C is an open."),
  {
    id: "inductor",
    title: "Inductor",
    icon: "L",
    count: "Walkthrough",
    boardHint: "v = L di/dt. DC short. Energy ½Li².",
    formula: "$v=L\\,di/dt$",
    doneBlurb: "In DC, L is a short.",
    steps: INDUCTOR.steps,
    practice: INDUCTOR.practice,
  },
  testLab("inductor", "Inductor", "L?", "$v=L\\,di/dt$", "In DC, L is a short."),
  {
    id: "freec",
    title: "Source-Free Capacitor",
    icon: "τC",
    count: "Walkthrough",
    boardHint: "v(t) = v(0) e^{−t/τ}, τ = RC.",
    formula: "$v(t)=v(0)e^{-t/RC}$",
    doneBlurb: "τ is the 1/e time.",
    steps: FREEC.steps,
    practice: FREEC.practice,
  },
  testLab(
    "freec",
    "Source-Free Capacitor",
    "τC?",
    "$v(t)=v(0)e^{-t/RC}$",
    "τ is the 1/e time."
  ),
  {
    id: "lsource",
    title: "Inductor with a Source",
    icon: "τL",
    count: "Walkthrough",
    boardHint: "i(∞) = Vs/R. τ = L/R.",
    formula: "$i=V_s/R+(I_0-V_s/R)e^{-t/\\tau}$",
    doneBlurb: "Current cannot jump at t = 0.",
    steps: LSOURCE.steps,
    practice: LSOURCE.practice,
  },
  testLab(
    "lsource",
    "Inductor with a Source",
    "τL?",
    "$i=V_s/R+(I_0-V_s/R)e^{-t/\\tau}$",
    "Current cannot jump at t = 0."
  ),
];

export const section3Catalog = makeCatalog("Transients", SECTION3_LABS);

export default function Section3Lesson({ labId, onExit, ...rest }) {
  const lab = section3Catalog.getLab(labId);
  return (
    <WalkLesson
      labId={labId}
      catalog={section3Catalog}
      Schematic={Section3Schematic}
      topicId={3}
      section={3}
      onExit={onExit}
      walkKey={lab.testOnly ? undefined : walkLessonKey(3, lab.id)}
      {...rest}
    />
  );
}

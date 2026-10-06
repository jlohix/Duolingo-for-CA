import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Section6Schematic from "./Schematics";
import { POLES, PHASE } from "./labs";
import { walkLessonKey } from "../state/progress";

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
];

export const section6Catalog = makeCatalog("Poles and Zeros", SECTION6_LABS);

export default function Section6Lesson({ labId, onExit, onContinue, ...rest }) {
  const lab = section6Catalog.getLab(labId);
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

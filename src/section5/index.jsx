import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Section5Schematic from "./WalkSchematics";
import { BASICS, CIRCUIT, TRANSFER } from "./labs";
import { walkLessonKey } from "../state/progress";

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
];

export const section5Catalog = makeCatalog("Laplace Transform", SECTION5_LABS);

export default function Section5Lesson({ labId, onExit, onContinue, ...rest }) {
  const lab = section5Catalog.getLab(labId);
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

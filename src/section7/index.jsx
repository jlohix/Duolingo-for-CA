import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Section7Schematic from "./Schematics";
import { TYPES, RESPONSES, STEADY } from "./labs";
import { walkLessonKey } from "../state/progress";

export const SECTION7_LABS = [
  {
    id: "network-function-types",
    title: "Network Functions and Types",
    icon: "H",
    count: "Walkthrough",
    boardHint: "",
    formula: "$H(s)=Y(s)/X(s)$",
    doneBlurb:
      "Choose the input-output ratio that matches the response you care about.",
    steps: TYPES.steps,
    practice: [],
  },
  {
    id: "network-responses",
    title: "Impulse and Step Response",
    icon: "du",
    count: "Walkthrough",
    boardHint: "",
    formula: "$Y(s)=H(s)X(s)$",
    doneBlurb:
      "Use H(s) with an impulse or step input to obtain the time response.",
    steps: RESPONSES.steps,
    practice: [],
  },
  {
    id: "steady-state-response",
    title: "DC and AC Steady-State",
    icon: "ss",
    count: "Walkthrough",
    boardHint: "",
    formula:
      "$y_{ss}(t)=A|H(j\\omega)|\\cos(\\omega t+\\phi+\\angle H(j\\omega))$",
    doneBlurb:
      "Read stable DC and sinusoidal steady-state behavior directly from H(s).",
    steps: STEADY.steps,
    practice: [],
  },
];

export const section7Catalog = makeCatalog("Network Functions", SECTION7_LABS);

export default function Section7Lesson({ labId, onExit, onContinue, ...rest }) {
  const lab = section7Catalog.getLab(labId);
  return (
    <WalkLesson
      labId={labId}
      catalog={section7Catalog}
      Schematic={Section7Schematic}
      topicId={7}
      section={7}
      onExit={onExit}
      onContinue={onContinue}
      walkKey={walkLessonKey(7, lab.id)}
      {...rest}
    />
  );
}

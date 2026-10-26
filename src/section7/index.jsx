import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Lesson from "../pages/Lesson";
import Section7Schematic from "./Schematics";
import { TYPES, RESPONSES, STEADY } from "./labs";
import { NETFUNC_EASY, NETFUNC_AVERAGE, NETFUNC_CHALLENGING } from "./networkFuncLabs";
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
  {
    id: "netfunc-easy",
    title: "Network Functions Easy",
    icon: "1",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$H(s)=Y(s)/X(s)$",
    doneBlurb: "Driving-point impedance and finite poles and zeros.",
    pack: NETFUNC_EASY,
    showBack: true,
  },
  {
    id: "netfunc-average",
    title: "Network Functions Average",
    icon: "2",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$H(s)=V_o(s)/V_g(s)$",
    doneBlurb: "RC ladder transfer functions and op-amp responses.",
    pack: NETFUNC_AVERAGE,
    showBack: true,
  },
  {
    id: "netfunc-challenging",
    title: "Network Functions Challenging",
    icon: "3",
    count: "Step-by-step question",
    boardHint: "",
    formula: "$y_{ss}(t)=A|H(j\\omega)|\\cos(\\omega t+\\phi+\\angle H(j\\omega))$",
    doneBlurb: "Pole-zero synthesis, steady-state response and bandpass stability.",
    pack: NETFUNC_CHALLENGING,
    showBack: true,
  },
];

export const section7Catalog = makeCatalog("Network Functions", SECTION7_LABS);

export default function Section7Lesson({ labId, onExit, onContinue, ...rest }) {
  const lab = section7Catalog.getLab(labId);
  if (lab.pack) {
    // Network-function step-by-step subsections run as a quiz
    // (progress bar + leave prompt), matching the other sections.
    return (
      <Lesson
        pack={lab.pack}
        topicId={7}
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

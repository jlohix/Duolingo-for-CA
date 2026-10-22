import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import Section8Schematic from "./Schematics";
import { BASICS, Y, Z, HABCD, RELATIONS, INTERCONNECT } from "./labs";
import { walkLessonKey } from "../state/progress";

export const SECTION8_LABS = [
  {
    id: "two-port-basics",
    title: "Ports and Two-Port Basics",
    icon: "2P",
    count: "Walkthrough",
    boardHint: "",
    formula: "$V_1, I_1, V_2, I_2$",
    doneBlurb:
      "Treat a complicated linear network as a black box described at its ports.",
    steps: BASICS.steps,
    practice: [],
  },
  {
    id: "y-parameters",
    title: "Y Parameters",
    icon: "Y",
    count: "Walkthrough",
    boardHint: "",
    formula: "$[I]=[Y][V]$",
    doneBlurb:
      "Use short-circuit tests to describe a two-port with admittance parameters.",
    steps: Y.steps,
    practice: [],
  },
  {
    id: "z-parameters",
    title: "Z Parameters",
    icon: "Z",
    count: "Walkthrough",
    boardHint: "",
    formula: "$[V]=[Z][I]$",
    doneBlurb:
      "Use open-circuit tests to describe a two-port with impedance parameters.",
    steps: Z.steps,
    practice: [],
  },
  {
    id: "h-abcd-parameters",
    title: "h and ABCD Parameters",
    icon: "hT",
    count: "Walkthrough",
    boardHint: "",
    formula: "$V_1=AV_2-BI_2$",
    doneBlurb:
      "Use hybrid and transmission parameters with the correct open/short conditions.",
    steps: HABCD.steps,
    practice: [],
  },
  {
    id: "two-port-properties",
    title: "Relations, Reciprocity and Symmetry",
    icon: "R/S",
    count: "Walkthrough",
    boardHint: "",
    formula: "$z_{12}=z_{21}$",
    doneBlurb:
      "Convert parameter sets and distinguish reciprocal from symmetrical networks.",
    steps: RELATIONS.steps,
    practice: [],
  },
  {
    id: "two-port-interconnections",
    title: "Interconnecting Two-Ports",
    icon: "++",
    count: "Walkthrough",
    boardHint: "",
    formula: "$[Z]_s=[Z]_1+[Z]_2$",
    doneBlurb:
      "Choose Z, Y, or ABCD parameters to combine series, parallel, or cascade blocks.",
    steps: INTERCONNECT.steps,
    practice: [],
  },
];

export const section8Catalog = makeCatalog("Two-Port Networks", SECTION8_LABS);

export default function Section8Lesson({ labId, onExit, onContinue, ...rest }) {
  const lab = section8Catalog.getLab(labId);
  return (
    <WalkLesson
      labId={labId}
      catalog={section8Catalog}
      Schematic={Section8Schematic}
      topicId={8}
      section={8}
      onExit={onExit}
      onContinue={onContinue}
      walkKey={walkLessonKey(8, lab.id)}
      {...rest}
    />
  );
}

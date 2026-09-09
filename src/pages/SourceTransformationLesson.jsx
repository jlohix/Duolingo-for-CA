import WalkLesson, { makeCatalog } from "../components/WalkLesson";
import SourceTransformationSchematic from "../components/SourceTransformationSchematic";
import { TRANSFORM } from "../section2/labs";

const LABS = [
  {
    id: "source-transformation",
    title: "Source Transformation",
    icon: "V↔I",
    count: "Walkthrough",
    boardHint: "The terminal voltage-current behavior stays the same.",
    formula: "$I_s=V_s/R$",
    doneBlurb: "Keep the same resistor and preserve source polarity.",
    steps: TRANSFORM.steps.map((step) => ({ ...step, view: "transform" })),
    practice: TRANSFORM.practice.map((question) => ({
      ...question,
      view: "transform",
    })),
  },
];

const catalog = makeCatalog("Basic laws", LABS);

export default function SourceTransformationLesson(props) {
  return (
    <WalkLesson
      {...props}
      labId="source-transformation"
      catalog={catalog}
      Schematic={SourceTransformationSchematic}
      topicId={1}
      section={1}
    />
  );
}

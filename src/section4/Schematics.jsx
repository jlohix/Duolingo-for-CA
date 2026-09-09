import {
  RcDecayBoard,
  RlDecayBoard,
  UnitStepBoard,
  RcStepBoard,
  RlStepBoard,
} from "./WalkBoard";
import {
  QrcDecayBoard,
  QrcParBoard,
  QrcSeriesBoard,
  QrcSimpleBoard,
  QrcSwitchBoard,
} from "./QuizBoards";

const VIEWS = {
  decayc: RcDecayBoard,
  decayl: RlDecayBoard,
  step: UnitStepBoard,
  stepc: RcStepBoard,
  stepl: RlStepBoard,
  "qrc-simple": QrcSimpleBoard,
  "qrc-switch": QrcSwitchBoard,
  "qrc-par": QrcParBoard,
  "qrc-series": QrcSeriesBoard,
  "qrc-decay": QrcDecayBoard,
};

export default function Section4Schematic({ view, highlight = "all" }) {
  const View = VIEWS[view];
  if (!View) return null;
  return <View highlight={highlight} />;
}

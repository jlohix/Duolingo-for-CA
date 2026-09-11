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
  QrlDecayBoard,
  QrlParBoard,
  QrlSeriesBoard,
  QrlSimpleBoard,
  QrlSwitchBoard,
  QrcsCompleteBoard,
  QrcsFinalBoard,
  QrcsRiseBoard,
  QrcsSimpleBoard,
  QrcsSwitchBoard,
  QrlsCompleteBoard,
  QrlsFinalBoard,
  QrlsRiseBoard,
  QrlsSimpleBoard,
  QrlsSwitchBoard,
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
  "qrl-simple": QrlSimpleBoard,
  "qrl-switch": QrlSwitchBoard,
  "qrl-par": QrlParBoard,
  "qrl-series": QrlSeriesBoard,
  "qrl-decay": QrlDecayBoard,
  "qrcs-simple": QrcsSimpleBoard,
  "qrcs-switch": QrcsSwitchBoard,
  "qrcs-final": QrcsFinalBoard,
  "qrcs-rise": QrcsRiseBoard,
  "qrcs-complete": QrcsCompleteBoard,
  "qrls-simple": QrlsSimpleBoard,
  "qrls-switch": QrlsSwitchBoard,
  "qrls-final": QrlsFinalBoard,
  "qrls-rise": QrlsRiseBoard,
  "qrls-complete": QrlsCompleteBoard,
};

export default function Section4Schematic({ view, highlight = "all" }) {
  const View = VIEWS[view];
  if (!View) return null;
  return <View highlight={highlight} />;
}

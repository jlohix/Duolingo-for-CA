import { TOPICS, DIFFICULTIES } from "./topics";
import { QUESTION_BANKS } from "./questionBanks";
import { PAST_YEAR_QUESTIONS, groupPastPapers } from "./loadQuestions";
import {
  DRAG_CIRCUIT_QUESTIONS,
  NODAL_LAB_QUESTIONS,
  THEVENIN_LAB_QUESTIONS,
  NORTON_LAB_QUESTIONS,
  MESH_LAB_QUESTIONS,
  SUPERMESH_LAB_QUESTIONS,
  SUPERNODE_LAB_QUESTIONS,
  SUPERPOS_LAB_QUESTIONS,
  DIVIDER_LAB_QUESTIONS,
  POWER_LAB_QUESTIONS,
  MAX_POWER_LAB_QUESTIONS,
  DEPENDENT_LAB_QUESTIONS,
  labPrompt,
} from "./dragCircuits";
import {
  DIVIDER_BRANCH_DRAG,
  DIVIDER_BRANCH_PRACTICE,
  dividerBranchDragPrompt,
} from "./dividerBranchesLab";
import { INVERTING_PRACTICE } from "./invertingOpAmp";
import { NON_INVERTING_PRACTICE } from "./nonInvertingOpAmp";
import {
  OPAMP,
  INVERTING,
  NONINV,
  CAPACITOR,
  INDUCTOR,
  FREEC as S3_FREEC,
  LSOURCE,
} from "../section3/labs";
import { practiceForLab } from "../section3/practice";
import { TRANSFORM } from "../section2/labs";
import { FREEC as S4_FREEC, FREEL, STEPRC, STEPRL } from "../section4/labs";
import {
  FREEC_QUIZ,
  FREEC_QUIZ_DRAG,
  freeCQuizDragPrompt,
} from "./freeCQuizLab";
import {
  FREEL_QUIZ,
  FREEL_QUIZ_DRAG,
  freeLQuizDragPrompt,
} from "./freeLQuizLab";
import {
  STEPC_QUIZ,
  STEPC_QUIZ_DRAG,
  stepCQuizDragPrompt,
} from "./stepCQuizLab";
import {
  STEPL_QUIZ,
  STEPL_QUIZ_DRAG,
  stepLQuizDragPrompt,
} from "./stepLQuizLab";
import { LAPLACE_LABS } from "../section5/index";

function formatAmps(amps) {
  return Number.isInteger(amps) ? `${amps}` : String(amps);
}

function mcq(question, extra = {}) {
  return {
    type: "mcq",
    id: question.id,
    prompt: question.prompt || question.question,
    options: question.options || null,
    answer: question.answer,
    why: question.why || question.explanation || "",
    image: question.image || "",
    difficulty: question.difficulty,
    boardHint: question.boardHint || "",
    view: question.view || "",
    highlight: question.highlight || "all",
    ...extra,
  };
}

function drag(question, extra = {}) {
  return {
    type: "drag",
    id: question.id,
    prompt: extra.prompt || labPrompt(question, false),
    choices: question.choices || [],
    why: question.why || "",
    question,
    level: question.level || "",
    ...extra,
  };
}

export function dragCorrect(question) {
  if (!question) return null;
  if (question.correctOhm != null) return question.correctOhm;
  if (question.correct != null) return question.correct;
  if (question.quiz === "currents") {
    return { i1: question.i1, i2: question.i2 };
  }
  if (question.answer != null) return question.answer;
  return null;
}

export function isDragChoiceCorrect(question, choice) {
  const correct = dragCorrect(question);
  if (choice && typeof choice === "object" && correct && typeof correct === "object") {
    return choice.i1 === correct.i1 && choice.i2 === correct.i2;
  }
  return choice === correct;
}

export function formatDragChoice(question, choice) {
  if (choice && typeof choice === "object" && "i1" in choice) {
    return `$\\mathbf{I}_1 = ${formatAmps(choice.i1)}\\ \\mathrm{A}$, $\\mathbf{I}_2 = ${formatAmps(choice.i2)}\\ \\mathrm{A}$`;
  }
  if (typeof choice === "string") return choice;
  if (question?.unit) return `${choice} ${question.unit}`;
  if (question?.kind === "power" || question?.kind === "mpt" || question?.kind === "dep") {
    return String(choice);
  }
  return `${choice} Ω`;
}

export function ohmBoardNote(question) {
  if (!question) return "";
  if (question.kind === "nodal") {
    return question.shape === "isrc"
      ? `v = ${question.nodeVolts} V · ${formatAmps(question.amps)} A into the node`
      : `v = ${question.nodeVolts} V · Is = ${formatAmps(question.amps)} A`;
  }
  if (question.kind === "thev-rth") {
    return `$V_{th} = ${question.vth}\\ \\mathrm{V}$ · drop $R_{th}$`;
  }
  if (question.kind === "thev-load") {
    return `$I_L = ${formatAmps(question.amps)}\\ \\mathrm{A}$`;
  }
  if (question.kind === "norton-rn") {
    return `$I_n = ${formatAmps(question.amps)}\\ \\mathrm{A}$ · drop $R_n$`;
  }
  if (question.kind === "norton-load") {
    return `$I_L = ${formatAmps(question.loadAmps)}\\ \\mathrm{A}$`;
  }
  if (question.kind === "mesh") {
    return question.quiz === "currents"
      ? "Both currents clockwise"
      : `$\\mathbf{I}_1 = ${formatAmps(question.i1)}\\ \\mathrm{A}$ · $\\mathbf{I}_2 = ${formatAmps(question.i2)}\\ \\mathrm{A}$`;
  }
  if (question.kind === "supermesh") {
    return `$\\mathbf{I}_1 = ${formatAmps(question.i1)}\\ \\mathrm{A}$ · $\\mathbf{I}_2 = ${formatAmps(question.i2)}\\ \\mathrm{A}$ · $I_s = ${formatAmps(question.amps)}\\ \\mathrm{A}$`;
  }
  if (question.kind === "supernode") {
    return `Va = ${question.nodeVolts} V · Vb = ${question.nodeVolts2} V · Vs = ${question.vs} V`;
  }
  if (question.kind === "superpos") {
    return `v' = ${question.vLeft} V · v'' = ${question.vRight} V · I = ${formatAmps(question.amps)} A`;
  }
  if (question.kind === "vdiv") {
    return `Vs = ${question.volts} V · Vo = ${question.nodeVolts} V`;
  }
  if (question.kind === "idiv") {
    return `Is = ${formatAmps(question.amps)} A · I through R = ${formatAmps(question.branchAmps)} A`;
  }
  if (question.kind === "power") {
    return `V = ${question.volts} V · I = ${formatAmps(question.amps)} A · R = ${question.ohms} Ω`;
  }
  if (question.kind === "mpt") {
    return `$V = ${question.volts}\\ \\mathrm{V}$ · $R_s = ${question.rs}\\ \\Omega$`;
  }
  if (question.kind === "dep") {
    if (question.shape === "solve") return "VCVS · $2 v_x$ · 2 Ω";
    if (question.shape === "vccs") return "VCCS · $0.5 v_x$";
    if (question.shape === "keep") return "Independent off · diamond stays";
    return "Diamond = dependent";
  }
  if (question.amps != null) return `I = ${formatAmps(question.amps)} A`;
  return "";
}

function boardForKind(kind) {
  if (kind === "power") return "power";
  if (kind === "mpt") return "mpt";
  if (kind === "dep") return "dep";
  return "ohm";
}

function ohmLabSection(id, title, questions) {
  return {
    id,
    title,
    items: questions.map((question) =>
      drag(question, { board: boardForKind(question.kind) })
    ),
  };
}

function walkMcqSection(id, title, questions, board) {
  return {
    id,
    title,
    items: questions.map((question) => mcq(question, { board })),
  };
}

const S3_TEST_LABS = [
  ["capacitor", "Capacitor test"],
  ["inductor", "Inductor test"],
  ["freec", "Source-free capacitor test"],
  ["lsource", "Inductor with a source test"],
];

function csvSections(questions) {
  const sections = [];
  const topicRows = questions.filter((question) => !question.bankId);
  for (const topic of TOPICS) {
    const rows = topicRows.filter((question) => question.topicId === topic.id);
    if (!rows.length) continue;
    for (const level of DIFFICULTIES) {
      const items = rows.filter((question) => question.difficulty === level.id);
      if (!items.length) continue;
      sections.push({
        id: `csv-${topic.id}-${level.id}`,
        title: `${topic.name} · ${level.name}`,
        items: items.map((question) => mcq(question, { board: "image" })),
      });
    }
  }
  const leftover = topicRows.filter(
    (question) => !TOPICS.some((topic) => topic.id === question.topicId)
  );
  if (leftover.length) {
    sections.push({
      id: "csv-other",
      title: "Other topic quizzes",
      items: leftover.map((question) => mcq(question, { board: "image" })),
    });
  }

  for (const bank of QUESTION_BANKS) {
    const rows = questions.filter((question) => question.bankId === bank.id);
    if (!rows.length) continue;
    for (const level of DIFFICULTIES) {
      const items = rows.filter((question) => question.difficulty === level.id);
      if (!items.length) continue;
      sections.push({
        id: `bank-${bank.id}-${level.id}`,
        title: `${bank.title} bank · ${level.name}`,
        items: items.map((question) => mcq(question, { board: "image" })),
      });
    }
  }
  return sections;
}

function pastPaperSections() {
  return groupPastPapers(PAST_YEAR_QUESTIONS).map((pack) => ({
    id: `pyp-${pack.id || pack.key}`,
    title: pack.title,
    items: pack.questions.map((question) => mcq(question, { board: "image" })),
  }));
}

export function buildQuestionPack(csvQuestions = []) {
  const sections = [
    ...csvSections(csvQuestions),
    ...pastPaperSections(),
    ohmLabSection("lab-ohm", "Ohm’s law lab · drag", DRAG_CIRCUIT_QUESTIONS),
    ohmLabSection("lab-nodal", "Nodal lab · drag", NODAL_LAB_QUESTIONS),
    ohmLabSection("lab-thev", "Thevenin lab · drag", THEVENIN_LAB_QUESTIONS),
    ohmLabSection("lab-norton", "Norton lab · drag", NORTON_LAB_QUESTIONS),
    ohmLabSection("lab-mesh", "Mesh lab · drag", MESH_LAB_QUESTIONS),
    ohmLabSection("lab-supermesh", "Supermesh lab · drag", SUPERMESH_LAB_QUESTIONS),
    ohmLabSection("lab-supernode", "Supernode lab · drag", SUPERNODE_LAB_QUESTIONS),
    ohmLabSection("lab-superpos", "Superposition lab · drag", SUPERPOS_LAB_QUESTIONS),
    ohmLabSection("lab-div", "Divider lab · drag", DIVIDER_LAB_QUESTIONS),
    ohmLabSection("lab-power", "Power lab", POWER_LAB_QUESTIONS),
    ohmLabSection("lab-mpt", "Max power lab", MAX_POWER_LAB_QUESTIONS),
    ohmLabSection("lab-dep", "Dependent sources lab", DEPENDENT_LAB_QUESTIONS),
    walkMcqSection(
      "st-quiz",
      "Source transformation · practice",
      TRANSFORM.practice,
      "st"
    ),
    walkMcqSection(
      "branch-quiz",
      "Branch dividers · quiz",
      DIVIDER_BRANCH_PRACTICE,
      "divider"
    ),
    {
      id: "branch-drag",
      title: "Branch dividers · drag",
      items: DIVIDER_BRANCH_DRAG.map((question) =>
        drag(question, {
          board: "divider-drag",
          prompt: dividerBranchDragPrompt(question),
        })
      ),
    },
    walkMcqSection("s2-opamp", "Op-amp walkthrough · practice", OPAMP.practice, "s2"),
    walkMcqSection(
      "s2-inv",
      "Inverting amp walkthrough · practice",
      INVERTING.practice,
      "s2"
    ),
    walkMcqSection(
      "s2-ninv",
      "Non-inverting amp walkthrough · practice",
      NONINV.practice,
      "s2"
    ),
    {
      id: "inv-drag",
      title: "Inverting amp lab · drag Rf",
      items: INVERTING_PRACTICE.map((question) =>
        drag(question, { board: "inv", prompt: question.prompt })
      ),
    },
    {
      id: "ninv-drag",
      title: "Non-inverting amp lab · drag Rf",
      items: NON_INVERTING_PRACTICE.map((question) =>
        drag(question, { board: "ninv", prompt: question.prompt })
      ),
    },
    walkMcqSection(
      "s3-cap",
      "Capacitor walkthrough · practice",
      CAPACITOR.practice,
      "s3"
    ),
    walkMcqSection(
      "s3-ind",
      "Inductor walkthrough · practice",
      INDUCTOR.practice,
      "s3"
    ),
    walkMcqSection(
      "s3-freec",
      "Source-free capacitor walkthrough · practice",
      S3_FREEC.practice,
      "s3"
    ),
    walkMcqSection(
      "s3-lsource",
      "Inductor with a source walkthrough · practice",
      LSOURCE.practice,
      "s3"
    ),
    ...S3_TEST_LABS.map(([id, title]) =>
      walkMcqSection(`s3-test-${id}`, title, practiceForLab(id), "s3-test")
    ),
    walkMcqSection(
      "s4-freec-walk",
      "Source-free capacitor (first-order) · practice",
      S4_FREEC.practice,
      "s4"
    ),
    walkMcqSection(
      "s4-freel-walk",
      "Source-free inductor (first-order) · practice",
      FREEL.practice,
      "s4"
    ),
    walkMcqSection(
      "s4-stepc-walk",
      "Step response RC walkthrough · practice",
      STEPRC.practice,
      "s4"
    ),
    walkMcqSection(
      "s4-stepl-walk",
      "Step response RL walkthrough · practice",
      STEPRL.practice,
      "s4"
    ),
    walkMcqSection("s4-freec-quiz", "Source-free C practice · quiz", FREEC_QUIZ, "s4"),
    {
      id: "s4-freec-drag",
      title: "Source-free C practice · drag",
      items: FREEC_QUIZ_DRAG.map((question) =>
        drag(question, {
          board: "s4-freec",
          prompt: freeCQuizDragPrompt(question),
        })
      ),
    },
    walkMcqSection("s4-freel-quiz", "Source-free L practice · quiz", FREEL_QUIZ, "s4"),
    {
      id: "s4-freel-drag",
      title: "Source-free L practice · drag",
      items: FREEL_QUIZ_DRAG.map((question) =>
        drag(question, {
          board: "s4-freel",
          prompt: freeLQuizDragPrompt(question),
        })
      ),
    },
    walkMcqSection("s4-stepc-quiz", "Step RC practice · quiz", STEPC_QUIZ, "s4"),
    {
      id: "s4-stepc-drag",
      title: "Step RC practice · drag",
      items: STEPC_QUIZ_DRAG.map((question) =>
        drag(question, {
          board: "s4-stepc",
          prompt: stepCQuizDragPrompt(question),
        })
      ),
    },
    walkMcqSection("s4-stepl-quiz", "Step RL practice · quiz", STEPL_QUIZ, "s4"),
    {
      id: "s4-stepl-drag",
      title: "Step RL practice · drag",
      items: STEPL_QUIZ_DRAG.map((question) =>
        drag(question, {
          board: "s4-stepl",
          prompt: stepLQuizDragPrompt(question),
        })
      ),
    },
    ...LAPLACE_LABS.map((lab) =>
      walkMcqSection(
        `laplace-${lab.id}`,
        `Laplace · ${lab.title}`,
        lab.practice,
        "laplace"
      )
    ),
  ];

  return sections.filter((section) => section.items.length);
}

export function packItemCount(sections) {
  return sections.reduce((sum, section) => sum + section.items.length, 0);
}

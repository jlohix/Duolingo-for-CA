import { shuffle } from "./loadQuestions";
import { FREEC_QUIZ } from "./freeCQuizLab";
import { FREEL_QUIZ } from "./freeLQuizLab";
import { STEPC_QUIZ } from "./stepCQuizLab";
import { STEPL_QUIZ } from "./stepLQuizLab";

export const KNOWLEDGE_CHECK_SIZE = 5;
export const KNOWLEDGE_CHECK_TOPIC_IDS = [1, 2, 3, 4, 5, 6];

export function knowledgeCheckKey(topicId) {
  return `kcheck-${topicId}`;
}

function isMcq(question) {
  const options = question?.options;
  const answer = String(question?.answer || "").toLowerCase();
  const prompt = question?.question || question?.prompt;
  return Boolean(options && prompt && options[answer]);
}

function familyKey(question) {
  return `${question.bankId || "core"}::${
    question.questionFamilyId || question.csvId || question.id
  }`;
}

function annotateFamily(steps, topicId, familyId) {
  const familyMain = steps.map((step) => step.mainQuestion).find(Boolean) || "";
  const familyImage = steps.map((step) => step.image).find(Boolean) || "";
  return steps.map((step, stepIndex) => ({
    ...step,
    topicId: Number(step.topicId) || Number(topicId) || 0,
    question: step.question || step.prompt,
    explanation: step.explanation || step.why || "",
    questionFamilyId: familyId,
    mainQuestion: step.mainQuestion || familyMain,
    image: step.image || familyImage,
    stepIndex: stepIndex + 1,
    stepCount: steps.length,
    isFamilyFinal: stepIndex === steps.length - 1,
  }));
}

function familiesFromBanks(allQuestions, topicId) {
  const rows = (allQuestions || []).filter(
    (question) => Number(question.topicId) === Number(topicId)
  );
  const byFamily = new Map();
  for (const question of rows) {
    const key = familyKey(question);
    if (!byFamily.has(key)) byFamily.set(key, []);
    byFamily.get(key).push(question);
  }
  const families = [];
  for (const [key, raw] of byFamily) {
    const steps = [...raw].sort(
      (a, b) =>
        (Number(a.stepNumber) || 0) - (Number(b.stepNumber) || 0) ||
        String(a.id).localeCompare(String(b.id))
    );
    if (!steps.length || !steps.every(isMcq)) continue;
    families.push({
      key,
      steps: annotateFamily(steps, topicId, key),
    });
  }
  return families;
}

function labFamily(item, topicId, prefix) {
  if (!isMcq(item)) return null;
  const id = item.id || `${item.groupId || "g"}-p${item.part || 1}`;
  const familyId = `kc-${topicId}-${prefix}-${id}`;
  const steps = annotateFamily(
    [
      {
        id: familyId,
        topicId,
        question: item.prompt || item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.why || item.explanation || "",
        image: "",
        mainQuestion: "",
      },
    ],
    topicId,
    familyId
  );
  return { key: familyId, steps };
}

function section4Families() {
  return [
    ...FREEC_QUIZ.map((item) => labFamily(item, 4, "freec")),
    ...FREEL_QUIZ.map((item) => labFamily(item, 4, "freel")),
    ...STEPC_QUIZ.map((item) => labFamily(item, 4, "stepc")),
    ...STEPL_QUIZ.map((item) => labFamily(item, 4, "stepl")),
  ].filter(Boolean);
}

export function knowledgeCheckFamilies(allQuestions, topicId) {
  const families = familiesFromBanks(allQuestions, topicId);
  if (Number(topicId) !== 4) return families;
  const seen = new Set(families.map((family) => family.key));
  for (const family of section4Families()) {
    if (seen.has(family.key)) continue;
    seen.add(family.key);
    families.push(family);
  }
  return families;
}

const LAST_PICKED_KEY = "circuito-kcheck-last-v1";

function readLastPicked(topicKey) {
  try {
    const all = JSON.parse(sessionStorage.getItem(LAST_PICKED_KEY) || "{}");
    return Array.isArray(all[topicKey]) ? all[topicKey] : [];
  } catch {
    return [];
  }
}

function writeLastPicked(topicKey, keys) {
  try {
    const all = JSON.parse(sessionStorage.getItem(LAST_PICKED_KEY) || "{}");
    all[topicKey] = keys;
    sessionStorage.setItem(LAST_PICKED_KEY, JSON.stringify(all));
  } catch {
    /* private mode */
  }
}

function pickFamilies(families, count, excludeKeys = []) {
  const exclude = new Set(excludeKeys);
  const fresh = families.filter((family) => !exclude.has(family.key));
  const reused = families.filter((family) => exclude.has(family.key));
  return [...shuffle(fresh), ...shuffle(reused)].slice(
    0,
    Math.min(count, families.length)
  );
}

export function questionsForKnowledgeCheck(
  allQuestions,
  topicId,
  count = KNOWLEDGE_CHECK_SIZE
) {
  const families = knowledgeCheckFamilies(allQuestions, topicId);
  const topicKey = String(topicId);
  const picked = pickFamilies(families, count, readLastPicked(topicKey));
  writeLastPicked(
    topicKey,
    picked.map((family) => family.key)
  );
  const out = [];
  picked.forEach((family, familyIndex) => {
    family.steps.forEach((step) => {
      out.push({
        ...step,
        familyIndex: familyIndex + 1,
        familyTotal: picked.length,
      });
    });
  });
  return out;
}

export function knowledgeCheckReady(allQuestions, topicId) {
  return (
    KNOWLEDGE_CHECK_TOPIC_IDS.includes(Number(topicId)) &&
    knowledgeCheckFamilies(allQuestions, topicId).length > 0
  );
}

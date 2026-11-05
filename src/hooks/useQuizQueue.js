import { useState } from "react";
import { isAnswerCorrect } from "../data/loadQuestions";
import { XP_CORRECT } from "../state/progress";
import { isAdmin, loadSession } from "../state/auth";
import { resumeSets } from "../state/quizResume";

function loadAnswers(resume) {
  const raw = resume?.answers;
  if (!raw || typeof raw !== "object") return {};
  const src = Array.isArray(raw)
    ? Object.fromEntries(
        raw.map((row, i) => [String(row?.i ?? i), row])
      )
    : raw;
  const out = {};
  for (const [key, row] of Object.entries(src)) {
    out[String(key)] = {
      selected: row?.selected ?? "",
      revealed: Boolean(row?.revealed),
    };
  }
  return out;
}

function loadAdvanced(resume) {
  const raw = resume?.advanced;
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.map((n) => String(n)));
}

function sameFamily(a, b) {
  if (!a || !b) return false;
  return (
    String(a.questionFamilyId || a.id) === String(b.questionFamilyId || b.id)
  );
}

export function useQuizQueue(
  initialQuestions,
  xpPerCorrect = XP_CORRECT,
  options = {}
) {
  const resume = options.resume;
  const recycleMissed = options.recycleMissed !== false;
  /** Within a multi-step family, require a correct answer before the next step. */
  const requireCorrectWithinFamily = Boolean(options.requireCorrectWithinFamily);
  const startQueue =
    Array.isArray(resume?.queue) && resume.queue.length
      ? resume.queue
      : initialQuestions;
  const [queue, setQueue] = useState(startQueue);
  const originalTotal =
    Number(resume?.originalTotal) > 0
      ? Number(resume.originalTotal)
      : initialQuestions.length;
  const familyTotal =
    Number(resume?.familyTotal) ||
    Number(options.familyTotal) ||
    new Set(
      startQueue.map((q) => q.questionFamilyId || q.id).filter(Boolean)
    ).size ||
    originalTotal;
  const [index, setIndex] = useState(() => {
    const i = Math.max(0, Math.round(Number(resume?.index) || 0));
    return startQueue.length ? Math.min(i, startQueue.length - 1) : 0;
  });
  const [selected, setSelected] = useState(
    () => resume?.selected ?? ""
  );
  const [revealed, setRevealed] = useState(() => Boolean(resume?.revealed));
  const [answers, setAnswers] = useState(() => loadAnswers(resume));
  const [advanced, setAdvanced] = useState(() => loadAdvanced(resume));
  const sets = resumeSets(resume);
  const [solvedIds, setSolvedIds] = useState(() => sets.solvedIds);
  const [attemptedIds, setAttemptedIds] = useState(() => sets.attemptedIds);
  const [completedFamilies, setCompletedFamilies] = useState(
    () => sets.completedFamilies
  );
  const [firstPassCorrect, setFirstPassCorrect] = useState(
    () => Math.max(0, Math.round(Number(resume?.firstPassCorrect) || 0))
  );
  const [firstPassIds, setFirstPassIds] = useState(() => sets.firstPassIds);
  const [xpGained, setXpGained] = useState(
    () => Math.max(0, Math.round(Number(resume?.xpGained) || 0))
  );

  const [reviewOpen, setReviewOpen] = useState(() => Boolean(resume?.reviewOpen));
  const [reviewCount, setReviewCount] = useState(
    () => Math.max(0, Math.round(Number(resume?.reviewCount) || 0))
  );

  const question = queue[index];

  function storeAnswers(fromIndex, sel, rev, base = answers) {
    return {
      ...base,
      [String(fromIndex)]: { selected: sel, revealed: Boolean(rev) },
    };
  }

  function showIndex(nextIndex, nextAnswers) {
    const saved = nextAnswers[String(nextIndex)];
    setAnswers(nextAnswers);
    setIndex(nextIndex);
    setSelected(saved?.selected ?? "");
    setRevealed(Boolean(saved?.revealed));
  }

  function check(onOutcome) {
    if (!selected || revealed || !question) return;
    const ok = isAnswerCorrect(question, selected);
    const firstTry = !attemptedIds.has(question.id);
    const awardXp = ok && !solvedIds.has(question.id);
    setAttemptedIds((ids) => new Set(ids).add(question.id));
    setRevealed(true);
    setAnswers(storeAnswers(index, selected, true));
    if (firstTry && ok) {
      setFirstPassCorrect((n) => n + 1);
      setFirstPassIds((ids) => new Set(ids).add(question.id));
    }
    if (awardXp) {
      setSolvedIds((ids) => new Set(ids).add(question.id));
      setXpGained((n) => n + xpPerCorrect);
    }
    if (ok && question.isFamilyFinal && question.questionFamilyId) {
      setCompletedFamilies((ids) =>
        new Set(ids).add(String(question.questionFamilyId))
      );
    } else if (ok && !question.stepCount) {
      setCompletedFamilies((ids) =>
        new Set(ids).add(String(question.questionFamilyId || question.id))
      );
    }
    onOutcome?.({ ok, firstTry, awardXp, question });
  }

  function markAdvanced(fromIndex) {
    setAdvanced((ids) => new Set(ids).add(String(fromIndex)));
  }

  /** Staff preview: move to the next part without answering or recycling. */
  function skipAhead() {
    if (!isAdmin(loadSession())) return { done: false };
    if (!question) return { done: true };
    if (index + 1 >= queue.length) {
      return { done: true };
    }
    markAdvanced(index);
    showIndex(index + 1, storeAnswers(index, selected, revealed));
    return { done: false };
  }

  function goBack() {
    if (index <= 0) return false;
    showIndex(index - 1, storeAnswers(index, selected, revealed));
    if (reviewOpen) setReviewOpen(false);
    return true;
  }

  function goNext() {
    if (!question) return { done: true };
    const ok = isAnswerCorrect(question, selected);
    const multiStep = (Number(question.stepCount) || 1) > 1;

    if (requireCorrectWithinFamily && multiStep && !ok) {
      setSelected("");
      setRevealed(false);
      setAnswers(storeAnswers(index, "", false));
      return { done: false, retriedStep: true };
    }

    const alreadyLeft = advanced.has(String(index));
    const shouldRecycle =
      !alreadyLeft && recycleMissed && !ok && !requireCorrectWithinFamily;
    const nextQueue = shouldRecycle ? [...queue, question] : queue;
    if (shouldRecycle) setQueue(nextQueue);
    if (index + 1 >= nextQueue.length) {
      return { done: true };
    }
    const enteringReview =
      !alreadyLeft &&
      recycleMissed &&
      !requireCorrectWithinFamily &&
      index + 1 === originalTotal &&
      nextQueue.length > originalTotal;
    const nextAnswers = storeAnswers(index, selected, revealed);
    markAdvanced(index);
    if (enteringReview) {
      setAnswers(nextAnswers);
      setReviewCount(nextQueue.length - originalTotal);
      setReviewOpen(true);
      return { done: false };
    }
    showIndex(index + 1, nextAnswers);
    return { done: false };
  }

  function startReview() {
    setReviewOpen(false);
    showIndex(index + 1, storeAnswers(index, selected, revealed));
  }

  function getResumeState() {
    return {
      queue,
      originalTotal,
      familyTotal,
      index,
      selected,
      revealed,
      answers,
      advanced: [...advanced],
      solvedIds: [...solvedIds],
      attemptedIds: [...attemptedIds],
      completedFamilies: [...completedFamilies],
      firstPassCorrect,
      firstPassIds: [...firstPassIds],
      xpGained,
      reviewOpen,
      reviewCount,
    };
  }

  const canGoBack = index > 0;
  const backLabel = sameFamily(queue[index - 1], question)
    ? "← Previous part"
    : "← Previous question";

  return {
    question,
    index,
    queueLength: queue.length,
    originalTotal,
    familyTotal,
    completedFamilyCount: completedFamilies.size,
    attemptedCount: attemptedIds.size,
    selected,
    setSelected,
    revealed,
    solvedCount: solvedIds.size,
    firstPassCorrect,
    firstPassIds,
    xpGained,
    reviewOpen,
    reviewCount,
    canGoBack,
    backLabel,
    check,
    goNext,
    goBack,
    skipAhead,
    startReview,
    getResumeState,
  };
}

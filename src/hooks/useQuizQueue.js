import { useState } from "react";
import { isAnswerCorrect } from "../data/loadQuestions";
import { XP_CORRECT } from "../state/progress";
import { isAdmin, loadSession } from "../state/auth";
import { resumeSets } from "../state/quizResume";

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

  function check(onOutcome) {
    if (!selected || revealed || !question) return;
    const ok = isAnswerCorrect(question, selected);
    const firstTry = !attemptedIds.has(question.id);
    const awardXp = ok && !solvedIds.has(question.id);
    setAttemptedIds((ids) => new Set(ids).add(question.id));
    setRevealed(true);
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

  /** Staff preview: move to the next part without answering or recycling. */
  function skipAhead() {
    if (!isAdmin(loadSession())) return { done: false };
    if (!question) return { done: true };
    if (index + 1 >= queue.length) {
      return { done: true };
    }
    setSelected("");
    setRevealed(false);
    setIndex((i) => i + 1);
    return { done: false };
  }

  function goNext() {
    if (!question) return { done: true };
    const ok = isAnswerCorrect(question, selected);
    const multiStep = (Number(question.stepCount) || 1) > 1;

    if (requireCorrectWithinFamily && multiStep && !ok) {
      setSelected("");
      setRevealed(false);
      return { done: false, retriedStep: true };
    }

    const nextQueue =
      recycleMissed && !ok && !requireCorrectWithinFamily
        ? [...queue, question]
        : queue;
    if (recycleMissed && !ok && !requireCorrectWithinFamily) {
      setQueue(nextQueue);
    }
    if (index + 1 >= nextQueue.length) {
      return { done: true };
    }
    const enteringReview =
      recycleMissed &&
      !requireCorrectWithinFamily &&
      index + 1 === originalTotal &&
      nextQueue.length > originalTotal;
    setSelected("");
    setRevealed(false);
    if (enteringReview) {
      setReviewCount(nextQueue.length - originalTotal);
      setReviewOpen(true);
      return { done: false };
    }
    setIndex((i) => i + 1);
    return { done: false };
  }

  function startReview() {
    setReviewOpen(false);
    setIndex((i) => i + 1);
    setSelected("");
    setRevealed(false);
  }

  function getResumeState() {
    return {
      queue,
      originalTotal,
      familyTotal,
      index,
      selected,
      revealed,
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
    check,
    goNext,
    skipAhead,
    startReview,
    getResumeState,
  };
}

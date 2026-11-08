import { useRef, useState } from "react";
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
  const queueRef = useRef(startQueue);
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
  const indexRef = useRef(index);
  const [selected, setSelected] = useState(
    () => resume?.selected ?? ""
  );
  const selectedRef = useRef(selected);
  const [revealed, setRevealed] = useState(() => Boolean(resume?.revealed));
  const revealedRef = useRef(revealed);
  const [answers, setAnswers] = useState(() => loadAnswers(resume));
  const answersRef = useRef(answers);
  const [advanced, setAdvanced] = useState(() => loadAdvanced(resume));
  const advancedRef = useRef(advanced);
  const startFurthest = Math.max(
    0,
    Math.round(Number(resume?.furthestIndex) || Number(resume?.index) || 0)
  );
  const [furthestIndex, setFurthestIndex] = useState(startFurthest);
  const furthestRef = useRef(startFurthest);
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

  function remember(fromIndex, sel, rev) {
    const nextAnswers = {
      ...answersRef.current,
      [String(fromIndex)]: {
        selected: sel ?? "",
        revealed: Boolean(rev),
      },
    };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    return nextAnswers;
  }

  function bumpFurthest(i) {
    if (i > furthestRef.current) {
      furthestRef.current = i;
      setFurthestIndex(i);
    }
  }

  function markAdvanced(fromIndex) {
    const next = new Set(advancedRef.current).add(String(fromIndex));
    advancedRef.current = next;
    setAdvanced(next);
  }

  function showIndex(nextIndex, nextAnswers = answersRef.current) {
    const list = queueRef.current;
    const bounded = list.length
      ? Math.max(0, Math.min(nextIndex, list.length - 1))
      : 0;
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    indexRef.current = bounded;
    setIndex(bounded);
    bumpFurthest(bounded);
    const saved = nextAnswers[String(bounded)];
    const nextSelected = saved?.selected ?? "";
    const nextRevealed = Boolean(saved?.revealed);
    selectedRef.current = nextSelected;
    revealedRef.current = nextRevealed;
    setSelected(nextSelected);
    setRevealed(nextRevealed);
  }

  function choose(value) {
    selectedRef.current = value;
    setSelected(value);
    remember(indexRef.current, value, revealedRef.current);
  }

  function check(onOutcome) {
    const current = queueRef.current[indexRef.current];
    const pick = selectedRef.current;
    if (!pick || revealedRef.current || !current) return;
    const ok = isAnswerCorrect(current, pick);
    const firstTry = !attemptedIds.has(current.id);
    const awardXp = ok && !solvedIds.has(current.id);
    setAttemptedIds((ids) => new Set(ids).add(current.id));
    revealedRef.current = true;
    setRevealed(true);
    remember(indexRef.current, pick, true);
    if (firstTry && ok) {
      setFirstPassCorrect((n) => n + 1);
      setFirstPassIds((ids) => new Set(ids).add(current.id));
    }
    if (awardXp) {
      setSolvedIds((ids) => new Set(ids).add(current.id));
      setXpGained((n) => n + xpPerCorrect);
    }
    if (ok && current.isFamilyFinal && current.questionFamilyId) {
      setCompletedFamilies((ids) =>
        new Set(ids).add(String(current.questionFamilyId))
      );
    } else if (ok && !current.stepCount) {
      setCompletedFamilies((ids) =>
        new Set(ids).add(String(current.questionFamilyId || current.id))
      );
    }
    onOutcome?.({ ok, firstTry, awardXp, question: current });
  }

  /** Staff preview: move to the next part without answering or recycling. */
  function skipAhead() {
    if (!isAdmin(loadSession())) return { done: false };
    const list = queueRef.current;
    const i = indexRef.current;
    if (!list[i]) return { done: true };
    if (i + 1 >= list.length) {
      return { done: true };
    }
    remember(i, selectedRef.current, revealedRef.current);
    markAdvanced(i);
    showIndex(i + 1);
    return { done: false };
  }

  function goBack() {
    const i = indexRef.current;
    if (i <= 0) return false;
    remember(i, selectedRef.current, revealedRef.current);
    if (reviewOpen) setReviewOpen(false);
    showIndex(i - 1);
    return true;
  }

  function goForward() {
    const i = indexRef.current;
    if (i >= furthestRef.current) return false;
    remember(i, selectedRef.current, revealedRef.current);
    if (reviewOpen) setReviewOpen(false);
    showIndex(i + 1);
    return true;
  }

  function goNext() {
    const list = queueRef.current;
    const i = indexRef.current;
    const current = list[i];
    if (!current) return { done: true };
    const pick = selectedRef.current;
    const shown = revealedRef.current;
    remember(i, pick, shown);
    const alreadyLeft = advancedRef.current.has(String(i));
    if (alreadyLeft && i < furthestRef.current) {
      showIndex(i + 1);
      return { done: false };
    }

    const ok = isAnswerCorrect(current, pick);
    const multiStep = (Number(current.stepCount) || 1) > 1;

    if (requireCorrectWithinFamily && multiStep && !ok && !alreadyLeft) {
      selectedRef.current = "";
      revealedRef.current = false;
      setSelected("");
      setRevealed(false);
      remember(i, "", false);
      return { done: false, retriedStep: true };
    }

    const shouldRecycle =
      !alreadyLeft && recycleMissed && !ok && !requireCorrectWithinFamily;
    const nextQueue = shouldRecycle ? [...list, current] : list;
    if (shouldRecycle) {
      queueRef.current = nextQueue;
      setQueue(nextQueue);
    }
    if (i + 1 >= nextQueue.length) {
      return { done: true };
    }
    const enteringReview =
      !alreadyLeft &&
      recycleMissed &&
      !requireCorrectWithinFamily &&
      i + 1 === originalTotal &&
      nextQueue.length > originalTotal;
    markAdvanced(i);
    if (enteringReview) {
      setReviewCount(nextQueue.length - originalTotal);
      setReviewOpen(true);
      return { done: false };
    }
    showIndex(i + 1);
    return { done: false };
  }

  function startReview() {
    setReviewOpen(false);
    remember(indexRef.current, selectedRef.current, revealedRef.current);
    showIndex(indexRef.current + 1);
  }

  function getResumeState() {
    return {
      queue: queueRef.current,
      originalTotal,
      familyTotal,
      index: indexRef.current,
      selected: selectedRef.current,
      revealed: revealedRef.current,
      answers: answersRef.current,
      advanced: [...advancedRef.current],
      furthestIndex: furthestRef.current,
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
  const canGoForward = index < furthestIndex;
  const backLabel = sameFamily(queue[index - 1], question)
    ? "← Previous part"
    : "← Previous question";
  const nextLabel = sameFamily(question, queue[index + 1])
    ? "Next part →"
    : "Next question →";

  return {
    question,
    index,
    queueLength: queue.length,
    originalTotal,
    familyTotal,
    completedFamilyCount: completedFamilies.size,
    attemptedCount: attemptedIds.size,
    selected,
    setSelected: choose,
    revealed,
    solvedCount: solvedIds.size,
    firstPassCorrect,
    firstPassIds,
    xpGained,
    reviewOpen,
    reviewCount,
    canGoBack,
    canGoForward,
    backLabel,
    nextLabel,
    check,
    goNext,
    goBack,
    goForward,
    skipAhead,
    startReview,
    getResumeState,
  };
}

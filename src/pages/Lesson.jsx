import { useEffect, useMemo, useRef, useState } from "react";
import {
  questionsForLesson,
  questionsForBank,
  isAnswerCorrect,
  shuffle,
} from "../data/loadQuestions";
import { brainSectionReport } from "../data/brainVerdict";
import { DIFFICULTIES, TOPICS, lessonKey } from "../data/topics";
import { bankLessonKey, questionBankForId } from "../data/questionBanks";
import { addXp, completeLesson, visibleStreak, wouldExtendStreak, xpForCorrect, xpForLessonBonus, recordFirstTry } from "../state/progress";
import { useQuizQueue } from "../hooks/useQuizQueue";
import QuestionCard from "../components/QuestionCard";
import ReviewGate from "../components/ReviewGate";
import { setCurrentQuestion } from "../data/currentQuestion";
import StreakChip from "../components/StreakChip";
import FeedbackBanner from "../components/FeedbackBanner";
import CloseWarning from "../components/CloseWarning";
import ThemeSwitch from "../components/ThemeSwitch";
import HintControl from "../components/HintControl";
import LessonWarmup from "../components/LessonWarmup";
import {
  startModuleAttempt,
  finishModuleAttempt,
} from "../state/moduleAttempts";

export default function Lesson({
  allQuestions,
  topicId,
  difficulty,
  progress,
  setProgress,
  onExit,
  onBack,
  showBack = false,
  onFinished,
  preview = false,
  pack = null,
  bankId = "",
  bankTitle = "",
}) {
  const paperMode = Boolean(pack);
  const bankMode = Boolean(bankId);
  const key = paperMode
    ? pack.key
    : bankMode
      ? bankLessonKey(bankId, difficulty)
      : lessonKey(topicId, difficulty);
  const alreadyDone = Boolean(progress.completed?.includes(key));
  const xpDiff = paperMode ? 2 : difficulty;
  const xpEach = preview || alreadyDone ? 0 : xpForCorrect(xpDiff);
  const xpBonus = preview || alreadyDone ? 0 : xpForLessonBonus(xpDiff);

  const initial = useMemo(
    () =>
      paperMode
        ? shuffle(pack.questions)
        : bankMode
          ? questionsForBank(allQuestions, bankId, difficulty)
        : questionsForLesson(allQuestions, topicId, difficulty),
    [allQuestions, topicId, difficulty, paperMode, bankMode, bankId, pack]
  );
  const familyTotal = useMemo(() => {
    if (!bankMode) return initial.length;
    return new Set(
      initial.map((q) => q.questionFamilyId || q.id).filter(Boolean)
    ).size;
  }, [bankMode, initial]);
  const quiz = useQuizQueue(initial, xpEach, {
    requireCorrectWithinFamily: bankMode,
    familyTotal,
  });
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveTo, setLeaveTo] = useState("exit");
  const [stage, setStage] = useState(
    paperMode || bankMode ? "quiz" : "teach"
  );

  // ---- Module attempt analytics (question banks only) ----------------
  // Log one attempt per (re)start of a bank module so staff can measure
  // module repeats (Feature 1) and completions (Feature 2). Non-bank
  // lessons, past papers, and staff previews are not tracked. Best-effort:
  // the helper swallows failures and never affects the quiz.
  const attemptRef = useRef(null);
  useEffect(() => {
    if (preview || !bankMode || !bankId || stage !== "quiz") return;
    attemptRef.current = startModuleAttempt({
      moduleId: bankId,
      difficulty,
      classId: progress?.classId || "",
      questionCount: familyTotal,
    });
    // A new attempt is intentionally created whenever the module (re)starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, bankMode, bankId, difficulty, stage]);

  // Publish the active question so the floating tutor can use it as context.
  // Only while actually answering (stage === "quiz"); cleared on unmount and
  // during the teach/warmup stage so the tutor isn't primed with an answer
  // before the student has even seen the question.
  useEffect(() => {
    if (stage === "quiz" && quiz.question) {
      setCurrentQuestion(quiz.question);
    } else {
      setCurrentQuestion(null);
    }
    return () => setCurrentQuestion(null);
  }, [stage, quiz.question]);

  const topic = TOPICS.find((t) => t.id === topicId);
  const diff = DIFFICULTIES.find((d) => d.id === difficulty);
  const topicName = paperMode
    ? pack.title
    : bankMode
      ? bankTitle
      : topic?.name;
  const bankMeta = bankMode ? questionBankForId(bankId) : null;
  const difficultyName = paperMode
    ? "Past paper"
    : bankMeta?.singleSet
      ? "Conceptual"
      : diff?.name;

  if (stage === "teach") {
    return (
      <LessonWarmup
        topic={topic}
        difficulty={difficulty}
        difficultyName={diff?.name}
        bankCount={bankMode ? familyTotal : initial.length}
        onReady={() => setStage("quiz")}
        onExit={onExit}
      />
    );
  }

  function finish() {
    const report = bankMeta?.singleSet
      ? brainSectionReport(initial, quiz.firstPassIds)
      : undefined;
    if (preview) {
      onFinished({
        status: "complete",
        kind: bankMeta?.singleSet ? "brain" : undefined,
        correct: quiz.firstPassCorrect,
        total: bankMode ? familyTotal : quiz.originalTotal,
        brainReport: report,
        xpGained: 0,
        streak: visibleStreak(progress),
        streakFrom: visibleStreak(progress),
        streakGrew: false,
        topicName,
        difficultyName,
        lessonKey: key,
        preview: true,
      });
      return;
    }
    // Stamp the module attempt as completed (every question answered at
    // least once by the time we reach finish()). Bank modules only.
    if (bankMode && attemptRef.current) {
      finishModuleAttempt(attemptRef.current, { answeredCount: familyTotal });
      attemptRef.current = null;
    }
    const grew = wouldExtendStreak(progress);
    const streakFrom = visibleStreak(progress);
    let next = progress;
    setProgress((p) => {
      next = completeLesson(p, key, xpBonus);
      return next;
    });
    onFinished({
      status: "complete",
      kind: bankMeta?.singleSet ? "brain" : undefined,
      correct: quiz.firstPassCorrect,
      total: bankMode ? familyTotal : quiz.originalTotal,
      brainReport: report,
      xpGained: quiz.xpGained + xpBonus,
      streak: visibleStreak(next),
      streakFrom,
      streakGrew: grew,
      topicName,
      difficultyName,
      lessonKey: key,
    });
  }

  function continueLesson() {
    const { done } = quiz.goNext();
    if (done) finish();
  }

  if (!quiz.question) {
    return (
      <div className="page">
        <p>No usable questions in this lesson.</p>
        <button type="button" className="primary" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const q = quiz.question;
  const multiStep = (Number(q.stepCount) || 1) > 1;
  const finishedCount = bankMeta?.singleSet
    ? quiz.attemptedCount
    : bankMode
      ? quiz.completedFamilyCount
      : quiz.solvedCount;
  const meterTotal = bankMode ? familyTotal : quiz.originalTotal;
  const meter = meterTotal ? (finishedCount / meterTotal) * 100 : 0;

  const metaBits = [topicName, difficultyName];
  if (bankMode && q.questionFamilyId) {
    metaBits.push(`Question ${q.questionFamilyId}`);
    if (multiStep) {
      metaBits.push(`step ${q.stepIndex}/${q.stepCount}`);
    }
    metaBits.push(`${q.familyIndex}/${q.familyTotal}`);
  } else {
    metaBits.push(`${quiz.index + 1}/${quiz.queueLength}`);
  }

  return (
    <div className="page lesson">
      {showBack ? (
        <div className="lesson-close-row">
          <button type="button" className="ghost" onClick={() => { setLeaveTo("exit"); setLeaveOpen(true); }}>
            Close
          </button>
        </div>
      ) : null}
      <header className="lesson-bar">
        {showBack ? (
          <button
            type="button"
            className="ghost back-link back-sticky"
            onClick={() => { setLeaveTo("back"); setLeaveOpen(true); }}
          >
            ← Back
          </button>
        ) : (
          <button type="button" className="ghost" onClick={() => { setLeaveTo("exit"); setLeaveOpen(true); }}>
            Close
          </button>
        )}
        <div
          className="meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={meterTotal || 0}
          aria-valuenow={finishedCount}
          aria-label="Questions completed"
        >
          <div className="meter-fill" style={{ width: `${meter}%` }} />
        </div>
        <StreakChip progress={progress} />
        <ThemeSwitch compact className={showBack ? "theme-sticky" : ""} />
      </header>
      <p className="lesson-meta">
        {metaBits.join(" · ")}
        {preview ? " · staff preview · no XP" : xpEach ? ` · +${xpEach} XP` : " · practice"}
      </p>
      {bankMeta?.singleSet && topic?.tagline ? (
        <p className="lesson-slogan">{topic.tagline}</p>
      ) : null}
      {preview && bankMeta?.singleSet ? (
        <button type="button" className="jump-end" onClick={finish}>
          Jump to the end
        </button>
      ) : null}
      {quiz.reviewOpen ? (
        <ReviewGate count={quiz.reviewCount} onContinue={quiz.startReview} />
      ) : (
        <>
          <QuestionCard
            question={quiz.question}
            selected={quiz.selected}
            revealed={quiz.revealed}
            onSelect={quiz.setSelected}
          />
          {!quiz.revealed ? (
            <div className="quiz-actions">
              <HintControl question={quiz.question} />
              <button
                type="button"
                className="primary check"
                disabled={!quiz.selected}
                onClick={() =>
                  quiz.check(({ ok, firstTry, awardXp, question }) => {
                    if (preview) return;
                    setProgress((p) => {
                      let next = p;
                      if (awardXp && xpEach) next = addXp(next, xpEach);
                      if (firstTry && !paperMode && question.topicId)
                        next = recordFirstTry(next, question.topicId, ok);
                      return next;
                    });
                  })
                }
              >
                Check
              </button>
            </div>
          ) : (
            <FeedbackBanner
              correct={isAnswerCorrect(quiz.question, quiz.selected)}
              explanation={quiz.question.explanation}
              willRepeat={
                !isAnswerCorrect(quiz.question, quiz.selected) &&
                !bankMode &&
                quiz.index < quiz.originalTotal
              }
              onContinue={continueLesson}
            />
          )}
        </>
      )}
      <CloseWarning
        open={leaveOpen}
        onStay={() => setLeaveOpen(false)}
        onLeave={leaveTo === "back" && onBack ? onBack : onExit}
        preview={preview}
      />
    </div>
  );
}

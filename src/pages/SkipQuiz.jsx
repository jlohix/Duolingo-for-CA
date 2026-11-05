import { useMemo, useRef, useState } from "react";
import { questionsForSkip, isAnswerCorrect } from "../data/loadQuestions";
import { TOPICS } from "../data/topics";
import {
  XP_CORRECT,
  SKIP_QUIZ_SIZE,
  SKIP_PASS_RATIO,
  addXp,
  unlockTopicBySkip,
  visibleStreak,
  wouldExtendStreak,
  recordFirstTry,
} from "../state/progress";
import { useQuizQueue } from "../hooks/useQuizQueue";
import QuestionCard from "../components/QuestionCard";
import FeedbackBanner from "../components/FeedbackBanner";
import QuizPartBack from "../components/QuizPartBack";
import CloseWarning from "../components/CloseWarning";
import ThemeSwitch from "../components/ThemeSwitch";
import HintControl from "../components/HintControl";
import StreakChip from "../components/StreakChip";
import {
  loadQuizResume,
  clearQuizResume,
  usePersistQuiz,
} from "../state/quizResume";

function SkipFail({ topicName, misses, needed, total, onRetry, onHome }) {
  return (
    <div className="page results">
      <header className="topbar">
        <h1>Skip not unlocked</h1>
        <ThemeSwitch />
      </header>
      <p className="skip-result">
        {topicName} stays locked. You got {misses} wrong. A skip needs{" "}
        {needed}/{total} correct on the first try, so one miss is the limit.
      </p>
      <p>Try the earlier lessons, then take the skip again.</p>
      <div className="opamp-nav">
        <button type="button" className="primary" onClick={onHome}>
          Back to Learn
        </button>
        <button type="button" className="primary" onClick={onRetry}>
          Try skip again
        </button>
      </div>
    </div>
  );
}

function SkipRound({
  allQuestions,
  targetTopicId,
  progress,
  setProgress,
  onExit,
  onFinished,
  onFail,
}) {
  const runKey = `skip-${targetTopicId}`;
  const [saved] = useState(() => loadQuizResume(runKey));
  const initial = useMemo(
    () =>
      saved?.queue?.length
        ? saved.queue
        : questionsForSkip(allQuestions, targetTopicId, SKIP_QUIZ_SIZE),
    [allQuestions, targetTopicId, saved]
  );
  const quiz = useQuizQueue(initial, XP_CORRECT, {
    recycleMissed: false,
    resume: saved,
  });
  const stoppedRef = useRef(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [firstMisses, setFirstMisses] = useState(
    () => Math.max(0, Math.round(Number(saved?.firstMisses) || 0))
  );

  usePersistQuiz(
    runKey,
    () => ({
      ...quiz.getResumeState(),
      firstMisses,
    }),
    stoppedRef
  );

  const target = TOPICS.find((t) => t.id === targetTopicId);
  const sourceNames = TOPICS.filter((t) => t.id < targetTopicId)
    .map((t) => t.name)
    .join(", ");
  const needed = Math.max(1, Math.ceil(quiz.originalTotal * SKIP_PASS_RATIO));
  const allowedMisses = Math.max(0, quiz.originalTotal - needed);
  const skipFailed = firstMisses > allowedMisses;

  function finishPass() {
    stoppedRef.current = true;
    clearQuizResume(runKey);
    const grew = wouldExtendStreak(progress);
    const streakFrom = visibleStreak(progress);
    let next = progress;
    setProgress((p) => {
      next = unlockTopicBySkip(p, targetTopicId);
      return next;
    });
    onFinished({
      kind: "skip",
      passed: true,
      correct: quiz.firstPassCorrect,
      total: quiz.originalTotal,
      needed,
      xpGained: quiz.xpGained + 20,
      streak: visibleStreak(next),
      streakFrom,
      streakGrew: grew,
      topicName: target?.name,
      difficultyName: "Skip quiz",
    });
  }

  function continueQuiz() {
    if (skipFailed) {
      stoppedRef.current = true;
      clearQuizResume(runKey);
      onFail({
        misses: firstMisses,
        needed,
        total: quiz.originalTotal,
        topicName: target?.name,
      });
      return;
    }
    const { done } = quiz.goNext();
    if (done) {
      if (quiz.firstPassCorrect >= needed) finishPass();
      else {
        stoppedRef.current = true;
        clearQuizResume(runKey);
        onFail({
          misses: firstMisses,
          needed,
          total: quiz.originalTotal,
          topicName: target?.name,
        });
      }
    }
  }

  if (!quiz.question) {
    return (
      <div className="page">
        <p>Not enough earlier questions for a skip quiz.</p>
        <button type="button" className="primary" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const meter = quiz.originalTotal
    ? ((quiz.index + (quiz.revealed ? 1 : 0)) / quiz.originalTotal) * 100
    : 0;

  return (
    <div className="page lesson">
      <header className="lesson-bar">
        <button type="button" className="ghost" onClick={() => setLeaveOpen(true)}>
          Close
        </button>
        <div className="meter">
          <div className="meter-fill" style={{ width: `${meter}%` }} />
        </div>
        <StreakChip progress={progress} />
        <ThemeSwitch compact />
      </header>
      <p className="lesson-meta">
        Skip to {target?.name} · Get {needed}/{quiz.originalTotal} first try ·{" "}
        {quiz.index + 1}/{quiz.originalTotal}
      </p>
      <p className="skip-sources">From: {sourceNames}</p>
      <QuestionCard
        question={quiz.question}
        selected={quiz.selected}
        revealed={quiz.revealed}
        onSelect={quiz.setSelected}
      />
      {!quiz.revealed ? (
        <div className="quiz-actions">
          <HintControl question={quiz.question} />
          <div className="quiz-actions-row">
            {quiz.canGoBack ? (
              <QuizPartBack onBack={quiz.goBack} label={quiz.backLabel} />
            ) : null}
            {quiz.canGoForward ? (
              <button
                type="button"
                className="primary"
                onClick={quiz.goForward}
              >
                {quiz.nextLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="primary check"
              disabled={!quiz.selected}
              onClick={() =>
                quiz.check(({ ok, firstTry, awardXp, question }) => {
                  if (firstTry && !ok) setFirstMisses((n) => n + 1);
                  setProgress((p) => {
                    let next = p;
                    if (awardXp) next = addXp(next, XP_CORRECT);
                    if (firstTry)
                      next = recordFirstTry(next, question.topicId, ok);
                    return next;
                  });
                })
              }
            >
              Check
            </button>
          </div>
        </div>
      ) : (
        <FeedbackBanner
          correct={isAnswerCorrect(quiz.question, quiz.selected)}
          explanation={quiz.question.explanation}
          willRepeat={false}
          failOut={skipFailed}
          onContinue={continueQuiz}
          onBack={quiz.canGoBack ? quiz.goBack : undefined}
          backLabel={quiz.backLabel}
          onNext={quiz.canGoForward ? quiz.goForward : undefined}
          nextLabel={quiz.nextLabel}
        />
      )}
      <CloseWarning
        open={leaveOpen}
        onStay={() => setLeaveOpen(false)}
        onLeave={onExit}
      />
    </div>
  );
}

export default function SkipQuiz({
  allQuestions,
  targetTopicId,
  progress,
  setProgress,
  onExit,
  onFinished,
}) {
  const [runId, setRunId] = useState(0);
  const [fail, setFail] = useState(null);

  if (fail) {
    return (
      <SkipFail
        topicName={fail.topicName}
        misses={fail.misses}
        needed={fail.needed}
        total={fail.total}
        onHome={onExit}
        onRetry={() => {
          setFail(null);
          setRunId((n) => n + 1);
        }}
      />
    );
  }

  return (
    <SkipRound
      key={runId}
      allQuestions={allQuestions}
      targetTopicId={targetTopicId}
      progress={progress}
      setProgress={setProgress}
      onExit={onExit}
      onFinished={onFinished}
      onFail={setFail}
    />
  );
}

import { useMemo, useRef, useState } from "react";
import { isAnswerCorrect } from "../data/loadQuestions";
import { TOPICS } from "../data/topics";
import {
  questionsForKnowledgeCheck,
  KNOWLEDGE_CHECK_SIZE,
} from "../data/knowledgeCheck";
import {
  recordKnowledgeCheck,
  knowledgeCheckSummary,
  visibleStreak,
  wouldExtendStreak,
} from "../state/progress";
import { logKnowledgeCheckAttempt } from "../state/knowledgeCheckAttempts";
import { useQuizQueue } from "../hooks/useQuizQueue";
import QuestionCard from "../components/QuestionCard";
import FeedbackBanner from "../components/FeedbackBanner";
import CloseWarning from "../components/CloseWarning";
import ThemeSwitch from "../components/ThemeSwitch";
import HintControl from "../components/HintControl";
import StreakChip from "../components/StreakChip";
import StaffSkipNext from "../components/StaffSkipNext";

function familyStatsFromQueue(questions) {
  const map = new Map();
  for (const question of questions) {
    const id = String(question.questionFamilyId || question.id);
    if (map.has(id)) continue;
    map.set(id, {
      index: Number(question.familyIndex) || map.size + 1,
      total: Math.max(1, Number(question.stepCount) || 1),
      correct: 0,
    });
  }
  return map;
}

export default function KnowledgeCheck({
  allQuestions,
  topicId,
  progress,
  setProgress,
  preview = false,
  onExit,
  onFinished,
}) {
  const [initial] = useState(() =>
    questionsForKnowledgeCheck(allQuestions, topicId, KNOWLEDGE_CHECK_SIZE)
  );
  const familyTotal = useMemo(
    () =>
      new Set(
        initial.map((question) => question.questionFamilyId || question.id)
      ).size,
    [initial]
  );
  const quiz = useQuizQueue(initial, 0, {
    recycleMissed: false,
    requireCorrectWithinFamily: true,
    familyTotal,
  });
  const familyStats = useRef(familyStatsFromQueue(initial));
  const [leaveOpen, setLeaveOpen] = useState(false);
  const topic = TOPICS.find((row) => row.id === topicId);
  const prior = knowledgeCheckSummary(progress, topicId);

  function finish() {
    const questionStats = [...familyStats.current.values()].sort(
      (a, b) => a.index - b.index
    );
    const correct = questionStats.reduce((sum, row) => sum + row.correct, 0);
    const total =
      questionStats.reduce((sum, row) => sum + row.total, 0) ||
      familyTotal ||
      quiz.originalTotal;
    const grew = !preview && wouldExtendStreak(progress);
    const streakFrom = visibleStreak(progress);
    let next = progress;
    if (!preview) {
      setProgress((p) => {
        next = recordKnowledgeCheck(p, topicId, correct, total, questionStats);
        return next;
      });
      logKnowledgeCheckAttempt({
        topicId,
        correct,
        total,
        questionStats,
        classId: progress.classId,
      });
    }
    onFinished({
      kind: "kcheck",
      topicName: topic?.name,
      difficultyName: "Knowledge check",
      correct,
      total,
      xpGained: 0,
      streak: visibleStreak(next),
      streakFrom,
      streakGrew: grew,
      preview,
      firstAttempt: !prior,
      firstCorrect: prior?.firstCorrect ?? correct,
      firstTotal: prior?.firstTotal ?? total,
      laterCount: prior ? (prior.laterCount || 0) + 1 : 0,
      questionStats,
    });
  }

  if (!quiz.question) {
    return (
      <div className="page">
        <p>Not enough questions in this section for a knowledge check yet.</p>
        <button type="button" className="primary" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const q = quiz.question;
  const multiStep = (Number(q.stepCount) || 1) > 1;
  const meter = familyTotal
    ? (quiz.completedFamilyCount / familyTotal) * 100
    : 0;
  const metaBits = [topic?.name, "Knowledge check"];
  if (q.familyIndex && q.familyTotal) {
    metaBits.push(`${q.familyIndex}/${q.familyTotal}`);
    if (multiStep) metaBits.push(`step ${q.stepIndex}/${q.stepCount}`);
  } else {
    metaBits.push(`${quiz.index + 1}/${quiz.originalTotal}`);
  }

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
        {metaBits.join(" · ")}
        {preview ? " · staff preview · not saved" : " · no XP"}
      </p>
      <QuestionCard
        question={q}
        selected={quiz.selected}
        revealed={quiz.revealed}
        onSelect={quiz.setSelected}
      />
      {!quiz.revealed ? (
        <div className="quiz-actions">
          <HintControl question={q} />
          <div className="quiz-actions-row">
            <button
              type="button"
              className="primary check"
              disabled={!quiz.selected}
              onClick={() =>
                quiz.check(({ ok, firstTry, question }) => {
                  if (!ok || !firstTry) return;
                  const familyId = String(
                    question.questionFamilyId || question.id
                  );
                  const row = familyStats.current.get(familyId);
                  if (!row || row.correct >= row.total) return;
                  row.correct += 1;
                })
              }
            >
              Check
            </button>
            {preview ? (
              <StaffSkipNext
                onClick={() => {
                  if (!preview) return;
                  const { done } = quiz.skipAhead();
                  if (done) finish();
                }}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <FeedbackBanner
          correct={isAnswerCorrect(q, quiz.selected)}
          explanation={q.explanation || q.why || ""}
          willRepeat={false}
          onContinue={() => {
            const { done } = preview ? quiz.skipAhead() : quiz.goNext();
            if (done) finish();
          }}
        />
      )}
      <CloseWarning
        open={leaveOpen}
        onStay={() => setLeaveOpen(false)}
        onLeave={onExit}
        preview={preview}
      />
    </div>
  );
}

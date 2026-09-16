import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Check, Info } from 'lucide-react';
import MathText from '../components/MathText';
import Mascot from '../components/Mascot';
import { questionsForTopic, OPTION_KEYS } from '../data/questions';
import { TOPICS } from '../data/topics';
import { useGameStore } from '../store/useGameStore';
import type { OptionKey, Question } from '../types';

const XP_PER_CORRECT = 10;

export default function Lesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const tid = Number(topicId);
  const topic = TOPICS.find((t) => t.id === tid);

  const { addXp, registerActivity, completeQuestion } = useGameStore();

  const questions = useMemo(() => {
    const q = questionsForTopic(tid);
    // shuffle a copy for lesson variety
    return [...q].sort(() => Math.random() - 0.5);
  }, [tid]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExplain, setShowExplain] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    registerActivity();
  }, [registerActivity]);

  if (!topic || questions.length === 0) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-neutral-300">No questions available for this unit yet.</p>
        <button className="btn-blue" onClick={() => navigate('/')}>Back to Learn</button>
      </div>
    );
  }

  const q: Question = questions[idx];
  const isCorrect = checked && selected === q.answer;
  const progressPct = Math.round((idx / questions.length) * 100);

  const check = () => {
    if (!selected) return;
    setChecked(true);
    const correct = selected === q.answer;
    if (correct) {
      setCorrectCount((c) => c + 1);
      addXp(XP_PER_CORRECT);
    }
    completeQuestion(tid, q.id, correct);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setChecked(false);
    setShowExplain(false);
  };

  if (finished) {
    return (
      <LessonComplete
        correct={correctCount}
        total={questions.length}
        xp={correctCount * XP_PER_CORRECT}
        onDone={() => navigate('/')}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* header: quit + progress */}
      <div className="flex items-center gap-3 px-4 py-3 pt-safe">
        <button onClick={() => navigate('/')} className="text-neutral-500 active:scale-90">
          <X size={26} />
        </button>
        <div className="flex-1 h-4 bg-ink-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-lime rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* question body */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="flex items-start gap-2 mb-4">
          <Mascot mood="think" size={56} />
          <div className="card flex-1 relative">
            <span className="absolute -left-2 top-5 w-3 h-3 rotate-45 bg-ink-800 border-l-2 border-b-2 border-ink-600" />
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-brand-lime mb-1">
              {topic.title} · {diffLabel(q.difficulty)}
            </p>
            <div className="font-bold leading-relaxed">
              <MathText block>{q.question}</MathText>
            </div>
          </div>
        </div>

        {q.image && (
          <div className="mb-4 rounded-2xl overflow-hidden bg-white p-2 flex justify-center">
            <img
              src={q.image}
              alt="circuit figure"
              className="max-h-56 object-contain"
              loading="lazy"
            />
          </div>
        )}

        <div className="space-y-3 pb-4">
          {OPTION_KEYS.map((key) => {
            const label = q[key];
            let cls = 'option border-b-ink-500';
            if (checked) {
              if (key === q.answer) cls = 'option option-correct border-b-brand-lime';
              else if (key === selected) cls = 'option option-wrong border-b-brand-red';
              else cls = 'option opacity-50';
            } else if (key === selected) {
              cls = 'option option-selected border-b-brand-blue';
            }
            return (
              <button
                key={key}
                disabled={checked}
                onClick={() => setSelected(key)}
                className={cls}
              >
                <MathText>{label}</MathText>
              </button>
            );
          })}
        </div>
      </div>

      {/* footer feedback / check button */}
      <div
        className={`px-4 pt-4 pb-safe border-t-2 transition-colors ${
          checked
            ? isCorrect
              ? 'bg-brand-lime/10 border-brand-lime/30'
              : 'bg-brand-red/10 border-brand-red/30'
            : 'border-ink-700'
        }`}
      >
        {checked && (
          <div className="mb-3">
            <div className="flex items-center gap-2 font-extrabold text-lg">
              {isCorrect ? (
                <>
                  <Check className="text-brand-lime" /> <span className="text-brand-lime">Correct!</span>
                </>
              ) : (
                <>
                  <X className="text-brand-red" /> <span className="text-brand-red">Not quite</span>
                </>
              )}
            </div>
            <button
              onClick={() => setShowExplain((v) => !v)}
              className="mt-1 flex items-center gap-1 text-sm text-neutral-300 font-bold"
            >
              <Info size={16} /> {showExplain ? 'Hide' : 'Show'} explanation
            </button>
            {showExplain && (
              <div className="mt-2 text-sm text-neutral-200 leading-relaxed max-h-40 overflow-y-auto">
                <MathText>{q.explanation}</MathText>
              </div>
            )}
          </div>
        )}

        {!checked ? (
          <button className="btn-lime disabled:bg-ink-600 disabled:text-neutral-500 disabled:shadow-none" disabled={!selected} onClick={check}>
            Check
          </button>
        ) : (
          <button className={isCorrect ? 'btn-lime' : 'btn-red'} onClick={next}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

function diffLabel(d: number): string {
  return d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard';
}

function LessonComplete({
  correct,
  total,
  xp,
  onDone,
}: {
  correct: number;
  total: number;
  xp: number;
  onDone: () => void;
}) {
  const accuracy = Math.round((correct / total) * 100);
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 text-center gap-6">
      <Mascot mood="celebrate" size={160} float />
      <h1 className="text-2xl font-extrabold text-brand-lime">Lesson Complete!</h1>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <StatBox label="Total XP" value={`+${xp}`} color="#FFC800" />
        <StatBox label="Accuracy" value={`${accuracy}%`} color="#1CB0F6" />
      </div>
      <button className="btn-lime max-w-xs" onClick={onDone}>
        Claim & Continue
      </button>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border-2 p-3" style={{ borderColor: color }}>
      <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color }}>
        {label}
      </p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}

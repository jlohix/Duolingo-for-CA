import { useNavigate } from 'react-router-dom';
import { Check, Lock, Star } from 'lucide-react';
import Mascot from '../components/Mascot';
import { TOPICS } from '../data/topics';
import { questionsForTopic } from '../data/questions';
import { useGameStore } from '../store/useGameStore';

export default function Home() {
  const navigate = useNavigate();
  const progress = useGameStore((s) => s.progress);
  const streak = useGameStore((s) => s.streak);

  return (
    <div className="px-4 py-4 space-y-6">
      {/* greeting */}
      <div className="flex items-center gap-3 card bg-gradient-to-br from-ink-800 to-ink-700">
        <Mascot mood="wave" size={78} float />
        <div>
          <h1 className="text-lg font-extrabold leading-tight">Welcome back!</h1>
          <p className="text-sm text-neutral-400">
            {streak > 0 ? `🔥 ${streak}-day streak — keep it going!` : 'Start a lesson to build your streak!'}
          </p>
        </div>
      </div>

      {/* topic units as a path */}
      <div className="space-y-8">
        {TOPICS.map((topic, unitIdx) => {
          const total = questionsForTopic(topic.id).length;
          const done = progress[topic.id]?.completedQuestionIds.length ?? 0;
          const prevTopic = TOPICS[unitIdx - 1];
          const prevDone = prevTopic
            ? (progress[prevTopic.id]?.completedQuestionIds.length ?? 0) >=
              Math.max(1, questionsForTopic(prevTopic.id).length)
            : true;
          const locked = !prevDone;
          const complete = total > 0 && done >= total;
          const pct = total ? Math.round((done / total) * 100) : 0;

          return (
            <div key={topic.id}>
              {/* unit header */}
              <div
                className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between"
                style={{ backgroundColor: topic.color + '22', border: `2px solid ${topic.color}55` }}
              >
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: topic.color }}>
                    Unit {unitIdx + 1}
                  </p>
                  <p className="font-extrabold">{topic.title}</p>
                  <p className="text-xs text-neutral-400">{topic.subtitle}</p>
                </div>
                <span className="text-3xl">{topic.icon}</span>
              </div>

              {/* node */}
              <button
                disabled={locked}
                onClick={() => navigate(`/lesson/${topic.id}`)}
                className="w-full flex items-center gap-4 disabled:opacity-50"
              >
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg active:translate-y-1 transition-transform"
                  style={{
                    backgroundColor: locked ? '#2A2A2A' : topic.color,
                    boxShadow: locked ? 'none' : `0 5px 0 0 ${shade(topic.color)}`,
                  }}
                >
                  {locked ? (
                    <Lock size={26} className="text-neutral-500" />
                  ) : complete ? (
                    <Check size={30} className="text-black" strokeWidth={4} />
                  ) : (
                    <Star size={30} className="text-black" fill="#000" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold">{topic.title}</span>
                    <span className="text-xs font-bold text-neutral-400">
                      {done}/{total}
                    </span>
                  </div>
                  <div className="mt-1.5 h-3 bg-ink-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: topic.color }}
                    />
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-neutral-600 pb-2">
        260+ authentic NTU EEE questions & past-year papers
      </div>
    </div>
  );
}

/** darken a hex color for the 3D button shadow */
function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - 45);
  const g = Math.max(0, ((n >> 8) & 255) - 45);
  const b = Math.max(0, (n & 255) - 45);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

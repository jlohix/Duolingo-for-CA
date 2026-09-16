import { useMemo, useState } from 'react';
import { Crown } from 'lucide-react';
import { TUTORIAL_CLASSES } from '../data/topics';
import { useGameStore } from '../store/useGameStore';
import type { LeaderboardEntry } from '../types';

const NAMES = [
  'Wei Jie', 'Aisha', 'Ryan', 'Priya', 'Marcus', 'Hui Ling', 'Daniel', 'Nurul',
  'Kai', 'Sarah', 'Jun Hao', 'Divya', 'Ethan', 'Mei', 'Arjun', 'Chloe',
  'Zhi Hao', 'Farah', 'Isaac', 'Ling',
];

/** Deterministic pseudo-random so ranks are stable per class. */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function buildClassLeaderboard(cls: string, youXp: number, youName: string): LeaderboardEntry[] {
  const rng = seeded(cls.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7);
  const entries: LeaderboardEntry[] = NAMES.map((name) => ({
    name,
    class: cls,
    xp: Math.floor(rng() * 3200) + 40,
  }));
  entries.push({ name: youName, class: cls, xp: youXp, isYou: true });
  return entries.sort((a, b) => b.xp - a.xp);
}

export default function Leaderboard() {
  const { xp, tutorialClass, displayName, setProfile } = useGameStore();
  const [cls, setCls] = useState(tutorialClass);

  const board = useMemo(() => buildClassLeaderboard(cls, xp, displayName), [cls, xp, displayName]);
  const youRank = board.findIndex((e) => e.isYou) + 1;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="card">
        <label className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
          Tutorial Class
        </label>
        <select
          value={cls}
          onChange={(e) => {
            setCls(e.target.value);
            setProfile(displayName, e.target.value);
          }}
          className="mt-1 w-full bg-ink-700 rounded-xl px-3 py-2.5 font-extrabold text-neutral-100 border-2 border-ink-600 focus:border-brand-blue outline-none"
        >
          {TUTORIAL_CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-neutral-400">
          You're rank <span className="font-extrabold text-brand-gold">#{youRank}</span> in {cls}
        </p>
      </div>

      <div className="space-y-2">
        {board.map((e, i) => {
          const rank = i + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
          return (
            <div
              key={e.name + i}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 ${
                e.isYou ? 'border-brand-blue bg-brand-blue/10' : 'border-ink-700 bg-ink-800'
              }`}
            >
              <span className="w-7 text-center font-extrabold text-neutral-400">
                {medal ?? rank}
              </span>
              <div className="flex-1 flex items-center gap-2">
                <span className={`font-extrabold ${e.isYou ? 'text-brand-blue' : ''}`}>{e.name}</span>
                {rank === 1 && <Crown size={16} className="text-brand-gold" fill="#FFC800" />}
                {e.isYou && (
                  <span className="text-[10px] font-extrabold uppercase bg-brand-blue/20 text-brand-blue px-1.5 py-0.5 rounded">
                    You
                  </span>
                )}
              </div>
              <span className="font-extrabold text-sm text-neutral-300">{e.xp} XP</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

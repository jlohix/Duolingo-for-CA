import { LEAGUES, leagueForXp } from '../data/topics';
import { useGameStore } from '../store/useGameStore';
import Mascot from '../components/Mascot';

export default function LeagueScreen() {
  const xp = useGameStore((s) => s.xp);
  const { current, next } = leagueForXp(xp);
  const toNext = next ? next.minXp - xp : 0;
  const span = next ? next.minXp - current.minXp : 1;
  const pct = next ? Math.min(100, Math.round(((xp - current.minXp) / span) * 100)) : 100;

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="card text-center space-y-3 bg-gradient-to-b from-ink-800 to-ink-900">
        <div className="text-6xl">{current.emoji}</div>
        <h1 className="text-2xl font-extrabold" style={{ color: current.color }}>
          {current.name} League
        </h1>
        <p className="text-sm text-neutral-400">{xp} XP earned</p>
        {next ? (
          <>
            <div className="h-4 bg-ink-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: current.color }} />
            </div>
            <p className="text-xs text-neutral-400">
              <span className="font-extrabold text-neutral-200">{toNext} XP</span> to reach {next.emoji} {next.name}
            </p>
          </>
        ) : (
          <p className="text-sm font-extrabold text-brand-gold">🏆 Top league reached — you're a legend!</p>
        )}
      </div>

      <div>
        <h2 className="font-extrabold text-lg mb-3 flex items-center gap-2">
          <Mascot mood="jump" size={40} /> 10 Trophy Leagues
        </h2>
        <div className="space-y-2">
          {[...LEAGUES].reverse().map((l) => {
            const unlocked = xp >= l.minXp;
            const isCurrent = l.key === current.key;
            return (
              <div
                key={l.key}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition ${
                  isCurrent ? 'border-current' : 'border-ink-600'
                } ${unlocked ? '' : 'opacity-45'}`}
                style={isCurrent ? { borderColor: l.color, backgroundColor: l.color + '18' } : undefined}
              >
                <span className="text-2xl">{l.emoji}</span>
                <div className="flex-1">
                  <p className="font-extrabold" style={{ color: unlocked ? l.color : undefined }}>
                    {l.name}
                  </p>
                  <p className="text-xs text-neutral-500">{l.minXp}+ XP</p>
                </div>
                {isCurrent && (
                  <span className="text-[11px] font-extrabold uppercase bg-white/10 px-2 py-1 rounded-lg">
                    You
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

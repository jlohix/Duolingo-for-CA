import { Flame, Gem } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { leagueForXp } from '../data/topics';

export default function TopBar() {
  const { streak, gems, xp } = useGameStore();
  const { current } = leagueForXp(xp);

  return (
    <div className="sticky top-0 z-20 bg-ink-900/95 backdrop-blur border-b border-ink-700 pt-safe">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5" title="League">
          <span className="text-xl">{current.emoji}</span>
          <span className="font-extrabold text-sm text-neutral-300">{current.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <Stat icon={<Flame size={20} className="text-brand-orange" fill="#FF9600" />} value={streak} />
          <Stat icon={<Gem size={20} className="text-brand-blue" fill="#1CB0F6" />} value={gems} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: number | string }) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className="font-extrabold text-sm">{value}</span>
    </div>
  );
}

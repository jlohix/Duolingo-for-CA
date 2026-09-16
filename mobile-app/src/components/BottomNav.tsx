import { NavLink } from 'react-router-dom';
import { Home, Trophy, Users, Zap } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Learn', icon: Home },
  { to: '/league', label: 'League', icon: Trophy },
  { to: '/leaderboard', label: 'Ranks', icon: Users },
  { to: '/tools', label: 'Tools', icon: Zap },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 bg-ink-800 border-t-2 border-ink-600 pb-safe">
      <div className="flex justify-around items-stretch">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 mx-1 my-2 rounded-2xl transition-colors ${
                isActive ? 'bg-brand-blue/15 text-brand-blue' : 'text-neutral-500'
              }`
            }
          >
            <Icon size={24} />
            <span className="text-[11px] font-extrabold uppercase tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

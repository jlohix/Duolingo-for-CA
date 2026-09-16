import type { Topic, League } from '../types';

/**
 * Learning topics for the Circuit Analysis path.
 * topicId values match the `topicid` column in the repo CSV question banks:
 *   1 = Op-Amps (PYP), 2 = Transients (RC/RL, capacitor/inductor networks).
 * Additional units are seeded from the repo's question-bank image folders.
 */
export const TOPICS: Topic[] = [
  {
    id: 1,
    slug: 'opamps',
    title: 'Op-Amps',
    subtitle: 'Inverting, non-inverting & difference amps',
    icon: '🔺',
    color: '#58CC02',
  },
  {
    id: 2,
    slug: 'transients',
    title: 'Transients',
    subtitle: 'RC/RL circuits, capacitor & inductor networks',
    icon: '〰️',
    color: '#1CB0F6',
  },
  {
    id: 3,
    slug: 'network-theorems',
    title: 'Network Theorems',
    subtitle: 'Thevenin, Norton & maximum power',
    icon: '🔌',
    color: '#CE82FF',
  },
  {
    id: 4,
    slug: 'analysis',
    title: 'Nodal & Mesh',
    subtitle: 'KCL, KVL, supernodes & supermeshes',
    icon: '🕸️',
    color: '#FF9600',
  },
];

/** 10-tier trophy leagues, Bronze through Diamond. */
export const LEAGUES: League[] = [
  { key: 'bronze', name: 'Bronze', color: '#CD7F32', minXp: 0, emoji: '🥉' },
  { key: 'silver', name: 'Silver', color: '#C0C0C0', minXp: 100, emoji: '🥈' },
  { key: 'gold', name: 'Gold', color: '#FFD700', minXp: 250, emoji: '🥇' },
  { key: 'sapphire', name: 'Sapphire', color: '#0F52BA', minXp: 500, emoji: '💙' },
  { key: 'ruby', name: 'Ruby', color: '#E0115F', minXp: 800, emoji: '❤️' },
  { key: 'emerald', name: 'Emerald', color: '#50C878', minXp: 1200, emoji: '💚' },
  { key: 'amethyst', name: 'Amethyst', color: '#9966CC', minXp: 1700, emoji: '💜' },
  { key: 'pearl', name: 'Pearl', color: '#EAE0C8', minXp: 2300, emoji: '🤍' },
  { key: 'obsidian', name: 'Obsidian', color: '#3D3D3D', minXp: 3000, emoji: '🖤' },
  { key: 'diamond', name: 'Diamond', color: '#B9F2FF', minXp: 4000, emoji: '💎' },
];

export function leagueForXp(xp: number): { current: League; next: League | null } {
  let current = LEAGUES[0];
  for (const l of LEAGUES) {
    if (xp >= l.minXp) current = l;
  }
  const idx = LEAGUES.findIndex((l) => l.key === current.key);
  const next = idx < LEAGUES.length - 1 ? LEAGUES[idx + 1] : null;
  return { current, next };
}

/** NTU EEE tutorial classes EE01 - EE22 */
export const TUTORIAL_CLASSES: string[] = Array.from({ length: 22 }, (_, i) =>
  `EE${String(i + 1).padStart(2, '0')}`
);

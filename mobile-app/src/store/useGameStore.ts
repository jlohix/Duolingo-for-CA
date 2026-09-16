import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TopicProgress {
  completedQuestionIds: string[];
  bestStreak: number;
}

interface GameState {
  xp: number;
  streak: number; // day streak
  lastActiveDate: string | null; // YYYY-MM-DD
  gems: number;
  tutorialClass: string; // e.g. EE07
  displayName: string;
  progress: Record<number, TopicProgress>;

  // actions
  addXp: (amount: number) => void;
  registerActivity: () => void;
  completeQuestion: (topicId: number, questionId: string, correct: boolean) => void;
  setProfile: (name: string, cls: string) => void;
  reset: () => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      gems: 50,
      tutorialClass: 'EE07',
      displayName: 'You',
      progress: {},

      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

      registerActivity: () =>
        set((s) => {
          const today = todayStr();
          if (s.lastActiveDate === today) return s;
          let streak = 1;
          if (s.lastActiveDate) {
            const gap = daysBetween(s.lastActiveDate, today);
            streak = gap === 1 ? s.streak + 1 : 1;
          }
          return { streak, lastActiveDate: today };
        }),

      completeQuestion: (topicId, questionId, correct) =>
        set((s) => {
          const tp = s.progress[topicId] ?? { completedQuestionIds: [], bestStreak: 0 };
          const completed = correct && !tp.completedQuestionIds.includes(questionId)
            ? [...tp.completedQuestionIds, questionId]
            : tp.completedQuestionIds;
          return {
            progress: { ...s.progress, [topicId]: { ...tp, completedQuestionIds: completed } },
          };
        }),

      setProfile: (name, cls) => set({ displayName: name, tutorialClass: cls }),

      reset: () =>
        set({
          xp: 0,
          streak: 0,
          lastActiveDate: null,
          gems: 50,
          progress: {},
        }),
    }),
    { name: 'duo-ca-game-v1' }
  )
);

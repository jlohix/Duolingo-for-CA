// Core domain types for Duolingo for CA

export type OptionKey = 'optionA' | 'optionB' | 'optionC' | 'optionD';

/** A single multiple-choice question, mirroring the CSV question-bank schema. */
export interface Question {
  id: string;
  topicId: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: OptionKey;
  image?: string;
  explanation: string;
  difficulty: number; // 1=easy, 2=medium, 3=hard
  walkthroughTag?: string;
}

/** A learning topic / unit on the path. */
export interface Topic {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  icon: string; // emoji
  color: string; // tailwind hex
}

/** Trophy league tiers, Bronze -> Diamond. */
export interface League {
  key: string;
  name: string;
  color: string;
  minXp: number;
  emoji: string;
}

export interface LeaderboardEntry {
  name: string;
  class: string; // EE01 - EE22
  xp: number;
  isYou?: boolean;
}

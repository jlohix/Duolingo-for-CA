import type { Question, OptionKey } from '../types';
import { QUESTIONS as GENERATED } from './questions.generated';
import { SUPPLEMENT } from './questions.supplement';

/**
 * Full question bank = questions parsed from the repo CSVs
 * (op-amps + transients) merged with hand-authored supplements for
 * topics whose questions live only as image banks in the repo.
 */
export const QUESTIONS: Question[] = [...GENERATED, ...SUPPLEMENT];

export function questionsForTopic(topicId: number): Question[] {
  return QUESTIONS.filter((q) => q.topicId === topicId);
}

export const OPTION_KEYS: OptionKey[] = ['optionA', 'optionB', 'optionC', 'optionD'];

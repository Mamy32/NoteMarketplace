import type { Note } from '../types';
import { NOTES_A } from './notes1';
import { NOTES_B } from './notes2';

export * from './base';

/** Centralised, fictional catalog. */
export const CATALOG: Note[] = [...NOTES_A, ...NOTES_B];

export function catalogNote(id: string): Note | undefined {
  return CATALOG.find((n) => n.id === id);
}

/** Seeded demo state ------------------------------------------------------ */
export const SEED_LIBRARY: { noteId: string; kind: 'seeded'; hoursAgoAcquired: number }[] = [
  { noteId: 'dsa-exam-revision', kind: 'seeded', hoursAgoAcquired: 24 * 21 },
  { noteId: 'math-prob-stats-formulas', kind: 'seeded', hoursAgoAcquired: 24 * 14 },
  { noteId: 'se-agile-scrum', kind: 'seeded', hoursAgoAcquired: 24 * 9 },
];

export const SEED_RECENT: { noteId: string; hoursAgo: number; lastPage: number }[] = [
  { noteId: 'dsa-exam-revision', hoursAgo: 3, lastPage: 1 },
  { noteId: 'math-prob-stats-formulas', hoursAgo: 30, lastPage: 0 },
  { noteId: 'se-agile-scrum', hoursAgo: 24 * 4, lastPage: 1 },
];

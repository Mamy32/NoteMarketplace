import { CATEGORIES, creatorById } from '../data';
import type { Note } from '../types';

export type SortKey = 'popular' | 'rated' | 'newest' | 'price';
export type PriceType = 'all' | 'free' | 'pass';

export interface Filters {
  q: string;
  cat: string;
  uni: string;
  course: string;
  price: PriceType;
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = { q: '', cat: '', uni: '', course: '', price: 'all', sort: 'popular' };

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9*+#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function haystack(n: Note): string {
  const cat = CATEGORIES.find((c) => c.id === n.category)?.name ?? '';
  const creator = creatorById(n.creatorId)?.name ?? '';
  return norm([n.title, n.courseName, n.courseCode, cat, n.university, creator, ...n.keywords, ...n.topics].join(' '));
}

export function matchesQuery(n: Note, q: string): boolean {
  const tokens = norm(q).split(' ').filter(Boolean);
  if (tokens.length === 0) return true;
  const h = haystack(n);
  return tokens.every((t) => h.includes(t));
}

export function filterNotes(notes: Note[], f: Filters): Note[] {
  const out = notes.filter(
    (n) =>
      matchesQuery(n, f.q) &&
      (!f.cat || n.category === f.cat) &&
      (!f.uni || n.university === f.uni) &&
      (!f.course || n.courseName === f.course) &&
      (f.price === 'all' || n.access === f.price),
  );
  const by: Record<SortKey, (a: Note, b: Note) => number> = {
    popular: (a, b) => b.downloads - a.downloads,
    rated: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    newest: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
    price: (a, b) => (a.access === b.access ? 0 : a.access === 'free' ? -1 : 1) || b.downloads - a.downloads,
  };
  return [...out].sort(by[f.sort]);
}

export function activeFilterCount(f: Filters): number {
  return [f.q, f.cat, f.uni, f.course, f.price !== 'all' ? f.price : ''].filter(Boolean).length;
}

export function relatedNotes(note: Note, pool: Note[], limit = 4): Note[] {
  return pool
    .filter((n) => n.id !== note.id)
    .map((n) => {
      let score = 0;
      if (n.courseName === note.courseName) score += 4;
      if (n.category === note.category) score += 2;
      if (n.university === note.university) score += 1;
      score += n.keywords.filter((k) => note.keywords.includes(k)).length * 0.5;
      return { n, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.n.downloads - a.n.downloads)
    .slice(0, limit)
    .map((x) => x.n);
}

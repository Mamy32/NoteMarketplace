import { useSyncExternalStore } from 'react';
import { BUYER_SERVICE_FEE, PASS_DAYS, PASS_PRICE } from '../config';
import { CATALOG, SEED_LIBRARY, SEED_RECENT, ME_ID, catalogNote } from '../data';
import type { AppState, Note, Order, SellDraft, UserListing } from '../types';

const KEY = 'bombanotes:v2';
const VERSION = 2;

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export function seedState(): AppState {
  return {
    v: VERSION,
    library: SEED_LIBRARY.map((s) => ({ noteId: s.noteId, kind: s.kind, acquiredAt: hoursAgo(s.hoursAgoAcquired) })),
    bookmarks: ['ai-ml-revision'],
    recent: SEED_RECENT.map((r) => ({ noteId: r.noteId, openedAt: hoursAgo(r.hoursAgo), lastPage: r.lastPage })),
    orders: [],
    subscription: null,
    listings: [
      {
        id: 'u-seed-os',
        status: 'Draft',
        title: 'Operating Systems — Process Scheduling Cheatsheet',
        university: 'BINUS University',
        courseName: 'Operating Systems',
        courseCode: 'COMP6153',
        semester: 4,
        category: 'programming',
        description: 'FCFS, SJF, Round Robin and priority scheduling with Gantt charts and waiting-time formulas. Still adding practice questions.',
        topics: ['FCFS', 'SJF', 'Round Robin', 'Gantt charts'],
        pages: 12,
        fileName: 'os-scheduling-draft.pdf',
        fileSize: 1_480_000,
        palette: 3,
        access: 'pass',
        createdAt: hoursAgo(24 * 6),
        updatedAt: hoursAgo(24 * 2),
      },
    ],
    draft: null,
    profile: { name: 'Nadia Pramesti', university: 'BINUS University', program: 'Computer Science', semester: 5 },
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && parsed.v === VERSION && Array.isArray(parsed.library)) return parsed;
    }
  } catch {
    /* storage blocked or corrupt: fall through to seed */
  }
  return seedState();
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: the app keeps working in memory */
  }
}

function commit(next: AppState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state);
}

export function getState(): AppState {
  return state;
}

/** Re-read from localStorage (used by tests to simulate a page refresh). */
export function reloadFromStorage() {
  state = load();
  listeners.forEach((l) => l());
}

export function resetAll() {
  commit(seedState());
}

// ---- derived helpers ----------------------------------------------------
export function listingToNote(l: UserListing): Note {
  return {
    id: l.id,
    title: l.title,
    courseCode: l.courseCode,
    courseName: l.courseName,
    category: l.category,
    university: l.university,
    semester: l.semester,
    term: '2026/27 Odd',
    creatorId: ME_ID,
    pages: l.pages,
    format: 'PDF',
    access: l.access,
    rating: 0,
    reviewCount: 0,
    downloads: 0,
    weeklyDownloads: 0,
    publishedAt: l.createdAt,
    palette: l.palette,
    description: l.description,
    topics: l.topics,
    keywords: [],
    openPages: 1,
    listingStatus: l.status,
    preview: [
      {
        title: 'Listing preview',
        blocks: [
          { t: 'h', text: l.title },
          { t: 'p', text: l.description },
          { t: 'h', text: 'Topics covered' },
          { t: 'ul', items: l.topics },
          {
            t: 'callout',
            title: 'Demo listing',
            text: `Your PDF (${l.fileName}) is not stored by this prototype, so no real page previews exist. A live product would render the first pages here.`,
            tone: 'sun',
          },
        ],
      },
    ],
  };
}

/** Resolve a note id against the catalog and the current user's own listings. */
export function resolveNote(id: string, s: AppState = state): Note | undefined {
  const c = catalogNote(id);
  if (c) return c;
  const l = s.listings.find((x) => x.id === id);
  return l ? listingToNote(l) : undefined;
}

export function useNote(id: string): Note | undefined {
  const s = useAppState();
  return resolveNote(id, s);
}

export function libraryEntry(id: string, s: AppState = state) {
  return s.library.find((e) => e.noteId === id);
}

export function isOwned(id: string, s: AppState = state) {
  return !!libraryEntry(id, s);
}

/** True while the demo Pass is paid for and has not run out. */
export function hasPass(s: AppState = state): boolean {
  return !!s.subscription && new Date(s.subscription.expiresAt).getTime() > Date.now();
}

/** In the library AND allowed to read/download right now. Pass notes need an active Pass. */
export function canAccess(id: string, s: AppState = state): boolean {
  const e = libraryEntry(id, s);
  if (!e) return false;
  return e.kind !== 'pass' || hasPass(s);
}

export function isBookmarked(id: string, s: AppState = state) {
  return s.bookmarks.includes(id);
}

// ---- actions ------------------------------------------------------------
export function toggleBookmark(id: string): boolean {
  const on = !state.bookmarks.includes(id);
  commit({ ...state, bookmarks: on ? [id, ...state.bookmarks] : state.bookmarks.filter((b) => b !== id) });
  return on;
}

export function acquireFree(id: string): boolean {
  const note = resolveNote(id);
  if (!note || note.access !== 'free' || isOwned(id) || note.creatorId === ME_ID) return false;
  commit({ ...state, library: [{ noteId: id, kind: 'free', acquiredAt: new Date().toISOString() }, ...state.library] });
  return true;
}

/** With an active Pass, one click adds a Pass note to the library. No extra charge. */
export function acquireWithPass(id: string): boolean {
  const note = resolveNote(id);
  if (!note || note.access !== 'pass' || !hasPass() || isOwned(id) || note.creatorId === ME_ID) return false;
  commit({ ...state, library: [{ noteId: id, kind: 'pass', acquiredAt: new Date().toISOString() }, ...state.library] });
  return true;
}

/** Simulated Pass payment. Returns null if a Pass is already active (no double charge). */
export function subscribeToPass(method: string, noteId?: string): Order | null {
  if (hasPass()) return null;
  const now = new Date();
  const n = state.orders.length + 1;
  const order: Order = {
    id: `DEMO-${String(n).padStart(4, '0')}`,
    plan: 'pass',
    noteId,
    price: PASS_PRICE,
    serviceFee: BUYER_SERVICE_FEE,
    total: PASS_PRICE + BUYER_SERVICE_FEE,
    method,
    createdAt: now.toISOString(),
  };
  const subscription = {
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PASS_DAYS * 86400_000).toISOString(),
    autoRenew: true,
    orderId: order.id,
  };
  const note = noteId ? resolveNote(noteId) : undefined;
  const addNote = !!note && note.access === 'pass' && note.creatorId !== ME_ID && !isOwned(noteId!);
  commit({
    ...state,
    orders: [order, ...state.orders],
    subscription,
    library: addNote ? [{ noteId: noteId!, kind: 'pass', acquiredAt: order.createdAt, orderId: order.id }, ...state.library] : state.library,
  });
  return order;
}

/** Stops renewal. Access continues until the paid period ends. */
export function cancelPass() {
  if (!state.subscription) return;
  commit({ ...state, subscription: { ...state.subscription, autoRenew: false } });
}

export function markOpened(id: string, lastPage?: number) {
  if (!canAccess(id)) return;
  const existing = state.recent.find((r) => r.noteId === id);
  const entry = { noteId: id, openedAt: new Date().toISOString(), lastPage: lastPage ?? existing?.lastPage ?? 0 };
  commit({ ...state, recent: [entry, ...state.recent.filter((r) => r.noteId !== id)].slice(0, 20) });
}

export function saveDraft(draft: SellDraft | null) {
  commit({ ...state, draft });
}

export function submitListing(draft: SellDraft): UserListing {
  const now = new Date().toISOString();
  const base = {
    title: draft.title.trim(),
    university: draft.university,
    courseName: draft.courseName.trim(),
    courseCode: draft.courseCode.trim().toUpperCase(),
    semester: Number(draft.semester),
    category: draft.category as UserListing['category'],
    description: draft.description.trim(),
    topics: draft.topics,
    pages: Number(draft.pages),
    fileName: draft.file?.name ?? 'untitled.pdf',
    fileSize: draft.file?.size ?? 0,
    palette: draft.palette,
    access: draft.access,
    updatedAt: now,
  };
  const existing = draft.editingId ? state.listings.find((l) => l.id === draft.editingId) : undefined;
  let listing: UserListing;
  let listings: UserListing[];
  if (existing) {
    // Editing keeps the original id; a draft moves to review, a pending listing stays pending.
    listing = { ...existing, ...base, status: 'Pending review' };
    listings = state.listings.map((l) => (l.id === existing.id ? listing : l));
  } else {
    listing = { id: `u-${Date.now().toString(36)}`, status: 'Pending review', createdAt: now, ...base };
    listings = [listing, ...state.listings];
  }
  commit({ ...state, listings, draft: null });
  return listing;
}

export function updateProfile(patch: Partial<AppState['profile']>) {
  commit({ ...state, profile: { ...state.profile, ...patch } });
}

export function catalogCount() {
  return CATALOG.length;
}

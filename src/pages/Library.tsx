import { useMemo, useState } from 'react';
import { creatorById } from '../data';
import { Cover } from '../components/Cover';
import { Icon } from '../components/Icon';
import { EmptyState, PageHeader } from '../components/ui';
import { formatDate, timeAgo } from '../lib/format';
import { Link, useRoute } from '../lib/router';
import { matchesQuery } from '../lib/search';
import { DownloadButton } from '../components/DownloadButton';
import { canAccess, hasPass, resolveNote, useAppState } from '../store/store';
import type { LibraryEntry, Note } from '../types';

type Tab = 'all' | 'pass' | 'free' | 'recent';
const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All notes' },
  { id: 'pass', label: 'Pass notes' },
  { id: 'free', label: 'Free' },
  { id: 'recent', label: 'Recently opened' },
];

const KIND_LABEL: Record<LibraryEntry['kind'], { text: string; cls: string }> = {
  pass: { text: 'Pass', cls: 'chip-ink' },
  free: { text: 'Free', cls: 'chip-plain' },
  seeded: { text: 'Pre-loaded demo', cls: 'chip-sun' },
};

export function Library() {
  const s = useAppState();
  const { query } = useRoute();
  const highlight = query.get('new');
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');

  const items = useMemo(() => {
    const joined = s.library
      .map((e) => ({ e, note: resolveNote(e.noteId, s) as Note | undefined, opened: s.recent.find((r) => r.noteId === e.noteId) }))
      .filter((x): x is { e: LibraryEntry; note: Note; opened: (typeof s.recent)[number] | undefined } => !!x.note);
    let list = joined;
    if (tab === 'pass') list = joined.filter((x) => x.e.kind === 'pass');
    if (tab === 'free') list = joined.filter((x) => x.note.access === 'free');
    if (tab === 'recent') list = joined.filter((x) => x.opened).sort((a, b) => b.opened!.openedAt.localeCompare(a.opened!.openedAt));
    else list = [...list].sort((a, b) => b.e.acquiredAt.localeCompare(a.e.acquiredAt));
    return { list: list.filter((x) => matchesQuery(x.note, q)), counts: { all: joined.length, pass: joined.filter((x) => x.e.kind === 'pass').length, free: joined.filter((x) => x.note.access === 'free').length, recent: joined.filter((x) => x.opened).length } };
  }, [s, tab, q]);

  const empty: Record<Tab, { title: string; text: string; cta: string; to: string }> = {
    all: { title: 'Your library is empty', text: 'Notes you get or buy show up here, ready to open.', cta: 'Explore notes', to: '/explore' },
    pass: { title: 'No Pass notes yet', text: 'With BombaNotes Pass you can add any paid note to your library, read it and download it.', cta: hasPass(s) ? 'Browse Pass notes' : 'Get BombaNotes Pass', to: hasPass(s) ? '/explore?price=pass' : '/subscribe' },
    free: { title: 'No free notes yet', text: 'Free notes you add are saved here with one click, no checkout.', cta: 'Browse free notes', to: '/explore?price=free' },
    recent: { title: 'Nothing opened recently', text: 'Open any note from your library and it will appear here so you can pick up where you left off.', cta: 'Go to all notes', to: '' },
  };

  return (
    <main id="main" tabIndex={-1} className="container-page py-8 sm:py-10">
      <PageHeader eyebrow="My Library" title="Your notes">Everything you have acquired in this demo, stored in your browser.</PageHeader>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Library sections" className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg border-2 px-3.5 text-sm font-semibold transition ${tab === t.id ? 'border-ink bg-ink text-paper' : 'border-ink/25 bg-white hover:border-ink'}`}
            >
              {t.label}
              <span className={`rounded px-1.5 text-xs ${tab === t.id ? 'bg-paper/20' : 'bg-ink-10'}`}>{items.counts[t.id]}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <label htmlFor="lib-q" className="sr-only">Search your library</label>
          <Icon name="search" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-70" />
          <input id="lib-q" type="search" className="input pl-10" placeholder="Search your library" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
        {items.list.length === 0 ? (
          q ? (
            <EmptyState title={`No notes in your library match “${q}”`} icon="search" action={<button className="btn btn-outline" onClick={() => setQ('')}>Clear search</button>}>
              Try a course code or part of the title.
            </EmptyState>
          ) : (
            <EmptyState
              title={empty[tab].title}
              action={empty[tab].to ? <Link to={empty[tab].to} className="btn btn-primary">{empty[tab].cta}</Link> : <button className="btn btn-primary" onClick={() => setTab('all')}>{empty[tab].cta}</button>}
            >
              {empty[tab].text}
            </EmptyState>
          )
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {items.list.map(({ e, note, opened }) => {
              const ok = canAccess(note.id, s);
              const kind = ok ? KIND_LABEL[e.kind] : { text: 'Pass expired', cls: 'chip-sun' };
              const isNew = highlight === note.id;
              return (
                <li key={note.id}>
                  <article className={`card flex gap-4 p-4 ${isNew ? 'pop-in ring-2 ring-coral ring-offset-2 ring-offset-paper' : ''}`} aria-label={note.title}>
                    <div className="w-20 shrink-0 self-start" style={{ filter: 'drop-shadow(4px 5px 0 rgba(33,28,69,.15))' }}>
                      <Cover note={note} mini />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`chip ${kind.cls}`}>{kind.text}</span>
                        {isNew && <span className="chip chip-coral">Just added</span>}
                        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-70">{note.courseCode}</span>
                      </div>
                      <h2 className="mt-1.5 text-[16px] font-bold leading-snug">
                        <Link to={`/note/${note.id}`} className="hover:underline hover:decoration-coral hover:decoration-2 hover:underline-offset-4">{note.title}</Link>
                      </h2>
                      <p className="mt-1 text-[13px] text-ink-70">
                        by {creatorById(note.creatorId)?.name} · acquired {formatDate(e.acquiredAt)}
                        {opened ? ` · opened ${timeAgo(opened.openedAt)}` : ' · not opened yet'}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-3">
                        {ok ? (
                          <>
                            <Link to={`/read/${note.id}${opened ? `?p=${opened.lastPage}` : ''}`} className="btn btn-primary btn-sm" aria-label={`Open note: ${note.title}`}>
                              <Icon name="book" size={16} /> Open note
                            </Link>
                            <DownloadButton note={note} size="sm" />
                          </>
                        ) : (
                          <Link to={`/subscribe?note=${note.id}`} className="btn btn-primary btn-sm">Renew Pass</Link>
                        )}
                        <Link to={`/note/${note.id}`} className="btn btn-ghost btn-sm">Details</Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { DocSheet } from '../components/Doc';
import { Icon } from '../components/Icon';
import { BookmarkButton } from '../components/BookmarkButton';
import { EmptyState } from '../components/ui';
import { Link, useRoute } from '../lib/router';
import { DownloadButton } from '../components/DownloadButton';
import { canAccess, isOwned, markOpened, useAppState, useNote } from '../store/store';
import { NotFound } from './NotFound';

export function Reader({ id }: { id: string }) {
  const s = useAppState();
  const note = useNote(id);
  const { query } = useRoute();
  const recent = s.recent.find((r) => r.noteId === id);
  const total = note?.preview.length ?? 1;
  const startParam = Number(query.get('p'));
  const [page, setPage] = useState(() => Math.min(Math.max(Number.isFinite(startParam) ? startParam : (recent?.lastPage ?? 0), 0), total - 1));
  const owned = isOwned(id, s);
  const can = canAccess(id, s);

  useEffect(() => {
    if (can) markOpened(id, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page, can]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      if (e.key === 'ArrowRight') setPage((p) => Math.min(total - 1, p + 1));
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(0, p - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  if (!note) return <NotFound />;
  if (!can) {
    return (
      <main id="main" tabIndex={-1} className="container-page py-14">
        <EmptyState
          title={owned ? 'Your Pass has ended' : 'This note is not in your library'}
          icon="lock"
          action={owned ? <Link to={`/subscribe?note=${id}`} className="btn btn-primary">Renew Pass</Link> : <Link to={`/note/${id}`} className="btn btn-primary">View note</Link>}
        >
          {owned ? 'Renew BombaNotes Pass to read and download this note again.' : 'Add it to your library first (free notes are one click, Pass notes need BombaNotes Pass), then you can read it here.'}
        </EmptyState>
      </main>
    );
  }

  return (
    <main id="main" tabIndex={-1} className="container-page py-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/library" className="btn btn-ghost btn-sm -ml-3"><Icon name="arrowLeft" size={16} /> My Library</Link>
        <div className="flex flex-wrap gap-2">
          <DownloadButton note={note} size="sm" />
          <BookmarkButton noteId={note.id} title={note.title} variant="labelled" className="btn-sm" />
        </div>
      </div>
      <p className="font-mono text-xs uppercase tracking-wider text-ink-70">{note.courseCode}</p>
      <h1 className="mb-5 mt-1 text-2xl font-extrabold sm:text-3xl">{note.title}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Pages" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <ol className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {note.preview.map((p, i) => (
              <li key={i} className="shrink-0">
                <button
                  type="button"
                  aria-current={page === i ? 'page' : undefined}
                  onClick={() => setPage(i)}
                  className={`flex w-full items-center gap-2 rounded-lg border-2 px-3 py-2 text-left text-[13px] font-semibold transition ${page === i ? 'border-ink bg-ink text-paper' : 'border-ink/20 bg-white hover:border-ink'}`}
                >
                  <span className="font-mono text-[11px] opacity-70">{i + 1}</span>
                  <span className="whitespace-nowrap lg:whitespace-normal">{p.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0">
          <DocSheet page={note.preview[page]} index={page} note={note} />
          <div className="mt-4 flex items-center justify-between">
            <button type="button" className="btn btn-outline" disabled={page === 0} onClick={() => setPage(page - 1)}><Icon name="arrowLeft" size={16} /> Previous</button>
            <span className="text-sm font-semibold" aria-live="polite">Page {page + 1} of {total}</span>
            <button type="button" className="btn btn-dark" disabled={page === total - 1} onClick={() => setPage(page + 1)}>Next <Icon name="arrowRight" size={16} /></button>
          </div>
          <p className="mt-5 flex items-start gap-2 rounded-lg bg-sun-soft p-3 text-[13px] leading-relaxed">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" />
            Demo reader: this prototype bundles {total} sample pages of this {note.pages}-page note instead of the full PDF. Use the arrow keys to turn pages.
          </p>
        </div>
      </div>
    </main>
  );
}

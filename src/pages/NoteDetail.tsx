import { CATALOG, categoryById, creatorById } from '../data';
import { AcquireAction } from '../components/AcquireAction';
import { BookmarkButton } from '../components/BookmarkButton';
import { Cover } from '../components/Cover';
import { DocViewer } from '../components/Doc';
import { Icon } from '../components/Icon';
import { NoteCard } from '../components/NoteCard';
import { Avatar, Breadcrumbs, Rating } from '../components/ui';
import { DownloadButton } from '../components/DownloadButton';
import { CREATOR_PERCENT, PASS_NAME, PASS_PRICE } from '../config';
import { formatCount, formatDate, formatRp } from '../lib/format';
import { Link } from '../lib/router';
import { relatedNotes } from '../lib/search';
import { canAccess, hasPass, isOwned, libraryEntry, useAppState, useNote } from '../store/store';
import { NotFound } from './NotFound';

export function NoteDetail({ id }: { id: string }) {
  const s = useAppState();
  const note = useNote(id);
  if (!note) return <NotFound />;

  const creator = creatorById(note.creatorId);
  const cat = categoryById(note.category);
  const owned = isOwned(note.id, s);
  const entry = libraryEntry(note.id, s);
  const mine = note.creatorId === 'me';
  const related = relatedNotes(note, CATALOG, 4);
  const can = canAccess(note.id, s);
  const unlocked = can || mine ? note.pages : note.openPages;
  const passActive = hasPass(s);

  const ownedLabel = !can ? 'Pass expired' : entry?.kind === 'pass' ? 'In your library with Pass' : entry?.kind === 'free' ? 'Free note added' : 'Pre-loaded demo item';

  return (
    <main id="main" tabIndex={-1} className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Explore', to: '/explore' },
          { label: cat?.name ?? 'Notes', to: `/explore?cat=${note.category}` },
          { label: note.title },
        ]}
      />

      {note.listingStatus && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-lg border-2 border-ink bg-sun-soft p-4 text-sm">
          <Icon name="info" size={20} className="mt-0.5 shrink-0" />
          <p>
            <strong>{note.listingStatus}.</strong> Only you can see this listing. This prototype has no moderation team, so it stays in this state until you edit it or reset the demo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="flex items-center justify-center rounded-2xl border-2 border-ink bg-paper-2 px-12 py-10"
            style={{ backgroundImage: 'radial-gradient(rgba(33,28,69,.09) 1px, transparent 1.2px)', backgroundSize: '14px 14px' }}
          >
            <div className="w-full max-w-[230px] -rotate-2" style={{ filter: 'drop-shadow(8px 10px 0 rgba(33,28,69,.2))' }}>
              <Cover note={note} />
            </div>
          </div>
        </div>

        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-ink-70">
            {note.courseCode} · {note.courseName}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-[1.1] sm:text-[40px]">{note.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2.5">
              <Avatar name={creator?.name ?? 'Student'} size={36} tone={note.palette} />
              <div className="leading-tight">
                <p className="text-sm font-semibold">{creator?.name}</p>
                <p className="text-xs text-ink-70">{creator?.program} · Student creator</p>
              </div>
            </div>
            <Rating rating={note.rating} count={note.reviewCount} size={16} />
            {note.downloads > 0 && (
              <span className="inline-flex items-center gap-1 text-[13px] text-ink-70">
                <Icon name="download" size={15} /> {formatCount(note.downloads)} downloads
              </span>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-ink/15 py-5 text-sm sm:grid-cols-4">
            {[
              ['University', note.university],
              ['Semester', `Semester ${note.semester} · ${note.term}`],
              ['Length', `${note.pages} pages`],
              ['Format', note.format],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 font-semibold leading-snug">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Buy box */}
          <section aria-label="Get this note" className="card mt-6 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">{owned ? 'Your copy' : mine ? 'Your listing' : note.access === 'free' ? 'Access' : PASS_NAME}</p>
                {owned ? (
                  <p className="mt-1 inline-flex items-center gap-2 font-display text-xl font-extrabold">
                    <Icon name={can ? 'check' : 'lock'} size={20} className={can ? 'text-mint-dark' : ''} /> {ownedLabel}
                  </p>
                ) : note.access === 'free' ? (
                  <p className="mt-1 font-display text-3xl font-extrabold leading-none">FREE</p>
                ) : (
                  <p className="mt-1 font-display text-3xl font-extrabold leading-none">
                    {formatRp(PASS_PRICE)}<span className="text-base font-bold text-ink-70"> / month</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <BookmarkButton noteId={note.id} title={note.title} variant="labelled" />
                {!mine && !note.listingStatus && <AcquireAction note={note} />}
                {mine && (
                  <Link to="/dashboard" className="btn btn-outline btn-lg">
                    Manage in dashboard
                  </Link>
                )}
              </div>
            </div>
            {can && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
                <Link to={`/read/${note.id}`} className="btn btn-primary">
                  <Icon name="book" size={18} /> Read note
                </Link>
                <DownloadButton note={note} />
              </div>
            )}
            <p className="mt-4 border-t border-ink/10 pt-3 text-[13px] leading-relaxed text-ink-70">
              {owned
                ? !can
                  ? 'Your Pass has ended, so this note is locked. Renew the Pass to read and download it again.'
                  : entry?.kind === 'seeded'
                    ? 'This item is pre-loaded to demonstrate a returning user. It was not acquired in this session.'
                    : 'In My Library. Read it online or download the PDF any time.'
                : note.access === 'free'
                  ? 'Free forever. No payment needed.'
                  : passActive
                    ? 'Your Pass is active: add this note to your library, then read it and download it.'
                    : `One ${PASS_NAME} unlocks, reads and downloads every Pass note. ${CREATOR_PERCENT}% of Pass revenue goes to creators. Payment is a demo and no real money moves.`}
            </p>
          </section>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="desc">
            <h2 id="desc" className="text-2xl font-extrabold">About this note</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-90">{note.description}</p>
            <h3 className="mt-6 text-lg font-bold">Topics covered</h3>
            <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {note.topics.map((t) => (
                <li key={t} className="flex items-start gap-2 text-[14px]">
                  <Icon name="check" size={17} className="mt-0.5 shrink-0 text-mint-dark" />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="preview">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <h2 id="preview" className="text-2xl font-extrabold">Preview</h2>
              <p className="text-[13px] text-ink-70">
                {owned || mine
                  ? 'Sample pages bundled in this demo.'
                  : `Read the first ${Math.min(note.openPages, note.preview.length)} sample ${note.openPages === 1 ? 'page' : 'pages'} free.`}
              </p>
            </div>
            <DocViewer
              key={note.id + (owned ? 'o' : 'p')}
              note={note}
              unlockedPages={unlocked}
              lockedAction={!mine && !note.listingStatus ? <AcquireAction note={note} /> : undefined}
            />
            {note.listingStatus === undefined && (
              <p className="mt-3 text-xs text-ink-70">Demo content: sample pages are written for this prototype. The full PDF is not included.</p>
            )}
          </section>
        </div>

        <aside aria-labelledby="creator-h">
          <h2 id="creator-h" className="text-lg font-bold">About the creator</h2>
          <div className="card mt-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={creator?.name ?? 'Student'} size={48} tone={note.palette} />
              <div>
                <p className="font-bold leading-tight">{creator?.name}</p>
                <p className="text-[13px] text-ink-70">{creator?.university}</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-ink-70">
              {creator?.program}, semester {creator?.semester}. Demo profile · not verified.
            </p>
            {note.publishedAt && !note.listingStatus && <p className="mt-1 text-[13px] text-ink-70">Published {formatDate(note.publishedAt)}</p>}
            <Link to={`/explore?q=${encodeURIComponent(creator?.name ?? '')}`} className="link mt-3 inline-block text-sm">
              More notes by {creator?.name.split(' ')[0]}
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="related">
          <h2 id="related" className="mb-5 text-2xl font-extrabold">Related notes</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((n) => (
              <li key={n.id}>
                <NoteCard note={n} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

import { creatorById } from '../data';
import { formatCount } from '../lib/format';
import { Link } from '../lib/router';
import { canAccess, isOwned, useAppState } from '../store/store';
import type { Access, Note } from '../types';
import { BookmarkButton } from './BookmarkButton';
import { Cover } from './Cover';
import { Icon } from './Icon';
import { Rating } from './ui';

export function PriceTag({ access, className = '' }: { access: Access; className?: string }) {
  return access === 'free' ? (
    <span className={`chip chip-mint ${className}`}>FREE</span>
  ) : (
    <span className={`chip chip-ink ${className}`}>PASS</span>
  );
}

function OwnedOrPrice({ note }: { note: Note }) {
  const s = useAppState();
  if (isOwned(note.id, s)) {
    return canAccess(note.id, s) ? (
      <span className="chip chip-mint">
        <Icon name="check" size={12} /> In library
      </span>
    ) : (
      <span className="chip chip-sun">Pass expired</span>
    );
  }
  if (note.creatorId === 'me') return <span className="chip chip-plain">Your note</span>;
  return <PriceTag access={note.access} />;
}

interface Props {
  note: Note;
  variant?: 'card' | 'featured';
}

/** Marketplace card. The title link is stretched over the whole card; the bookmark sits above it. */
export function NoteCard({ note, variant = 'card' }: Props) {
  const creator = creatorById(note.creatorId);
  const featured = variant === 'featured';

  return (
    <article
      className={`card group relative flex overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift ${
        'h-full flex-col'
      }`}
    >
      <div
        className={`relative flex items-center justify-center bg-paper-2 ${
          featured ? 'flex-1 px-8 py-10' : 'px-10 pb-5 pt-6'
        }`}
        style={{ backgroundImage: 'radial-gradient(rgba(33,28,69,.09) 1px, transparent 1.2px)', backgroundSize: '14px 14px' }}
      >
        <div
          className={`w-full transition duration-200 group-hover:-rotate-1 group-hover:scale-[1.02] ${featured ? 'max-w-[230px] -rotate-2' : 'max-w-[150px]'}`}
          style={{ filter: 'drop-shadow(6px 8px 0 rgba(33,28,69,.16))' }}
        >
          <Cover note={note} />
        </div>
        <div className="absolute right-3 top-3 z-10">
          <BookmarkButton noteId={note.id} title={note.title} />
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <OwnedOrPrice note={note} />
        </div>
      </div>

      <div className={`flex flex-col p-4 ${featured ? 'sm:p-6' : 'flex-1'}`}>
        <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink-70">
          {note.courseCode}
          {featured && <span className="ml-2 text-coral-dark">· Trending this week</span>}
        </p>
        <h3 className={`mt-1 font-bold leading-snug ${featured ? 'text-2xl sm:text-[26px]' : 'clamp-2 text-[16px]'}`}>
          <Link
            to={`/note/${note.id}`}
            className="outline-offset-4 after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-xl"
          >
            {note.title}
          </Link>
        </h3>
        {featured && <p className="clamp-3 mt-3 text-[14px] leading-relaxed text-ink-70">{note.description}</p>}
        <p className="mt-2 text-[13px] text-ink-70">
          by <span className="font-medium text-ink-90">{creator?.name ?? 'Student'}</span>
          {featured && creator ? ` · ${creator.university}` : ''}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
          <Rating rating={note.rating} count={note.reviewCount} />
          <span className="inline-flex items-center gap-1 text-[13px] text-ink-70">
            <Icon name="download" size={14} /> {formatCount(note.downloads)}
          </span>
        </div>
        {featured && (
          <div className="mt-5 flex items-center gap-3">
            <span className="btn btn-primary pointer-events-none">View note</span>
            <PriceTag access={note.access} />
          </div>
        )}
      </div>
    </article>
  );
}

/** Compact horizontal row: used by "Continue studying". */
export function NoteRow({ note, meta, action }: { note: Note; meta: string; action: React.ReactNode }) {
  return (
    <article className="card relative flex items-center gap-4 p-3 pr-4">
      <div className="w-14 shrink-0 sm:w-16" style={{ filter: 'drop-shadow(3px 4px 0 rgba(33,28,69,.15))' }}>
        <Cover note={note} mini />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-70">{note.courseCode}</p>
        <h3 className="clamp-2 text-[15px] font-bold leading-snug">{note.title}</h3>
        <p className="mt-0.5 text-[13px] text-ink-70">{meta}</p>
      </div>
      <div className="relative z-10 shrink-0">{action}</div>
    </article>
  );
}

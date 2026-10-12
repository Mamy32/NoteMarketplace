import { ME_ID } from '../data';
import { PASS_PRICE } from '../config';
import { formatRp } from '../lib/format';
import { Link } from '../lib/router';
import { acquireFree, acquireWithPass, canAccess, hasPass, isOwned, useAppState } from '../store/store';
import type { Note } from '../types';
import { Icon } from './Icon';
import { useToast } from './Toast';

/** The one place that decides which call-to-action a note shows. */
export function AcquireAction({ note, block = false }: { note: Note; block?: boolean }) {
  const s = useAppState();
  const toast = useToast();
  const owned = isOwned(note.id, s);
  const w = block ? 'w-full' : '';

  if (note.creatorId === ME_ID) {
    return (
      <Link to="/dashboard" className={`btn btn-outline btn-lg ${w}`}>
        Manage in dashboard
      </Link>
    );
  }
  if (owned && canAccess(note.id, s)) {
    return (
      <Link to={`/library?new=${note.id}`} className={`btn btn-dark btn-lg ${w}`}>
        <Icon name="library" size={18} /> Open in library
      </Link>
    );
  }
  if (owned) {
    // A Pass note whose Pass has run out.
    return (
      <Link to={`/subscribe?note=${note.id}`} className={`btn btn-primary btn-lg ${w}`}>
        Renew Pass · {formatRp(PASS_PRICE)}/month
      </Link>
    );
  }
  if (note.access === 'free') {
    return (
      <button
        type="button"
        className={`btn btn-primary btn-lg ${w}`}
        onClick={() => {
          if (acquireFree(note.id)) toast(`“${note.title}” was added to My Library.`);
        }}
      >
        <Icon name="download" size={18} /> Get free notes
      </button>
    );
  }
  if (hasPass(s)) {
    return (
      <button
        type="button"
        className={`btn btn-primary btn-lg ${w}`}
        onClick={() => {
          if (acquireWithPass(note.id)) toast(`“${note.title}” was added to My Library with your Pass.`);
        }}
      >
        <Icon name="plus" size={18} /> Add to library with Pass
      </button>
    );
  }
  return (
    <Link to={`/subscribe?note=${note.id}`} className={`btn btn-primary btn-lg ${w}`}>
      <Icon name="lock" size={18} /> Unlock with Pass · {formatRp(PASS_PRICE)}/month
    </Link>
  );
}

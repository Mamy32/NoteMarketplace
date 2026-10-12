import { isBookmarked, toggleBookmark, useAppState } from '../store/store';
import { Icon } from './Icon';
import { useToast } from './Toast';

interface Props {
  noteId: string;
  title: string;
  variant?: 'icon' | 'labelled';
  className?: string;
}

export function BookmarkButton({ noteId, title, variant = 'icon', className = '' }: Props) {
  const s = useAppState();
  const saved = isBookmarked(noteId, s);
  const toast = useToast();
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const on = toggleBookmark(noteId);
    toast(on ? 'Saved to your bookmarks.' : 'Removed from bookmarks.', on ? 'success' : 'info');
  };
  const label = saved ? `Remove ${title} from saved notes` : `Save ${title}`;

  if (variant === 'labelled') {
    return (
      <button type="button" aria-pressed={saved} aria-label={label} onClick={onClick} className={`btn btn-outline ${className}`}>
        <Icon name="bookmark" size={18} filled={saved} className={saved ? 'text-coral-dark' : ''} />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Saved' : 'Save for later'}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink bg-white transition hover:bg-coral-soft ${className}`}
    >
      <Icon name="bookmark" size={18} filled={saved} className={saved ? 'text-coral-dark' : ''} />
    </button>
  );
}

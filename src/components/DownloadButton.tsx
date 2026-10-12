import { downloadNote } from '../lib/download';
import type { Note } from '../types';
import { Icon } from './Icon';
import { useToast } from './Toast';

export function DownloadButton({ note, size = 'md', className = '' }: { note: Note; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const toast = useToast();
  const sz = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button
      type="button"
      className={`btn btn-outline ${sz} ${className}`}
      aria-label={`Download PDF: ${note.title}`}
      onClick={() => {
        const name = downloadNote(note);
        toast(`Downloaded ${name} (demo file with the sample pages).`);
      }}
    >
      <Icon name="download" size={size === 'sm' ? 15 : 18} /> Download PDF
    </button>
  );
}

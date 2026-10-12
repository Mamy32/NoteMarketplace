import { Cover } from '../components/Cover';
import { DownloadButton } from '../components/DownloadButton';
import { Icon } from '../components/Icon';
import { PASS_NAME } from '../config';
import { formatDate, formatRp } from '../lib/format';
import { Link, Redirect } from '../lib/router';
import { resolveNote, useAppState } from '../store/store';

export function Success({ orderId }: { orderId: string }) {
  const s = useAppState();
  const order = s.orders.find((o) => o.id === orderId);
  if (!order) return <Redirect to="/library" />;
  const note = order.noteId ? resolveNote(order.noteId, s) : undefined;
  const expires = s.subscription ? formatDate(s.subscription.expiresAt) : '';

  return (
    <main id="main" tabIndex={-1} className="container-page max-w-2xl py-10 sm:py-14">
      <div className="card pop-in overflow-hidden text-center">
        <div className="bg-mint-soft px-6 pb-6 pt-10">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-mint shadow-stamp">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#211C45" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path className="draw-check" d="m5 12.5 4.5 4.5L19 7" />
            </svg>
          </span>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl" aria-live="polite">{PASS_NAME} is active</h1>
          <p className="mt-2 text-[15px] text-ink-70">{note ? `“${note.title}” is unlocked and in your library.` : 'Every Pass note is now unlocked.'}</p>
          <p className="mx-auto mt-3 inline-block rounded-md bg-sun-soft px-3 py-1 text-xs font-semibold text-[#6B4A00]">Demo transaction · no real money was transferred</p>
        </div>
        <div className="px-6 py-6 text-left">
          {note && (
            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0"><Cover note={note} mini /></div>
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-snug">{note.title}</p>
                <p className="text-[13px] text-ink-70">{note.courseCode}</p>
              </div>
            </div>
          )}
          <dl className={`grid grid-cols-2 gap-3 pt-4 text-sm ${note ? 'mt-5 border-t border-ink/10' : ''}`}>
            <div><dt className="eyebrow">Order</dt><dd className="mt-1 font-mono font-semibold">{order.id}</dd></div>
            <div><dt className="eyebrow">Method (demo)</dt><dd className="mt-1 font-semibold">{order.method}</dd></div>
            <div><dt className="eyebrow">Total</dt><dd className="mt-1 font-semibold">{formatRp(order.total)}</dd></div>
            <div><dt className="eyebrow">Pass active until</dt><dd className="mt-1 font-semibold text-mint-dark">{expires}</dd></div>
          </dl>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {note ? (
              <>
                <Link to={`/read/${note.id}`} className="btn btn-primary btn-lg"><Icon name="book" size={18} /> Read note</Link>
                <DownloadButton note={note} size="lg" />
                <Link to={`/library?new=${note.id}`} className="btn btn-outline btn-lg sm:col-span-2"><Icon name="library" size={18} /> Open My Library</Link>
              </>
            ) : (
              <>
                <Link to="/explore?price=pass" className="btn btn-primary btn-lg">Browse Pass notes</Link>
                <Link to="/library" className="btn btn-outline btn-lg"><Icon name="library" size={18} /> Open My Library</Link>
              </>
            )}
          </div>
          <p className="mt-4 text-center"><Link to="/explore" className="link text-sm">Keep exploring notes</Link></p>
        </div>
      </div>
    </main>
  );
}

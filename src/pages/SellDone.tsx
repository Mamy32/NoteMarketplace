import { Cover } from '../components/Cover';
import { Icon } from '../components/Icon';
import { StatusBadge } from '../components/ui';
import { Link, Redirect, useRoute } from '../lib/router';
import { listingToNote, useAppState } from '../store/store';

export function SellDone({ id }: { id: string }) {
  const s = useAppState();
  const { query } = useRoute();
  const listing = s.listings.find((l) => l.id === id);
  if (!listing) return <Redirect to="/dashboard" />;
  const note = listingToNote(listing);
  const saved = query.get('mode') === 'saved';

  return (
    <main id="main" tabIndex={-1} className="container-page max-w-2xl py-10 sm:py-14">
      <div className="card pop-in overflow-hidden">
        <div className="bg-sun-soft px-6 pb-6 pt-9 text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-sun shadow-stamp">
            <Icon name="clock" size={30} />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl" aria-live="polite">
            {saved ? 'Your changes were saved.' : 'Your note has been submitted for review.'}
          </h1>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm font-medium">
            Status: <StatusBadge status={listing.status} />
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 shrink-0"><Cover note={note} mini /></div>
            <div className="min-w-0">
              <p className="font-bold leading-snug">{listing.title}</p>
              <p className="text-[13px] text-ink-70">{listing.courseCode} · {listing.access === 'free' ? 'Free' : 'Pass note'} · {listing.fileName}</p>
            </div>
          </div>
          <h2 className="mt-6 text-sm font-bold">What happens next in this demo</h2>
          <ol className="mt-2 space-y-2 text-[14px] text-ink-90">
            <li className="flex gap-2"><span className="font-mono text-coral-dark">1</span> Your listing is saved in this browser only.</li>
            <li className="flex gap-2"><span className="font-mono text-coral-dark">2</span> It stays “Pending review”. There is no real review team in this prototype, so it will not go live on its own.</li>
            <li className="flex gap-2"><span className="font-mono text-coral-dark">3</span> Track it in your seller dashboard, or edit it while it is pending.</li>
          </ol>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link to="/dashboard" className="btn btn-primary btn-lg flex-1">Open seller dashboard</Link>
            <Link to={`/note/${listing.id}`} className="btn btn-outline btn-lg flex-1">View listing</Link>
          </div>
          <p className="mt-4 text-center"><Link to="/sell" className="link text-sm">Add another note</Link></p>
        </div>
      </div>
    </main>
  );
}

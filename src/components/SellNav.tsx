import { Link } from '../lib/router';

export function SellNav({ active }: { active: 'new' | 'dashboard' }) {
  const base = 'inline-flex min-h-[40px] items-center rounded-lg border-2 px-4 text-sm font-semibold transition';
  return (
    <nav aria-label="Seller" className="mb-6 flex gap-2">
      <Link to="/sell" aria-current={active === 'new' ? 'page' : undefined} className={`${base} ${active === 'new' ? 'border-ink bg-ink text-paper' : 'border-ink/25 bg-white hover:border-ink'}`}>
        New listing
      </Link>
      <Link to="/dashboard" aria-current={active === 'dashboard' ? 'page' : undefined} className={`${base} ${active === 'dashboard' ? 'border-ink bg-ink text-paper' : 'border-ink/25 bg-white hover:border-ink'}`}>
        Seller dashboard
      </Link>
    </nav>
  );
}

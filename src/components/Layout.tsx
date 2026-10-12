import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, navigate, useRoute } from '../lib/router';
import { useAppState } from '../store/store';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { Avatar } from './ui';
import { BRAND, COMMISSION_PERCENT, PASS_NAME, PASS_PRICE } from '../config';
import { formatRp } from '../lib/format';

const startsWith = (path: string, ...prefixes: string[]) => prefixes.some((p) => (p === '/' ? path === '/' : path === p || path.startsWith(p + '/')));

const NAV = [
  { label: 'Explore', to: '/explore', match: ['/explore', '/note', '/subscribe', '/checkout', '/success'] },
  { label: 'Categories', to: '/categories', match: ['/categories'] },
  { label: 'Sell notes', to: '/sell', match: ['/sell', '/dashboard'] },
  { label: 'My Library', to: '/library', match: ['/library', '/read'] },
];

function HeaderSearch() {
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    setQ('');
  };
  return (
    <form role="search" onSubmit={submit} className="relative hidden w-56 lg:block xl:w-72">
      <label htmlFor="header-search" className="sr-only">
        Search notes
      </label>
      <Icon name="search" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-70" />
      <input
        id="header-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search courses, subjects, or topics..."
        className="h-10 w-full rounded-lg border-2 border-ink/30 bg-white pl-9 pr-3 text-[13px] placeholder:text-ink-50 hover:border-ink/50 focus:border-ink"
      />
    </form>
  );
}

export function Header() {
  const { path } = useRoute();
  const s = useAppState();
  const showSearch = path !== '/' && path !== '/explore';
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-[2px]">
      <div className="container-page flex h-16 items-center gap-4 lg:gap-6">
        <Logo />
        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = startsWith(path, ...n.match);
            return (
              <Link
                key={n.to}
                to={n.to}
                aria-current={active ? 'page' : undefined}
                className={`relative rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-ink/5 ${active ? 'text-ink' : 'text-ink-70'}`}
              >
                {n.label}
                {n.to === '/library' && s.library.length > 0 && (
                  <span className="ml-1.5 inline-flex min-w-[20px] justify-center rounded bg-ink px-1 text-[11px] font-bold leading-5 text-paper">{s.library.length}</span>
                )}
                {active && <span className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-coral" />}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {showSearch && <HeaderSearch />}
          {path !== '/explore' && (
            <Link to="/explore?focus=1" className="btn btn-outline btn-sm lg:hidden" aria-label="Search notes">
              <Icon name="search" size={18} />
              <span className="hidden sm:inline">Search</span>
            </Link>
          )}
          <Link to="/profile" aria-label={`Profile: ${s.profile.name}`} aria-current={startsWith(path, '/profile') ? 'page' : undefined} className="hidden rounded-full ring-2 ring-transparent transition hover:ring-coral md:block">
            <Avatar name={s.profile.name} size={38} />
          </Link>
        </div>
      </div>
    </header>
  );
}

const TABS = [
  { label: 'Home', to: '/', icon: 'home', match: ['/'] },
  { label: 'Explore', to: '/explore', icon: 'compass', match: ['/explore', '/note', '/subscribe', '/checkout', '/success', '/categories'] },
  { label: 'Sell', to: '/sell', icon: 'sell', match: ['/sell', '/dashboard'] },
  { label: 'Library', to: '/library', icon: 'library', match: ['/library', '/read'] },
  { label: 'Profile', to: '/profile', icon: 'user', match: ['/profile'] },
];

export function BottomNav() {
  const { path } = useRoute();
  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = startsWith(path, ...t.match);
          const sell = t.to === '/sell';
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active ? 'text-ink' : 'text-ink-70'}`}
              >
                <span
                  className={`inline-flex h-8 w-11 items-center justify-center rounded-lg transition ${
                    sell ? 'border-2 border-ink bg-coral text-ink shadow-[2px_2px_0_#211C45]' : active ? 'bg-ink text-paper' : ''
                  }`}
                >
                  <Icon name={t.icon} size={20} />
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DemoStrip() {
  return (
    <div className="bg-ink px-4 py-1.5 text-center text-[11.5px] font-medium leading-snug text-paper/90 sm:text-xs">
      Demo prototype · All notes, names, prices and statistics are fictional · Payments are simulated
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-ink bg-paper-2">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-70">{BRAND.tagline}</p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-ink-70">
            Prototype for demonstration. Free notes for everyone; {PASS_NAME} is {formatRp(PASS_PRICE)}/month for every paid note. {100 - COMMISSION_PERCENT}% of Pass revenue goes to creators; BombaNotes keeps {COMMISSION_PERCENT}%.
          </p>
        </div>
        <FooterCol title="Students" links={[['Explore notes', '/explore'], ['BombaNotes Pass', '/subscribe'], ['My Library', '/library']]} />
        <FooterCol title="Creators" links={[['Sell your notes', '/sell'], ['Seller dashboard', '/dashboard'], ['Demo profile', '/profile']]} />
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="eyebrow mb-3">{title}</h2>
      <ul className="space-y-2">
        {links.map(([l, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm font-medium text-ink hover:underline hover:decoration-coral hover:decoration-2 hover:underline-offset-4">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </button>
      <DemoStrip />
      <Header />
      {children}
      <Footer />
      <BottomNav />
    </>
  );
}

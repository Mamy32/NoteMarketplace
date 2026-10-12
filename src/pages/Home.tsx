import { useState, type FormEvent } from 'react';
import { CATALOG, CATEGORIES, catalogNote } from '../data';
import { Cover, MotifIcon, PALETTES } from '../components/Cover';
import { Icon } from '../components/Icon';
import { NoteCard, NoteRow } from '../components/NoteCard';
import { COMMISSION_PERCENT, CREATOR_PERCENT, EST_PASS_DOWNLOADS_PER_SUBSCRIBER, PASS_NAME, PASS_PRICE, passSplit } from '../config';
import { formatRp, timeAgo } from '../lib/format';
import { Link, navigate } from '../lib/router';
import { isOwned, resolveNote, useAppState } from '../store/store';

const HERO_NOTES = ['db-sql-normalization', 'ai-ml-revision', 'dsa-exam-revision', 'net-routing-tcpip'] as const;

function HeroComposition() {
  const notes = HERO_NOTES.map((id) => catalogNote(id)!);
  const spots = [
    'left-[1%] top-[8%] w-[41%] -rotate-6 z-10',
    'left-[33%] top-[2%] w-[40%] rotate-3 z-20',
    'left-[4%] bottom-[-2%] w-[36%] rotate-2 z-30',
    'right-[1%] bottom-[4%] w-[36%] -rotate-3 z-20',
  ];
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[520px] sm:h-[450px]" aria-label="A selection of study note covers">
      <div className="absolute inset-x-[6%] inset-y-[8%] rounded-[28px] border-2 border-ink bg-paper-3" aria-hidden="true" />
      {notes.map((n, i) => (
        <Link
          key={n.id}
          to={`/note/${n.id}`}
          aria-label={n.title}
          className={`absolute transition duration-200 hover:z-40 hover:-translate-y-1 hover:rotate-0 ${spots[i]}`}
          style={{ filter: 'drop-shadow(7px 9px 0 rgba(33,28,69,.28))' }}
        >
          <Cover note={n} />
        </Link>
      ))}
      <div className="absolute right-[2%] top-[6%] z-30 rotate-3 rounded-md border-2 border-ink bg-white px-3 py-2 shadow-stamp" aria-hidden="true">
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-70">All paid notes</p>
        <p className="font-display text-lg font-extrabold leading-none">{formatRp(PASS_PRICE)}/mo</p>
      </div>
      <div className="absolute bottom-[34%] left-[-1%] z-40 -rotate-3 rounded-md border-2 border-ink bg-mint px-2.5 py-1 font-display text-sm font-extrabold shadow-[2px_2px_0_#211C45]" aria-hidden="true">
        FREE notes too
      </div>
    </div>
  );
}

function HeroSearch() {
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };
  return (
    <form role="search" onSubmit={submit} className="mt-7">
      <label htmlFor="hero-search" className="sr-only">
        Search courses, subjects, or topics
      </label>
      <div className="flex flex-col gap-2 rounded-xl border-2 border-ink bg-white p-1.5 shadow-stamp sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-70" />
          <input
            id="hero-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses, subjects, or topics..."
            className="h-12 w-full rounded-lg border-0 bg-transparent pl-11 pr-3 text-[15px] placeholder:text-ink-50 focus:ring-0"
          />
        </div>
        <button type="submit" className="btn btn-dark btn-lg sm:min-h-[48px]">
          Search
        </button>
      </div>
      <p className="mt-3 text-[13px] text-ink-70">
        Try:{' '}
        {['Database', 'DSA', 'Machine Learning', 'React'].map((t, i) => (
          <span key={t}>
            {i > 0 && <span aria-hidden="true"> · </span>}
            <Link to={`/explore?q=${encodeURIComponent(t)}`} className="font-semibold text-ink underline decoration-coral decoration-2 underline-offset-4">
              {t}
            </Link>
          </span>
        ))}
      </p>
    </form>
  );
}

export function Home() {
  const s = useAppState();
  const popular = [...CATALOG].sort((a, b) => b.weeklyDownloads - a.weeklyDownloads).slice(0, 5);
  const continueItems = s.recent
    .map((r) => ({ r, note: resolveNote(r.noteId, s) }))
    .filter((x) => x.note && isOwned(x.r.noteId, s))
    .slice(0, 3);
  const example = passSplit();

  return (
    <main id="main" tabIndex={-1}>
      {/* Hero */}
      <section className="border-b-2 border-ink bg-paper" aria-labelledby="hero-title">
        <div className="container-page grid items-center gap-10 py-10 md:grid-cols-[1.05fr_1fr] md:py-14">
          <div>
            <p className="eyebrow mb-4">Student notes · Indonesian CS courses</p>
            <h1 id="hero-title" className="text-[44px] font-extrabold leading-[0.96] sm:text-6xl lg:text-[68px]">
              Good notes.
              <br />
              <span className="relative inline-block">
                Less cramming.
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 6c40-6 80 3 120 0s90-6 176 0" fill="none" stroke="#FF735C" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-70">Find student-made study guides for your next class, quiz, or exam.</p>
            <HeroSearch />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/explore" className="btn btn-primary btn-lg">
                Explore notes <Icon name="arrowRight" size={18} />
              </Link>
              <Link to="/sell" className="btn btn-outline btn-lg">
                Sell your notes
              </Link>
            </div>
            <p className="mt-4 text-[13px] text-ink-70">Free notes for everyone. One {PASS_NAME} ({formatRp(PASS_PRICE)}/month) unlocks and downloads every paid note.</p>
          </div>
          <HeroComposition />
        </div>
      </section>

      {/* Categories */}
      <section className="container-page pt-14" aria-labelledby="cats-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1.5">Browse by subject</p>
            <h2 id="cats-title" className="text-2xl font-extrabold sm:text-3xl">Start with your course</h2>
          </div>
          <Link to="/categories" className="link hidden text-sm sm:inline">All subjects</Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const count = CATALOG.filter((n) => n.category === c.id).length;
            const pal = PALETTES[[0, 3, 1, 2, 0, 4, 3, 1][i]];
            return (
              <li key={c.id}>
                <Link
                  to={`/explore?cat=${c.id}`}
                  className="group flex h-full items-center gap-3 rounded-xl border-2 border-ink/15 bg-white p-3 transition hover:border-ink hover:shadow-stamp"
                >
                  <span className="w-14 shrink-0 rounded-lg p-1.5 sm:w-16" style={{ background: pal.bg }}>
                    <MotifIcon cat={c.id} palette={[0, 3, 1, 2, 0, 4, 3, 1][i]} className="h-auto w-full" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-bold leading-tight sm:text-[15px]">{c.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-70">{count} {count === 1 ? 'note' : 'notes'}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Popular this week */}
      <section className="container-page pt-16" aria-labelledby="pop-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1.5">Trending now</p>
            <h2 id="pop-title" className="text-2xl font-extrabold sm:text-3xl">Popular this week</h2>
          </div>
          <Link to="/explore" className="link hidden text-sm sm:inline">See all notes</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((n, i) => (
            <div key={n.id} className={i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''}>
              <NoteCard note={n} variant={i === 0 ? 'featured' : 'card'} />
            </div>
          ))}
        </div>
      </section>

      {/* Continue studying */}
      {continueItems.length > 0 && (
        <section className="container-page pt-16" aria-labelledby="cont-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-1.5">Pick up where you left off</p>
              <h2 id="cont-title" className="text-2xl font-extrabold sm:text-3xl">Continue studying</h2>
            </div>
            <Link to="/library" className="link hidden text-sm sm:inline">Open My Library</Link>
          </div>
          <ul className="grid gap-3 md:grid-cols-3">
            {continueItems.map(({ r, note }) => (
              <li key={r.noteId}>
                <NoteRow
                  note={note!}
                  meta={`Page ${r.lastPage + 1} · opened ${timeAgo(r.openedAt)}`}
                  action={
                    <Link to={`/read/${r.noteId}?p=${r.lastPage}`} className="btn btn-outline btn-sm" aria-label={`Continue ${note!.title}`}>
                      Continue
                    </Link>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Value props */}
      <section className="container-page pt-16" aria-labelledby="value-title">
        <h2 id="value-title" className="sr-only">Why BombaNotes</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            { n: '01', icon: 'search', t: 'Find notes by course', d: 'Search by course code, topic or university. Every note is tied to a real class, so you skip the guesswork.' },
            { n: '02', icon: 'eye', t: 'Preview, then unlock', d: `Read sample pages first. If the explanations click, one ${PASS_NAME} (${formatRp(PASS_PRICE)}/month) unlocks, reads and downloads every paid note.` },
            { n: '03', icon: 'wallet', t: 'Share knowledge and earn', d: `List your own original notes. ${CREATOR_PERCENT}% of Pass revenue goes to creators, shared by downloads. Free notes are welcome too.` },
          ].map((v) => (
            <li key={v.n} className="card relative p-6">
              <span className="block font-mono text-xs font-medium text-coral-dark">{v.n}</span>
              <span className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-paper">
                <Icon name={v.icon} size={22} />
              </span>
              <h3 className="mt-4 text-xl font-bold">{v.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-70">{v.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Sell CTA */}
      <section className="container-page pt-6" aria-labelledby="sell-title">
        <div className="grid items-center gap-6 rounded-2xl border-2 border-ink bg-ink p-6 text-paper sm:p-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 id="sell-title" className="text-3xl font-extrabold text-paper sm:text-4xl">Got notes worth sharing?</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-paper/80">
              Upload your original study notes. Pass subscribers read and download them, and {CREATOR_PERCENT}% of Pass revenue goes to the creator pool, shared by downloads. BombaNotes keeps a {COMMISSION_PERCENT}% commission.
            </p>
            <Link to="/sell" className="btn btn-primary btn-lg mt-6 border-paper">
              Sell your notes <Icon name="arrowRight" size={18} />
            </Link>
          </div>
          <div className="rounded-xl bg-paper p-5 text-ink">
            <p className="eyebrow mb-3">Example: one Pass month</p>
            <dl>
              <div className="flex justify-between border-b border-ink/10 py-2 text-sm"><dt>Pass price</dt><dd className="font-semibold">{formatRp(example.price)}</dd></div>
              <div className="flex justify-between border-b border-ink/10 py-2 text-sm"><dt>BombaNotes commission ({COMMISSION_PERCENT}%)</dt><dd className="font-semibold">−{formatRp(example.commission)}</dd></div>
              <div className="flex justify-between border-b border-ink/10 py-2 text-sm"><dt>Creator pool</dt><dd className="font-semibold">{formatRp(example.creatorPool)}</dd></div>
              <div className="flex justify-between pt-3 font-display text-lg font-extrabold"><dt>≈ per download</dt><dd className="text-mint-dark">{formatRp(example.perDownload)}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-ink-70">Illustrative: assumes {EST_PASS_DOWNLOADS_PER_SUBSCRIBER} downloads per subscriber per month.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

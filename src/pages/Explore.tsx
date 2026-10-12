import { useEffect, useMemo, useRef, useState } from 'react';
import { CATALOG, CATEGORIES, UNIVERSITIES } from '../data';
import { Icon } from '../components/Icon';
import { NoteCard } from '../components/NoteCard';
import { EmptyState, PageHeader } from '../components/ui';
import { Link, buildQuery, replaceRoute, useRoute } from '../lib/router';
import { activeFilterCount, filterNotes, type Filters, type PriceType, type SortKey } from '../lib/search';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'rated', label: 'Highest rated' },
  { id: 'newest', label: 'Newest' },
  { id: 'price', label: 'Free first' },
];

export function Explore() {
  const { query } = useRoute();
  const f: Filters = {
    q: query.get('q') ?? '',
    cat: query.get('cat') ?? '',
    uni: query.get('uni') ?? '',
    course: query.get('course') ?? '',
    price: (['free', 'pass'].includes(query.get('price') ?? '') ? query.get('price') : 'all') as PriceType,
    sort: (SORTS.some((s) => s.id === query.get('sort')) ? query.get('sort') : 'popular') as SortKey,
  };
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.get('focus')) searchRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch };
    if (patch.cat !== undefined && patch.cat !== f.cat) next.course = '';
    replaceRoute(
      '/explore' +
        buildQuery({
          q: next.q || undefined,
          cat: next.cat || undefined,
          uni: next.uni || undefined,
          course: next.course || undefined,
          price: next.price !== 'all' ? next.price : undefined,
          sort: next.sort !== 'popular' ? next.sort : undefined,
        }),
    );
  };

  const results = useMemo(() => filterNotes(CATALOG, f), [f.q, f.cat, f.uni, f.course, f.price, f.sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const courses = useMemo(
    () => Array.from(new Set(CATALOG.filter((n) => !f.cat || n.category === f.cat).map((n) => n.courseName))).sort(),
    [f.cat],
  );
  const active = activeFilterCount(f);
  const catName = CATEGORIES.find((c) => c.id === f.cat)?.name;

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <label htmlFor="f-cat" className="label">Subject</label>
        <select id="f-cat" className="input" value={f.cat} onChange={(e) => update({ cat: e.target.value })}>
          <option value="">All subjects</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-uni" className="label">University</label>
        <select id="f-uni" className="input" value={f.uni} onChange={(e) => update({ uni: e.target.value })}>
          <option value="">All universities</option>
          {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-course" className="label">Course</label>
        <select id="f-course" className="input" value={f.course} onChange={(e) => update({ course: e.target.value })}>
          <option value="">All courses</option>
          {courses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="label">Access</legend>
        <div className="grid grid-cols-3 gap-1.5">
          {(['all', 'free', 'pass'] as PriceType[]).map((p) => (
            <label
              key={p}
              className={`flex min-h-[40px] cursor-pointer items-center justify-center rounded-lg border-2 text-[13px] font-semibold capitalize transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
                f.price === p ? 'border-ink bg-ink text-paper' : 'border-ink/25 bg-white hover:border-ink'
              }`}
            >
              <input type="radio" name="price" value={p} checked={f.price === p} onChange={() => update({ price: p })} className="sr-only" />
              {p}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="button" className="btn btn-outline w-full" disabled={active === 0} onClick={() => replaceRoute('/explore' + buildQuery({ sort: f.sort !== 'popular' ? f.sort : undefined }))}>
        Clear filters
      </button>
    </div>
  );

  return (
    <main id="main" tabIndex={-1} className="container-page py-8 sm:py-10">
      <PageHeader eyebrow="Marketplace" title={catName ? catName : 'Explore notes'}>
        {catName ? `Student-made notes for ${catName}.` : 'Search by title, subject, course code or topic, then preview before you get anything.'}
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 lg:hidden">
            <button type="button" className="btn btn-outline w-full justify-between" aria-expanded={showFilters} aria-controls="filter-panel" onClick={() => setShowFilters((v) => !v)}>
              <span className="inline-flex items-center gap-2"><Icon name="sliders" size={18} /> Filters{active > 0 ? ` (${active})` : ''}</span>
              <Icon name="chevronDown" size={18} className={showFilters ? 'rotate-180' : ''} />
            </button>
          </div>
          <div id="filter-panel" className={`card p-4 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            {filterPanel}
          </div>
        </aside>

        <section aria-label="Results">
          <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
            <label htmlFor="explore-q" className="sr-only">Search notes</label>
            <Icon name="search" size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-70" />
            <input
              id="explore-q"
              ref={searchRef}
              type="search"
              value={f.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search courses, subjects, or topics..."
              className="input h-12 pl-11 text-base"
            />
          </form>

          <div className="mb-4 mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold" role="status" aria-live="polite">
              {results.length} {results.length === 1 ? 'note' : 'notes'}
              {f.q && <span className="font-normal text-ink-70"> for “{f.q}”</span>}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-ink-70">Sort by</label>
              <select id="sort" className="input !w-auto py-2 text-sm" value={f.sort} onChange={(e) => update({ sort: e.target.value as SortKey })}>
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {results.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((n) => (
                <li key={n.id}>
                  <NoteCard note={n} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title={f.q ? `No notes match “${f.q}”` : 'No notes match these filters'}
              icon="search"
              action={
                <>
                  <button type="button" className="btn btn-primary" onClick={() => replaceRoute('/explore')}>Clear all filters</button>
                  <Link to="/sell" className="btn btn-outline">Sell notes for this course</Link>
                </>
              }
            >
              Try a course code like COMP6799, or a broader topic like “SQL”. Missing a course? Write the notes yourself and be the first to list them.
            </EmptyState>
          )}
        </section>
      </div>
    </main>
  );
}

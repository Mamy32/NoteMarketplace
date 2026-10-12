import { CATALOG, CATEGORIES } from '../data';
import { MotifIcon, PALETTES } from '../components/Cover';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/ui';
import { Link } from '../lib/router';

const PAL = [0, 3, 1, 2, 0, 4, 3, 1];

export function Categories() {
  return (
    <main id="main" tabIndex={-1} className="container-page py-8 sm:py-10">
      <PageHeader eyebrow="Browse by subject" title="Categories">Pick a subject to see every note for it, from free cheatsheets to full exam guides.</PageHeader>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => {
          const notes = CATALOG.filter((n) => n.category === c.id);
          const free = notes.filter((n) => n.access === 'free').length;
          const pal = PALETTES[PAL[i]];
          return (
            <li key={c.id}>
              <Link to={`/explore?cat=${c.id}`} className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="block px-8 py-6" style={{ background: pal.bg }}>
                  <MotifIcon cat={c.id} palette={PAL[i]} className="h-auto w-full" />
                </span>
                <span className="flex flex-1 flex-col p-4">
                  <span className="font-display text-lg font-bold leading-tight">{c.name}</span>
                  <span className="mt-1 text-[13px] text-ink-70">{c.blurb}</span>
                  <span className="mt-auto flex items-center justify-between pt-3 text-[13px] font-semibold">
                    <span>{notes.length} notes · {free} free</span>
                    <Icon name="arrowRight" size={16} className="transition group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

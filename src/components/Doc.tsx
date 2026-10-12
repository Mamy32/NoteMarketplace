import { Fragment, useId, useState, type ReactNode } from 'react';
import type { Block, DocPage, Note } from '../types';
import { Icon } from './Icon';

/* ---- tiny syntax highlighter ---------------------------------------- */
const KEYWORDS: Record<string, string[]> = {
  sql: 'select from where join inner left right full on group by having order asc desc as and or not in is null count union all create index explain limit insert into values update set delete'.split(' '),
  python: 'def return if elif else while for in import from not and or none true false print class with as lambda'.split(' '),
  java: 'public private protected class extends implements static void new return try catch finally int double boolean string if else for while this super throws import'.split(' '),
  tsx: 'const let function return type import from export default useState useEffect if else true false null new'.split(' '),
};

function highlight(code: string, lang: string): ReactNode[] {
  const comment = lang === 'sql' ? '--.*' : lang === 'python' ? '#.*' : '//.*';
  const re = new RegExp(`(${comment})|("[^"\\n]*"|'[^'\\n]*')|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b[A-Za-z_][A-Za-z0-9_]*\\b)`, 'g');
  const kw = new Set(KEYWORDS[lang] ?? []);
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [txt, c, str, num, id] = m;
    if (c) out.push(<span key={i++} className="italic text-ink-50">{txt}</span>);
    else if (str) out.push(<span key={i++} className="text-[#9BE3C5]">{txt}</span>);
    else if (num) out.push(<span key={i++} className="text-[#F6C65B]">{txt}</span>);
    else if (id && kw.has(id.toLowerCase())) out.push(<span key={i++} className="font-medium text-[#FF9B88]">{txt}</span>);
    else out.push(txt);
    last = m.index + txt.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

const TONES = {
  coral: 'border-coral bg-coral-soft',
  mint: 'border-mint bg-mint-soft',
  sun: 'border-sun bg-sun-soft',
};

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'h':
      return <h4 className="mt-5 border-b-2 border-ink/10 pb-1 font-display text-[17px] font-bold first:mt-0">{b.text}</h4>;
    case 'p':
      return <p className="text-[14px] leading-relaxed text-ink-90">{b.text}</p>;
    case 'ul':
      return (
        <ul className="list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-ink-90 marker:text-coral-dark">
          {b.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <figure className="overflow-hidden rounded-md bg-ink text-paper">
          <figcaption className="flex items-center justify-between border-b border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-50">
            <span>{b.lang}</span>
            <span className="flex gap-1" aria-hidden="true">
              <i className="block h-2 w-2 rounded-full bg-coral" />
              <i className="block h-2 w-2 rounded-full bg-sun" />
              <i className="block h-2 w-2 rounded-full bg-mint" />
            </span>
          </figcaption>
          <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[12.5px] leading-[1.6]" tabIndex={0} aria-label={`${b.lang} code sample`}>
            <code>{highlight(b.code, b.lang)}</code>
          </pre>
        </figure>
      );
    case 'math':
      return (
        <div className="overflow-x-auto rounded-md border-l-4 border-ink bg-paper-2 px-4 py-2.5 font-serif text-[15px] italic leading-8 text-ink" tabIndex={0} aria-label="Formula">
          {b.lines.map((l, i) => (
            <div key={i} className="whitespace-nowrap">
              {l}
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto rounded-md border border-ink/20" tabIndex={0} role="region" aria-label="Table">
          <table className="w-full min-w-max border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-paper-3">
                {b.head.map((h, i) => (
                  <th key={i} scope="col" className="border-b border-ink/20 px-3 py-1.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-b border-ink/10 last:border-0">
                  {r.map((c, j) => (
                    <td key={j} className={`px-3 py-1.5 ${j === 0 ? 'font-medium' : ''}`}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'flow':
      return (
        <figure>
          <div className={`flex gap-1.5 ${b.vertical ? 'flex-col items-start' : 'flex-wrap items-center'}`}>
            {b.steps.map((s, i) => (
              <Fragment key={i}>
                <span className="rounded-md border-2 border-ink bg-white px-2.5 py-1.5 text-[13px] font-medium leading-snug shadow-[2px_2px_0_#211C45]">{s}</span>
                {i < b.steps.length - 1 && <Icon name={b.vertical ? 'chevronDown' : 'arrowRight'} size={16} className="text-coral-dark" />}
              </Fragment>
            ))}
          </div>
          {b.caption && <figcaption className="mt-2 font-mono text-[11px] text-ink-70">{b.caption}</figcaption>}
        </figure>
      );
    case 'tree':
      return (
        <figure className="flex flex-col items-center rounded-md bg-paper-2 py-3">
          {b.levels.map((lv, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="h-3 w-px bg-ink/40" />}
              <div className="flex gap-5">
                {lv.map((n, j) => (
                  <span
                    key={j}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink font-mono text-[13px] font-semibold ${i === 0 ? 'bg-coral' : 'bg-white'}`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </Fragment>
          ))}
          {b.caption && <figcaption className="mt-2 font-mono text-[11px] text-ink-70">{b.caption}</figcaption>}
        </figure>
      );
    case 'callout':
      return (
        <aside className={`rounded-md border-l-4 px-3.5 py-2.5 ${TONES[b.tone]}`}>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-90">{b.title}</p>
          <p className="mt-0.5 text-[14px] leading-relaxed text-ink">{b.text}</p>
        </aside>
      );
  }
}

export function DocSheet({ page, index, note }: { page: DocPage; index: number; note: Pick<Note, 'courseCode' | 'pages' | 'title'> }) {
  return (
    <article className="sheet min-h-[420px] py-5 pr-4 sm:pr-8" style={{ paddingLeft: 'calc(var(--m) + 16px)' }} aria-label={`Page ${index + 1}: ${page.title}`}>
      <header className="mb-4 flex items-baseline justify-between gap-3 border-b border-ink/10 pb-2">
        <p className="font-mono text-[10.5px] uppercase tracking-widest text-ink-70">{note.courseCode}</p>
        <p className="truncate font-display text-[13px] font-bold text-ink">{page.title}</p>
      </header>
      <div className="space-y-3.5">
        {page.blocks.map((b, i) => (
          <BlockView key={i} b={b} />
        ))}
      </div>
      <footer className="mt-6 text-right font-mono text-[11px] text-ink-50">
        {index + 1} / {note.pages}
      </footer>
    </article>
  );
}

export function LockedSheet({ index, note, action }: { index: number; note: Pick<Note, 'pages' | 'access'>; action?: ReactNode }) {
  const bars = [92, 100, 78, 96, 60, 88, 100, 70];
  return (
    <article className="sheet relative min-h-[420px] overflow-hidden py-5 pr-4 sm:pr-8" style={{ paddingLeft: 'calc(var(--m) + 16px)' }} aria-label={`Page ${index + 1} is locked`}>
      <div className="space-y-3 opacity-60" aria-hidden="true">
        <div className="h-4 w-1/3 rounded bg-ink/15" />
        {bars.map((w, i) => (
          <div key={i} className="h-2.5 rounded bg-ink/10" style={{ width: `${w}%` }} />
        ))}
        <div className="h-24 rounded bg-ink/10" />
        {bars.slice(0, 4).map((w, i) => (
          <div key={`b${i}`} className="h-2.5 rounded bg-ink/10" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 px-6 text-center">
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-paper">
          <Icon name="lock" size={22} />
        </span>
        <p className="font-display text-lg font-bold">Pages {index + 1}–{note.pages} are in the full note</p>
        <p className="mt-1 max-w-xs text-[13px] text-ink-70">{note.access === 'pass' ? 'Unlock it with BombaNotes Pass to read and download the full note.' : 'Get this free note to read the rest.'}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </article>
  );
}

/** Page tabs + sheet. Locked pages never render their real content. */
export function DocViewer({ note, unlockedPages, lockedAction }: { note: Note; unlockedPages: number; lockedAction?: ReactNode }) {
  const [idx, setIdx] = useState(0);
  const baseId = useId();
  const total = note.preview.length;
  const hasLocked = unlockedPages < note.pages;
  const tabCount = hasLocked && unlockedPages >= total ? total + 1 : total;

  const tabs = Array.from({ length: tabCount }, (_, i) => ({
    i,
    locked: i >= unlockedPages || i >= total,
    label: i >= total ? `Pages ${total + 1}+` : `Page ${i + 1}`,
  }));
  const current = tabs[Math.min(idx, tabs.length - 1)];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setIdx((v) => Math.min(tabs.length - 1, v + 1));
    if (e.key === 'ArrowLeft') setIdx((v) => Math.max(0, v - 1));
  };

  return (
    <div>
      <div role="tablist" aria-label="Preview pages" className="mb-3 flex flex-wrap gap-1.5" onKeyDown={onKey}>
        {tabs.map((t) => (
          <button
            key={t.i}
            role="tab"
            type="button"
            id={`${baseId}-tab-${t.i}`}
            aria-selected={current.i === t.i}
            aria-controls={`${baseId}-panel`}
            tabIndex={current.i === t.i ? 0 : -1}
            onClick={() => setIdx(t.i)}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md border-2 px-3 text-[13px] font-semibold transition ${
              current.i === t.i ? 'border-ink bg-ink text-paper' : 'border-ink/25 bg-white text-ink hover:border-ink'
            }`}
          >
            {t.locked && <Icon name="lock" size={13} />}
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${current.i}`}>
        {current.locked ? (
          <LockedSheet index={current.i} note={note} action={lockedAction} />
        ) : (
          <DocSheet page={note.preview[current.i]} index={current.i} note={note} />
        )}
      </div>
    </div>
  );
}

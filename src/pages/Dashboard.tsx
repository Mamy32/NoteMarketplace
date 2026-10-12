import { useState } from 'react';
import { CATALOG, categoryById } from '../data';
import { Cover } from '../components/Cover';
import { Icon } from '../components/Icon';
import { SellNav } from '../components/SellNav';
import { EmptyState, StatusBadge } from '../components/ui';
import { CREATOR_PERCENT, EST_PASS_DOWNLOADS_PER_SUBSCRIBER, PER_DOWNLOAD_PAYOUT } from '../config';
import { formatCount, formatRp } from '../lib/format';
import { Link } from '../lib/router';
import { listingToNote, useAppState } from '../store/store';
import type { Access, ListingStatus, Note } from '../types';

interface Row {
  id: string;
  note: Note;
  status: ListingStatus;
  access: Access;
  sales: number;
  downloads: number;
  earnings: number;
  editable: boolean;
}

const FILTERS: ('All' | ListingStatus)[] = ['All', 'Active', 'Pending review', 'Draft'];

export function Dashboard() {
  const s = useAppState();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const mine = CATALOG.filter((n) => n.creatorId === 'me');
  const rows: Row[] = [
    ...[...s.listings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map<Row>((l) => ({
      id: l.id, note: listingToNote(l), status: l.status, access: l.access, sales: 0, downloads: 0, earnings: 0, editable: true,
    })),
    ...mine.map<Row>((n) => {
      const sales = n.access === 'pass' ? n.downloads : 0;
      return { id: n.id, note: n, status: 'Active', access: n.access, sales, downloads: n.downloads, earnings: sales * PER_DOWNLOAD_PAYOUT, editable: false };
    }),
  ];

  const totals = {
    earnings: rows.reduce((a, r) => a + r.earnings, 0),
    sales: rows.reduce((a, r) => a + r.sales, 0),
    downloads: rows.reduce((a, r) => a + r.downloads, 0),
    active: rows.filter((r) => r.status === 'Active').length,
  };
  const visible = rows.filter((r) => filter === 'All' || r.status === filter);
  const count = (f: (typeof FILTERS)[number]) => rows.filter((r) => f === 'All' || r.status === f).length;

  const stats = [
    { label: 'Demo earnings', value: formatRp(totals.earnings), icon: 'wallet' },
    { label: 'Pass downloads', value: totals.sales.toLocaleString('en-US'), icon: 'sell' },
    { label: 'Total downloads', value: formatCount(totals.downloads), icon: 'download' },
    { label: 'Active listings', value: String(totals.active), icon: 'file' },
  ];

  const actions = (r: Row) => (
    <div className="flex flex-wrap gap-2">
      <Link to={`/note/${r.id}`} className="btn btn-outline btn-sm">View listing</Link>
      {r.editable && <Link to={`/sell/edit/${r.id}`} className="btn btn-dark btn-sm"><Icon name="edit" size={14} /> Edit</Link>}
    </div>
  );

  return (
    <main id="main" tabIndex={-1} className="container-page py-8 sm:py-10">
      <SellNav active="dashboard" />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Seller dashboard</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Your listings</h1>
        </div>
        <Link to="/sell" className="btn btn-primary"><Icon name="plus" size={18} /> Add new note</Link>
      </div>

      <p role="note" className="mb-5 flex items-start gap-2 rounded-lg bg-sun-soft p-3 text-[13px] leading-relaxed">
        <Icon name="info" size={16} className="mt-0.5 shrink-0" />
        <span><strong>Sample data.</strong> Downloads and earnings for live listings are demo figures, not real money. Earnings = Pass downloads × ≈{formatRp(PER_DOWNLOAD_PAYOUT)}, your share of the {CREATOR_PERCENT}% creator pool (assumes {EST_PASS_DOWNLOADS_PER_SUBSCRIBER} downloads per subscriber per month). Nothing is paid out.</span>
      </p>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="card p-4">
            <dt className="flex items-center gap-1.5 text-[13px] font-medium text-ink-70"><Icon name={st.icon} size={15} /> {st.label}</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold sm:text-[28px]">{st.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-4 mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter listings by status">
        {FILTERS.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg border-2 px-3.5 text-sm font-semibold transition ${filter === f ? 'border-ink bg-ink text-paper' : 'border-ink/25 bg-white hover:border-ink'}`}>
            {f} <span className={`rounded px-1.5 text-xs ${filter === f ? 'bg-paper/20' : 'bg-ink-10'}`}>{count(f)}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title={filter === 'All' ? 'No listings yet' : `No ${filter.toLowerCase()} listings`} icon="file" action={<Link to="/sell" className="btn btn-primary">Add new note</Link>}>
          Listings you create will show up here with their status.
        </EmptyState>
      ) : (
        <>
          {/* Table (md and up) */}
          <div className="card hidden overflow-hidden lg:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Your listings</caption>
              <thead className="bg-paper-2 text-[12px] uppercase tracking-wider text-ink-70">
                <tr>
                  {['Note', 'Access', 'Pass downloads', 'Downloads', 'Earnings', 'Status', ''].map((h, i) => (
                    <th key={i} scope="col" className="px-4 py-3 font-semibold">{h || <span className="sr-only">Actions</span>}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 shrink-0"><Cover note={r.note} mini /></div>
                        <div className="min-w-0">
                          <p className="font-semibold leading-snug">{r.note.title}</p>
                          <p className="font-mono text-[11px] text-ink-70">{r.note.courseCode} · {categoryById(r.note.category)?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.access === 'free' ? 'Free' : 'Pass'}</td>
                    <td className="px-4 py-3">{r.status === 'Active' ? r.sales : '–'}</td>
                    <td className="px-4 py-3">{r.status === 'Active' ? r.downloads.toLocaleString('en-US') : '–'}</td>
                    <td className="px-4 py-3 font-medium">{r.status === 'Active' ? formatRp(r.earnings) : '–'}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">{actions(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <ul className="space-y-3 lg:hidden">
            {visible.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex gap-3">
                  <div className="w-12 shrink-0"><Cover note={r.note} mini /></div>
                  <div className="min-w-0 flex-1">
                    <StatusBadge status={r.status} />
                    <p className="mt-1 font-semibold leading-snug">{r.note.title}</p>
                    <p className="font-mono text-[11px] text-ink-70">{r.note.courseCode}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-4 gap-2 border-t border-ink/10 pt-3 text-center text-xs">
                  <div><dt className="text-ink-70">Access</dt><dd className="mt-0.5 font-semibold">{r.access === 'free' ? 'Free' : 'Pass'}</dd></div>
                  <div><dt className="text-ink-70">Pass dl.</dt><dd className="mt-0.5 font-semibold">{r.status === 'Active' ? r.sales : '–'}</dd></div>
                  <div><dt className="text-ink-70">Downloads</dt><dd className="mt-0.5 font-semibold">{r.status === 'Active' ? formatCount(r.downloads) : '–'}</dd></div>
                  <div><dt className="text-ink-70">Earnings</dt><dd className="mt-0.5 font-semibold">{r.status === 'Active' ? formatRp(r.earnings) : '–'}</dd></div>
                </dl>
                <div className="mt-3">{actions(r)}</div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-70">Edit is available for Draft and Pending review listings. Live listings are locked in this demo.</p>
        </>
      )}
    </main>
  );
}

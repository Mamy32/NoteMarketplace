import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { CATALOG } from '../data';
import { COMMISSION_RATE, PASS_PRICE, passSplit } from '../config';
import { buildNotePdf } from '../lib/download';
import { DEFAULT_FILTERS, filterNotes, matchesQuery } from '../lib/search';
import { getState, hasPass, reloadFromStorage } from '../store/store';

const go = (path: string) => {
  window.location.hash = '#' + path;
};
const TITLE = 'Database Systems — SQL & Normalization Guide';

describe('search, filters and sorting', () => {
  it('matches title, subject, course code and keywords', () => {
    expect(filterNotes(CATALOG, { ...DEFAULT_FILTERS, q: 'Database' }).map((n) => n.id)).toEqual(
      expect.arrayContaining(['db-sql-normalization', 'db-joins-cheatsheet', 'db-transactions-indexing']),
    );
    expect(filterNotes(CATALOG, { ...DEFAULT_FILTERS, q: 'database' })).toHaveLength(3);
    expect(filterNotes(CATALOG, { ...DEFAULT_FILTERS, q: 'COMP6799' }).map((n) => n.id)).toContain('db-sql-normalization');
    expect(filterNotes(CATALOG, { ...DEFAULT_FILTERS, q: 'sql and normalization' }).map((n) => n.id)).toContain('db-sql-normalization');
    expect(filterNotes(CATALOG, { ...DEFAULT_FILTERS, q: 'react' }).map((n) => n.id)).toContain('web-react-fundamentals');
    expect(filterNotes(CATALOG, { ...DEFAULT_FILTERS, q: 'zzzzqq' })).toHaveLength(0);
    expect(matchesQuery(CATALOG[0], '')).toBe(true);
  });

  it('filters by category, university, course and price type', () => {
    const f = (p: Partial<typeof DEFAULT_FILTERS>) => filterNotes(CATALOG, { ...DEFAULT_FILTERS, ...p });
    expect(f({ cat: 'networking' }).every((n) => n.category === 'networking')).toBe(true);
    expect(f({ uni: 'Telkom University' })).toHaveLength(0);
    expect(f({ uni: 'Universitas Indonesia' }).every((n) => n.university === 'Universitas Indonesia')).toBe(true);
    expect(f({ course: 'Database Systems' })).toHaveLength(3);
    expect(f({ price: 'free' }).every((n) => n.access === 'free')).toBe(true);
    expect(f({ price: 'pass' }).every((n) => n.access === 'pass')).toBe(true);
  });

  it('sorts by popularity, rating, date and price', () => {
    const s = (sort: 'popular' | 'rated' | 'newest' | 'price') => filterNotes(CATALOG, { ...DEFAULT_FILTERS, sort });
    const pop = s('popular');
    expect(pop[0].downloads).toBeGreaterThanOrEqual(pop[1].downloads);
    const rated = s('rated');
    expect(rated[0].rating).toBeGreaterThanOrEqual(rated[rated.length - 1].rating);
    const newest = s('newest');
    expect(newest[0].publishedAt >= newest[1].publishedAt).toBe(true);
    const freeFirst = s('price');
    expect(freeFirst[0].access).toBe('free');
    expect(freeFirst[freeFirst.length - 1].access).toBe('pass');
  });

  it('updates the Explore page when filters change', async () => {
    const user = userEvent.setup();
    go('/explore');
    render(<App />);
    expect(await screen.findByText(`${CATALOG.length} notes`)).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: /search notes/i }), 'Database');
    expect(await screen.findByText('3 notes')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /free/i }));
    expect(await screen.findByText('1 note')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(await screen.findByText(`${CATALOG.length} notes`)).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: /search notes/i }), 'qqqzzz');
    expect(await screen.findByText(/no notes match/i)).toBeInTheDocument();
  });
});

const mockBlobUrls = () => {
  const blobs: Blob[] = [];
  URL.createObjectURL = vi.fn((b: Blob) => { blobs.push(b); return 'blob:demo'; }) as never;
  URL.revokeObjectURL = vi.fn() as never;
  return blobs;
};
const readBlob = (b: Blob) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsText(b); });

describe('buyer demo flow (BombaNotes Pass)', () => {
  it('Home → search → open note → preview → pay for Pass → unlocked → read, download, library', async () => {
    const user = userEvent.setup();
    const blobs = mockBlobUrls();
    render(<App />);

    await user.type(await screen.findByRole('searchbox', { name: /search courses/i }), 'Database');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    const link = await screen.findByRole('link', { name: TITLE });
    expect(screen.getByText('3 notes')).toBeInTheDocument();
    await user.click(link);

    // detail + preview, page 3 locked until the Pass is paid
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument();
    expect(screen.getByText(/Anatomy of a query/)).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /page 3/i }));
    expect(screen.getByText(/are in the full note/i)).toBeInTheDocument();
    expect(screen.queryByText(/BCNF in one sentence/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /download pdf/i })).not.toBeInTheDocument();

    await user.click(screen.getAllByRole('link', { name: /unlock with pass/i })[0]);
    expect(await screen.findByRole('heading', { name: /get bombanotes pass/i })).toBeInTheDocument();
    expect(screen.getByText(/demo transaction/i)).toBeInTheDocument();
    expect(screen.getByText('Total today').nextSibling).toHaveTextContent('Rp15,000');
    expect(screen.getAllByText(TITLE).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /pay rp15,000/i }));
    expect(await screen.findByRole('heading', { name: /bombanotes pass is active/i }, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText(/no real money was transferred/i)).toBeInTheDocument();
    expect(hasPass()).toBe(true);
    expect(getState().orders[0]).toMatchObject({ plan: 'pass', total: PASS_PRICE, noteId: 'db-sql-normalization' });

    // download from the success screen yields a real PDF
    await user.click(screen.getByRole('button', { name: /download pdf/i }));
    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe('application/pdf');
    const text = await readBlob(blobs[0]);
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('Normalization');

    // read the whole note
    await user.click(screen.getByRole('link', { name: /read note/i }));
    expect(await screen.findByText(/Anatomy of a query/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^next/i }));
    await user.click(screen.getByRole('button', { name: /^next/i }));
    expect(await screen.findByText(/BCNF in one sentence/)).toBeInTheDocument();

    go('/library');
    const card = await screen.findByRole('article', { name: TITLE });
    expect(within(card).getByText('Pass')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: /open note/i })).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /pass notes/i }));
    expect(screen.getByRole('article', { name: TITLE })).toBeInTheDocument();

    // detail page is fully unlocked and shows Open in library
    go('/note/db-sql-normalization');
    expect(await screen.findByRole('link', { name: /open in library/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /unlock with pass/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });

  it('never charges twice, and another Pass note is one click with no payment', async () => {
    const user = userEvent.setup();
    go('/subscribe');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /pay rp15,000/i }));
    await screen.findByRole('heading', { name: /bombanotes pass is active/i }, { timeout: 4000 });
    expect(getState().library.some((e) => e.kind === 'pass')).toBe(false); // no note chosen, none added

    go('/subscribe');
    expect(await screen.findByText(/pass is already active/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pay rp/i })).not.toBeInTheDocument();

    go('/note/ai-ml-revision');
    await user.click(await screen.findByRole('button', { name: /add to library with pass/i }));
    expect(await screen.findByRole('link', { name: /open in library/i })).toBeInTheDocument();
    expect(getState().library[0]).toMatchObject({ noteId: 'ai-ml-revision', kind: 'pass' });
    expect(getState().orders).toHaveLength(1);
  });

  it('persists the Pass and library across a simulated refresh', async () => {
    const user = userEvent.setup();
    go('/note/db-sql-normalization');
    render(<App />);
    await user.click((await screen.findAllByRole('link', { name: /unlock with pass/i }))[0]);
    await user.click(await screen.findByRole('button', { name: /pay rp15,000/i }));
    await screen.findByRole('heading', { name: /bombanotes pass is active/i }, { timeout: 4000 });
    reloadFromStorage();
    expect(hasPass()).toBe(true);
    expect(getState().library.find((e) => e.noteId === 'db-sql-normalization')?.kind).toBe('pass');
    expect(JSON.parse(localStorage.getItem('bombanotes:v2')!).subscription.orderId).toBe('DEMO-0001');
  });

  it('locks Pass notes again when the Pass has expired', async () => {
    const user = userEvent.setup();
    go('/note/db-sql-normalization');
    render(<App />);
    await user.click((await screen.findAllByRole('link', { name: /unlock with pass/i }))[0]);
    await user.click(await screen.findByRole('button', { name: /pay rp15,000/i }));
    await screen.findByRole('heading', { name: /bombanotes pass is active/i }, { timeout: 4000 });

    const raw = JSON.parse(localStorage.getItem('bombanotes:v2')!);
    raw.subscription.expiresAt = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem('bombanotes:v2', JSON.stringify(raw));
    reloadFromStorage();
    expect(hasPass()).toBe(false);

    go('/library');
    const card = await screen.findByRole('article', { name: TITLE });
    expect(within(card).getByText('Pass expired')).toBeInTheDocument();
    expect(within(card).queryByRole('link', { name: /open note/i })).not.toBeInTheDocument();
    expect(within(card).getByRole('link', { name: /renew pass/i })).toBeInTheDocument();
    go('/read/db-sql-normalization');
    expect(await screen.findByText(/your pass has ended/i)).toBeInTheDocument();
    // seeded demo items stay readable
    go('/read/dsa-exam-revision');
    expect(await screen.findByText(/Big-O cheat table/)).toBeInTheDocument();
  });

  it('builds a valid PDF from the sample pages', async () => {
    const note = CATALOG.find((n) => n.id === 'ai-ml-revision')!;
    const text = await readBlob(buildNotePdf(note));
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(text).toContain('Artificial Intelligence');
    expect(text).toContain('Revision Notes');
    expect(text).toContain('/Count 4');
  });
});

describe('free acquisition, bookmarks and library', () => {
  it('gets a free note without checkout', async () => {
    const user = userEvent.setup();
    go('/note/db-joins-cheatsheet');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /get free notes/i }));
    expect(await screen.findByRole('link', { name: /open in library/i })).toBeInTheDocument();
    expect(getState().library[0]).toMatchObject({ noteId: 'db-joins-cheatsheet', kind: 'free' });
    expect(getState().orders).toHaveLength(0);
    go('/library');
    const card = await screen.findByRole('article', { name: /SQL Joins Cheatsheet/ });
    expect(within(card).getByText('Free')).toBeInTheDocument();
    expect(within(card).queryByText('Pass')).not.toBeInTheDocument();
  });

  it('toggles bookmarks and keeps them after refresh', async () => {
    const user = userEvent.setup();
    go('/note/web-react-fundamentals');
    render(<App />);
    const btn = await screen.findByRole('button', { name: /^Save Web Programming/ });
    await user.click(btn);
    expect(getState().bookmarks).toContain('web-react-fundamentals');
    reloadFromStorage();
    expect(getState().bookmarks).toContain('web-react-fundamentals');
    expect(await screen.findByRole('button', { name: /Remove Web Programming/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /Remove Web Programming/ }));
    expect(getState().bookmarks).not.toContain('web-react-fundamentals');
  });

  it('labels seeded items as demo content and never as Pass', async () => {
    go('/library');
    render(<App />);
    const card = await screen.findByRole('article', { name: /Exam Revision Guide/ });
    expect(within(card).getByText('Pre-loaded demo')).toBeInTheDocument();
    expect(screen.queryByText('Pass', { selector: '.chip' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /pass notes/i }));
    expect(await screen.findByText(/no pass notes yet/i)).toBeInTheDocument();
  });

  it('searches within the library', async () => {
    const user = userEvent.setup();
    go('/library');
    render(<App />);
    await user.type(await screen.findByRole('searchbox', { name: /search your library/i }), 'scrum');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    await user.clear(screen.getByRole('searchbox', { name: /search your library/i }));
    await user.type(screen.getByRole('searchbox', { name: /search your library/i }), 'nothing-here');
    expect(await screen.findByText(/no notes in your library match/i)).toBeInTheDocument();
  });
});

describe('seller demo flow', () => {
  it('Sell → fill → price → rights → submit → pending → dashboard', async () => {
    const user = userEvent.setup({ applyAccept: false });
    go('/sell');
    render(<App />);

    // validation first
    await user.click(await screen.findByRole('button', { name: /continue/i }));
    expect(await screen.findByText(/descriptive title/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^note title/i), 'Web Programming — Node.js and REST API Basics');
    await user.selectOptions(screen.getByLabelText(/^university/i), 'BINUS University');
    await user.type(screen.getByLabelText(/course name/i), 'Web Programming');
    await user.type(screen.getByLabelText(/course code/i), 'comp6171');
    await user.selectOptions(screen.getByLabelText(/^semester/i), '5');
    await user.selectOptions(screen.getByLabelText(/subject category/i), 'programming');
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // step 2 validates pdf type and size
    await user.type(await screen.findByLabelText(/short description/i), 'Node.js fundamentals, Express routing, REST conventions and JWT basics from the practicum.');
    const topic = screen.getByLabelText(/topics covered/i);
    for (const t of ['Express', 'REST', 'JWT']) await user.type(topic, `${t}{Enter}`);
    await user.type(screen.getByLabelText(/number of pages/i), '28');
    const input = screen.getByLabelText(/pdf file/i) as HTMLInputElement;
    await user.upload(input, new File(['x'], 'notes.txt', { type: 'text/plain' }));
    await waitFor(() => expect(screen.getByText(/only pdf files are accepted/i)).toBeInTheDocument());
    await user.upload(input, new File([new Uint8Array(11 * 1024 * 1024)], 'huge.pdf', { type: 'application/pdf' }));
    await waitFor(() => expect(screen.getByText(/limit is 10 MB/i)).toBeInTheDocument());
    await user.upload(input, new File([new Uint8Array(2048)], 'node-basics.pdf', { type: 'application/pdf' }));
    expect(await screen.findByText('node-basics.pdf')).toBeInTheDocument();
    expect(screen.getByText(/2 KB/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // step 3: price + commission shown separately + rights required
    expect(await screen.findByRole('heading', { name: /access and rights/i })).toBeInTheDocument();
    const est = screen.getByLabelText(/estimated earnings per download/i);
    expect(est).toHaveTextContent('Rp15,000/month');
    expect(est).toHaveTextContent('15%');
    expect(est).toHaveTextContent('−Rp2,250');
    expect(est).toHaveTextContent('Rp12,750');
    expect(est).toHaveTextContent('Rp2,550');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByText(/confirm you have the right/i)).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // back navigation keeps data
    expect(await screen.findByRole('heading', { name: /review and submit/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByRole('radio', { name: /pass note/i })).toBeChecked();
    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText('node-basics.pdf', { exact: false })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /submit for review/i }));
    expect(await screen.findByText('Your note has been submitted for review.', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('Pending review')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /open seller dashboard/i }));
    const row = (await screen.findByText('Web Programming — Node.js and REST API Basics', { selector: 'td p' })).closest('tr')!;
    expect(within(row).getByText('Pending review')).toBeInTheDocument();
    expect(within(row).getByText('Pass')).toBeInTheDocument();
    expect(getState().listings[0]).toMatchObject({ status: 'Pending review', courseCode: 'COMP6171', access: 'pass' });
    // not live in the marketplace
    expect(filterNotes(CATALOG, { ...DEFAULT_FILTERS, q: 'Node.js' })).toHaveLength(0);

    // status filter + edit eligibility
    await user.click(screen.getByRole('button', { name: /^Active/ }));
    expect(screen.queryByText('Web Programming — Node.js and REST API Basics', { selector: 'td p' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Pending review/ }));
    expect(within(screen.getAllByRole('row')[1]).getByRole('link', { name: /edit/i })).toBeInTheDocument();
  });
});

describe('dashboard, profile and revenue model', () => {
  it('labels stats as sample data and computes earnings from the commission config', async () => {
    go('/dashboard');
    render(<App />);
    expect(await screen.findByText(/sample data/i)).toBeInTheDocument();
    // (186 + 242) Pass downloads × Rp2,550 = Rp1,091,400
    const expected = (186 + 242) * passSplit().perDownload;
    expect(expected).toBe(1091400);
    expect(screen.getByText('Rp1,091,400')).toBeInTheDocument();
  });

  it('derives the Pass revenue split from one config', () => {
    expect(COMMISSION_RATE).toBe(0.15);
    expect(PASS_PRICE).toBe(15000);
    expect(passSplit()).toEqual({ price: 15000, commission: 2250, creatorPool: 12750, perDownload: 2550 });
  });

  it('cancels the Pass but keeps access until the period ends', async () => {
    const user = userEvent.setup();
    go('/subscribe');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /pay rp15,000/i }));
    await screen.findByRole('heading', { name: /bombanotes pass is active/i }, { timeout: 4000 });
    go('/profile');
    await user.click(await screen.findByRole('button', { name: /cancel pass/i }));
    await user.click(screen.getByRole('button', { name: /yes, cancel pass/i }));
    expect(getState().subscription?.autoRenew).toBe(false);
    expect(hasPass()).toBe(true);
  });

  it('edits the demo profile and shows the Demo profile label', async () => {
    const user = userEvent.setup();
    go('/profile');
    render(<App />);
    expect(await screen.findByText('Demo profile', { selector: '.chip' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /edit profile/i }));
    const name = screen.getByLabelText(/display name/i);
    await user.clear(name);
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText(/enter your display name/i)).toBeInTheDocument();
    await user.type(name, 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByRole('heading', { name: 'Budi Santoso' })).toBeInTheDocument();
    expect(getState().profile.name).toBe('Budi Santoso');
  });
});

describe('branding and navigation', () => {
  it('never says NoteSwap and every internal link resolves to a route', async () => {
    const paths = ['/', '/explore', '/categories', '/library', '/sell', '/dashboard', '/profile', '/note/ai-ml-revision', '/subscribe'];
    for (const p of paths) {
      go(p);
      const { container, unmount } = render(<App />);
      await screen.findAllByText(/BombaNotes/);
      expect(container.textContent).not.toMatch(/noteswap/i);
      expect(document.title).toMatch(/BombaNotes/);
      container.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute('href')!;
        expect(href.startsWith('#/')).toBe(true);
      });
      unmount();
    }
  });

  it('shows a helpful 404', async () => {
    go('/does-not-exist');
    render(<App />);
    expect(await screen.findByText(/couldn't find that page/i)).toBeInTheDocument();
  });
});

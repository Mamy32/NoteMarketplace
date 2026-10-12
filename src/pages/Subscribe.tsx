import { useState } from 'react';
import { Cover } from '../components/Cover';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';
import { Breadcrumbs } from '../components/ui';
import { BUYER_SERVICE_FEE, COMMISSION_PERCENT, CREATOR_PERCENT, PASS_DAYS, PASS_NAME, PASS_PRICE } from '../config';
import { formatDate, formatRp } from '../lib/format';
import { Link, navigate, useRoute } from '../lib/router';
import { hasPass, resolveNote, subscribeToPass, useAppState } from '../store/store';

const METHODS = [
  { id: 'QRIS', label: 'QRIS', hint: 'Scan with any e-wallet' },
  { id: 'GoPay', label: 'GoPay', hint: 'Demo wallet' },
  { id: 'Bank transfer', label: 'Bank transfer', hint: 'Virtual account, demo only' },
];

const PERKS = [
  'Read every Pass note in full',
  'Download each note as a PDF',
  'Free notes stay free for everyone',
  `Access for ${PASS_DAYS} days per payment`,
];

export function Subscribe() {
  const s = useAppState();
  const { query } = useRoute();
  const toast = useToast();
  const [method, setMethod] = useState(METHODS[0].id);
  const [busy, setBusy] = useState(false);

  const noteId = query.get('note') ?? undefined;
  const note = noteId ? resolveNote(noteId, s) : undefined;
  const unlocking = note && note.access === 'pass' && note.creatorId !== 'me' ? note : undefined;
  const active = hasPass(s);
  const total = PASS_PRICE + BUYER_SERVICE_FEE;
  const endsOn = formatDate(new Date(Date.now() + PASS_DAYS * 86400_000).toISOString());

  const confirm = () => {
    if (busy) return;
    setBusy(true);
    window.setTimeout(() => {
      const order = subscribeToPass(method, unlocking?.id);
      if (!order) {
        setBusy(false);
        toast('Your Pass is already active, so you were not charged again.', 'info');
        return;
      }
      navigate(`/success/${order.id}`);
    }, 1100);
  };

  return (
    <main id="main" tabIndex={-1} className="container-page max-w-5xl py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Explore', to: '/explore' },
          ...(unlocking ? [{ label: unlocking.title, to: `/note/${unlocking.id}` }] : []),
          { label: PASS_NAME },
        ]}
      />
      <h1 className="text-3xl font-extrabold sm:text-4xl">Get {PASS_NAME}</h1>
      <p className="mt-2 max-w-xl text-[15px] text-ink-70">One simple monthly payment unlocks, reads and downloads every Pass note.</p>

      <div role="note" className="mt-5 flex items-start gap-3 rounded-lg border-2 border-ink bg-sun-soft p-4 text-sm">
        <Icon name="info" size={20} className="mt-0.5 shrink-0" />
        <p><strong>Demo transaction.</strong> No real payment is made, no money moves and nothing renews automatically. Confirming only activates the Pass in this browser.</p>
      </div>

      {active ? (
        <div className="card mt-8 p-6 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-mint"><Icon name="check" size={24} /></span>
          <h2 className="mt-4 text-xl font-bold">Your Pass is already active</h2>
          <p className="mt-1 text-sm text-ink-70">Active until {formatDate(s.subscription!.expiresAt)}. You will not be charged again.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {unlocking ? <Link to={`/note/${unlocking.id}`} className="btn btn-primary">Back to note</Link> : <Link to="/explore?price=pass" className="btn btn-primary">Browse Pass notes</Link>}
            <Link to="/library" className="btn btn-outline">My Library</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section aria-labelledby="summary" className="card p-5">
            <h2 id="summary" className="text-lg font-bold">Order summary</h2>
            <div className="mt-4 rounded-lg border-2 border-ink bg-coral-soft p-4">
              <p className="font-display text-xl font-extrabold">{PASS_NAME}</p>
              <p className="text-sm text-ink-90">{formatRp(PASS_PRICE)} per month</p>
              <ul className="mt-3 space-y-1.5 text-[14px]">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-start gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-mint-dark" />{p}</li>
                ))}
              </ul>
            </div>

            {unlocking && (
              <div className="mt-4 flex gap-4 border-t border-ink/10 pt-4">
                <div className="w-14 shrink-0" style={{ filter: 'drop-shadow(3px 4px 0 rgba(33,28,69,.15))' }}><Cover note={unlocking} mini /></div>
                <div className="min-w-0">
                  <p className="eyebrow">You are unlocking</p>
                  <p className="font-bold leading-snug">{unlocking.title}</p>
                  <p className="text-[13px] text-ink-70">It is added to your library right after payment.</p>
                </div>
              </div>
            )}

            <dl className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between"><dt>{PASS_NAME}, 1 month</dt><dd className="font-semibold">{formatRp(PASS_PRICE)}</dd></div>
              <div className="flex justify-between"><dt>Service fee</dt><dd className="font-semibold">{formatRp(BUYER_SERVICE_FEE)}</dd></div>
              <div className="flex justify-between border-t border-ink/10 pt-3 font-display text-xl font-extrabold"><dt>Total today</dt><dd>{formatRp(total)}</dd></div>
            </dl>
            <p className="mt-3 text-[13px] text-ink-70">Access until {endsOn}. No automatic renewal in this demo.</p>

            <div className="mt-5 rounded-lg bg-paper-2 p-3.5 text-[13px] leading-relaxed text-ink-90">
              <p className="font-semibold">Where the money goes</p>
              <p className="mt-1">{CREATOR_PERCENT}% goes to a creator pool, shared by how often each creator’s notes are downloaded. BombaNotes keeps a {COMMISSION_PERCENT}% commission. No fee is added on top of the price.</p>
            </div>
          </section>

          <section aria-labelledby="pay" className="card self-start p-5">
            <h2 id="pay" className="text-lg font-bold">Payment method <span className="chip chip-sun ml-1 align-middle">Demo</span></h2>
            <fieldset className="mt-4 space-y-2" disabled={busy}>
              <legend className="sr-only">Choose a demo payment method</legend>
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
                    method === m.id ? 'border-ink bg-coral-soft' : 'border-ink/20 bg-white hover:border-ink/60'
                  }`}
                >
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="h-4 w-4 accent-[#211C45]" />
                  <span>
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-ink-70">{m.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <button type="button" className="btn btn-primary btn-lg mt-5 w-full" onClick={confirm} disabled={busy} aria-busy={busy}>
              {busy ? (
                <span role="status" className="inline-flex items-center gap-2"><span className="spinner" aria-hidden="true" /> Processing demo payment…</span>
              ) : (
                <>Pay {formatRp(total)} and unlock</>
              )}
            </button>
            <Link to={unlocking ? `/note/${unlocking.id}` : '/explore'} className="btn btn-ghost mt-2 w-full">Not now</Link>
          </section>
        </div>
      )}
    </main>
  );
}

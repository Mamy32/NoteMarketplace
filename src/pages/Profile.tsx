import { useState } from 'react';
import { CATALOG, SEMESTERS, UNIVERSITIES, catalogNote } from '../data';
import { Icon } from '../components/Icon';
import { NoteCard } from '../components/NoteCard';
import { useToast } from '../components/Toast';
import { Avatar, EmptyState, Field } from '../components/ui';
import { Link } from '../lib/router';
import { PASS_NAME, PASS_PRICE } from '../config';
import { formatDate, formatRp } from '../lib/format';
import { cancelPass, hasPass, resetAll, resolveNote, updateProfile, useAppState } from '../store/store';
import type { Note } from '../types';

export function Profile() {
  const s = useAppState();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(s.profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const sub = s.subscription;
  const active = hasPass(s);

  const uploaded = CATALOG.filter((n) => n.creatorId === 'me').length + s.listings.length;
  const live = CATALOG.filter((n) => n.creatorId === 'me').length;
  const pending = s.listings.filter((l) => l.status === 'Pending review').length;
  const sellerStatus = live > 0 ? `Active seller (demo)` : pending > 0 ? 'Listings pending review' : 'Not selling yet';
  const saved = s.bookmarks.map((id) => resolveNote(id, s)).filter((n): n is Note => !!n && !!(catalogNote(n.id) || n.listingStatus));

  const save = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Enter your display name.';
    if (form.program.trim().length < 2) e.program = 'Enter your study program.';
    setErrors(e);
    if (Object.keys(e).length) return;
    updateProfile({ ...form, name: form.name.trim(), program: form.program.trim() });
    setEditing(false);
    toast('Profile updated.');
  };

  const stats = [
    { label: 'Notes uploaded', value: String(uploaded), to: '/dashboard' },
    { label: 'Notes in library', value: String(s.library.length), to: '/library' },
    { label: 'Saved notes', value: String(saved.length), to: '#saved' },
    { label: 'Seller status', value: sellerStatus, to: '/dashboard' },
  ];

  return (
    <main id="main" tabIndex={-1} className="container-page py-8 sm:py-10">
      <section className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7" aria-labelledby="profile-name">
        <Avatar name={s.profile.name} size={84} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 id="profile-name" className="text-3xl font-extrabold">{s.profile.name}</h1>
            <span className="chip chip-sun">Demo profile</span>
          </div>
          <p className="mt-1 text-[15px] text-ink-90">{s.profile.program} · Semester {s.profile.semester}</p>
          <p className="text-[14px] text-ink-70">{s.profile.university}</p>
          <p className="mt-2 text-xs text-ink-70">This is a sample student account. It is not verified and no real identity is attached.</p>
        </div>
        {!editing && (
          <button type="button" className="btn btn-outline self-start" onClick={() => { setForm(s.profile); setErrors({}); setEditing(true); }}>
            <Icon name="edit" size={16} /> Edit profile
          </button>
        )}
      </section>

      {editing && (
        <section className="card pop-in mt-4 p-5 sm:p-7" aria-labelledby="edit-h">
          <h2 id="edit-h" className="mb-4 text-lg font-bold">Edit demo profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name" required error={errors.name}>
              {(p) => <input {...p} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
            </Field>
            <Field label="University">
              {(p) => (
                <select {...p} className="input" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}>
                  {UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}
                </select>
              )}
            </Field>
            <Field label="Study program" required error={errors.program}>
              {(p) => <input {...p} className="input" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />}
            </Field>
            <Field label="Semester">
              {(p) => (
                <select {...p} className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}>
                  {SEMESTERS.map((n) => <option key={n} value={n}>Semester {n}</option>)}
                </select>
              )}
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="button" className="btn btn-primary" onClick={save}>Save changes</button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </section>
      )}

      <section className="card mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="pass-h">
        <div>
          <h2 id="pass-h" className="flex items-center gap-2 text-lg font-bold">
            {PASS_NAME}
            <span className={`chip ${active ? 'chip-mint' : 'chip-plain'}`}>{active ? (sub?.autoRenew ? 'Active' : 'Cancelled, active until end') : sub ? 'Expired' : 'Not subscribed'}</span>
          </h2>
          <p className="mt-1 text-sm text-ink-70">
            {active
              ? `Active until ${formatDate(sub!.expiresAt)}. ${sub!.autoRenew ? 'Demo only: nothing renews automatically.' : 'It will not renew.'}`
              : `${formatRp(PASS_PRICE)}/month unlocks, reads and downloads every paid note. Free notes stay free.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {active ? (
            sub!.autoRenew &&
            (confirmCancel ? (
              <>
                <button type="button" className="btn btn-dark btn-sm" onClick={() => { cancelPass(); setConfirmCancel(false); toast('Pass cancelled. You keep access until the end of the period.', 'info'); }}>Yes, cancel Pass</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmCancel(false)}>Keep it</button>
              </>
            ) : (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirmCancel(true)}>Cancel Pass</button>
            ))
          ) : (
            <Link to="/subscribe" className="btn btn-primary btn-sm">{sub ? 'Renew Pass' : 'Get Pass'}</Link>
          )}
        </div>
      </section>

      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((st) => (
          <li key={st.label} className="card p-4">
            <p className="text-[13px] font-medium text-ink-70">{st.label}</p>
            <p className={`mt-1 font-display font-extrabold ${st.label === 'Seller status' ? 'text-lg leading-tight' : 'text-3xl'}`}>{st.value}</p>
            {st.to.startsWith('#') ? (
              <button type="button" className="link mt-2 text-[13px]" onClick={() => document.getElementById('saved')?.scrollIntoView({ behavior: 'smooth' })}>View saved</button>
            ) : (
              <Link to={st.to} className="link mt-2 inline-block text-[13px]">{st.label === 'Notes in library' ? 'Open library' : 'Open dashboard'}</Link>
            )}
          </li>
        ))}
      </ul>

      <section id="saved" className="mt-12 scroll-mt-24" aria-labelledby="saved-h">
        <h2 id="saved-h" className="mb-4 text-2xl font-extrabold">Saved notes</h2>
        {saved.length === 0 ? (
          <EmptyState title="Nothing saved yet" icon="bookmark" action={<Link to="/explore" className="btn btn-primary">Explore notes</Link>}>
            Tap the bookmark on any note to keep it here for later.
          </EmptyState>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {saved.map((n) => <li key={n.id}><NoteCard note={n} /></li>)}
          </ul>
        )}
      </section>

      <section className="mt-12 rounded-xl border border-ink/15 bg-paper-2 p-5" aria-labelledby="reset-h">
        <h2 id="reset-h" className="text-lg font-bold">Demo data</h2>
        <p className="mt-1 text-sm text-ink-70">Everything you do here is stored only in this browser. Reset to restore the starting demo state: library, bookmarks, listings and profile.</p>
        {confirmReset ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-dark btn-sm" onClick={() => { resetAll(); setConfirmReset(false); setForm(s.profile); toast('Demo data was reset.', 'info'); }}>Yes, reset demo data</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="btn btn-outline btn-sm mt-3" onClick={() => setConfirmReset(true)}>Reset demo data</button>
        )}
      </section>
    </main>
  );
}

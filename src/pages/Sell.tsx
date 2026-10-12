import { useRef, useState, type KeyboardEvent } from 'react';
import { CATEGORIES, SEMESTERS, UNIVERSITIES } from '../data';
import { Cover, PALETTES } from '../components/Cover';
import { Icon } from '../components/Icon';
import { SellNav } from '../components/SellNav';
import { Field } from '../components/ui';
import { COMMISSION_PERCENT, CREATOR_PERCENT, CURRENT_TERM, EST_PASS_DOWNLOADS_PER_SUBSCRIBER, MAX_PDF_MB, PASS_NAME, PASS_PRICE, passSplit } from '../config';
import { formatBytes, formatRp } from '../lib/format';
import { Link, Redirect, navigate } from '../lib/router';
import { checkPdf, emptyDraft, firstInvalidStep, validateStep } from '../lib/sellValidation';
import { getState, saveDraft, submitListing, useAppState } from '../store/store';
import type { SellDraft } from '../types';

const STEPS = ['Basics', 'Content', 'Access & rights', 'Review'];

function initDraft(editingId?: string): SellDraft | null {
  const s = getState();
  if (editingId) {
    if (s.draft?.editingId === editingId) return s.draft;
    const l = s.listings.find((x) => x.id === editingId);
    if (!l) return null;
    return {
      editingId,
      step: 0,
      title: l.title,
      university: l.university,
      courseName: l.courseName,
      courseCode: l.courseCode,
      semester: String(l.semester),
      category: l.category,
      description: l.description,
      topics: l.topics,
      pages: String(l.pages),
      file: { name: l.fileName, size: l.fileSize },
      palette: l.palette,
      access: l.access,
      rights: false,
    };
  }
  return s.draft && !s.draft.editingId ? s.draft : emptyDraft();
}

function ListingPreview({ d }: { d: SellDraft }) {
  const note = {
    category: (d.category || 'programming') as never,
    palette: d.palette,
    courseCode: d.courseCode.trim().toUpperCase() || 'CODE000',
    courseName: d.courseName.trim() || 'Your course',
    title: d.title.trim() || 'Course — Your note title',
  };
  return (
    <div className="card overflow-hidden" aria-label="Listing preview">
      <div className="bg-paper-2 px-12 py-6" style={{ backgroundImage: 'radial-gradient(rgba(33,28,69,.09) 1px, transparent 1.2px)', backgroundSize: '14px 14px' }}>
        <div className="mx-auto w-full max-w-[150px] -rotate-2" style={{ filter: 'drop-shadow(5px 6px 0 rgba(33,28,69,.16))' }}>
          <Cover note={note} />
        </div>
      </div>
      <div className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-70">{note.courseCode}</p>
        <p className="mt-1 text-[15px] font-bold leading-snug">{d.title.trim() || 'Your note title'}</p>
        <p className="mt-1 text-[13px] text-ink-70">by Nadia Pramesti{d.university ? ` · ${d.university}` : ''}</p>
        <div className="mt-3 flex items-center gap-2">
          {d.access === 'free' ? <span className="chip chip-mint">FREE</span> : <span className="chip chip-ink">PASS</span>}
          <span className="text-[12px] text-ink-70">{d.pages ? `${d.pages} pages · PDF` : 'PDF'}</span>
        </div>
      </div>
    </div>
  );
}

export function Sell({ editingId }: { editingId?: string }) {
  const s = useAppState();
  const [draft, setDraft] = useState<SellDraft | null>(() => initDraft(editingId));
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [fileError, setFileError] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [topicError, setTopicError] = useState('');
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  if (!draft) return <Redirect to="/dashboard" />;
  const editing = editingId ? s.listings.find((l) => l.id === editingId) : undefined;
  if (editingId && !editing) return <Redirect to="/dashboard" />;

  const step = draft.step;
  const errors = attempted[step] ? validateStep(step, draft) : {};
  const err = (k: string) => (k === 'file' ? fileError || errors.file : k === 'topics' ? topicError || errors.topics : errors[k]);

  const update = (patch: Partial<SellDraft>) => {
    const next = { ...draft, ...patch, editingId };
    setDraft(next);
    saveDraft(next);
  };

  const focusFirstError = () =>
    window.setTimeout(() => {
      (formRef.current?.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
    }, 30);

  const goTo = (n: number) => {
    update({ step: n });
    window.setTimeout(() => formRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' }), 0);
  };

  const next = () => {
    setAttempted((a) => ({ ...a, [step]: true }));
    if (Object.keys(validateStep(step, draft)).length) {
      focusFirstError();
      return;
    }
    goTo(step + 1);
  };

  const submit = () => {
    const bad = firstInvalidStep(draft);
    if (bad >= 0) {
      setAttempted((a) => ({ ...a, [bad]: true }));
      goTo(bad);
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const listing = submitListing(draft);
      navigate(`/sell/done/${listing.id}${editing && editing.status === 'Pending review' ? '?mode=saved' : ''}`);
    }, 800);
  };

  const addTopics = (raw: string) => {
    const parts = raw.split(',').map((t) => t.trim()).filter(Boolean);
    if (!parts.length) return;
    const merged = [...draft.topics];
    for (const p of parts) {
      if (p.length > 40) { setTopicError('Keep each topic under 40 characters.'); return; }
      if (!merged.some((m) => m.toLowerCase() === p.toLowerCase())) merged.push(p);
    }
    if (merged.length > 10) { setTopicError('You can add up to 10 topics.'); return; }
    setTopicError('');
    setTopicInput('');
    update({ topics: merged });
  };
  const onTopicKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTopics(topicInput);
    }
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const problem = checkPdf(f);
    if (problem) {
      setFileError(problem);
      return;
    }
    setFileError('');
    update({ file: { name: f.name, size: f.size } });
  };

  const split = passSplit();
  const finalLabel = editing ? (editing.status === 'Pending review' ? 'Save changes' : 'Submit for review') : 'Submit for review';
  const cat = CATEGORIES.find((c) => c.id === draft.category)?.name;

  return (
    <main id="main" tabIndex={-1} className="container-page max-w-5xl py-8 sm:py-10">
      <SellNav active="new" />
      <p className="eyebrow mb-2">{editing ? 'Edit listing' : 'Sell notes'}</p>
      <h1 className="text-3xl font-extrabold sm:text-4xl">{editing ? 'Edit your listing' : 'List your notes'}</h1>
      <p className="mt-2 max-w-xl text-[15px] text-ink-70">Four short steps. Your progress is saved in this browser as you go.</p>

      <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((label, i) => {
          const done = i < step;
          const cur = i === step;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!done}
                onClick={() => goTo(i)}
                aria-current={cur ? 'step' : undefined}
                className={`flex w-full flex-col items-start gap-1 rounded-lg border-2 p-2 text-left transition sm:p-3 ${cur ? 'border-ink bg-ink text-paper' : done ? 'border-ink bg-mint-soft hover:bg-mint/30' : 'border-ink/20 bg-white text-ink-70'}`}
              >
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${cur ? 'bg-coral text-ink' : done ? 'bg-mint text-ink' : 'bg-ink-10'}`}>
                  {done ? <Icon name="check" size={14} /> : i + 1}
                </span>
                <span className="text-[11px] font-semibold leading-tight sm:text-[13px]">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section ref={formRef} className="card scroll-mt-24 p-5 sm:p-7" aria-labelledby="step-title">
          <p className="eyebrow">Step {step + 1} of {STEPS.length}</p>
          <h2 id="step-title" className="mb-5 mt-1 text-2xl font-bold">{['Basic information', 'Note content', 'Access and rights', 'Review and submit'][step]}</h2>

          {step === 0 && (
            <div className="space-y-5">
              <Field label="Note title" required error={err('title')} hint="Format that works well: Course name — what is inside.">
                {(p) => <input {...p} className="input" value={draft.title} maxLength={100} placeholder="e.g. Web Programming — Node.js and REST API Basics" onChange={(e) => update({ title: e.target.value })} />}
              </Field>
              <Field label="University" required error={err('university')}>
                {(p) => (
                  <select {...p} className="input" value={draft.university} onChange={(e) => update({ university: e.target.value })}>
                    <option value="">Choose university</option>
                    {UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}
                  </select>
                )}
              </Field>
              <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
                <Field label="Course name" required error={err('courseName')}>
                  {(p) => <input {...p} className="input" value={draft.courseName} placeholder="e.g. Web Programming" onChange={(e) => update({ courseName: e.target.value })} />}
                </Field>
                <Field label="Course code" required error={err('courseCode')}>
                  {(p) => <input {...p} className="input font-mono uppercase" value={draft.courseCode} placeholder="COMP6171" onChange={(e) => update({ courseCode: e.target.value })} />}
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Semester" required error={err('semester')} hint={`Term shown on the listing: ${CURRENT_TERM}`}>
                  {(p) => (
                    <select {...p} className="input" value={draft.semester} onChange={(e) => update({ semester: e.target.value })}>
                      <option value="">Choose semester</option>
                      {SEMESTERS.map((n) => <option key={n} value={n}>Semester {n}</option>)}
                    </select>
                  )}
                </Field>
                <Field label="Subject category" required error={err('category')}>
                  {(p) => (
                    <select {...p} className="input" value={draft.category} onChange={(e) => update({ category: e.target.value })}>
                      <option value="">Choose category</option>
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Field label="Short description" required error={err('description')} hint={`${draft.description.trim().length}/600 characters. Say what is covered and who it helps.`}>
                {(p) => <textarea {...p} className="input min-h-[120px]" value={draft.description} onChange={(e) => update({ description: e.target.value })} placeholder="What does your note cover, and what exam or course is it for?" />}
              </Field>

              <Field label="Topics covered" required error={err('topics')} hint="Press Enter or comma to add. Minimum 3, maximum 10.">
                {(p) => (
                  <div>
                    <div className="flex gap-2">
                      <input {...p} className="input" value={topicInput} onChange={(e) => setTopicInput(e.target.value)} onKeyDown={onTopicKey} placeholder="e.g. REST API design" />
                      <button type="button" className="btn btn-outline shrink-0" onClick={() => addTopics(topicInput)}>Add</button>
                    </div>
                    {draft.topics.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Topics added">
                        {draft.topics.map((t) => (
                          <li key={t} className="inline-flex items-center gap-1 rounded-md border border-ink/25 bg-paper-2 py-1 pl-2.5 pr-1 text-[13px] font-medium">
                            {t}
                            <button type="button" aria-label={`Remove topic ${t}`} className="rounded p-1 hover:bg-ink/10" onClick={() => update({ topics: draft.topics.filter((x) => x !== t) })}>
                              <Icon name="x" size={13} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Field>

              <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
                <Field label="Number of pages" required error={err('pages')}>
                  {(p) => <input {...p} className="input" inputMode="numeric" value={draft.pages} onChange={(e) => update({ pages: e.target.value.replace(/\D/g, '').slice(0, 3) })} placeholder="24" />}
                </Field>
              </div>

              <Field label="PDF file" required error={err('file')}>
                {(p) => (
                  <div>
                    <div className="relative">
                      <input
                        {...p}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }}
                      />
                      <div className={`flex items-center gap-3 rounded-lg border-2 border-dashed bg-paper-2 p-4 transition peer-hover:border-ink peer-focus-visible:border-ink peer-focus-visible:shadow-[0_0_0_4px_rgba(255,115,92,.55)] ${p['aria-invalid'] ? 'border-[#B83A26]' : 'border-ink/35'}`}>
                        <Icon name="upload" size={22} />
                        <div>
                          <p className="text-sm font-semibold">{draft.file ? 'Choose a different PDF' : 'Choose a PDF'}</p>
                          <p className="text-xs text-ink-70">PDF only, up to {MAX_PDF_MB} MB</p>
                        </div>
                      </div>
                    </div>
                    {draft.file && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg border border-ink/20 bg-white p-3" role="status">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-coral-soft"><Icon name="file" size={18} /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{draft.file.name}</p>
                          <p className="text-xs text-ink-70">{draft.file.size ? formatBytes(draft.file.size) : 'size unknown'} · selected</p>
                        </div>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => update({ file: null })}><Icon name="trash" size={15} /> Remove</button>
                      </div>
                    )}
                    <p className="hint">Demo only: BombaNotes records the file name and size in this browser. Your file is not uploaded to a server.</p>
                  </div>
                )}
              </Field>

              <fieldset>
                <legend className="label">Cover style</legend>
                <div className="flex flex-wrap gap-3">
                  {PALETTES.map((_, i) => (
                    <label key={i} className="cursor-pointer">
                      <input type="radio" name="cover" className="peer sr-only" checked={draft.palette === i} onChange={() => update({ palette: i })} aria-label={`Cover style ${i + 1}`} />
                      <span className="block w-[72px] rounded-md p-1 ring-2 ring-transparent transition peer-checked:ring-ink peer-focus-visible:shadow-[0_0_0_5px_rgba(255,115,92,.55)] hover:ring-ink/40">
                        <Cover note={{ category: (draft.category || 'programming') as never, palette: i, courseCode: draft.courseCode || 'CODE', courseName: draft.courseName || 'Course', title: draft.title || 'Course — Note' }} mini />
                      </span>
                    </label>
                  ))}
                </div>
                <p className="hint">Covers are generated from your course and category. No image upload needed.</p>
              </fieldset>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="label">Who can read your note?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([['pass', 'Pass note', `Included in ${PASS_NAME}. You earn from every download.`], ['free', 'Free', 'Open to everyone. Great for reach, but you earn nothing from it.']] as const).map(([v, t, d]) => (
                    <label key={v} className={`flex cursor-pointer gap-3 rounded-lg border-2 p-3.5 transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${draft.access === v ? 'border-ink bg-coral-soft' : 'border-ink/20 bg-white hover:border-ink/60'}`}>
                      <input type="radio" name="access" className="mt-1 h-4 w-4 accent-[#211C45]" checked={draft.access === v} onChange={() => update({ access: v })} />
                      <span><span className="block text-sm font-bold">{t}</span><span className="block text-[13px] text-ink-70">{d}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {draft.access === 'pass' && (
                <dl className="max-w-md rounded-lg bg-paper-2 p-4 text-sm" aria-label="Estimated earnings per download">
                  <p className="eyebrow mb-2">How you earn</p>
                  <div className="flex justify-between py-1"><dt>{PASS_NAME} price</dt><dd className="font-semibold">{formatRp(split.price)}/month</dd></div>
                  <div className="flex justify-between py-1"><dt>BombaNotes commission ({COMMISSION_PERCENT}%)</dt><dd className="font-semibold">−{formatRp(split.commission)}</dd></div>
                  <div className="flex justify-between py-1"><dt>Creator pool ({CREATOR_PERCENT}%)</dt><dd className="font-semibold">{formatRp(split.creatorPool)}</dd></div>
                  <div className="mt-1 flex justify-between border-t border-ink/15 pt-2 font-display text-lg font-extrabold"><dt>You earn ≈ per download</dt><dd className="text-mint-dark">{formatRp(split.perDownload)}</dd></div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-70">The pool is shared by creators in proportion to downloads. The estimate assumes {EST_PASS_DOWNLOADS_PER_SUBSCRIBER} downloads per subscriber per month, so real earnings will differ. You do not set a price: subscribers pay {formatRp(PASS_PRICE)}/month for all Pass notes.</p>
                </dl>
              )}

              <div className="rounded-lg border-2 border-ink bg-sun-soft p-4">
                <p className="flex items-center gap-2 text-sm font-bold"><Icon name="shield" size={18} /> Only share what is yours</p>
                <p className="mt-1.5 text-[13px] leading-relaxed">
                  List original notes you wrote, or materials you are allowed to distribute. Do not upload copyrighted textbooks, publisher slides, or restricted lecturer materials such as unreleased exam papers.
                </p>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={draft.rights}
                    aria-invalid={!!err('rights')}
                    aria-describedby={err('rights') ? 'rights-err' : undefined}
                    onChange={(e) => update({ rights: e.target.checked })}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#211C45]"
                  />
                  <span className="text-sm font-medium leading-snug">I created these notes or have permission to distribute them, and I accept the {COMMISSION_PERCENT}% commission on Pass revenue.</span>
                </label>
                {err('rights') && (
                  <p id="rights-err" role="alert" className="err"><Icon name="alert" size={15} className="mt-px shrink-0" />{err('rights')}</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="text-sm text-ink-70">Check everything below. After you submit, your listing shows as <strong>Pending review</strong>.</p>
              {[
                { t: 'Basics', go: 0, rows: [['Title', draft.title], ['University', draft.university], ['Course', `${draft.courseName} (${draft.courseCode.trim().toUpperCase()})`], ['Semester', `Semester ${draft.semester}`], ['Category', cat ?? '']] },
                { t: 'Content', go: 1, rows: [['Description', draft.description], ['Topics', draft.topics.join(', ')], ['Pages', draft.pages], ['File', draft.file ? `${draft.file.name} (${draft.file.size ? formatBytes(draft.file.size) : 'size unknown'}), demo only` : '']] },
                { t: 'Access and rights', go: 2, rows: [['Access', draft.access === 'free' ? 'Free for everyone' : `Pass note (included in ${PASS_NAME})`], ['You earn', draft.access === 'free' ? 'Nothing from free downloads' : `≈ ${formatRp(split.perDownload)} per download, from the ${CREATOR_PERCENT}% creator pool (${COMMISSION_PERCENT}% commission to BombaNotes)`], ['Rights', draft.rights ? 'Confirmed: I may distribute these notes' : 'Not confirmed']] },
              ].map((sec) => (
                <section key={sec.t} className="rounded-lg border border-ink/15">
                  <div className="flex items-center justify-between border-b border-ink/10 bg-paper-2 px-4 py-2">
                    <h3 className="text-sm font-bold">{sec.t}</h3>
                    <button type="button" className="link text-[13px]" onClick={() => goTo(sec.go)} aria-label={`Edit ${sec.t}`}>Edit</button>
                  </div>
                  <dl className="divide-y divide-ink/10 text-sm">
                    {sec.rows.map(([k, v]) => (
                      <div key={k} className="grid gap-1 px-4 py-2 sm:grid-cols-[150px_1fr]"><dt className="text-ink-70">{k}</dt><dd className="font-medium [overflow-wrap:anywhere]">{v}</dd></div>
                    ))}
                  </dl>
                </section>
              ))}
              <p className="flex items-start gap-2 rounded-lg bg-sun-soft p-3 text-[13px]"><Icon name="info" size={16} className="mt-0.5 shrink-0" />Prototype note: there is no real review team. The listing stays “Pending review” and is visible only to you in this browser.</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink/10 pt-5">
            {step > 0 ? (
              <button type="button" className="btn btn-outline" onClick={() => goTo(step - 1)} disabled={busy}><Icon name="arrowLeft" size={16} /> Back</button>
            ) : (
              <Link to={editing ? '/dashboard' : '/explore'} className="btn btn-ghost">Cancel</Link>
            )}
            {step < 3 ? (
              <button type="button" className="btn btn-primary" onClick={next}>Continue <Icon name="arrowRight" size={16} /></button>
            ) : (
              <button type="button" className="btn btn-primary btn-lg" onClick={submit} disabled={busy} aria-busy={busy}>
                {busy ? <span role="status" className="inline-flex items-center gap-2"><span className="spinner" aria-hidden="true" /> Submitting…</span> : finalLabel}
              </button>
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Live preview">
          <p className="eyebrow mb-2">Live preview</p>
          <ListingPreview d={draft} />
          <p className="mt-3 text-xs leading-relaxed text-ink-70">This is how your card will look to students once it is live.</p>
        </aside>
      </div>
    </main>
  );
}

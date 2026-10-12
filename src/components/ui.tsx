import { useId, type ReactNode } from 'react';
import { Icon } from './Icon';
import type { ListingStatus } from '../types';

export function Rating({ rating, count, size = 14 }: { rating: number; count: number; size?: number }) {
  if (!rating || !count) return <span className="text-[13px] text-ink-70">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] text-ink-90" aria-label={`Rated ${rating.toFixed(1)} out of 5 from ${count} reviews`}>
      <Icon name="star" size={size} filled className="text-[#E8A317]" />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-ink-70">({count})</span>
    </span>
  );
}

export function Avatar({ name, size = 36, tone = 0 }: { name: string; size?: number; tone?: number }) {
  const tones = ['#211C45', '#C23A24', '#1F8A6D', '#8A5A00', '#5B4DB1'];
  const parts = name.trim().split(/\s+/);
  const ini = (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-paper"
      style={{ width: size, height: size, background: tones[tone % tones.length], fontSize: size * 0.38 }}
    >
      {ini}
    </span>
  );
}

export function StatusBadge({ status }: { status: ListingStatus }) {
  const cls = status === 'Active' ? 'chip-mint' : status === 'Pending review' ? 'chip-sun' : 'chip-plain';
  return <span className={`chip ${cls}`}>{status}</span>;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span className="spinner" aria-hidden="true" />
      {label ? <span>{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}

export function PageHeader({ eyebrow, title, children, action }: { eyebrow?: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {children && <p className="mt-2 text-[15px] leading-relaxed text-ink-70">{children}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, children, action, icon = 'book' }: { title: string; children?: ReactNode; action?: ReactNode; icon?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border-2 border-dashed border-ink/25 bg-white/60 px-6 py-10 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-paper-3 text-ink">
        <Icon name={icon} size={28} />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      {children && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-70">{children}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (p: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string; 'aria-required'?: boolean }) => ReactNode;
}

export function Field({ label, error, hint, required, children }: FieldProps) {
  const id = useId();
  const describedBy = [error ? `${id}-err` : '', hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="ml-0.5 text-[#B83A26]" aria-hidden="true"> *</span>}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy, 'aria-required': required })}
      {hint && !error && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="err" role="alert">
          <Icon name="alert" size={15} className="mt-px shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-ink-70">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.to ? (
              <a href={'#' + it.to} className="font-medium text-ink-90 underline decoration-ink/25 underline-offset-2 hover:decoration-coral">
                {it.label}
              </a>
            ) : (
              <span aria-current="page" className="max-w-[60vw] truncate font-semibold text-ink sm:max-w-none">
                {it.label}
              </span>
            )}
            {i < items.length - 1 && <Icon name="chevronRight" size={13} className="text-ink-50" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

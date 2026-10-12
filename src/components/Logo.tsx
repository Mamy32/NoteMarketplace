import { Link } from '../lib/router';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="10" fill="#211C45" />
      {/* notebook */}
      <path d="M11 8h15a3 3 0 0 1 3 3v21H14a3 3 0 0 1-3-3z" fill="#FAF8F2" />
      <path d="M11 29a3 3 0 0 1 3-3h15" fill="none" stroke="#211C45" strokeWidth="1.6" />
      <rect x="15.5" y="13" width="9" height="1.8" rx=".9" fill="#211C45" opacity=".85" />
      <rect x="15.5" y="17.5" width="6" height="1.8" rx=".9" fill="#211C45" opacity=".45" />
      {/* bookmark ribbon */}
      <path d="M22 8h6v13l-3-2.4L22 21z" fill="#FF735C" />
      {/* spark: the "bomba" */}
      <path d="m31.5 4.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#FF735C" />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-[22px] leading-none tracking-tight ${className}`}>
      <span className="font-extrabold">Bomba</span>
      <span className="font-medium">Notes</span>
    </span>
  );
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="BombaNotes home">
      <LogoMark />
      <Wordmark />
    </Link>
  );
}

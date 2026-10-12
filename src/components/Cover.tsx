import type { CategoryId, Note } from '../types';

export interface Palette {
  bg: string;
  fg: string;
  acc: string;
  spine: string;
  sub: string;
}

export const PALETTES: Palette[] = [
  { bg: '#211C45', fg: '#FAF8F2', acc: '#FF735C', spine: '#15112F', sub: '#B5B1D4' },
  { bg: '#FF735C', fg: '#211C45', acc: '#FAF8F2', spine: '#E5543C', sub: '#4A1D17' },
  { bg: '#BDEBDB', fg: '#211C45', acc: '#E5543C', spine: '#8CD3BA', sub: '#2B5A4B' },
  { bg: '#F6C65B', fg: '#211C45', acc: '#C23A24', spine: '#E0AA33', sub: '#5E4408' },
  { bg: '#F3F0E6', fg: '#211C45', acc: '#FF735C', spine: '#211C45', sub: '#5B5680' },
];

const ABBR: Record<string, string> = {
  'Data Structures': 'DSA',
  'Algorithm and Programming': 'ALGO',
  'Web Programming': 'WEB',
  'Object Oriented Programming': 'OOP',
  'Database Systems': 'DB',
  'Computer Networks': 'NET',
  'Discrete Mathematics': 'DM',
  'Linear Algebra': 'LA',
  'Probability and Statistics': 'P&S',
  'Artificial Intelligence': 'AI',
  'Software Engineering': 'SE',
  Entrepreneurship: 'ENT',
  'Enterprise Systems': 'ERP',
  'Human-Computer Interaction': 'HCI',
  'UI/UX Design': 'UX',
  'Operating Systems': 'OS',
};

export function courseAbbr(courseName: string): string {
  if (ABBR[courseName]) return ABBR[courseName];
  const words = courseName.split(/[\s/-]+/).filter((w) => w && !/^(and|of|the|&)$/i.test(w));
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
}

export function topicOf(title: string): string {
  const i = title.indexOf('—');
  return i >= 0 ? title.slice(i + 1).trim() : title;
}

function Motif({ cat, p }: { cat: CategoryId; p: Palette }) {
  const s = { stroke: p.fg, strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (cat) {
    case 'programming':
      return (
        <g>
          <path {...s} d="M30 8q-9 0-9 9v7q0 6-8 6 8 0 8 6v7q0 9 9 9" />
          <path {...s} d="M70 8q9 0 9 9v7q0 6 8 6-8 0-8 6v7q0 9-9 9" />
          <rect x="37" y="17" width="26" height="4" rx="2" fill={p.fg} />
          <rect x="37" y="26" width="16" height="4" rx="2" fill={p.fg} opacity=".55" />
          <rect x="37" y="35" width="22" height="4" rx="2" fill={p.fg} opacity=".55" />
          <rect x="62" y="35" width="4" height="4" fill={p.acc} />
        </g>
      );
    case 'database':
      return (
        <g>
          <ellipse {...s} cx="50" cy="12" rx="22" ry="7" fill={p.acc} />
          <path {...s} d="M28 12v14c0 4 10 7 22 7s22-3 22-7V12" />
          <path {...s} d="M28 26v14c0 4 10 7 22 7s22-3 22-7V26" />
          <path {...s} d="M28 40v8c0 4 10 7 22 7s22-3 22-7v-8" opacity=".6" />
        </g>
      );
    case 'networking':
      return (
        <g>
          <path {...s} d="M50 28 18 12M50 28l32-16M50 28 18 48M50 28l32 20M18 12v36M82 12v36" opacity=".7" />
          <circle cx="50" cy="28" r="9" fill={p.acc} stroke={p.fg} strokeWidth="2.4" />
          {[[18, 12], [82, 12], [18, 48], [82, 48]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="5.5" fill={p.bg} stroke={p.fg} strokeWidth="2.4" />
          ))}
        </g>
      );
    case 'math':
      return (
        <g>
          <path {...s} d="M14 8v44h72" opacity=".6" />
          <path {...s} d="M18 46Q38 -6 56 30T84 14" stroke={p.acc} strokeWidth="3.2" />
          <circle cx="56" cy="30" r="3.6" fill={p.fg} />
          <text x="68" y="48" fontSize="20" fontFamily="serif" fontStyle="italic" fill={p.fg}>∑</text>
          <text x="22" y="22" fontSize="14" fontFamily="serif" fontStyle="italic" fill={p.fg} opacity=".75">π</text>
        </g>
      );
    case 'ai':
      return (
        <g>
          {[10, 30, 50].flatMap((y1) => [6, 22, 38, 54].map((y2) => <path key={`${y1}-${y2}`} d={`M16 ${y1}L50 ${y2}`} stroke={p.fg} strokeWidth="1" opacity=".35" />))}
          {[6, 22, 38, 54].flatMap((y1) => [18, 42].map((y2) => <path key={`b${y1}-${y2}`} d={`M50 ${y1}L84 ${y2}`} stroke={p.fg} strokeWidth="1" opacity=".35" />))}
          {[10, 30, 50].map((y) => <circle key={`i${y}`} cx="16" cy={y} r="5" fill={p.bg} stroke={p.fg} strokeWidth="2.4" />)}
          {[6, 22, 38, 54].map((y) => <circle key={`h${y}`} cx="50" cy={y} r="5" fill={p.fg} />)}
          {[18, 42].map((y) => <circle key={`o${y}`} cx="84" cy={y} r="6" fill={p.acc} stroke={p.fg} strokeWidth="2.4" />)}
        </g>
      );
    case 'se':
      return (
        <g>
          <rect {...s} x="10" y="8" width="32" height="24" rx="2" />
          <path {...s} d="M10 17h32M10 24h32" />
          <rect {...s} x="58" y="28" width="32" height="24" rx="2" fill={p.acc} />
          <path {...s} d="M58 37h32M58 44h32" />
          <path {...s} d="M42 20h8q8 0 8 8" />
          <path d="M58 28l-4-7h8z" fill={p.fg} />
          <circle cx="20" cy="13" r="2" fill={p.fg} />
        </g>
      );
    case 'business':
      return (
        <g>
          <rect x="14" y="36" width="12" height="16" fill={p.fg} opacity=".55" />
          <rect x="34" y="26" width="12" height="26" fill={p.fg} opacity=".75" />
          <rect x="54" y="16" width="12" height="36" fill={p.fg} />
          <path {...s} d="M12 30 36 18l18-6 28-4" stroke={p.acc} strokeWidth="3.2" />
          <path d="M82 8l-9 1 5 7z" fill={p.acc} />
          <circle cx="82" cy="40" r="9" fill={p.acc} stroke={p.fg} strokeWidth="2.4" />
          <text x="82" y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill={p.fg}>Rp</text>
        </g>
      );
    case 'design':
      return (
        <g>
          <rect {...s} x="12" y="6" width="44" height="48" rx="3" />
          <rect x="12" y="6" width="44" height="8" fill={p.fg} opacity=".25" />
          <path {...s} d="M18 22h32v14H18zM18 22l32 14M50 22 18 36" opacity=".55" />
          <rect x="18" y="42" width="20" height="4" rx="2" fill={p.fg} opacity=".6" />
          <path {...s} d="M62 48q8-26 24-30" stroke={p.acc} strokeWidth="3.2" />
          <rect x="59" y="45" width="6" height="6" fill={p.bg} stroke={p.fg} strokeWidth="2" />
          <circle cx="86" cy="18" r="4" fill={p.acc} stroke={p.fg} strokeWidth="2" />
        </g>
      );
  }
}

interface CoverProps {
  note: Pick<Note, 'category' | 'palette' | 'courseCode' | 'courseName' | 'title'>;
  /** "mini" hides text for tiny thumbnails. */
  mini?: boolean;
  className?: string;
}

export function Cover({ note, mini = false, className = '' }: CoverProps) {
  const p = PALETTES[((note.palette % PALETTES.length) + PALETTES.length) % PALETTES.length];
  const abbr = courseAbbr(note.courseName);
  const needsBorder = note.palette === 4;
  return (
    <div
      className={`cover-root relative aspect-[3/4] w-full select-none overflow-hidden ${className}`}
      style={{
        background: p.bg,
        color: p.fg,
        borderRadius: '3% 5% 5% 3% / 2% 3% 3% 2%',
        boxShadow: needsBorder ? 'inset 0 0 0 1.5px #211C45' : undefined,
      }}
      role="img"
      aria-label={`Cover of ${note.title}`}
    >
      {/* spine */}
      <div className="absolute inset-y-0 left-0" style={{ width: '9%', background: p.spine }}>
        {[16, 34, 52, 70].map((t) => (
          <span key={t} className="absolute left-1/2 block -translate-x-1/2 rounded-full" style={{ top: `${t}%`, width: '34%', aspectRatio: '1', background: p.bg, opacity: 0.9 }} />
        ))}
      </div>
      {/* bookmark ribbon */}
      <div
        className="absolute"
        style={{ right: '9%', top: 0, width: '11%', height: '19%', background: p.acc, clipPath: 'polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)' }}
      />
      {/* course code */}
      {!mini && (
        <div className="absolute font-mono font-medium uppercase" style={{ left: '15%', top: '6%', fontSize: '5.6cqw', letterSpacing: '0.08em', color: p.sub }}>
          {note.courseCode}
        </div>
      )}
      {/* art */}
      <svg viewBox="0 0 100 60" className="absolute" style={{ left: '15%', right: '8%', top: mini ? '14%' : '16%', width: '77%' }} aria-hidden="true">
        <Motif cat={note.category} p={p} />
      </svg>
      {/* abbreviation + topic */}
      <div className="absolute" style={{ left: '15%', right: '8%', bottom: '7%' }}>
        <div className="font-display font-extrabold leading-[0.9]" style={{ fontSize: mini ? '24cqw' : abbr.length > 3 ? '19cqw' : '24cqw', letterSpacing: '-0.03em' }}>
          {abbr}
        </div>
        {!mini && (
          <div className="clamp-2 mt-[3cqw] font-medium leading-tight" style={{ fontSize: '5.6cqw', color: p.sub }}>
            {note.title.includes('—') ? note.title.split('—')[1].trim() : note.title}
          </div>
        )}
      </div>
    </div>
  );
}

export function MotifIcon({ cat, palette = 0, className = '' }: { cat: CategoryId; palette?: number; className?: string }) {
  const p = PALETTES[palette % PALETTES.length];
  return (
    <svg viewBox="0 0 100 60" className={className} aria-hidden="true">
      <Motif cat={cat} p={{ ...p, bg: p.bg }} />
    </svg>
  );
}

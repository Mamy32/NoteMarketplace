import type { SVGProps } from 'react';

const P: Record<string, JSX.Element> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  bookmark: <path d="M6 3h12v18l-6-4.5L6 21z" />,
  star: <path d="m12 3 2.8 5.8 6.2.8-4.5 4.4 1.2 6.3L12 17.2 6.3 20.3l1.2-6.3L3 9.6l6.2-.8z" />,
  download: <path d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14" />,
  home: <path d="M3 11 12 3l9 8M5 10v10h14V10M10 20v-6h4v6" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  sell: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  library: <path d="M5 4h4v16H5zM9 4h4v16H9zM14.5 5.5l3.8-1 3 15-3.8 1z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  sliders: <><path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  file: <path d="M7 3h7l5 5v13H7zM14 3v5h5" />,
  upload: <path d="M12 16V5m0 0-4 4m4-4 4 4M5 20h14" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  edit: <path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3" />,
  book: <path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v14" />,
  shield: <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 15h2" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  alert: <><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 18h.01" /></>,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: keyof typeof P | string;
  size?: number;
  filled?: boolean;
}

export function Icon({ name, size = 20, filled = false, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {P[name] ?? null}
    </svg>
  );
}

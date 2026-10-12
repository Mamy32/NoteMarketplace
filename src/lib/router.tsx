import { useEffect, useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from 'react';

export interface Route {
  path: string;
  query: URLSearchParams;
}

function readHash(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/' + h;
}

let cached = { raw: '', route: { path: '/', query: new URLSearchParams() } as Route };

function snapshot(): Route {
  const raw = readHash();
  if (raw !== cached.raw) {
    const [path, qs = ''] = raw.split('?');
    cached = { raw, route: { path: path || '/', query: new URLSearchParams(qs) } };
  }
  return cached.route;
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, snapshot);
}

export function navigate(to: string) {
  window.location.hash = to;
}

/** Update the URL without adding a history entry (used for live filters). */
export function replaceRoute(to: string) {
  window.history.replaceState(null, '', '#' + to);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function buildQuery(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const s = sp.toString();
  return s ? '?' + s : '';
}

export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={'#' + to} {...rest}>
      {children}
    </a>
  );
}

export function Redirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace('#' + to);
  }, [to]);
  return null;
}

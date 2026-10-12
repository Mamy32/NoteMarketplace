import { useEffect, useRef, type ReactElement } from 'react';
import { Shell } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { Redirect, matchPath, useRoute } from './lib/router';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Sell } from './pages/Sell';
import { SellDone } from './pages/SellDone';
import { Subscribe } from './pages/Subscribe';
import { Library } from './pages/Library';
import { NoteDetail } from './pages/NoteDetail';
import { Reader } from './pages/Reader';
import { Success } from './pages/Success';
import { Categories } from './pages/Categories';
import { Explore } from './pages/Explore';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

type Entry = { pattern: string; render: (p: Record<string, string>) => ReactElement; title: string };

const ROUTES: Entry[] = [
  { pattern: '/', title: 'Home', render: () => <Home /> },
  { pattern: '/explore', title: 'Explore notes', render: () => <Explore /> },
  { pattern: '/categories', title: 'Categories', render: () => <Categories /> },
  { pattern: '/note/:id', title: 'Note', render: (p) => <NoteDetail id={p.id} key={p.id} /> },
  { pattern: '/subscribe', title: 'BombaNotes Pass', render: () => <Subscribe /> },
  { pattern: '/checkout/:id', title: 'BombaNotes Pass', render: (p) => <Redirect to={`/subscribe?note=${p.id}`} /> },
  { pattern: '/success/:orderId', title: 'Pass active', render: (p) => <Success orderId={p.orderId} /> },
  { pattern: '/sell', title: 'Sell notes', render: () => <Sell key="new" /> },
  { pattern: '/sell/edit/:id', title: 'Edit listing', render: (p) => <Sell key={p.id} editingId={p.id} /> },
  { pattern: '/sell/done/:id', title: 'Submitted', render: (p) => <SellDone id={p.id} /> },
  { pattern: '/dashboard', title: 'Seller dashboard', render: () => <Dashboard /> },
  { pattern: '/profile', title: 'Profile', render: () => <Profile /> },
  { pattern: '/library', title: 'My Library', render: () => <Library /> },
  { pattern: '/read/:id', title: 'Reader', render: (p) => <Reader id={p.id} key={p.id} /> },
];

export function App() {
  const route = useRoute();
  const lastPath = useRef<string | null>(null);

  let element: ReactElement = <NotFound />;
  let title = 'Page not found';
  for (const r of ROUTES) {
    const params = matchPath(r.pattern, route.path);
    if (params) {
      element = r.render(params);
      title = r.title;
      break;
    }
  }

  useEffect(() => {
    document.title = `${title} · BombaNotes`;
    if (lastPath.current !== route.path) {
      lastPath.current = route.path;
      window.scrollTo(0, 0);
      document.getElementById('main')?.focus({ preventScroll: true });
    }
  }, [route.path, title]);

  return (
    <ToastProvider>
      <Shell>{element}</Shell>
    </ToastProvider>
  );
}

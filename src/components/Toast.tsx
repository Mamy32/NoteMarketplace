import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

type Kind = 'success' | 'info' | 'error';
interface ToastItem {
  id: number;
  message: string;
  kind: Kind;
}

const Ctx = createContext<(message: string, kind?: Kind) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);

  const push = useCallback((message: string, kind: Kind = 'success') => {
    const id = next.current++;
    setItems((cur) => [...cur.slice(-2), { id, message, kind }]);
    window.setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 4200);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-stretch gap-2 md:bottom-auto md:left-auto md:right-6 md:top-24 md:w-[360px]"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="pop-in pointer-events-auto flex items-start gap-3 rounded-lg border-2 border-ink bg-white p-3 pr-2 shadow-stamp"
          >
            <span
              className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                t.kind === 'error' ? 'bg-coral text-ink' : t.kind === 'info' ? 'bg-sun text-ink' : 'bg-mint text-ink'
              }`}
            >
              <Icon name={t.kind === 'error' ? 'alert' : t.kind === 'info' ? 'info' : 'check'} size={15} />
            </span>
            <p className="flex-1 py-0.5 text-sm font-medium leading-snug">{t.message}</p>
            <button
              type="button"
              className="rounded p-1.5 text-ink-70 hover:bg-ink/5"
              aria-label="Dismiss notification"
              onClick={() => setItems((cur) => cur.filter((x) => x.id !== t.id))}
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

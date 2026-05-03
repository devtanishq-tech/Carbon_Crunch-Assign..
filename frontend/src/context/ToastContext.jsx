import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = ++counterRef.current;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      const timeout = type === 'error' ? 6000 : 4000;
      setTimeout(() => dismiss(id), timeout);
      return id;
    },
    [dismiss],
  );

  return (
    <ToastCtx.Provider value={{ addToast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx.addToast;
}

// ── Toast Stack ─────────────────────────────────────────────────────────────
const VARIANTS = {
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/8',
    text: 'text-emerald-400',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'SUCCESS',
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/8',
    text: 'text-red-400',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: 'ERROR',
  },
  duplicate: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/8',
    text: 'text-amber-400',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v5M7 9.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    label: 'DUPLICATE',
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/8',
    text: 'text-blue-400',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 6v4M7 4.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: 'INFO',
  },
};

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const v = VARIANTS[t.type] ?? VARIANTS.info;
        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            className={`
              pointer-events-auto animate-slide-up
              flex items-start gap-3 px-4 py-3 rounded-lg border
              backdrop-blur-md ${v.border} ${v.bg}
              min-w-[280px] max-w-[400px] cursor-pointer
              shadow-[0_4px_24px_rgba(0,0,0,0.6)]
            `}
          >
            <span className={`${v.text} mt-0.5 shrink-0`}>{v.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-mono font-semibold tracking-widest mb-0.5 ${v.text}`}>
                {v.label}
              </p>
              <p className="text-xs font-mono text-ink-secondary leading-relaxed break-words">
                {t.message}
              </p>
            </div>
            <span className="text-ink-muted hover:text-ink-secondary text-lg leading-none ml-1 shrink-0">×</span>
          </div>
        );
      })}
    </div>
  );
}

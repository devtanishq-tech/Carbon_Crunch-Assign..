const NAV_ITEMS = [
  {
    id: 'submit',
    label: 'Submit Event',
    sublabel: 'Ingest',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'raw',
    label: 'Raw Events',
    sublabel: 'Pipeline',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 6h6M5 8.5h4M5 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'processed',
    label: 'Processed',
    sublabel: 'Normalized',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2.5 8.5L6 12l7.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'failed',
    label: 'Failed',
    sublabel: 'Errors',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 5v3.5M8 10.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'aggregate',
    label: 'Aggregate',
    sublabel: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 13V9M6 13V6M10 13V4M14 13V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ACCENT_BY_VIEW = {
  submit: 'text-accent',
  raw: 'text-amber-400',
  processed: 'text-emerald-400',
  failed: 'text-red-400',
  aggregate: 'text-violet-400',
};

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="w-[220px] shrink-0 h-screen flex flex-col bg-surface-900 border-r border-wire">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-wire">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-glow">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 10L5 5l2.5 3L9.5 4l3 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-ink-primary tracking-tight">FluxPipeline</p>
            <p className="text-[9px] font-mono text-ink-muted tracking-widest uppercase">Event Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-[9px] font-mono font-semibold tracking-widest text-ink-muted uppercase">
          Views
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const accentColor = ACCENT_BY_VIEW[item.id] ?? 'text-accent';
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                transition-all duration-150 group
                ${isActive
                  ? 'bg-surface-600 shadow-[0_0_0_1px_rgba(255,255,255,0.07)]'
                  : 'hover:bg-surface-700'
                }
              `}
            >
              <span className={`transition-colors ${isActive ? accentColor : 'text-ink-muted group-hover:text-ink-secondary'}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-mono font-medium transition-colors leading-none ${
                  isActive ? 'text-ink-primary' : 'text-ink-secondary group-hover:text-ink-primary'
                }`}>
                  {item.label}
                </p>
                <p className="text-[9px] text-ink-muted mt-0.5 font-mono">{item.sublabel}</p>
              </div>
              {isActive && (
                <span className={`w-1 h-1 rounded-full ${accentColor.replace('text-', 'bg-')}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-wire">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[10px] font-mono text-ink-muted">Connected · :8080</p>
        </div>
      </div>
    </aside>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-surface-700 border border-wire flex items-center justify-center text-2xl">
        {icon ?? '📭'}
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-ink-secondary text-sm">{title ?? 'No data yet'}</p>
        {description && (
          <p className="text-ink-muted text-xs mt-1 font-mono">{description}</p>
        )}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
          <path d="M12 9v4M12 17.5v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-red-400 text-sm">Request failed</p>
        <p className="text-ink-muted text-xs mt-1 font-mono max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-4 py-1.5 text-xs font-mono font-medium rounded-lg
            bg-surface-700 border border-wire text-ink-secondary
            hover:border-accent/40 hover:text-ink-primary transition-colors"
        >
          ↺ retry
        </button>
      )}
    </div>
  );
}

const STATUS_MAP = {
  processed: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    label: 'PROCESSED',
  },
  failed: {
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'FAILED',
  },
  pending: {
    dot: 'bg-amber-400 animate-pulse',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    label: 'PENDING',
  },
};

export default function Badge({ status, className = '' }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5
        rounded text-[10px] font-mono font-semibold tracking-wider
        border ${s.bg} ${s.border} ${s.text} ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

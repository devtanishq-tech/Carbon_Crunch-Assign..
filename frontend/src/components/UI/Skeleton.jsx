export function SkeletonRow({ cols = 4 }) {
  return (
    <tr className="border-b border-wire">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 rounded shimmer-bg"
            style={{ width: `${55 + (i * 17) % 40}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-800 rounded-xl border border-wire p-5 space-y-3">
      <div className="h-3 w-24 rounded shimmer-bg" />
      <div className="h-8 w-36 rounded shimmer-bg" />
    </div>
  );
}

export function SkeletonBlock({ className = '' }) {
  return <div className={`rounded shimmer-bg ${className}`} />;
}

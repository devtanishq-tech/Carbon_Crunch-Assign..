import { useCallback } from 'react';
import { getProcessedEvents } from '../../services/api';
import { useAutoFetch } from '../../hooks/useFetch';
import { SkeletonTable } from '../UI/Skeleton';
import { EmptyState, ErrorState } from '../UI/EmptyState';

function fmt(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleString(); } catch { return val; }
}

function AmountCell({ amount }) {
  return (
    <td className="px-4 py-3">
      <span className="font-mono text-xs font-semibold text-emerald-400">
        {typeof amount === 'number' ? amount.toLocaleString() : amount ?? '—'}
      </span>
    </td>
  );
}

export default function ProcessedEventsTable() {
  const fetcher = useCallback(getProcessedEvents, []);
  const { data, loading, error, refresh } = useAutoFetch(fetcher);

  const events = Array.isArray(data) ? data : [];

  // Compute quick stats
  const totalAmount = events.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const sources = [...new Set(events.map((e) => e.clientId).filter(Boolean))];

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink-primary">Processed Events</h2>
          <p className="text-xs font-mono text-ink-muted mt-1">GET /api/events/processed · NormalizedEvent collection</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono
            bg-surface-700 border border-wire text-ink-secondary
            hover:border-accent/30 hover:text-ink-primary transition-colors disabled:opacity-40"
        >
          <span className={loading ? 'animate-spin-slow' : ''}>↺</span>
          Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Events', value: events.length, color: 'text-ink-primary' },
          { label: 'Total Amount', value: totalAmount.toLocaleString(), color: 'text-emerald-400' },
          { label: 'Unique Clients', value: sources.length, color: 'text-accent' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-800 rounded-xl border border-wire px-4 py-3">
            <p className="text-[9px] font-mono text-ink-muted uppercase tracking-widest">{label}</p>
            <p className={`text-xl font-display font-bold mt-1 ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-800 rounded-2xl border border-wire shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wire">
                {['Client ID', 'Metric', 'Amount', 'Timestamp', 'Hash'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-mono font-semibold tracking-widest text-ink-muted uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonTable rows={6} cols={5} />}
              {!loading && error && (
                <tr><td colSpan={5}><ErrorState message={error} onRetry={refresh} /></td></tr>
              )}
              {!loading && !error && events.length === 0 && (
                <tr><td colSpan={5}>
                  <EmptyState icon="✅" title="No processed events" description="Events appear here after successful normalization" />
                </td></tr>
              )}
              {!loading && !error && events.map((ev) => (
                <tr
                  key={ev._id}
                  className="border-b border-wire last:border-0 hover:bg-surface-700/50 transition-colors animate-fade-in"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent/8 border border-accent/15 text-accent text-[11px] font-mono font-medium">
                      {ev.clientId ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-ink-secondary font-mono">{ev.metric ?? '—'}</span>
                  </td>
                  <AmountCell amount={ev.amount} />
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap font-mono">{fmt(ev.timestamp)}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-ink-muted" title={ev.hash}>
                      {ev.hash ? `${ev.hash.slice(0, 8)}…` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

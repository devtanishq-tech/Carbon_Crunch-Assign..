import { useCallback } from 'react';
import { getRawEvents } from '../../services/api';
import { useAutoFetch } from '../../hooks/useFetch';
import Badge from '../UI/Badge';
import { SkeletonTable } from '../UI/Skeleton';
import { EmptyState, ErrorState } from '../UI/EmptyState';

function fmt(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleString(); } catch { return val; }
}

function RawDataCell({ data }) {
  const str = typeof data === 'object' ? JSON.stringify(data) : String(data ?? '');
  return (
    <td className="px-4 py-3 max-w-[220px]">
      <span
        title={str}
        className="block truncate text-[10px] font-mono text-ink-muted
          bg-surface-700 border border-wire rounded px-2 py-1"
      >
        {str}
      </span>
    </td>
  );
}

export default function RawEventsTable() {
  const fetcher = useCallback(getRawEvents, []);
  const { data, loading, error, refresh } = useAutoFetch(fetcher);

  const events = Array.isArray(data) ? data : [];
  const counts = { processed: 0, failed: 0, pending: 0 };
  events.forEach((e) => { counts[e.status] = (counts[e.status] ?? 0) + 1; });

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink-primary">Raw Events</h2>
          <p className="text-xs font-mono text-ink-muted mt-1">GET /api/events/raw · all pipeline states</p>
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

      {/* Stat chips */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'processed', label: 'Processed', color: 'text-emerald-400 bg-emerald-500/8 border-emerald-500/20' },
          { key: 'failed', label: 'Failed', color: 'text-red-400 bg-red-500/8 border-red-500/20' },
          { key: 'pending', label: 'Pending', color: 'text-amber-400 bg-amber-500/8 border-amber-500/20' },
        ].map(({ key, label, color }) => (
          <div key={key} className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono font-medium ${color}`}>
            {counts[key]} {label}
          </div>
        ))}
        <div className="px-3 py-1.5 rounded-lg border border-wire text-[11px] font-mono text-ink-muted">
          {events.length} Total
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-800 rounded-2xl border border-wire shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wire">
                {['Status', 'Raw Data', 'Error', 'Received At', 'ID'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-mono font-semibold tracking-widest text-ink-muted uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonTable rows={6} cols={5} />}
              {!loading && error && (
                <tr>
                  <td colSpan={5}>
                    <ErrorState message={error} onRetry={refresh} />
                  </td>
                </tr>
              )}
              {!loading && !error && events.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon="📡" title="No raw events" description="Submit an event to see pipeline activity here" />
                  </td>
                </tr>
              )}
              {!loading && !error && events.map((ev) => (
                <tr
                  key={ev._id}
                  className="border-b border-wire last:border-0 hover:bg-surface-700/50 transition-colors animate-fade-in"
                >
                  <td className="px-4 py-3"><Badge status={ev.status} /></td>
                  <RawDataCell data={ev.rawdata} />
                  <td className="px-4 py-3">
                    {ev.error
                      ? <span className="text-red-400 font-mono text-[10px]" title={ev.error}>{ev.error.slice(0, 40)}{ev.error.length > 40 ? '…' : ''}</span>
                      : <span className="text-ink-faint">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">{fmt(ev.receivedAt || ev.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-ink-muted">{ev._id?.slice(-8)}</span>
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

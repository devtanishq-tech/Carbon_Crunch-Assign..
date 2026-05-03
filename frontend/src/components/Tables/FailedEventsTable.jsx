import { useCallback } from 'react';
import { getFailedEvents } from '../../services/api';
import { useAutoFetch } from '../../hooks/useFetch';
import { SkeletonTable } from '../UI/Skeleton';
import { EmptyState, ErrorState } from '../UI/EmptyState';

function fmt(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleString(); } catch { return val; }
}

function RawDataCell({ data }) {
  const str = typeof data === 'object' ? JSON.stringify(data, null, 0) : String(data ?? '');
  return (
    <td className="px-4 py-3 max-w-[260px]">
      <div className="relative group">
        <span
          className="block truncate text-[10px] font-mono text-ink-muted
            bg-surface-700 border border-wire rounded px-2 py-1 cursor-default"
          title={str}
        >
          {str}
        </span>
      </div>
    </td>
  );
}

export default function FailedEventsTable() {
  const fetcher = useCallback(getFailedEvents, []);
  const { data, loading, error, refresh } = useAutoFetch(fetcher);

  const events = Array.isArray(data) ? data : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-ink-primary">Failed Events</h2>
          <p className="text-xs font-mono text-ink-muted mt-1">GET /api/events/failed · Raw docs with status=failed</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono
            bg-surface-700 border border-wire text-ink-secondary
            hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-40"
        >
          <span className={loading ? 'animate-spin-slow' : ''}>↺</span>
          Refresh
        </button>
      </div>

      {/* Alert banner if there are failures */}
      {!loading && events.length > 0 && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-400 shrink-0">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 5v3.5M8 10v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-xs font-mono text-red-400">
            <span className="font-semibold">{events.length} failed event{events.length > 1 ? 's' : ''}</span> detected in the pipeline.
            These raw events require investigation.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-800 rounded-2xl border border-wire shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wire">
                {['Raw Data', 'Error Message', 'Received At', 'ID'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-mono font-semibold tracking-widest text-ink-muted uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonTable rows={4} cols={4} />}
              {!loading && error && (
                <tr><td colSpan={4}><ErrorState message={error} onRetry={refresh} /></td></tr>
              )}
              {!loading && !error && events.length === 0 && (
                <tr><td colSpan={4}>
                  <EmptyState icon="🟢" title="No failed events" description="All events have been processed successfully" />
                </td></tr>
              )}
              {!loading && !error && events.map((ev) => (
                <tr
                  key={ev._id}
                  className="border-b border-wire last:border-0 hover:bg-red-500/5 transition-colors animate-fade-in"
                >
                  <RawDataCell data={ev.rawdata} />
                  <td className="px-4 py-3 max-w-[240px]">
                    <span className="text-red-400 font-mono text-[11px] leading-relaxed line-clamp-2" title={ev.error}>
                      {ev.error ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary whitespace-nowrap font-mono">
                    {fmt(ev.receivedAt || ev.createdAt)}
                  </td>
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

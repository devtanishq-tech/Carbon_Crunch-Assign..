import { useState } from "react";
import { getAggregate } from "../services/api"; // up to src/, then services/
import { useFetch } from "../hooks/useFetch"; // up to src/, then hooks/
import { SkeletonCard } from "./UI/Skeleton";

const inputCls = `
  w-full px-3 py-2 rounded-lg text-xs font-mono
  bg-surface-800 border border-wire
  text-ink-primary placeholder-ink-muted
  focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40
  transition-colors
`;

function StatCard({ label, value, sub, color = "text-ink-primary", loading }) {
  return (
    <div className="bg-surface-800 rounded-2xl border border-wire shadow-card px-6 py-5 flex flex-col gap-2">
      <p className="text-[9px] font-mono font-semibold tracking-widest text-ink-muted uppercase">
        {label}
      </p>
      {loading ? (
        <div className="h-10 w-32 rounded shimmer-bg" />
      ) : (
        <p className={`text-4xl font-display font-bold ${color}`}>{value}</p>
      )}
      {sub && <p className="text-[10px] font-mono text-ink-muted">{sub}</p>}
    </div>
  );
}

export default function AggregateView() {
  const [filters, setFilters] = useState({ clientId: "", from: "", to: "" });
  const [appliedFilters, setAppliedFilters] = useState(null);
  const { data, loading, error, execute } = useFetch(getAggregate);

  const handleFetch = async () => {
    setAppliedFilters({ ...filters });
    await execute(filters);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleFetch();
  };

  const hasResult = data !== null;
  const totalAmount = data?.totalAmount ?? 0;
  const count = data?.count ?? 0;
  const avg = count > 0 ? (totalAmount / count).toFixed(2) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-ink-primary">
          Aggregate View
        </h2>
        <p className="text-xs font-mono text-ink-muted mt-1">
          GET /api/aggregate · group + sum from NormalizedEvent
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-surface-800 rounded-2xl border border-wire shadow-card p-5 mb-6">
        <p className="text-[9px] font-mono font-semibold tracking-widest text-ink-muted uppercase mb-4">
          Filters
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-ink-secondary uppercase tracking-widest">
              Client ID
            </label>
            <input
              type="text"
              placeholder="client_A"
              value={filters.clientId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, clientId: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-ink-secondary uppercase tracking-widest">
              From Date
            </label>
            <input
              type="datetime-local"
              value={filters.from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, from: e.target.value }))
              }
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-ink-secondary uppercase tracking-widest">
              To Date
            </label>
            <input
              type="datetime-local"
              value={filters.to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, to: e.target.value }))
              }
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleFetch}
            disabled={loading}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl
              text-xs font-mono font-semibold transition-all duration-150
              ${
                loading
                  ? "opacity-50 cursor-not-allowed bg-surface-600 border border-wire text-ink-muted"
                  : "bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20"
              }
            `}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                Fetching…
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle
                    cx="5.5"
                    cy="5.5"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8.5 8.5l2 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Fetch Aggregate
              </>
            )}
          </button>

          {(filters.clientId || filters.from || filters.to) && (
            <button
              onClick={() => setFilters({ clientId: "", from: "", to: "" })}
              className="text-[11px] font-mono text-ink-muted hover:text-ink-secondary transition-colors"
            >
              × Clear filters
            </button>
          )}
        </div>

        {/* Applied filter pills */}
        {appliedFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-wire">
            <span className="text-[9px] font-mono text-ink-muted uppercase tracking-widest self-center">
              Applied:
            </span>
            {appliedFilters.clientId && (
              <span className="px-2 py-0.5 rounded bg-accent/8 border border-accent/15 text-[10px] font-mono text-accent">
                clientId={appliedFilters.clientId}
              </span>
            )}
            {appliedFilters.from && (
              <span className="px-2 py-0.5 rounded bg-surface-600 border border-wire text-[10px] font-mono text-ink-secondary">
                from={new Date(appliedFilters.from).toLocaleDateString()}
              </span>
            )}
            {appliedFilters.to && (
              <span className="px-2 py-0.5 rounded bg-surface-600 border border-wire text-[10px] font-mono text-ink-secondary">
                to={new Date(appliedFilters.to).toLocaleDateString()}
              </span>
            )}
            {!appliedFilters.clientId &&
              !appliedFilters.from &&
              !appliedFilters.to && (
                <span className="px-2 py-0.5 rounded bg-surface-600 border border-wire text-[10px] font-mono text-ink-secondary">
                  all records
                </span>
              )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 animate-slide-up">
          <p className="text-xs font-mono text-red-400">✗ {error}</p>
        </div>
      )}

      {/* Result cards */}
      {(loading || hasResult) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
          <StatCard
            label="Total Amount"
            value={loading ? "—" : totalAmount.toLocaleString()}
            sub="Sum of all matching events"
            color="text-emerald-400"
            loading={loading}
          />
          <StatCard
            label="Event Count"
            value={loading ? "—" : count.toLocaleString()}
            sub="Matching normalized events"
            color="text-accent"
            loading={loading}
          />
          <StatCard
            label="Avg. Amount"
            value={loading ? "—" : Number(avg).toLocaleString()}
            sub="Per matching event"
            color="text-violet-400"
            loading={loading}
          />
        </div>
      )}

      {/* Empty prompt */}
      {!loading && !hasResult && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-wire flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-ink-muted"
            >
              <path
                d="M4 20V10M8 20V4M12 20v-8M16 20V8M20 20v-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-ink-secondary text-sm">
              No query yet
            </p>
            <p className="text-ink-muted text-xs mt-1 font-mono">
              Apply filters above and click Fetch Aggregate
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from 'react';
import { submitEvent } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const INITIAL = {
  source: '',
  metric: '',
  amount: '',
  timestamp: '',
};

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[10px] font-mono font-semibold tracking-widest text-ink-secondary uppercase">
          {label}
        </label>
        {hint && <span className="text-[10px] font-mono text-ink-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = `
  w-full px-3 py-2.5 rounded-lg text-xs font-mono
  bg-surface-800 border border-wire
  text-ink-primary placeholder-ink-muted
  focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40
  transition-colors
`;

export default function EventForm() {
  const [form, setForm] = useState(INITIAL);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null); // null | 'success' | 'duplicate' | 'error'
  const toast = useToast();

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setLastResult(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.source || !form.amount || !form.timestamp) {
      toast('Please fill in source, amount, and timestamp.', 'error');
      return;
    }

    setSubmitting(true);
    setLastResult(null);

    // Build payload (flat format; backend supports both)
    const payload = {
      source: form.source.trim(),
      metric: form.metric.trim() || 'value',
      amount: form.amount,
      timestamp: form.timestamp,
    };

    try {
      const data = await submitEvent(payload, simulateFailure);

      const isDuplicate = data?.message?.toLowerCase().includes('duplicate');
      if (isDuplicate) {
        setLastResult('duplicate');
        toast(data.message ?? 'Duplicate event — already processed.', 'duplicate');
      } else {
        setLastResult('success');
        toast(data.message ?? 'Event processed successfully!', 'success');
        setForm(INITIAL);
      }
    } catch (err) {
      setLastResult('error');
      toast(err?.message ?? 'Failed to submit event.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const feedbackBanner = () => {
    if (!lastResult) return null;
    const map = {
      success: {
        cls: 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400',
        msg: '✓ Event ingested and normalized successfully.',
      },
      duplicate: {
        cls: 'bg-amber-500/8 border-amber-500/20 text-amber-400',
        msg: '⟳ Duplicate detected — event was ignored but marked processed.',
      },
      error: {
        cls: 'bg-red-500/8 border-red-500/20 text-red-400',
        msg: '✗ Processing failed — raw event stored with "failed" status.',
      },
    };
    const b = map[lastResult];
    return (
      <div className={`rounded-lg border px-4 py-3 text-xs font-mono ${b.cls} animate-slide-up`}>
        {b.msg}
      </div>
    );
  };

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-ink-primary">Submit Event</h2>
        <p className="text-xs font-mono text-ink-muted mt-1">
          POST /api/events · Flat payload format
        </p>
      </div>

      <div className="bg-surface-800 rounded-2xl border border-wire shadow-card p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Source + Metric */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Source" hint="required">
              <input
                type="text"
                placeholder="client_A"
                value={form.source}
                onChange={(e) => setField('source', e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Metric" hint="default: value">
              <input
                type="text"
                placeholder="click"
                value={form.metric}
                onChange={(e) => setField('metric', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Amount + Timestamp */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount" hint="numeric">
              <input
                type="number"
                placeholder="800"
                value={form.amount}
                onChange={(e) => setField('amount', e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Timestamp" hint="ISO 8601">
              <input
                type="datetime-local"
                value={form.timestamp}
                onChange={(e) => setField('timestamp', e.target.value)}
                className={inputCls}
                required
              />
            </Field>
          </div>

          {/* Divider */}
          <div className="border-t border-wire" />

          {/* Failure toggle + submit */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setSimulateFailure((v) => !v)}
                className={`
                  relative w-10 h-5.5 rounded-full border transition-colors duration-200
                  ${simulateFailure
                    ? 'bg-red-500/20 border-red-500/40'
                    : 'bg-surface-600 border-wire'}
                `}
                style={{ height: '22px' }}
              >
                <span
                  className={`
                    absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200
                    ${simulateFailure
                      ? 'left-[calc(100%-18px)] bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]'
                      : 'left-0.5 bg-ink-muted'}
                  `}
                />
              </div>
              <div>
                <p className={`text-xs font-mono font-medium transition-colors ${simulateFailure ? 'text-red-400' : 'text-ink-secondary'}`}>
                  Simulate Failure
                </p>
                <p className="text-[10px] font-mono text-ink-muted">appends ?fail=true</p>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl
                text-xs font-mono font-semibold
                transition-all duration-150
                ${submitting
                  ? 'opacity-50 cursor-not-allowed bg-surface-600 border border-wire text-ink-muted'
                  : simulateFailure
                    ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                    : 'bg-accent/15 border border-accent/30 text-accent hover:bg-accent/20 hover:shadow-glow'
                }
              `}
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {simulateFailure ? 'Submit (fail)' : 'Submit Event'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Feedback */}
        {feedbackBanner()}
      </div>

      {/* Pipeline diagram hint */}
      <div className="mt-5 px-4 py-3 rounded-xl bg-surface-800 border border-wire">
        <p className="text-[9px] font-mono text-ink-muted uppercase tracking-widest mb-2">Data Pipeline</p>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-muted flex-wrap">
          {['Form Input', '→', 'Raw Storage', '→', 'Normalize', '→', 'Hash Check', '→', 'NormalizedEvent DB'].map((s, i) => (
            <span key={i} className={s === '→' ? 'text-ink-faint' : 'text-ink-muted'}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

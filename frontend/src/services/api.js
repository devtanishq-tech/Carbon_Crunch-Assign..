// ─── Centralized API Service ───────────────────────────────────────────────
// All backend communication goes through this module.
// Backend runs on :8080; Vite dev-proxy forwards /api/* automatically.
// ───────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL? `${import.env.meta.VITE_API_URL}`:`/api`;
// means if backend link exist then use this render link else use the local system link
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Non-JSON response from server (status ${res.status})`);
  }

  // Backend returns 200 for duplicate events with a specific message
  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ── POST /api/events ────────────────────────────────────────────────────────
// Accepts both flat format and nested payload format.
// ?fail=true simulates a backend processing failure.
export async function submitEvent(body, simulateFailure = false) {
  const url = `${BASE}/events${simulateFailure ? '?fail=true' : ''}`;
  return request(url, { method: 'POST', body: JSON.stringify(body) });
}

// ── GET /api/events/raw ─────────────────────────────────────────────────────
// Returns all raw events: pending | processed | failed
export async function getRawEvents() {
  return request(`${BASE}/events/raw`);
}

// ── GET /api/events/processed ───────────────────────────────────────────────
// Returns normalized (deduplicated) events from NormalizedEvent collection
export async function getProcessedEvents() {
  return request(`${BASE}/events/processed`);
}

// ── GET /api/events/failed ──────────────────────────────────────────────────
// Returns Raw docs where status === "failed"
export async function getFailedEvents() {
  return request(`${BASE}/events/failed`);
}

// ── GET /api/aggregate ──────────────────────────────────────────────────────
// Optional filters: clientId, from (ISO), to (ISO)
// Returns: { totalAmount: number, count: number }
export async function getAggregate({ clientId = '', from = '', to = '' } = {}) {
  const params = new URLSearchParams();
  if (clientId.trim()) params.set('clientId', clientId.trim());
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return request(`${BASE}/aggregate${qs ? `?${qs}` : ''}`);
}

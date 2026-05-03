# FluxPipeline — Frontend Dashboard

Internal engineering dashboard for the Fault-Tolerant Event Processing System.

## Stack
- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **IBM Plex Mono** + **Syne** (Google Fonts)
- No external component libraries — fully custom UI

## Project Structure

```
src/
├── components/
│   ├── Form/
│   │   └── EventForm.jsx          # POST /api/events form
│   ├── Tables/
│   │   ├── RawEventsTable.jsx     # GET /api/events/raw
│   │   ├── ProcessedEventsTable.jsx # GET /api/events/processed
│   │   └── FailedEventsTable.jsx  # GET /api/events/failed
│   ├── UI/
│   │   ├── Badge.jsx              # Status badges (pending/processed/failed)
│   │   ├── EmptyState.jsx         # Empty + error state components
│   │   ├── Sidebar.jsx            # App navigation
│   │   └── Skeleton.jsx           # Loading skeleton components
│   └── AggregateView.jsx          # GET /api/aggregate with filters
├── context/
│   └── ToastContext.jsx            # Global toast notification system
├── hooks/
│   └── useFetch.js                 # useFetch + useAutoFetch hooks
├── pages/
│   └── Dashboard.jsx               # Page shell / view router
├── services/
│   └── api.js                      # Centralized API layer (all fetch calls)
├── App.jsx
├── main.jsx
└── index.css
```

## Setup

### 1. Prerequisites
Make sure your backend is running:
```bash
cd your-backend-folder
node server.js   # starts on :8080
```

### 2. Install & Run
```bash
cd flux-dashboard
npm install
npm run dev
```

Dashboard opens at **http://localhost:5173**

The Vite dev proxy forwards `/api/*` → `http://localhost:8080` automatically, so no CORS issues.

## Features

| View | Endpoint | Description |
|------|----------|-------------|
| Submit Event | `POST /api/events` | Flat payload, failure simulation toggle |
| Raw Events | `GET /api/events/raw` | All events with status badges |
| Processed | `GET /api/events/processed` | Normalized NormalizedEvent collection |
| Failed | `GET /api/events/failed` | Raw docs with status=failed |
| Aggregate | `GET /api/aggregate` | clientId + date range filters |

## Design

- **Dark industrial** aesthetic — deep navy backgrounds, monospace typography
- Status colors: 🟢 emerald (processed) · 🔴 red (failed) · 🟡 amber (pending)
- Loading skeletons on every data table
- Toast notifications: success / error / duplicate (context-aware messaging)
- Responsive layout with fixed sidebar navigation

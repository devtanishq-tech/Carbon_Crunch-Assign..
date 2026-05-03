# ⚡ FluxPipeline — Fault-Tolerant Event Processing System

> A full-stack data pipeline that ingests unreliable external events, normalizes them, eliminates duplicates, and serves aggregated analytics — built to handle real-world failures gracefully.

&nbsp;

## 📌 Table of Contents

- [What This Project Does](#-what-this-project-does)
- [Live Demo / Screenshots](#-project-highlights)
- [System Architecture](#-system-architecture)
- [The Data Pipeline (How It Works)](#-the-data-pipeline-how-it-works)
- [Backend](#-backend)
  - [Tech Stack](#backend-tech-stack)
  - [API Reference](#-api-reference)
  - [Database Design](#-database-design)
  - [Key Backend Logic](#-key-backend-logic)
- [Frontend](#-frontend)
  - [Tech Stack](#frontend-tech-stack)
  - [Project Structure](#-project-structure)
  - [Features & Views](#-features--views)
  - [Design Decisions](#-design-decisions)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Folder Structure (Full)](#-full-folder-structure)
- [What I Learned / Engineering Decisions](#-engineering-decisions)

---

&nbsp;

## 🧠 What This Project Does

In the real world, applications receive events from many sources — user clicks, payments, sensor readings, API webhooks. These events often arrive:

- **Out of order** — the same event sent twice
- **In inconsistent formats** — sometimes nested, sometimes flat
- **With invalid or corrupt data** — missing fields, wrong types
- **Under failure conditions** — network issues, timeouts

**FluxPipeline solves all of this.** It acts as a reliable middle layer that:

1. **Accepts** events in multiple formats from any client
2. **Stores the raw event immediately** — so nothing is ever lost
3. **Validates and normalizes** the data into a clean, consistent shape
4. **Deduplicates** using a cryptographic hash — same event sent 10 times? Stored once
5. **Marks failures clearly** — if anything goes wrong, the raw event is flagged with the exact error
6. **Serves analytics** — query total amounts, counts, and averages by client and date range

The frontend dashboard gives engineers full visibility into the pipeline: what's flowing, what's stuck, and what failed.

---

&nbsp;

## ✨ Project Highlights

| Capability            | Detail                                                             |
| --------------------- | ------------------------------------------------------------------ |
| 🔁 Deduplication      | SHA-256 hash of `clientId + amount + timestamp + metric`           |
| 🛡️ Fault Tolerance    | Raw event saved _before_ processing — failures never lose data     |
| 📊 Aggregation        | MongoDB `$group` pipeline with optional filters                    |
| 🎛️ Failure Simulation | `?fail=true` query param to test error handling                    |
| 🖥️ Live Dashboard     | 5-view internal tool with loading skeletons, toasts, empty states  |
| 📡 Status Tracking    | Every event tracked as `pending → processed` or `pending → failed` |

---

&nbsp;

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT / UI                          │
│              React Dashboard (localhost:5173)               │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP (proxied via Vite)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER                          │
│                    (localhost:8080)                         │
│                                                             │
│   POST /api/events        → Ingest + Process               │
│   GET  /api/events/raw    → All raw events                 │
│   GET  /api/events/processed → Normalized events           │
│   GET  /api/events/failed → Failed events only             │
│   GET  /api/aggregate     → Aggregation query              │
└───────────────────────────┬─────────────────────────────────┘
                            │  Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     MONGODB ATLAS                           │
│                                                             │
│   Collection: raws          (all incoming events)          │
│   Collection: normalizedevents  (clean, deduplicated)      │
└─────────────────────────────────────────────────────────────┘
```

---

&nbsp;

## 🔄 The Data Pipeline (How It Works)

This is the most important part of the system. Every event follows this exact journey:

```
User submits event
       │
       ▼
① RAW STORAGE ──────────────────────────────────────────────
  Raw event saved to MongoDB with status: "pending"
  This happens FIRST — before any processing.
  Guarantee: even if everything breaks, the event is not lost.
       │
       ▼
② FAILURE CHECK ─────────────────────────────────────────────
  Is ?fail=true in the query? → throw error immediately
  (Used for testing the failure path)
       │
       ▼
③ NORMALIZATION ─────────────────────────────────────────────
  Extract fields from either format:
    • Flat:   { source, amount, timestamp, metric }
    • Nested: { source, payload: { amount, timestamp, metric } }
  Validate: amount must be a number, timestamp must be a valid date
       │
       ▼
④ HASH GENERATION ───────────────────────────────────────────
  SHA-256( clientId + amount + timestamp + metric )
  This fingerprint uniquely identifies the event's content.
       │
       ▼
⑤ DEDUPLICATION CHECK ───────────────────────────────────────
  Does this hash already exist in NormalizedEvent?
    → YES: Mark raw event as "processed", return 200 "Duplicate ignored"
    → NO:  Continue to next step
       │
       ▼
⑥ PERSIST NORMALIZED DATA ───────────────────────────────────
  Save clean event to NormalizedEvent collection
  Update raw event status: "pending" → "processed"
  Return 201 "Event processed successfully"

  ──── If ANY step ③–⑥ throws an error ────────────────────
  Update raw event status: "pending" → "failed"
  Save the error message on the raw document
  Return 500 with the error message
```

---

&nbsp;

## 🔧 Backend

### Backend Tech Stack

| Technology            | Purpose                                   |
| --------------------- | ----------------------------------------- |
| **Node.js + Express** | HTTP server and routing                   |
| **MongoDB Atlas**     | Cloud-hosted NoSQL database               |
| **Mongoose**          | Schema definition and database queries    |
| **crypto-js**         | SHA-256 hash generation for deduplication |
| **dotenv**            | Environment variable management           |

---

### 📡 API Reference

#### `POST /api/events`

Submit a new event for processing.

**Query Parameters:**
| Param | Value | Description |
|---|---|---|
| `fail` | `true` | Simulates a processing failure |

**Accepted Formats:**

```jsonc
// Format 1 — Flat
{
  "source": "client_A",
  "amount": "800",
  "timestamp": "2026-05-03T10:00:00Z",
  "metric": "click"
}

// Format 2 — Nested payload
{
  "source": "client_A",
  "payload": {
    "amount": "800",
    "timestamp": "2026-05-03T10:00:00Z",
    "metric": "click"
  }
}
```

**Responses:**
| Status | Message | Meaning |
|---|---|---|
| `201` | `"Event processed successfully"` | New event stored and normalized |
| `200` | `"Duplicate event ignored"` | Hash already exists — skipped |
| `500` | `"<error message>"` | Processing failed — raw event marked failed |

---

#### `GET /api/events/raw`

Returns every event ever received, regardless of outcome.

```jsonc
[
  {
    "_id": "abc123",
    "rawdata": { "source": "client_A", "amount": "800", ... },
    "status": "processed",   // "pending" | "processed" | "failed"
    "error": null,
    "receivedAt": "2026-05-03T10:00:00.000Z"
  }
]
```

---

#### `GET /api/events/processed`

Returns all events from the `NormalizedEvent` collection — clean, validated, deduplicated data.

```jsonc
[
  {
    "_id": "xyz789",
    "clientId": "client_A",
    "metric": "click",
    "amount": 800,
    "timestamp": "2026-05-03T10:00:00.000Z",
    "hash": "a3f9c2...",
  },
]
```

---

#### `GET /api/events/failed`

Returns only the raw events where `status === "failed"`, including the error message.

---

#### `GET /api/aggregate`

Returns the sum and count of normalized events, with optional filters.

**Query Parameters (all optional):**
| Param | Example | Description |
|---|---|---|
| `clientId` | `client_A` | Filter by source client |
| `from` | `2026-01-01` | Events on or after this date |
| `to` | `2026-12-31` | Events on or before this date |

**Response:**

```jsonc
{
  "totalAmount": 4800,
  "count": 6,
}
```

---

### 🗄️ Database Design

**Collection 1: `raws`** — The intake log. Every event lands here first.

| Field        | Type          | Description                                     |
| ------------ | ------------- | ----------------------------------------------- |
| `rawdata`    | Mixed         | The original payload, exactly as received       |
| `status`     | String (enum) | `pending` → `processed` or `failed`             |
| `error`      | String        | Error message if processing failed, else `null` |
| `receivedAt` | Date          | When the server first saw this event            |

**Collection 2: `normalizedevents`** — The clean, trusted data store.

| Field       | Type            | Description                                  |
| ----------- | --------------- | -------------------------------------------- |
| `clientId`  | String          | Extracted from `source` or `client` field    |
| `metric`    | String          | Event type (defaults to `"value"`)           |
| `amount`    | Number          | Parsed and validated numeric amount          |
| `timestamp` | Date            | Parsed and validated ISO date                |
| `hash`      | String (unique) | SHA-256 fingerprint — enforces deduplication |

---

### 🔑 Key Backend Logic

**Why save the raw event before processing?**
This is a deliberate engineering choice. If normalization crashes halfway through, the event isn't silently lost — it's in the database with `status: "failed"` and the exact error message. You can retry or debug it later. This is the foundation of a fault-tolerant system.

**How does deduplication work?**
A SHA-256 hash is computed from `clientId + amount + timestamp + metric`. The `hash` field on `NormalizedEvent` has a `unique: true` index. Before saving, the server checks if this hash already exists. If it does — the event is a duplicate and is skipped. The same event sent 100 times results in exactly 1 database record.

**Why use `status` transitions on the raw document?**
It creates a full audit trail. You can always query `Raw.find({ status: "pending" })` to find events that started but never finished, which shouldn't happen under normal operation — a useful monitoring signal.

---

&nbsp;

## 🖥️ Frontend

### Frontend Tech Stack

| Technology         | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| **React 18**       | Component-based UI                               |
| **Vite 5**         | Fast dev server + build tool (with proxy config) |
| **Tailwind CSS 3** | Utility-first styling                            |
| **IBM Plex Mono**  | Monospace font for data/tables                   |
| **Syne**           | Display font for headings                        |

No UI component libraries — everything is built from scratch.

---

### 📁 Project Structure

```
src/
│
├── services/
│   └── api.js                  # Every API call lives here — one file, all endpoints
│
├── context/
│   └── ToastContext.jsx         # Global notification system (success/error/duplicate)
│
├── hooks/
│   └── useFetch.js              # useFetch (manual) + useAutoFetch (auto on mount)
│
├── components/
│   ├── Form/
│   │   └── EventForm.jsx        # Event submission form with failure toggle
│   │
│   ├── Tables/
│   │   ├── RawEventsTable.jsx       # All events with status badges
│   │   ├── ProcessedEventsTable.jsx # Normalized events with live stats
│   │   └── FailedEventsTable.jsx    # Failed events with error details
│   │
│   ├── UI/
│   │   ├── Badge.jsx            # Status badge (pending/processed/failed)
│   │   ├── Skeleton.jsx         # Loading skeleton rows and cards
│   │   ├── EmptyState.jsx       # Empty and error state displays
│   │   └── Sidebar.jsx          # Navigation sidebar
│   │
│   └── AggregateView.jsx        # Analytics view with filters
│
├── pages/
│   └── Dashboard.jsx            # Page shell — routes between views
│
├── App.jsx                      # Root component, wires sidebar + dashboard
├── main.jsx                     # React entry point
└── index.css                    # Tailwind directives + global styles
```

---

### 🎛️ Features & Views

**1. Submit Event**

- Controlled form with: Source, Metric, Amount, Timestamp
- "Simulate Failure" toggle — appends `?fail=true` to the request
- Inline feedback banner: shows success, duplicate, or error state after submission
- Pipeline diagram shown below the form for context
- Toast notifications for every outcome

**2. Raw Events Table**

- Fetches `GET /api/events/raw` on mount
- Shows every event with a color-coded status badge:
  - 🟢 `PROCESSED` — made it through the full pipeline
  - 🔴 `FAILED` — something went wrong, error shown inline
  - 🟡 `PENDING` — in progress (animated pulse dot)
- Summary chips at the top: count of each status
- Raw payload shown in a truncated monospace chip with full tooltip

**3. Processed Events Table**

- Fetches `GET /api/events/processed` — the clean NormalizedEvent data
- Quick stats cards: total events, total amount, unique clients
- Hash column truncated with full value on hover
- Client ID shown as a styled badge

**4. Failed Events Table**

- Fetches `GET /api/events/failed`
- Alert banner if any failures exist — draws immediate attention
- Full error message displayed per row
- Raw payload shown for debugging

**5. Aggregate View**

- Optional filters: Client ID, From Date, To Date
- Results shown in three stat cards: Total Amount, Count, Average
- Active filter pills shown below the form after a query
- Supports Enter key to trigger fetch

**All views include:**

- ⏳ Loading skeletons while data fetches
- 📭 Empty state with context-aware message
- ⚠️ Error state with retry button
- 🔄 Manual refresh button

---

### 🎨 Design Decisions

**Why a sidebar layout?**
Internal engineering tools need quick switching between views without losing context. A persistent sidebar makes it obvious where you are and where you can go — similar to tools like Grafana, Datadog, or Linear.

**Why IBM Plex Mono as the primary font?**
This is a data-heavy tool. Monospace fonts align numbers and IDs vertically in tables, making them instantly scannable. It also gives the dashboard an "engineering tool" feel that's appropriate for its audience.

**Why no external UI library?**
Tailwind + custom components gives full control over the design system. No fighting against third-party styles, no bloated bundle, and the components are exactly as complex as they need to be — no more.

**Toast type `duplicate` as its own variant**
The backend returns `200` (not an error) for duplicate events, but it's important to surface this to the engineer submitting the event. A distinct amber toast makes this state immediately clear and different from a real success or failure.

---

&nbsp;

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A running MongoDB Atlas cluster (or local MongoDB)
- npm

### 1. Clone & Setup Backend

```bash
# Install backend dependencies
npm install

# Create your .env file (see Environment Variables section)
# Then start the server
node server.js
# Server runs on http://localhost:8080
```

### 2. Setup & Run Frontend

```bash
cd flux-dashboard

# Install dependencies
npm install

# Start the dev server
npm run dev
# Dashboard opens at http://localhost:5173
```

> **Note:** The Vite dev server automatically proxies all `/api/*` requests to `http://localhost:8080`. No CORS configuration needed — they talk seamlessly out of the box.

### 3. Test the Pipeline

Try these scenarios in order:

```bash
# ① Submit a valid event → should return "processed"
# ② Submit the exact same event again → should return "duplicate"
# ③ Enable "Simulate Failure" toggle → should return "failed"
# ④ Check the Raw Events view to see all three statuses
# ⑤ Check Processed Events → only the first event appears
# ⑥ Check Failed Events → only the simulated failure appears
```

---

&nbsp;

## 🔐 Environment Variables

Create a `.env` file in the backend root:

```env
# Server port
Port=8080

# MongoDB connection string (Atlas or local)
DB_CONNECTION=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

| Variable        | Description                        |
| --------------- | ---------------------------------- |
| `Port`          | Port the Express server listens on |
| `DB_CONNECTION` | Full MongoDB connection URI        |

---

&nbsp;

## 📂 Full Folder Structure

```
project-root/
│
├── server.js                    # Express app, all routes
├── .env                         # Environment config (not committed)
├── package.json
│
├── models/
│   ├── rawScheam.js             # Raw event schema (pending/processed/failed)
│   └── normalizeScheam.js       # NormalizedEvent schema (clean data)
│
└── flux-dashboard/              # Frontend (React + Vite)
    ├── index.html
    ├── vite.config.js           # Dev proxy: /api/* → :8080
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── services/api.js
        ├── context/ToastContext.jsx
        ├── hooks/useFetch.js
        ├── pages/Dashboard.jsx
        └── components/
            ├── Form/EventForm.jsx
            ├── Tables/
            │   ├── RawEventsTable.jsx
            │   ├── ProcessedEventsTable.jsx
            │   └── FailedEventsTable.jsx
            ├── UI/
            │   ├── Badge.jsx
            │   ├── Skeleton.jsx
            │   ├── EmptyState.jsx
            │   └── Sidebar.jsx
            └── AggregateView.jsx
```

---

&nbsp;

## 🧩 Engineering Decisions

**Raw-first storage pattern**
The most important architectural decision. Saving the raw event _before_ any processing means the system is always recoverable. If the normalization logic has a bug, or MongoDB has a blip, the original data is still there. This mirrors how systems like Kafka and event sourcing architectures work at scale.

**SHA-256 for deduplication instead of a unique index on fields**
A compound unique index on `(clientId, amount, timestamp, metric)` would work, but a hash is more flexible — it's a single indexed field regardless of how many properties contribute to uniqueness. It also makes deduplication logic explicit and easy to audit.

**Centralized API layer (`services/api.js`)**
All fetch calls live in one file. If the backend URL changes, or an endpoint is renamed, there's exactly one place to update it. Components never construct URLs or handle raw HTTP — they just call a named function.

**`useAutoFetch` vs `useFetch`**
Two hook variants for two different needs. Tables auto-load their data on mount — `useAutoFetch` handles this. The aggregate form only fetches when the user clicks a button — `useFetch` (manual trigger) handles this. Same underlying logic, different invocation pattern.

**Status transitions as an audit trail**
Rather than deleting or updating events in place, every raw event keeps its full history. `status` moves in one direction: `pending → processed` or `pending → failed`. This makes the system easy to monitor and debug — you can always answer "what happened to this event?" with a single document lookup.

---

&nbsp;

## 👤 Author

Built by **Tanishq Jaiswal**

---

_This project demonstrates full-stack engineering fundamentals: fault tolerance, data normalization, deduplication, async state management, and production-quality UI design._

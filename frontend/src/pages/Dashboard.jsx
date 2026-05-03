import EventForm from '../components/Form/EventForm';
import RawEventsTable from '../components/Tables/RawEventsTable';
import ProcessedEventsTable from '../components/Tables/ProcessedEventsTable';
import FailedEventsTable from '../components/Tables/FailedEventsTable';
import AggregateView from '../components/AggregateView';

const PAGE_TITLES = {
  submit: { title: 'Submit Event', path: 'POST /api/events' },
  raw: { title: 'Raw Events', path: 'GET /api/events/raw' },
  processed: { title: 'Processed Events', path: 'GET /api/events/processed' },
  failed: { title: 'Failed Events', path: 'GET /api/events/failed' },
  aggregate: { title: 'Aggregate', path: 'GET /api/aggregate' },
};

export default function Dashboard({ activeView }) {
  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Topbar */}
      <header className="shrink-0 h-12 flex items-center justify-between px-6 border-b border-wire bg-surface-900">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-ink-muted">DASHBOARD</span>
          <span className="text-ink-faint">/</span>
          <span className="text-[10px] font-mono font-semibold text-ink-secondary uppercase tracking-wider">
            {PAGE_TITLES[activeView]?.title}
          </span>
        </div>
        <span className="text-[10px] font-mono text-ink-muted bg-surface-700 border border-wire px-2.5 py-1 rounded-md">
          {PAGE_TITLES[activeView]?.path}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto animate-fade-in" key={activeView}>
          {activeView === 'submit' && <EventForm />}
          {activeView === 'raw' && <RawEventsTable />}
          {activeView === 'processed' && <ProcessedEventsTable />}
          {activeView === 'failed' && <FailedEventsTable />}
          {activeView === 'aggregate' && <AggregateView />}
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/UI/Sidebar';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [activeView, setActiveView] = useState('submit');

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-surface-950 font-mono">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <div className="flex-1 min-w-0">
          <Dashboard activeView={activeView} />
        </div>
      </div>
    </ToastProvider>
  );
}

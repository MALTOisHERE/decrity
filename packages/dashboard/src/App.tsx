/**
 * Decrity Dashboard App
 */

import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import History from './pages/History'

function App() {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M12 2.5l7.5 3v6c0 5-3.2 8.3-7.5 10-4.3-1.7-7.5-5-7.5-10v-6l7.5-3z" />
              </svg>
            </span>
            <h1 className="text-xl font-semibold text-foreground">Decrity</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

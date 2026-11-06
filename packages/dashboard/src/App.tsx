/**
 * Decrity Dashboard App
 */

import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium px-1 py-0.5 border-b-2 transition-colors',
    isActive
      ? 'text-foreground border-primary'
      : 'text-muted-foreground border-transparent hover:text-foreground'
  )

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="h-10 bg-primary"
            style={{
              aspectRatio: '5246 / 2283',
              maskImage: 'url(/brand/wordmark.png)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'left center',
              WebkitMaskImage: 'url(/brand/wordmark.png)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'left center',
            }}
            role="img"
            aria-label="Decrity"
          />
          <nav className="flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/history" className={navLinkClass}>
              History
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

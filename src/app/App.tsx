import { useEffect } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Map, Home as HomeIcon, FileDown, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store/app'
import { Logo } from '@/components/Brand'
import { Home } from './pages/Home'
import { Planner } from './pages/Planner'
import { RouteView } from './pages/RouteView'
import { ExportView } from './pages/ExportView'
import { Settings } from './pages/Settings'

const NAV = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/planner', label: 'Planner', icon: Map },
  { to: '/export', label: 'Export', icon: FileDown },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function App() {
  const load = useAppStore((s) => s.load)

  useEffect(() => {
    // Pull persisted app config from the main process on startup.
    load().catch(() => undefined)
  }, [load])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/route" element={<RouteView />} />
          <Route path="/export" element={<ExportView />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

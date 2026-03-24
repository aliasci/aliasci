import { NavLink } from 'react-router-dom'
import { Home, Building2, Car, Shield, BookOpen } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Ana Sayfa' },
  { to: '/finansman/ev', icon: Building2, label: 'Konut' },
  { to: '/finansman/arac', icon: Car, label: 'Araç' },
  { to: '/helal-sigorta', icon: Shield, label: 'Sigorta' },
  { to: '/rehber', icon: BookOpen, label: 'Rehber' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-emerald-700'
                  : 'text-slate-400 active:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={isActive ? 'text-emerald-600' : ''}
                />
                <span>{label}</span>
                {isActive && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-600" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

import { useNavigate } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

export default function Header({ title, showBack = false }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition active:scale-95"
              aria-label="Geri"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                HH
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-emerald-700">Helal Hesap</p>
                <p className="text-[10px] text-slate-400">Faizsiz Finans</p>
              </div>
            </div>
          )}
          {showBack && title && (
            <h1 className="text-base font-bold text-slate-900">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition active:scale-95"
            aria-label="Ara"
          >
            <Search size={18} />
          </button>
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition active:scale-95"
            aria-label="Bildirimler"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  )
}

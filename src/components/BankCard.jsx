import { Star, ChevronRight } from 'lucide-react'

export default function BankCard({ bank, onClick }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition active:scale-[0.98]"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white"
            style={{ backgroundColor: bank.color }}
          >
            {bank.logo}
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-slate-900">{bank.name}</h3>
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-slate-600">{bank.rating}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-300" />
        </div>

        <p className="mb-3 text-[13px] leading-relaxed text-slate-500">{bank.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {bank.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600"
            >
              {feature}
            </span>
          ))}
          {bank.features.length > 3 && (
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-600">
              +{bank.features.length - 3}
            </span>
          )}
        </div>
      </div>

      {bank.profitRate && (
        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/50 px-4 py-2.5">
          <span className="text-xs text-slate-500">Kâr Oranı</span>
          <span className="text-sm font-bold text-emerald-600">%{bank.profitRate}</span>
        </div>
      )}
    </div>
  )
}

import { TrendingUp, Clock, ArrowRight } from 'lucide-react'

const tagColors = {
  emerald: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
  rose: 'bg-rose-50 text-rose-700',
}

export default function CampaignCard({ campaign, compact = false }) {
  const {
    bank,
    bankLogo,
    bankColor,
    title,
    description,
    profitRate,
    maxTerm,
    tag,
    tagColor = 'emerald',
    minDownPayment,
  } = campaign

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition active:scale-[0.98]">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: bankColor }}
        >
          {bankLogo}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{bank}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-emerald-600">%{profitRate}</p>
          <p className="text-[10px] text-slate-400">{maxTerm}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition active:scale-[0.98]">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: bankColor }}
            >
              {bankLogo}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{bank}</p>
              <p className="text-[11px] text-slate-400">{campaign.type === 'tasarruf' ? 'Tasarruf Finansman' : 'Katılım Bankası'}</p>
            </div>
          </div>
          {tag && (
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tagColors[tagColor]}`}>
              {tag}
            </span>
          )}
        </div>

        <h3 className="mb-1.5 text-[15px] font-bold text-slate-900">{title}</h3>
        <p className="mb-4 text-[13px] leading-relaxed text-slate-500">{description}</p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">%{profitRate}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
            <Clock size={14} className="text-slate-500" />
            <span className="text-xs font-medium text-slate-600">{maxTerm}</span>
          </div>
          {minDownPayment && (
            <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
              <span className="text-xs font-medium text-slate-600">{minDownPayment}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-50 px-4 py-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition active:bg-emerald-700">
          Detayları İncele
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

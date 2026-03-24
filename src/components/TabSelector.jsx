export default function TabSelector({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === tab.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 active:bg-slate-200'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1.5 text-xs ${activeTab === tab.id ? 'text-emerald-100' : 'text-slate-400'}`}>
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

import { useState } from 'react'
import { BookOpen, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import TabSelector from '../components/TabSelector'
import { guides, guideCategories } from '../data/guides'

export default function GuidePage() {
  const [activeCategory, setActiveCategory] = useState('Tümü')
  const [expandedId, setExpandedId] = useState(null)

  const tabs = guideCategories.map((cat) => ({
    id: cat,
    label: cat,
  }))

  const filtered = activeCategory === 'Tümü'
    ? guides
    : guides.filter((g) => g.category === activeCategory)

  return (
    <div className="pb-24">
      <Header title="Rehber" showBack />

      <main className="space-y-4 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <BookOpen size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Rehber & Bilgi Merkezi</h1>
          <p className="mt-2 text-[13px] text-indigo-100">
            Katılım bankacılığı, tekafül ve helal yatırım hakkında merak ettikleriniz.
          </p>
        </section>

        <TabSelector tabs={tabs} activeTab={activeCategory} onChange={setActiveCategory} />

        <div className="space-y-2.5">
          {filtered.map((guide) => {
            const isExpanded = expandedId === guide.id
            return (
              <div
                key={guide.id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                  className="flex w-full items-center gap-3 p-4 text-left transition active:bg-slate-50"
                >
                  <div className="flex-1">
                    <span className="mb-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {guide.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{guide.title}</h3>
                    {!isExpanded && (
                      <p className="mt-1 text-[12px] text-slate-500 line-clamp-2">{guide.summary}</p>
                    )}
                  </div>
                  <ChevronRight
                    size={18}
                    className={`shrink-0 text-slate-300 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="border-t border-slate-50 px-4 pb-4 pt-3">
                    <p className="text-[13px] leading-relaxed text-slate-600">{guide.content}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

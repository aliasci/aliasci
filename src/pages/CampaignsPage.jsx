import { useState } from 'react'
import { Tag } from 'lucide-react'
import Header from '../components/Header'
import TabSelector from '../components/TabSelector'
import CampaignCard from '../components/CampaignCard'
import { allCampaigns } from '../data/campaigns'

const tabs = [
  { id: 'all', label: 'Tümü', count: allCampaigns.length },
  { id: 'konut', label: 'Konut' },
  { id: 'arac', label: 'Araç' },
  { id: 'ihtiyac', label: 'İhtiyaç' },
  { id: 'sifir', label: '%0 Kâr' },
]

function categorize(campaign) {
  if (campaign.id.includes('konut')) return 'konut'
  if (campaign.id.includes('arac')) return 'arac'
  if (campaign.id.includes('ihtiyac')) return 'ihtiyac'
  if (campaign.id.includes('sifir')) return 'sifir'
  return 'other'
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all'
    ? allCampaigns
    : allCampaigns.filter((c) => categorize(c) === activeTab)

  return (
    <div className="pb-24">
      <Header title="Tüm Kampanyalar" showBack />

      <main className="space-y-4 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-600 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Tag size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Güncel Kampanyalar</h1>
          <p className="mt-2 text-[13px] text-cyan-100">
            Faizsiz finans dünyasındaki tüm güncel kampanyaları tek ekranda karşılaştırın.
          </p>
        </section>

        <TabSelector tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="space-y-3">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">Bu kategoride henüz kampanya bulunmuyor.</p>
          </div>
        )}
      </main>
    </div>
  )
}

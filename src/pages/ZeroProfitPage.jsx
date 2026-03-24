import { Percent } from 'lucide-react'
import Header from '../components/Header'
import CampaignCard from '../components/CampaignCard'
import { zeroProfitCampaigns } from '../data/campaigns'

export default function ZeroProfitPage() {
  return (
    <div className="pb-24">
      <Header title="%0 Kâr Paylı Fırsatlar" showBack />

      <main className="space-y-6 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Percent size={24} />
          </div>
          <h1 className="text-xl font-extrabold">%0 Kâr Paylı Fırsatlar</h1>
          <p className="mt-2 text-[13px] text-emerald-100">
            Katılım bankalarının sunduğu sıfır kâr paylı kampanyaları keşfedin.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Aktif Kampanyalar</h2>
          {zeroProfitCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </section>
      </main>
    </div>
  )
}

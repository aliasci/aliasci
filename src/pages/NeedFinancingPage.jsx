import { TrendingUp, HelpCircle } from 'lucide-react'
import Header from '../components/Header'
import CampaignCard from '../components/CampaignCard'
import FAQAccordion from '../components/FAQAccordion'
import { needCampaigns } from '../data/campaigns'

const faqs = [
  {
    question: 'İhtiyaç finansmanı nedir?',
    answer: 'İhtiyaç finansmanı, katılım bankalarının murabaha yöntemiyle sunduğu bireysel finansman hizmetidir. Banka, müşterinin ihtiyaç duyduğu ürünü satın alır ve kâr marjıyla vadeli olarak satar.',
  },
  {
    question: 'Başvuru için neler gerekli?',
    answer: 'Kimlik belgesi, gelir belgesi ve banka hesap özeti ile başvurabilirsiniz. Dijital kanallar üzerinden de başvuru yapılabilir.',
  },
]

export default function NeedFinancingPage() {
  return (
    <div className="pb-24">
      <Header title="İhtiyaç Finansmanı" showBack />

      <main className="space-y-6 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-extrabold">İhtiyaç Finansmanı</h1>
          <p className="mt-2 text-[13px] text-emerald-100">
            Faizsiz ve helal bireysel finansman seçeneklerini karşılaştırın.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Güncel Teklifler</h2>
          {needCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Sıkça Sorulan Sorular</h2>
          </div>
          <FAQAccordion items={faqs} />
        </section>
      </main>
    </div>
  )
}

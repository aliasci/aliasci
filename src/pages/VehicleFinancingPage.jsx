import { useState } from 'react'
import { Car, CheckCircle, HelpCircle } from 'lucide-react'
import Header from '../components/Header'
import TabSelector from '../components/TabSelector'
import CampaignCard from '../components/CampaignCard'
import FAQAccordion from '../components/FAQAccordion'
import { vehicleCampaigns } from '../data/campaigns'

const tabs = [
  { id: 'all', label: 'Tümü' },
  { id: 'tasarruf', label: 'Tasarruf Finansman' },
  { id: 'katilim', label: 'Katılım Bankası' },
]

const howItWorks = [
  {
    icon: '🤝',
    model: 'Murabaha',
    title: 'Alım-Satım Modeli',
    description: 'Banka aracı satın alır ve kâr marjıyla vadeli satar. Toplam maliyet ve taksitler baştan bellidir.',
    features: ['Sabit ve şeffaf maliyet', 'Gizli masraf yok', 'Hızlı onay süreci'],
  },
  {
    icon: '🔑',
    model: 'Finansal Kiralama',
    title: 'Leasing Modeli',
    description: 'Araç kullanım süresi boyunca kiralanır, vade sonunda mülkiyeti size geçer.',
    features: ['Düşük aylık taksit', 'Ticari araçlarda vergi avantajı', '12–60 ay vade'],
  },
]

const documents = [
  { icon: '🪪', title: 'Kimlik Belgesi', desc: 'Nüfus cüzdanı veya ehliyet' },
  { icon: '💰', title: 'Gelir Belgesi', desc: 'Maaş bordrosu, SGK dökümü' },
  { icon: '🚗', title: 'Araç Bilgileri', desc: 'Ruhsat veya satıcı teklifi' },
  { icon: '🏦', title: 'Hesap Özeti', desc: 'Son 3 aylık hesap özeti' },
  { icon: '📍', title: 'İkametgah', desc: 'E-Devlet\'ten alınabilir' },
]

const faqs = [
  {
    question: 'Faizsiz araç finansmanı faizli taşıt kredisinden nasıl farklıdır?',
    answer: 'Geleneksel taşıt kredisinde banka size para verir ve siz faiz ödersiniz. Murabaha modelinde banka aracı satın alır, kâr marjı ekleyerek vadeli satar. Toplam maliyet baştan sabittir.',
  },
  {
    question: 'Hangi bankalar faizsiz araç finansmanı sunuyor?',
    answer: 'Türkiye\'deki tüm katılım bankaları Murabaha ve finansal kiralama yoluyla araç finansmanı sunmaktadır.',
  },
  {
    question: 'Elektrikli araçlarda faizsiz finansman geçerli mi?',
    answer: 'Evet, elektrikli ve hibrit araçlar da Murabaha finansmanına dahildir. Bazı katılım bankaları elektrikli araçlara özel kampanya ve indirimli kâr oranları sunmaktadır.',
  },
]

export default function VehicleFinancingPage() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all'
    ? vehicleCampaigns
    : vehicleCampaigns.filter((c) => c.type === activeTab)

  return (
    <div className="pb-24">
      <Header title="Araç Finansmanı" showBack />

      <main className="space-y-6 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Car size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Hayalinizdeki arabaya faizsiz kavuşun</h1>
          <p className="mt-2 text-[13px] text-blue-100">
            Katılım bankaları ve tasarruf finansman şirketlerinin sunduğu faizsiz araç kampanyalarını keşfedin.
          </p>
        </section>

        <section className="space-y-4">
          <TabSelector tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="space-y-3">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Nasıl çalışır?</h2>
          {howItWorks.map((item) => (
            <div key={item.model} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    {item.model}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">{item.title}</h3>
                </div>
              </div>
              <p className="mb-3 text-[13px] text-slate-500">{item.description}</p>
              <ul className="space-y-1.5">
                {item.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-slate-600">
                    <CheckCircle size={14} className="shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Gerekli Belgeler</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {documents.map((doc) => (
              <div key={doc.title} className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <span className="text-xl">{doc.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{doc.title}</p>
                  <p className="text-[11px] text-slate-500">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Sıkça Sorulan Sorular</h2>
          </div>
          <FAQAccordion items={faqs} />
        </section>
      </main>
    </div>
  )
}

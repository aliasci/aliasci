import { useState } from 'react'
import { Home, FileText, CheckCircle, HelpCircle } from 'lucide-react'
import Header from '../components/Header'
import TabSelector from '../components/TabSelector'
import CampaignCard from '../components/CampaignCard'
import FAQAccordion from '../components/FAQAccordion'
import { homeCampaigns } from '../data/campaigns'

const tabs = [
  { id: 'all', label: 'Tümü' },
  { id: 'tasarruf', label: 'Tasarruf Finansman' },
  { id: 'katilim', label: 'Katılım Bankası' },
]

const howItWorks = [
  {
    icon: '🏠',
    model: 'İcara',
    title: 'Kiralama Modeli',
    description: 'Banka konutu satın alır ve size kiralar. Kira ödemeleri sonunda konut size geçer.',
    features: ['Sabit aylık ödemeler', '120–240 ay vade', 'Erken ödeme avantajı'],
  },
  {
    icon: '🤝',
    model: 'Murabaha',
    title: 'Alım-Satım Modeli',
    description: 'Banka konutu satın alır ve kâr marjıyla vadeli satar. Toplam maliyet baştan bellidir.',
    features: ['Şeffaf fiyatlandırma', 'Esnek ödeme planları', 'Hızlı onay'],
  },
]

const documents = [
  { icon: '🪪', title: 'Kimlik Belgesi', desc: 'Nüfus cüzdanı veya ehliyet' },
  { icon: '💰', title: 'Gelir Belgesi', desc: 'Maaş bordrosu, SGK dökümü' },
  { icon: '🏠', title: 'Konut Bilgileri', desc: 'Tapu, satış vaadi sözleşmesi' },
  { icon: '🏦', title: 'Hesap Özeti', desc: 'Son 3 aylık hesap özeti' },
  { icon: '📍', title: 'İkametgah', desc: 'E-Devlet\'ten alınabilir' },
]

const advantages = [
  { icon: CheckCircle, title: 'Helal Kazanç', desc: 'İslami prensiplere uygun' },
  { icon: CheckCircle, title: 'Sabit Maliyet', desc: 'Ödeme tutarı değişmez' },
  { icon: CheckCircle, title: 'Şeffaf Fiyat', desc: 'Tüm masraflar açık' },
  { icon: CheckCircle, title: 'Hızlı Onay', desc: '3–7 gün içinde sonuç' },
]

const faqs = [
  {
    question: 'Faizsiz konut finansmanı faizli krediden nasıl farklıdır?',
    answer: 'Faizsiz konut finansmanı, faiz yerine kâr-zarar ortaklığı veya kira esasına dayalı sistemler kullanır. Aylık ödemeler sabittir ve tüm maliyetler baştan bellidir.',
  },
  {
    question: 'Hangi bankalar faizsiz konut finansmanı sunuyor?',
    answer: 'Türkiye\'deki tüm katılım bankaları (Kuveyt Türk, Türkiye Finans, Albaraka, Vakıf Katılım, Ziraat Katılım, Emlak Katılım) ve bazı tasarruf finansman şirketleri faizsiz konut finansmanı sunmaktadır.',
  },
  {
    question: 'Peşinat oranı ne kadar olmalı?',
    answer: 'Genellikle konut değerinin %20–30\'u kadar peşinat gerekir. Bazı kampanyalarda %10\'a kadar düşebilir.',
  },
]

export default function HomeFinancingPage() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all'
    ? homeCampaigns
    : homeCampaigns.filter((c) => c.type === activeTab)

  return (
    <div className="pb-24">
      <Header title="Konut Finansmanı" showBack />

      <main className="space-y-6 px-4 py-4">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Home size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Hayalinizdeki eve faizsiz kavuşun</h1>
          <p className="mt-2 text-[13px] text-emerald-100">
            Katılım bankaları ve tasarruf finansman şirketlerinin sunduğu faizsiz ev finansmanı kampanyalarını keşfedin.
          </p>
        </section>

        {/* Tabs & Campaigns */}
        <section className="space-y-4">
          <TabSelector tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="space-y-3">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Nasıl çalışır?</h2>
          {howItWorks.map((item) => (
            <div key={item.model} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    {item.model}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">{item.title}</h3>
                </div>
              </div>
              <p className="mb-3 text-[13px] text-slate-500">{item.description}</p>
              <ul className="space-y-1.5">
                {item.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-slate-600">
                    <CheckCircle size={14} className="shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Documents */}
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

        {/* Advantages */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Avantajları</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {advantages.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <Icon size={20} className="mb-2 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="text-[11px] text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
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

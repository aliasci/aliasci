import { Landmark, CheckCircle, HelpCircle } from 'lucide-react'
import Header from '../components/Header'
import BankCard from '../components/BankCard'
import FAQAccordion from '../components/FAQAccordion'
import { participationBanks } from '../data/banks'

const whyReasons = [
  {
    title: 'Faizsiz Sistem',
    desc: 'Mevduat toplama ve fon kullandırma süreçlerinde faiz tamamen dışarıda bırakılır.',
    icon: '🕌',
  },
  {
    title: 'Kâr / Zarar Ortaklığı',
    desc: 'Toplanan fonlar ticaret ve sanayide değerlendirilir, kâr mudilerle paylaşılır.',
    icon: '🤝',
  },
  {
    title: 'Helal Ticaret',
    desc: 'Sadece İslami kurallara uygun projelere finansman sağlanır.',
    icon: '✅',
  },
  {
    title: 'Reel Ekonomi Desteği',
    desc: 'Doğrudan mal alım-satımına ve üretime dayalıdır.',
    icon: '🏭',
  },
]

const faqs = [
  {
    question: 'Katılım bankası ile geleneksel banka arasındaki fark nedir?',
    answer: 'Geleneksel bankalar faiz üzerinden işlem yaparken, katılım bankaları faizsiz finans prensipleriyle çalışır. Fon toplarken kâr-zarar ortaklığı, fon kullandırırken murabaha veya icara yöntemlerini kullanırlar.',
  },
  {
    question: 'Paramı katılım hesabına yatırırsam zarar edebilir miyim?',
    answer: 'Kuramsal olarak zarar etme ihtimali bulunsa da, katılım bankalarının profesyonel risk yönetimi sayesinde Türkiye\'de bugüne kadar mudilerine zarar yansıttıkları görülmemiştir.',
  },
  {
    question: 'Katılım bankalarında devlet güvencesi var mı?',
    answer: 'Evet. TMSF güvencesi katılım bankaları için de geçerlidir. Gerçek kişilere ait hesaplar 650.000 TL\'ye kadar devlet güvencesi altındadır.',
  },
]

export default function BanksPage() {
  return (
    <div className="pb-24">
      <Header title="Katılım Bankaları" showBack />

      <main className="space-y-6 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Landmark size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Faizsiz kazanç ve güvenilir finansman</h1>
          <p className="mt-2 text-[13px] text-violet-100">
            İslami finans prensipleriyle çalışan katılım bankalarını keşfedin.
          </p>
          <div className="mt-3 flex gap-3">
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              Faizsiz Sistem
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              %100 Güvenli
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              Helal
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Kurumları Keşfedin</h2>
          {participationBanks.map((bank) => (
            <BankCard key={bank.id} bank={bank} />
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Neden Katılım Bankası?</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {whyReasons.map(({ title, desc, icon }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                <span className="text-2xl">{icon}</span>
                <h3 className="mt-2 text-sm font-bold text-slate-900">{title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-violet-600" />
            <h2 className="text-lg font-bold text-slate-900">Sıkça Sorulan Sorular</h2>
          </div>
          <FAQAccordion items={faqs} />
        </section>
      </main>
    </div>
  )
}

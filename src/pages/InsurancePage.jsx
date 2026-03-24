import { Shield, CheckCircle, HelpCircle } from 'lucide-react'
import Header from '../components/Header'
import FAQAccordion from '../components/FAQAccordion'
import { insuranceProducts } from '../data/campaigns'

const whyReasons = [
  {
    icon: '🤲',
    title: 'Dayanışma ve Yardımlaşma',
    desc: 'Katılımcılar paralarını ortak fonda toplar ve hasar gören üyelerin zararları bu fondan karşılanır.',
  },
  {
    icon: '🕌',
    title: 'Faizsiz Fon Yönetimi',
    desc: 'Toplanan primler helal yatırımlarda değerlendirilir.',
  },
  {
    icon: '💰',
    title: 'Kâr Payı İadesi',
    desc: 'Dönem sonunda fonda kalan bakiye katılımcılara iade edilebilir.',
  },
  {
    icon: '✅',
    title: 'Şer\'i Kurul Onaylı',
    desc: 'Tüm süreçler fıkıh hocalarından oluşan kurullar tarafından denetlenir.',
  },
]

const faqs = [
  {
    question: 'Tekafül geleneksel sigortadan nasıl farklıdır?',
    answer: 'Geleneksel sigortada şirket primi alır ve riski üstlenir. Tekafül\'de katılımcılar yardımlaşma amacıyla ortak bir fona bağış yapar. Şirket sadece fonun yönetimini üstlenir.',
  },
  {
    question: 'Yıl sonunda hiç kaza yapmazsam param iade edilir mi?',
    answer: 'Tekafül havuzunda yıl sonunda bakiye kalırsa, hasarsızlık oranınıza göre iade edilebilir ya da sonraki yıl poliçenizden düşülebilir.',
  },
  {
    question: 'Zorunlu Trafik Sigortası tekafül olarak yaptırılabilir mi?',
    answer: 'Evet. Türkiye\'deki katılım sigortacılığı şirketleri tüm standart ürünlerin İslami kurallara uygun versiyonlarını sunmaktadır.',
  },
]

export default function InsurancePage() {
  return (
    <div className="pb-24">
      <Header title="Helal Sigorta" showBack />

      <main className="space-y-6 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Shield size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Güvenceniz helal, geleceğiniz huzurlu</h1>
          <p className="mt-2 text-[13px] text-amber-100">
            İslami finans prensiplerine uygun Tekafül sigorta ürünlerini karşılaştırın.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              Faizsiz Fon
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              Şeffaf Maliyetler
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              Bakiye İade
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Sigorta Ürünleri</h2>
          {insuranceProducts.map((product) => (
            <div key={product.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: product.color }}
                >
                  {product.logo}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{product.title}</h3>
                  <p className="text-[11px] text-slate-500">{product.company}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  {product.type}
                </span>
              </div>
              <p className="mb-3 text-[13px] text-slate-500">{product.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {product.features.map((f) => (
                  <span key={f} className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                    <CheckCircle size={12} className="text-amber-500" />
                    {f}
                  </span>
                ))}
              </div>
              <button className="mt-3 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition active:bg-amber-600">
                Teklif Al
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Neden Helal Sigorta?</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {whyReasons.map(({ icon, title, desc }) => (
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
            <HelpCircle size={20} className="text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Sıkça Sorulan Sorular</h2>
          </div>
          <FAQAccordion items={faqs} />
        </section>
      </main>
    </div>
  )
}

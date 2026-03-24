import { PiggyBank, CheckCircle, HelpCircle } from 'lucide-react'
import Header from '../components/Header'
import FAQAccordion from '../components/FAQAccordion'
import { savingsCompanies } from '../data/banks'

const whyReasons = [
  { icon: '🏛️', title: 'BDDK Güvencesi', desc: 'Tüm şirketler BDDK denetimine tabidir.' },
  { icon: '🕌', title: 'Faizsiz ve Kredisiz', desc: 'Faiz, vade farkı veya kredi tahsis ücreti yoktur.' },
  { icon: '📊', title: 'Esnek Ödeme Planları', desc: 'Aylık taksit tutarını siz belirlersiniz.' },
  { icon: '🏠', title: 'Peşinat Zorunluluğu Yok', desc: 'Küçük tasarruflarla sisteme dahil olun.' },
]

const faqs = [
  {
    question: 'Tasarruf finansman sistemi nasıl çalışır?',
    answer: 'Sistem imece usulüne dayanır. Ev veya araç almak isteyen kişiler bir araya gelir, her ay taksit öderler. Her ay toplanan parayla gruptaki kişilere ev/araç alınır. Sıralama noter huzurunda yapılan çekilişlerle veya vade planına göre belirlenir.',
  },
  {
    question: 'Organizasyon ücreti nedir?',
    answer: 'Şirketin operasyonel maliyetlerini karşılamak için alınan tek seferlik ücrettir. Faiz değildir. Cayma süresi geçtikten sonra iade edilmez; ancak biriktirdiğiniz taksitler iade edilir.',
  },
  {
    question: 'Sistemden çıkarsam biriktirdiğim parayı alabilir miyim?',
    answer: 'Evet. Sözleşmenizi feshetmeniz durumunda biriken tasarruf tutarınız yasal süreler içerisinde eksiksiz iade edilir.',
  },
  {
    question: 'İstediğim evi veya aracı alabilir miyim?',
    answer: 'Evet. Sıranız geldiğinde Türkiye\'nin herhangi bir yerindeki iskanlı ve tapulu bir evi veya uygun bir aracı seçip alabilirsiniz.',
  },
]

export default function SavingsPage() {
  return (
    <div className="pb-24">
      <Header title="Tasarruf Finansman" showBack />

      <main className="space-y-6 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <PiggyBank size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Küçük tasarruflarla büyük hayallere</h1>
          <p className="mt-2 text-[13px] text-rose-100">
            Kredi çekmeden, faiz ödemeden ev, araç veya işyeri sahibi olun.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              Faizsiz Tasarruf
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              BDDK Onaylı
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
              Peşinatsız
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Tasarruf Finansman Şirketleri</h2>
          {savingsCompanies.map((company) => (
            <div key={company.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: company.color }}
                >
                  {company.logo}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{company.name}</h3>
                  <p className="text-[11px] text-slate-500">{company.type}</p>
                </div>
              </div>
              <p className="mb-3 text-[13px] text-slate-500">{company.description}</p>
              <div className="flex gap-3">
                <div className="flex-1 rounded-xl bg-slate-50 p-2.5 text-center">
                  <p className="text-[10px] text-slate-500">Min. Taksit</p>
                  <p className="text-sm font-bold text-slate-800">{company.minPayment}</p>
                </div>
                <div className="flex-1 rounded-xl bg-slate-50 p-2.5 text-center">
                  <p className="text-[10px] text-slate-500">Maks. Vade</p>
                  <p className="text-sm font-bold text-slate-800">{company.maxTerm}</p>
                </div>
              </div>
              <button className="mt-3 w-full rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition active:bg-rose-600">
                Detayları İncele
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Neden Tasarruf Finansmanı?</h2>
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
            <HelpCircle size={20} className="text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">Sıkça Sorulan Sorular</h2>
          </div>
          <FAQAccordion items={faqs} />
        </section>
      </main>
    </div>
  )
}

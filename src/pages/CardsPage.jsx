import { CreditCard, CheckCircle } from 'lucide-react'
import Header from '../components/Header'

const cards = [
  {
    id: 'kt-card',
    bank: 'Kuveyt Türk',
    bankLogo: 'KT',
    bankColor: '#00a651',
    name: 'Sağlam Kart',
    type: 'Ön Ödemeli Kart',
    description: 'Taksitli alışveriş imkânı sunan, kredi kartı özellikli helal kart.',
    features: ['Taksitli alışveriş', 'Online ödeme', 'Temassız ödeme', 'Dünya genelinde geçerli'],
  },
  {
    id: 'tf-card',
    bank: 'Türkiye Finans',
    bankLogo: 'TF',
    bankColor: '#e30613',
    name: 'Katılım Kart',
    type: 'Ön Ödemeli Kart',
    description: 'Faizsiz alışveriş kartı ile güvenli ve helal ödeme deneyimi.',
    features: ['Puan kazanma', 'Kampanya fırsatları', 'Mobil ödeme', 'E-ticaret uyumlu'],
  },
  {
    id: 'al-card',
    bank: 'Albaraka Türk',
    bankLogo: 'AL',
    bankColor: '#006837',
    name: 'Bereket Kart',
    type: 'Banka Kartı',
    description: 'Günlük ihtiyaçlarınız için pratik ve helal banka kartı.',
    features: ['ATM işlemleri', 'Market ödemeleri', 'Online bankacılık', 'HGS/OGS'],
  },
]

export default function CardsPage() {
  return (
    <div className="pb-24">
      <Header title="Helal Kart" showBack />

      <main className="space-y-6 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <CreditCard size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Helal Kart Seçenekleri</h1>
          <p className="mt-2 text-[13px] text-violet-100">
            Katılım bankalarının sunduğu faizsiz kart ürünlerini karşılaştırın.
          </p>
        </section>

        <section className="space-y-3">
          {cards.map((card) => (
            <div key={card.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: card.bankColor }}
                >
                  {card.bankLogo}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{card.name}</h3>
                  <p className="text-[11px] text-slate-500">{card.bank} - {card.type}</p>
                </div>
              </div>

              <div className="mb-4 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="text-center text-white">
                  <CreditCard size={40} className="mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold">{card.name}</p>
                  <p className="text-[11px] text-slate-400">{card.bank}</p>
                </div>
              </div>

              <p className="mb-3 text-[13px] text-slate-500">{card.description}</p>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {card.features.map((f) => (
                  <span key={f} className="flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700">
                    <CheckCircle size={12} />
                    {f}
                  </span>
                ))}
              </div>

              <button className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition active:bg-violet-700">
                Başvuru Yap
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

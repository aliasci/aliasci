import { UserPlus, ExternalLink } from 'lucide-react'
import Header from '../components/Header'
import { participationBanks } from '../data/banks'

export default function CustomerPage() {
  return (
    <div className="pb-24">
      <Header title="Müşterisi Ol" showBack />

      <main className="space-y-6 px-4 py-4">
        <section className="rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-5 text-white">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <UserPlus size={24} />
          </div>
          <h1 className="text-xl font-extrabold">Katılım Bankası Müşterisi Olun</h1>
          <p className="mt-2 text-[13px] text-teal-100">
            Katılım bankalarında hesap açın, faizsiz finans dünyasına adım atın.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Banka Seçin</h2>
          {participationBanks.map((bank) => (
            <div key={bank.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:bg-slate-50">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: bank.color }}
              >
                {bank.logo}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">{bank.name}</h3>
                <p className="text-[11px] text-slate-500">{bank.description}</p>
              </div>
              <button className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition active:bg-emerald-100">
                <ExternalLink size={14} />
                Başvur
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

import { Link } from 'react-router-dom'
import {
  Building2,
  Car,
  Landmark,
  Shield,
  PiggyBank,
  Tag,
  CreditCard,
  UserPlus,
  TrendingUp,
  Percent,
  BookOpen,
  ArrowRight,
  Star,
  ChevronRight,
} from 'lucide-react'
import Header from '../components/Header'
import SectionHeader from '../components/SectionHeader'
import CampaignCard from '../components/CampaignCard'
import { homeCampaigns, vehicleCampaigns, needCampaigns } from '../data/campaigns'
import { participationBanks } from '../data/banks'

const quickLinks = [
  { to: '/finansman/ev', icon: Building2, label: 'Faizsiz Ev Al', color: 'bg-emerald-500', desc: 'Konut finansmanı' },
  { to: '/finansman/arac', icon: Car, label: 'Faizsiz Araba Al', color: 'bg-blue-500', desc: 'Araç finansmanı' },
  { to: '/kurumlar', icon: Landmark, label: 'Katılım Bankaları', color: 'bg-violet-500', desc: 'Bankaları keşfet' },
  { to: '/helal-sigorta', icon: Shield, label: 'Helal Sigorta', color: 'bg-amber-500', desc: 'Tekafül ürünleri' },
  { to: '/tasarruf-finansman', icon: PiggyBank, label: 'Tasarruf Finansman', color: 'bg-rose-500', desc: 'Faizsiz tasarruf' },
  { to: '/tum-kampanyalar', icon: Tag, label: 'Kampanyalar', color: 'bg-cyan-500', desc: 'Güncel fırsatlar' },
]

const productLinks = [
  { to: '/finansman/sifir-kar', icon: Percent, label: '%0 Kâr Paylı Fırsatlar' },
  { to: '/finansman/ihtiyac', icon: TrendingUp, label: 'İhtiyaç Finansmanı' },
  { to: '/kartlar', icon: CreditCard, label: 'Helal Kart' },
  { to: '/kurumlar/musteri-ol', icon: UserPlus, label: 'Müşterisi Ol' },
  { to: '/rehber', icon: BookOpen, label: 'Rehber' },
]

export default function HomePage() {
  return (
    <div className="pb-24">
      <Header />

      <main className="space-y-6 px-4 py-4">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white">
          <div className="mb-1 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
            Faizsiz Finans Platformu
          </div>
          <h1 className="mt-2 text-xl font-extrabold leading-tight">
            İhtiyacınıza en uygun <br />finansal çözüm
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-emerald-100">
            Katılım bankacılığı ve helal finans ürünlerini tek yerden keşfedin.
          </p>
          <Link
            to="/tum-kampanyalar"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 transition active:scale-95"
          >
            Kampanyaları Gör
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* Quick Access Grid */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">Hızlı Erişim</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {quickLinks.map(({ to, icon: Icon, label, color }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition active:scale-[0.97]"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} text-white`}>
                  <Icon size={20} />
                </div>
                <span className="text-center text-[11px] font-semibold leading-tight text-slate-800">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Home Financing Section */}
        <section className="space-y-3">
          <SectionHeader title="Faizsiz Konut Finansmanı" linkTo="/finansman/ev" />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {homeCampaigns.slice(0, 3).map((c) => (
              <div key={c.id} className="w-[300px] shrink-0">
                <CampaignCard campaign={c} />
              </div>
            ))}
          </div>
        </section>

        {/* Vehicle Financing Section */}
        <section className="space-y-3">
          <SectionHeader title="Faizsiz Araç Finansmanı" linkTo="/finansman/arac" />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {vehicleCampaigns.slice(0, 3).map((c) => (
              <div key={c.id} className="w-[300px] shrink-0">
                <CampaignCard campaign={c} />
              </div>
            ))}
          </div>
        </section>

        {/* Need Financing */}
        <section className="space-y-3">
          <SectionHeader title="İhtiyaç Finansmanı" linkTo="/finansman/ihtiyac" />
          <div className="space-y-2.5">
            {needCampaigns.slice(0, 3).map((c) => (
              <CampaignCard key={c.id} campaign={c} compact />
            ))}
          </div>
        </section>

        {/* Products & Services */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">Ürün ve Hizmetler</h2>
          <div className="space-y-2">
            {productLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition active:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon size={20} />
                </div>
                <span className="flex-1 text-sm font-semibold text-slate-800">{label}</span>
                <ChevronRight size={18} className="text-slate-300" />
              </Link>
            ))}
          </div>
        </section>

        {/* Participation Banks */}
        <section className="space-y-3">
          <SectionHeader title="Katılım Bankaları" linkTo="/kurumlar" />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {participationBanks.slice(0, 4).map((bank) => (
              <Link
                key={bank.id}
                to="/kurumlar"
                className="flex w-[200px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.97]"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{ backgroundColor: bank.color }}
                >
                  {bank.logo}
                </div>
                <p className="text-center text-sm font-semibold text-slate-900">{bank.shortName}</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs text-slate-500">{bank.rating}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
          <h3 className="text-base font-bold">Fırsatlardan ilk sizin haberiniz olsun</h3>
          <p className="mt-1.5 text-[13px] text-slate-300">
            Faizsiz finans dünyasındaki yeni kampanyalar her hafta e-posta kutunuzda.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none ring-1 ring-white/20 focus:ring-emerald-400"
            />
            <button className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition active:bg-emerald-600">
              Abone Ol
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Spam gönderilmez. İstediğiniz an ayrılabilirsiniz.</p>
        </section>
      </main>
    </div>
  )
}

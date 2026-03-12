import { useMemo, useState } from 'react'

const categories = [
  { name: 'Meyve', icon: '🍎' },
  { name: 'Sebze', icon: '🥦' },
  { name: 'Atıştırmalık', icon: '🍪' },
  { name: 'İçecek', icon: '🥤' },
  { name: 'Fırın', icon: '🥐' },
  { name: 'Temel Gıda', icon: '🥫' },
  { name: 'Süt Ürünleri', icon: '🥛' },
  { name: 'Temizlik', icon: '🧴' },
]

const products = [
  { name: 'Muz', detail: '500 g', price: 42.9, bg: 'bg-amber-50' },
  { name: 'Avokado', detail: '2 adet', price: 58.5, bg: 'bg-emerald-50' },
  { name: 'Soğuk Kahve', detail: '330 ml', price: 36.95, bg: 'bg-sky-50' },
  { name: 'Granola Bar', detail: '4 x 25 g', price: 47.25, bg: 'bg-violet-50' },
  { name: 'Maden Suyu', detail: '6 x 200 ml', price: 32.9, bg: 'bg-cyan-50' },
  { name: 'Yoğurt', detail: '1 kg', price: 54.5, bg: 'bg-rose-50' },
]

const addresses = ['Ev • Kadıköy', 'Ofis • Levent', 'Arkadaşım • Beşiktaş']

function LocationIcon() {
  return (
    <svg className="h-5 w-5 text-[#5d3ebc]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10.5c0 5.75-7 11.25-7 11.25S5 16.25 5 10.5a7 7 0 1 1 14 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function App() {
  const [selectedAddress, setSelectedAddress] = useState(addresses[0])
  const [cartCount] = useState(3)

  const formattedProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        formattedPrice: product.price.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      })),
    [],
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5d3ebc] font-bold text-[#ffd200]">
              OD
            </div>
            <div>
              <p className="text-sm font-semibold text-[#5d3ebc] sm:text-base">OnDemand</p>
              <p className="text-[11px] text-slate-500 sm:text-xs">Delivery</p>
            </div>
          </div>

          <label className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <LocationIcon />
            <select
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
              value={selectedAddress}
              onChange={(event) => setSelectedAddress(event.target.value)}
              aria-label="Teslimat adresi seçimi"
            >
              {addresses.map((address) => (
                <option key={address} value={address}>
                  {address}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            <button className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:inline-flex">
              Giriş Yap
            </button>
            <button className="hidden rounded-full bg-[#5d3ebc] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:inline-flex">
              Kayıt Ol
            </button>
            <button className="relative inline-flex rounded-full bg-[#ffd200] px-4 py-2 text-sm font-bold text-slate-900 transition hover:brightness-95">
              Sepet
              <span className="ml-1 rounded-full bg-slate-900 px-1.5 text-xs text-white">{cartCount}</span>
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 sm:hidden">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <LocationIcon />
            <select
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
              value={selectedAddress}
              onChange={(event) => setSelectedAddress(event.target.value)}
              aria-label="Mobil teslimat adresi seçimi"
            >
              {addresses.map((address) => (
                <option key={address} value={address}>
                  {address}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid items-center gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:grid-cols-2 md:p-10">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-[#5d3ebc]/10 px-3 py-1 text-xs font-semibold text-[#5d3ebc]">
              7/24 On-Demand Delivery
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Dakikalar içinde kapında
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
              İhtiyacın olan ürünleri tek tıkla seç, siparişini takip et ve birkaç dakika içinde teslim al.
              Hızlı, sade ve modern bir alışveriş deneyimi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-[#5d3ebc] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                Hemen Sipariş Ver
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Kampanyaları Gör
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="mx-auto flex h-64 max-w-md items-center justify-center rounded-3xl bg-gradient-to-br from-[#5d3ebc] to-[#7e68d7] p-4 text-white shadow-xl">
              <div className="w-full rounded-2xl border border-white/30 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/80">Teslimat görseli</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffd200] text-2xl">🛵</div>
                  <div>
                    <p className="text-lg font-semibold">Siparişin Yolda</p>
                    <p className="text-sm text-white/80">Tahmini varış: 12 dk</p>
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/20">
                  <div className="h-full w-2/3 rounded-full bg-[#ffd200]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Kategoriler</h2>
            <button className="text-sm font-semibold text-[#5d3ebc] hover:underline">Tümünü Gör</button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <button
                key={category.name}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#5d3ebc]/40 hover:shadow-md"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl transition group-hover:bg-[#5d3ebc] group-hover:shadow-lg">
                  <span className="transition group-hover:scale-110">{category.icon}</span>
                </span>
                <span className="text-xs font-semibold text-slate-700 sm:text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Popüler Ürünler</h2>
            <button className="text-sm font-semibold text-[#5d3ebc] hover:underline">Daha Fazla</button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {formattedProducts.map((product) => (
              <article
                key={product.name}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#5d3ebc] text-lg font-bold text-white transition hover:brightness-110"
                  aria-label={`${product.name} ürününü ekle`}
                >
                  +
                </button>
                <div
                  className={`mb-4 flex h-28 items-center justify-center rounded-xl text-4xl ${product.bg}`}
                  aria-hidden="true"
                >
                  📦
                </div>
                <p className="text-sm text-slate-500">{product.detail}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-3 text-2xl font-extrabold text-[#5d3ebc]">{product.formattedPrice} TL</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App

import React from 'react';

const categories = [
  { name: 'Meyve', emoji: '🍎', color: 'from-red-50 to-red-100', border: 'border-red-200' },
  { name: 'Sebze', emoji: '🥦', color: 'from-green-50 to-green-100', border: 'border-green-200' },
  { name: 'Süt Ürünleri', emoji: '🧀', color: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200' },
  { name: 'Et & Tavuk', emoji: '🥩', color: 'from-pink-50 to-pink-100', border: 'border-pink-200' },
  { name: 'Atıştırmalık', emoji: '🍿', color: 'from-orange-50 to-orange-100', border: 'border-orange-200' },
  { name: 'İçecek', emoji: '🥤', color: 'from-blue-50 to-blue-100', border: 'border-blue-200' },
  { name: 'Fırın', emoji: '🥖', color: 'from-amber-50 to-amber-100', border: 'border-amber-200' },
  { name: 'Dondurma', emoji: '🍦', color: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200' },
  { name: 'Kahvaltı', emoji: '🍳', color: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200' },
  { name: 'Temizlik', emoji: '🧹', color: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200' },
  { name: 'Bebek', emoji: '🍼', color: 'from-rose-50 to-rose-100', border: 'border-rose-200' },
  { name: 'Evcil Hayvan', emoji: '🐾', color: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200' },
];

export default function Categories() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
            Kategoriler
          </h2>
          <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            Aradığın her şeyi kolayca bul, hızlıca sipariş ver.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} flex items-center justify-center text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110`}
              >
                {cat.emoji}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

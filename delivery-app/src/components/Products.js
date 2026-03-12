import React, { useState } from 'react';

const products = [
  {
    id: 1,
    name: 'Organik Muz',
    desc: '1 kg, taze',
    price: 34.90,
    oldPrice: 44.90,
    badge: '%22 İndirim',
    emoji: '🍌',
  },
  {
    id: 2,
    name: 'Tam Yağlı Süt',
    desc: '1 litre',
    price: 22.50,
    oldPrice: null,
    badge: null,
    emoji: '🥛',
  },
  {
    id: 3,
    name: 'Domates',
    desc: '1 kg, yerli',
    price: 18.90,
    oldPrice: 24.90,
    badge: 'Fırsat',
    emoji: '🍅',
  },
  {
    id: 4,
    name: 'Beyaz Peynir',
    desc: '250g, tam yağlı',
    price: 42.00,
    oldPrice: null,
    badge: 'Yeni',
    emoji: '🧀',
  },
  {
    id: 5,
    name: 'Portakal Suyu',
    desc: '1 litre, taze sıkım',
    price: 28.90,
    oldPrice: 35.00,
    badge: '%17 İndirim',
    emoji: '🍊',
  },
  {
    id: 6,
    name: 'Çikolata Bar',
    desc: '80g, bitter',
    price: 14.50,
    oldPrice: null,
    badge: null,
    emoji: '🍫',
  },
  {
    id: 7,
    name: 'Tavuk Göğsü',
    desc: '500g, taze',
    price: 59.90,
    oldPrice: 74.90,
    badge: '%20 İndirim',
    emoji: '🍗',
  },
  {
    id: 8,
    name: 'Yumurta',
    desc: '15\'li, serbest gezen',
    price: 54.90,
    oldPrice: null,
    badge: 'Popüler',
    emoji: '🥚',
  },
];

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    onAdd(product);
    setTimeout(() => setAdded(false), 600);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/10">
      {/* Image Area */}
      <div className="relative p-4 pb-2">
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-primary text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg">
            {product.badge}
          </span>
        )}
        <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-6xl sm:text-7xl group-hover:scale-105 transition-transform duration-300">
          {product.emoji}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-1">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{product.desc}</p>

        <div className="flex items-end justify-between mt-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-primary">
                ₺{product.price.toFixed(2)}
              </span>
            </div>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₺{product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
              added
                ? 'bg-green-500 text-white scale-110'
                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25'
            }`}
          >
            {added ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products({ onAddToCart }) {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 md:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Popüler Ürünler
            </h2>
            <p className="mt-2 text-gray-500 text-base sm:text-lg">
              En çok tercih edilen ürünleri keşfet.
            </p>
          </div>
          <button className="text-primary font-semibold text-sm hover:underline underline-offset-4 shrink-0 flex items-center gap-1">
            Tümünü Gör
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

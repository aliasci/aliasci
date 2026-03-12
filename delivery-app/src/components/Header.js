import React, { useState, useEffect } from 'react';

export default function Header({ cartCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-primary/5'
          : 'bg-primary'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg ${
                scrolled ? 'bg-primary text-white' : 'bg-accent text-primary'
              }`}
            >
              G
            </div>
            <span
              className={`text-xl font-extrabold tracking-tight hidden sm:block ${
                scrolled ? 'text-primary' : 'text-white'
              }`}
            >
              getswift
            </span>
          </div>

          {/* Address Selector - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <button
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                scrolled
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">Teslimat adresini seç...</span>
              <svg
                className="w-4 h-4 shrink-0 ml-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Login - Desktop */}
            <button
              className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                scrolled
                  ? 'text-primary hover:bg-primary/5'
                  : 'text-white hover:bg-white/15'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Giriş Yap
            </button>

            {/* Register - Desktop */}
            <button
              className={`hidden md:flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                scrolled
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-accent text-primary hover:bg-accent-dark'
              }`}
            >
              Kayıt Ol
            </button>

            {/* Cart */}
            <button
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                scrolled
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-accent text-primary hover:bg-accent-dark'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              <span className="hidden sm:inline">Sepet</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className={`md:hidden p-2 rounded-lg transition-all ${
                scrolled
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-white hover:bg-white/15'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-60 pb-4' : 'max-h-0'
          }`}
        >
          <div className="space-y-2">
            <button
              className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                scrolled
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-white/15 text-white'
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Teslimat adresini seç...
            </button>
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  scrolled
                    ? 'text-primary border border-primary/20'
                    : 'text-white border border-white/30'
                }`}
              >
                Giriş Yap
              </button>
              <button
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  scrolled
                    ? 'bg-primary text-white'
                    : 'bg-accent text-primary'
                }`}
              >
                Kayıt Ol
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

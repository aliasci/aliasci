import React from 'react';

export default function AppDownload() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-primary to-primary-dark rounded-3xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-light/20 rounded-full blur-3xl" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Uygulamayı İndir,
                <br />
                <span className="text-accent">Hemen Başla!</span>
              </h2>
              <p className="mt-4 text-white/70 text-lg leading-relaxed max-w-md">
                iOS ve Android için uygulamamızı indirerek alışverişe hemen başlayabilirsin.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-5 py-3 rounded-xl transition-all border border-white/10">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] opacity-70">İndir</div>
                    <div className="text-sm font-semibold -mt-0.5">App Store</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-5 py-3 rounded-xl transition-all border border-white/10">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] opacity-70">İndir</div>
                    <div className="text-sm font-semibold -mt-0.5">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Phone mockup placeholder */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-56 h-[440px] bg-white/10 backdrop-blur-md rounded-[40px] border-2 border-white/20 p-3">
                  <div className="w-full h-full bg-gradient-to-b from-white/5 to-white/10 rounded-[32px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-3">📱</div>
                      <div className="text-white/60 text-sm font-medium">getswift</div>
                      <div className="text-white/40 text-xs mt-1">Mobil Uygulama</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-accent text-primary px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                  Ücretsiz!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

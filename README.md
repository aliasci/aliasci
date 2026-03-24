# Helal Hesap Mobil Uygulama

Bu proje, https://helalhesap.com/ web sitesini Android ve iOS'ta native kabuk icinde calistiran bir Capacitor mobil uygulamasidir.

## Gereksinimler

- Node.js 20+
- Android Studio (Android icin)
- Xcode (yalnizca macOS, iOS icin)

## Kurulum

```bash
npm install
```

## Gelistirme

Web arayuzunu Vite ile calistirmak icin:

```bash
npm run dev
```

## Mobil projeleri acma

Android Studio'da acmak icin:

```bash
npm run mobile:android
```

Xcode'da acmak icin:

```bash
npm run mobile:ios
```

## Senkronizasyon

Yapilandirma veya plugin degisikligi yaptiktan sonra native projeleri guncellemek icin:

```bash
npm run mobile:sync
```

## Not

- Uygulama acildiginda dogrudan `https://helalhesap.com/` adresi yuklenir.
- `server.url` kullanimindan dolayi web build dosyalari mobilde zorunlu degildir; yine de web arayuzu icin `npm run build` komutu mevcuttur.

import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';
import Features from './components/Features';
import AppDownload from './components/AppDownload';
import Footer from './components/Footer';

export default function App() {
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartCount} />
      <main>
        <Hero />
        <Categories />
        <Products onAddToCart={handleAddToCart} />
        <Features />
        <AppDownload />
      </main>
      <Footer />
    </div>
  );
}

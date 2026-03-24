import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import HomeFinancingPage from './pages/HomeFinancingPage'
import VehicleFinancingPage from './pages/VehicleFinancingPage'
import BanksPage from './pages/BanksPage'
import InsurancePage from './pages/InsurancePage'
import SavingsPage from './pages/SavingsPage'
import CampaignsPage from './pages/CampaignsPage'
import GuidePage from './pages/GuidePage'
import NeedFinancingPage from './pages/NeedFinancingPage'
import ZeroProfitPage from './pages/ZeroProfitPage'
import CardsPage from './pages/CardsPage'
import CustomerPage from './pages/CustomerPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/finansman/ev" element={<HomeFinancingPage />} />
      <Route path="/finansman/arac" element={<VehicleFinancingPage />} />
      <Route path="/finansman/ihtiyac" element={<NeedFinancingPage />} />
      <Route path="/finansman/sifir-kar" element={<ZeroProfitPage />} />
      <Route path="/kurumlar" element={<BanksPage />} />
      <Route path="/kurumlar/katilim-bankalari" element={<BanksPage />} />
      <Route path="/kurumlar/musteri-ol" element={<CustomerPage />} />
      <Route path="/helal-sigorta" element={<InsurancePage />} />
      <Route path="/tasarruf-finansman" element={<SavingsPage />} />
      <Route path="/tum-kampanyalar" element={<CampaignsPage />} />
      <Route path="/rehber" element={<GuidePage />} />
      <Route path="/kartlar" element={<CardsPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="mx-auto min-h-screen max-w-lg bg-slate-50">
        <AppRoutes />
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

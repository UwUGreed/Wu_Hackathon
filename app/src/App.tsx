import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import CompanionShowcase from './components/CompanionShowcase'
import WhyItMatters from './components/WhyItMatters'
import FinalCTA from './components/FinalCTA'
import LoginPage from './pages/LoginPage'
import DemoPage from './pages/DemoPage'
import Dashboard from './components/Dashboard'
import { useAppStore } from './store'

function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-50 font-body">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <CompanionShowcase />
        <WhyItMatters />
        <FinalCTA />
      </main>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

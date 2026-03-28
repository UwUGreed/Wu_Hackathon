import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import CompanionShowcase from './components/CompanionShowcase'
import InteractiveDemo from './components/InteractiveDemo'
import WhyItMatters from './components/WhyItMatters'
import FinalCTA from './components/FinalCTA'

export default function App() {
  return (
    <div className="min-h-screen bg-warm-50 font-body">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <CompanionShowcase />
        <InteractiveDemo />
        <WhyItMatters />
        <FinalCTA />
      </main>
    </div>
  )
}

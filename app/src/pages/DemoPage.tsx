import InteractiveDemo from '../components/InteractiveDemo'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-warm-50 font-body">
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-warm-50/80 backdrop-blur-xl border-b border-warm-200/40 shadow-sm">
        <div className="section-pad flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm"><Shield size={16} className="text-white" /></div>
            <span className="font-display font-700 text-sm text-warm-900 tracking-tight">Gooblet</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-warm-800/50 hover:text-warm-800 transition-colors"><ArrowLeft size={15} />Back to home</Link>
        </div>
      </header>
      <main className="pt-20"><InteractiveDemo /></main>
    </div>
  )
}

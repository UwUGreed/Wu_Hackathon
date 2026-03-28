import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Building2, CheckCircle2, Lock, ArrowRight, Search } from 'lucide-react'

const banks = [
  { id: 'chase', name: 'Chase', icon: '🏦', color: 'bg-blue-50 border-blue-200' },
  { id: 'bofa', name: 'Bank of America', icon: '🏛', color: 'bg-red-50 border-red-200' },
  { id: 'wells', name: 'Wells Fargo', icon: '🏦', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'citi', name: 'Citibank', icon: '🏦', color: 'bg-sky-50 border-sky-200' },
  { id: 'capital', name: 'Capital One', icon: '💳', color: 'bg-orange-50 border-orange-200' },
  { id: 'usaa', name: 'USAA', icon: '⭐', color: 'bg-indigo-50 border-indigo-200' },
]

type Step = 'select' | 'credentials' | 'connecting' | 'success'

interface PlaidFlowProps { onComplete: () => void }

const progressMessages = [
  'Connecting securely to your bank...', 'Verifying account access...',
  'Fetching transaction history...', 'Analyzing spending patterns...',
  'Setting up your safety net...', 'Almost there...',
]

export default function PlaidFlow({ onComplete }: PlaidFlowProps) {
  const [step, setStep] = useState<Step>('select')
  const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null)
  const [bankSearch, setBankSearch] = useState('')
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState(0)

  const filteredBanks = banks.filter((b) => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
  const handleSelectBank = (bank: typeof banks[0]) => { setSelectedBank(bank); setStep('credentials') }
  const handleConnect = (e: React.FormEvent) => { e.preventDefault(); setStep('connecting') }

  const advanceProgress = useCallback(() => {
    setProgress((p) => { if (p >= 100) return 100; return Math.min(p + Math.random() * 15 + 5, 100) })
    setProgressMsg((m) => Math.min(m + 1, progressMessages.length - 1))
  }, [])

  useEffect(() => { if (step !== 'connecting') return; const interval = setInterval(advanceProgress, 700); return () => clearInterval(interval) }, [step, advanceProgress])
  useEffect(() => { if (progress >= 100 && step === 'connecting') setTimeout(() => setStep('success'), 500) }, [progress, step])
  useEffect(() => { if (step === 'success') { const timer = setTimeout(onComplete, 2000); return () => clearTimeout(timer) } }, [step, onComplete])

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center relative overflow-hidden noise">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-sage-100/25 blur-[90px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] rounded-full bg-lavender-100/20 blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm"><Shield size={18} className="text-white" /></div>
            <div className="w-6 flex justify-center"><div className="w-4 h-px bg-warm-300" /><Lock size={10} className="text-warm-400 absolute" /></div>
            <div className="w-10 h-10 rounded-xl bg-sage-500 flex items-center justify-center shadow-sm"><Building2 size={18} className="text-white" /></div>
          </div>
          <span className="text-warm-800/30 text-[11px] font-bold tracking-widest uppercase">Secure Connection</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-warm-200/50 shadow-card overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="p-6">
                <h2 className="font-display font-700 text-lg text-warm-900 tracking-tight mb-1">Select your bank</h2>
                <p className="text-warm-800/40 text-sm mb-5">Choose your institution to securely connect</p>
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-800/25" />
                  <input type="text" value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} placeholder="Search banks..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-warm-50 border border-warm-200/60 text-sm text-warm-900 placeholder:text-warm-800/25 font-medium focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all" />
                </div>
                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto hide-scrollbar">
                  {filteredBanks.map((bank, i) => (
                    <motion.button key={bank.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => handleSelectBank(bank)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border ${bank.color} hover:shadow-card transition-all active:scale-[0.98] text-left`}>
                      <span className="text-xl">{bank.icon}</span><span className="font-semibold text-sm text-warm-900 flex-1">{bank.name}</span><ArrowRight size={14} className="text-warm-800/25" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 'credentials' && selectedBank && (
              <motion.div key="credentials" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="p-6">
                <button onClick={() => setStep('select')} className="text-warm-800/40 text-sm font-medium hover:text-warm-800/60 transition-colors mb-4">← Back</button>
                <div className="flex items-center gap-3 mb-5"><span className="text-2xl">{selectedBank.icon}</span><div><h2 className="font-display font-700 text-lg text-warm-900 tracking-tight">{selectedBank.name}</h2><p className="text-warm-800/40 text-xs">Enter your online banking credentials</p></div></div>
                <form onSubmit={handleConnect} className="flex flex-col gap-4">
                  <div><label className="text-xs font-semibold text-warm-800/40 tracking-wider uppercase block mb-1.5">Username</label><input type="text" defaultValue="demo_student" className="w-full px-4 py-3 rounded-xl bg-warm-50 border border-warm-200/60 text-sm text-warm-900 font-medium focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all" /></div>
                  <div><label className="text-xs font-semibold text-warm-800/40 tracking-wider uppercase block mb-1.5">Password</label><input type="password" defaultValue="••••••••" className="w-full px-4 py-3 rounded-xl bg-warm-50 border border-warm-200/60 text-sm text-warm-900 font-medium focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all" /></div>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sage-600 text-white font-display font-700 text-sm tracking-tight hover:bg-sage-500 transition-colors mt-1">Connect Account<ArrowRight size={15} /></motion.button>
                </form>
                <div className="flex items-center gap-2 mt-4 justify-center"><Lock size={11} className="text-warm-800/20" /><span className="text-warm-800/25 text-[11px] font-medium">End-to-end encrypted · Read-only access</span></div>
              </motion.div>
            )}
            {step === 'connecting' && (
              <motion.div key="connecting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="p-8 flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="#e7e5e4" strokeWidth="4" /><motion.circle cx="48" cy="48" r="42" fill="none" stroke="#52955e" strokeWidth="4" strokeLinecap="round" strokeDasharray={264} strokeDashoffset={264 - (progress / 100) * 264} transition={{ duration: 0.5, ease: 'easeOut' }} /></svg>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="font-display font-800 text-lg text-warm-900">{Math.round(progress)}%</span></div>
                </div>
                <AnimatePresence mode="wait"><motion.p key={progressMsg} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-warm-800/60 text-sm font-medium">{progressMessages[progressMsg]}</motion.p></AnimatePresence>
                <div className="flex items-center gap-2 mt-6"><Lock size={11} className="text-warm-800/20" /><span className="text-warm-800/20 text-[11px] font-medium">256-bit encrypted connection</span></div>
              </motion.div>
            )}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="p-8 flex flex-col items-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }} className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center mb-5"><CheckCircle2 size={32} className="text-sage-600" /></motion.div>
                <h2 className="font-display font-800 text-xl text-warm-900 tracking-tight mb-2">You're connected!</h2>
                <p className="text-warm-800/45 text-sm leading-relaxed mb-1">{selectedBank?.name ?? 'Your bank'} account linked successfully.</p>
                <p className="text-warm-800/30 text-xs">Redirecting to your dashboard...</p>
                <div className="flex gap-1.5 mt-5">{[0, 1, 2].map((i) => (<motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-sage-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />))}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 text-[11px] font-bold tracking-wider">DEMO — No real bank data is accessed</span>
        </motion.div>
      </div>
    </div>
  )
}

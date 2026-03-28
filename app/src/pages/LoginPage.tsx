import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { api } from '../api'
import { useAppStore } from '../store'
import Mascot from '../components/Mascot'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const session = await api.login(username, password)
      login(session)
      navigate('/dashboard')
    } catch {
      setError('Wrong credentials — try your username / payday')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 600)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 font-body relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[30%] -right-[20%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-brand-200/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[15%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-lavender-200/15 blur-[120px]" />
        <div className="absolute top-[20%] left-[60%] w-[25vw] h-[25vw] max-w-[350px] max-h-[350px] rounded-full bg-sage-200/15 blur-[80px]" />
      </div>
      <div className="absolute inset-0 noise pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full max-w-md px-6">
        <motion.div animate={isShaking ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}} transition={{ duration: 0.5 }} className="rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <Mascot mood="calm" size={80} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }} className="flex items-center gap-2 mt-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center"><Shield size={14} className="text-white" /></div>
              <span className="font-display font-800 text-lg text-warm-900 tracking-tight">Make It to Payday</span>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="text-warm-800/40 text-sm mt-2 text-center">Sign in to your financial companion</motion.p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <label className="block text-[11px] font-bold text-warm-800/40 tracking-wider uppercase mb-1.5 ml-1">Username</label>
              <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError('') }} placeholder="alex" autoComplete="username"
                className="w-full px-4 py-3.5 rounded-xl bg-warm-50/80 border border-warm-200/60 text-warm-900 font-medium text-sm placeholder:text-warm-800/25 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-300 transition-all" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <label className="block text-[11px] font-bold text-warm-800/40 tracking-wider uppercase mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} placeholder="payday" autoComplete="current-password"
                  className="w-full px-4 py-3.5 rounded-xl bg-warm-50/80 border border-warm-200/60 text-warm-900 font-medium text-sm placeholder:text-warm-800/25 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-300 transition-all pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-800/30 hover:text-warm-800/60 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>
            {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-brand-600 text-sm font-medium text-center py-1">{error}</motion.div>)}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <motion.button type="submit" whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }} disabled={isSubmitting}
                className="w-full group flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-warm-900 text-white font-display font-700 text-sm tracking-tight shadow-lg shadow-warm-900/15 hover:shadow-xl hover:bg-warm-800 transition-all mt-2 disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? (<><Loader2 size={16} className="animate-spin" />Signing In</>) : (<>Sign In<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>)}
              </motion.button>
            </motion.div>
          </form>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center text-warm-800/25 text-xs mt-6">Hint: any username / payday</motion.p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-center mt-4">
          <a href="/" className="text-sm text-warm-800/40 hover:text-warm-800/60 font-medium transition-colors">← Back to home</a>
        </motion.div>
      </motion.div>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LogOut, RefreshCw, Wallet, TrendingDown,
  Building2, CreditCard, ArrowDownRight, ArrowUpRight, Clock, Trash2
} from 'lucide-react'
import { api } from '../api'
import type { Transaction } from '../api'
import { useAppStore } from '../store'
import Mascot from './Mascot'
import PlaidLinkButton from './PlaidLinkButton'
import type { MascotMood } from '../data'

const riskToMood: Record<string, MascotMood> = {
  CALM: 'happy', WATCH: 'calm', TIGHT: 'worried', CRITICAL: 'alert',
}
const riskColors: Record<string, { bg: string; text: string; badge: string; glow: string }> = {
  CALM: { bg: 'from-sage-50 to-sage-100/50', text: 'text-sage-600', badge: 'bg-sage-100 text-sage-700', glow: 'shadow-sage-400/20' },
  WATCH: { bg: 'from-blue-50 to-indigo-50/50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', glow: 'shadow-blue-400/20' },
  TIGHT: { bg: 'from-amber-50 to-orange-50/50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', glow: 'shadow-amber-400/20' },
  CRITICAL: { bg: 'from-brand-50 to-red-50/50', text: 'text-brand-600', badge: 'bg-red-100 text-red-700', glow: 'shadow-red-400/20' },
}
const riskMessages: Record<string, string> = {
  CALM: "You're doing great! Spend freely today.",
  WATCH: 'Things look okay, but keep an eye on it.',
  TIGHT: "Getting tight — maybe hold off on extras.",
  CRITICAL: 'Careful! Very little room until next paycheck.',
}

function formatCurrency(n: number | null) {
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const { homeData, setHomeData, logout, setError, error } = useAppStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const fetchHome = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    try {
      const data = await api.home()
      setHomeData(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch home:', err)
      setError('Could not load data. Is the backend running on :3001?')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await api.unlinkAllBanks()
      setHomeData(null)
    } catch (err) {
      console.error('Unlink failed:', err)
      setError('Could not unlink bank accounts. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  const linked = homeData?.linked ?? false
  const risk = homeData?.risk ?? 'CALM'
  const colors = riskColors[risk] ?? riskColors.CALM
  const mood = riskToMood[risk] ?? 'calm'

  return (
    <div className="min-h-screen bg-warm-50 font-body">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[15%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-brand-200/15 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-lavender-200/10 blur-[100px]" />
      </div>
      <header className="sticky top-0 z-50 bg-warm-50/80 backdrop-blur-xl border-b border-warm-200/40">
        <div className="section-pad flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm"><Shield size={16} className="text-white" /></div>
            <span className="font-display font-700 text-sm text-warm-900 tracking-tight">Make It to Payday</span>
          </div>
          <div className="flex items-center gap-2">
            {linked && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => fetchHome(true)} disabled={isRefreshing}
                className="p-2 rounded-lg hover:bg-warm-100 text-warm-800/40 hover:text-warm-800/70 transition-colors disabled:opacity-40">
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </motion.button>
            )}
            {linked && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleReset} disabled={isResetting}
                className="p-2 rounded-lg hover:bg-red-50 text-warm-800/30 hover:text-red-500 transition-colors disabled:opacity-40" title="Unlink all bank accounts">
                <Trash2 size={16} />
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.95 }} onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-warm-100 text-warm-800/40 hover:text-warm-800/70 text-sm font-medium transition-colors">
              <LogOut size={14} /> Sign out
            </motion.button>
          </div>
        </div>
      </header>
      <main className="section-pad py-8 relative z-10">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-2xl bg-brand-50 border border-brand-200/60 text-brand-700 text-sm font-medium">{error}</motion.div>
          )}
        </AnimatePresence>
        {!linked ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-lg mx-auto mt-12">
            <div className="rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass p-8 md:p-10 text-center">
              <Mascot mood="sleepy" size={100} />
              <h2 className="font-display font-800 text-2xl text-warm-900 tracking-tight mt-4 mb-2">Let's get started</h2>
              <p className="text-warm-800/50 text-sm leading-relaxed mb-8 max-w-sm mx-auto">Connect your bank account to see your safe-to-spend amount, risk level, and recent transactions.</p>
              <PlaidLinkButton onLinked={() => fetchHome()} />
              <p className="text-warm-800/20 text-xs mt-4">Uses Plaid Sandbox — no real bank data</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className={`rounded-[2rem] bg-gradient-to-br ${colors.bg} border border-white/60 shadow-glass p-6 md:p-8`}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="shrink-0"><Mascot mood={mood} size={100} /></div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>{risk}</span>
                      <span className="text-warm-800/30 text-xs font-medium">{homeData?.institution}</span>
                    </div>
                    <p className="text-warm-800/40 text-[11px] font-bold tracking-wider uppercase mt-3 mb-1">Safe to spend today</p>
                    <p className={`font-display font-800 text-5xl md:text-6xl tracking-tight ${colors.text}`}>{formatCurrency(homeData?.safeToSpendToday ?? 0)}</p>
                    <p className="text-warm-800/45 text-sm mt-2 font-medium max-w-md">{riskMessages[risk]}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Building2 size={18} />} label="Institution" value={homeData?.institution ?? '—'} />
              <StatCard icon={<CreditCard size={18} />} label="Account" value={homeData?.accountName ?? '—'} />
              <StatCard icon={<Wallet size={18} />} label="Current Balance" value={formatCurrency(homeData?.balance ?? null)} accent />
              <StatCard icon={<TrendingDown size={18} />} label="Available" value={formatCurrency(homeData?.availableBalance ?? null)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass overflow-hidden">
                <div className="px-6 py-4 border-b border-warm-100/60 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Clock size={16} className="text-warm-800/30" /><h3 className="font-display font-700 text-base text-warm-900 tracking-tight">Recent Transactions</h3></div>
                  <span className="text-warm-800/30 text-xs font-bold">{homeData?.transactions?.length ?? 0} shown</span>
                </div>
                <div className="divide-y divide-warm-50">
                  {(homeData?.transactions ?? []).length === 0 ? (
                    <div className="px-6 py-10 text-center text-warm-800/30 text-sm">No transactions yet</div>
                  ) : (
                    (homeData?.transactions ?? []).map((txn, i) => (<TransactionRow key={txn.id} txn={txn} index={i} />))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-card p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center gap-2 mb-2 text-warm-800/30">{icon}<span className="text-[11px] font-bold tracking-wider uppercase">{label}</span></div>
      <p className={`font-display font-700 text-sm tracking-tight truncate ${accent ? 'text-warm-900' : 'text-warm-800/70'}`}>{value}</p>
    </div>
  )
}

function TransactionRow({ txn, index }: { txn: Transaction; index: number }) {
  const isIncome = txn.amount < 0
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
      className="flex items-center justify-between px-6 py-3.5 hover:bg-warm-50/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-sage-50 text-sage-500' : 'bg-brand-50 text-brand-400'}`}>
          {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-warm-900 truncate">{txn.name}</p>
          <p className="text-[11px] text-warm-800/30 font-medium">{formatDate(txn.date)}{txn.pending && <span className="ml-1.5 text-amber-500">• Pending</span>}</p>
        </div>
      </div>
      <span className={`font-display font-700 text-sm tabular-nums shrink-0 ml-3 ${isIncome ? 'text-sage-600' : 'text-warm-900'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(Math.abs(txn.amount)).replace('$', '$\u200A')}
      </span>
    </motion.div>
  )
}

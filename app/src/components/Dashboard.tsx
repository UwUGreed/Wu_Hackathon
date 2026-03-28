import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LogOut, RefreshCw, Wallet, TrendingDown,
  Building2, CreditCard, ArrowDownRight, ArrowUpRight, Clock, Trash2, Brain, AlertTriangle
} from 'lucide-react'
import { api, buildApiUrl } from '../api'
import type { BudgetInsights, Transaction } from '../api'
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

function toIsoDate(value: string): string | null {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const direct = new Date(value)
  if (Number.isNaN(direct.getTime())) return null
  return direct.toISOString().slice(0, 10)
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  const didCopy = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!didCopy) {
    throw new Error('Clipboard copy failed')
  }
}

function buildScriptableWidgetScript(widgetUrl: string, appUrl: string) {
  return `const API_URL = ${JSON.stringify(widgetUrl)}
const OPEN_URL = ${JSON.stringify(appUrl)}

const palette = {
  happy: { top: '#F4FBEF', bottom: '#DCEFD2', accent: '#3F7A35' },
  calm: { top: '#EEF5FF', bottom: '#DCE9FF', accent: '#2F5F9F' },
  worried: { top: '#FFF6E6', bottom: '#FFE3B0', accent: '#A56400' },
  alert: { top: '#FFF0EF', bottom: '#FFD7D2', accent: '#B2443B' },
  sleepy: { top: '#F7F0FF', bottom: '#EBE2FF', accent: '#6A5AA6' },
}

async function loadData() {
  const request = new Request(API_URL)
  request.timeoutInterval = 15
  return await request.loadJSON()
}

function formatMoney(value) {
  if (value === null || value === undefined) return 'Link bank'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function faceForMood(mood) {
  if (mood === 'happy') return '◡'
  if (mood === 'worried') return '﹏'
  if (mood === 'alert') return 'o'
  if (mood === 'sleepy') return '︵'
  return '–'
}

function drawMascot(mood) {
  const ctx = new DrawContext()
  ctx.size = new Size(140, 140)
  ctx.opaque = false
  ctx.respectScreenScale = true

  ctx.setFillColor(new Color('#FF954A'))
  ctx.fillEllipse(new Rect(20, 28, 100, 92))

  ctx.setFillColor(new Color('#5BA65B'))
  ctx.fillRect(new Rect(68, 12, 5, 18))
  ctx.setFillColor(new Color('#6BC26B'))
  ctx.fillEllipse(new Rect(52, 6, 22, 16))
  ctx.fillEllipse(new Rect(68, 6, 22, 16))

  ctx.setFillColor(new Color('#FFFFFF'))
  const eyeHeight = mood === 'sleepy' ? 6 : 14
  ctx.fillEllipse(new Rect(45, 58, 16, eyeHeight))
  ctx.fillEllipse(new Rect(79, 58, 16, eyeHeight))

  ctx.setFillColor(new Color('#2D2D3D'))
  const pupilHeight = mood === 'sleepy' ? 2 : 8
  ctx.fillEllipse(new Rect(49, 61, 8, pupilHeight))
  ctx.fillEllipse(new Rect(83, 61, 8, pupilHeight))

  ctx.setTextAlignedCenter()
  ctx.setTextColor(new Color('#2D2D3D'))
  ctx.setFont(Font.mediumSystemFont(mood === 'alert' ? 24 : 22))
  ctx.drawTextInRect(faceForMood(mood), new Rect(0, 82, 140, 26))

  return ctx.getImage()
}

function buildWidget(data) {
  const mood = data.mood || 'calm'
  const theme = palette[mood] || palette.calm

  const widget = new ListWidget()
  const gradient = new LinearGradient()
  gradient.colors = [new Color(theme.top), new Color(theme.bottom)]
  gradient.locations = [0, 1]
  widget.backgroundGradient = gradient
  widget.setPadding(16, 16, 16, 16)
  widget.url = OPEN_URL

  const topRow = widget.addStack()
  topRow.layoutHorizontally()
  topRow.centerAlignContent()

  const mascot = topRow.addImage(drawMascot(mood))
  mascot.imageSize = new Size(68, 68)

  topRow.addSpacer(12)

  const details = topRow.addStack()
  details.layoutVertically()

  const nameLine = details.addText(data.displayName || 'Make It to Payday')
  nameLine.font = Font.mediumSystemFont(12)
  nameLine.textColor = new Color('#6B7280')

  const amountLine = details.addText(formatMoney(data.safeToSpendToday))
  amountLine.font = Font.boldRoundedSystemFont(26)
  amountLine.textColor = new Color(theme.accent)

  const riskLine = details.addText(data.linked ? (data.risk || 'CHECK-IN') : 'NOT LINKED')
  riskLine.font = Font.semiboldSystemFont(11)
  riskLine.textColor = new Color('#4B5563')

  widget.addSpacer(12)

  const messageLine = widget.addText(data.message || 'Open the app for details.')
  messageLine.font = Font.mediumSystemFont(12)
  messageLine.textColor = new Color('#374151')
  messageLine.minimumScaleFactor = 0.8

  widget.addSpacer(6)

  const subLine = widget.addText(data.institution || 'Tap to open dashboard')
  subLine.font = Font.mediumSystemFont(10)
  subLine.textColor = new Color('#6B7280')
  subLine.minimumScaleFactor = 0.8

  return widget
}

function buildErrorWidget(message) {
  const widget = new ListWidget()
  widget.backgroundColor = new Color('#FFF7ED')
  widget.url = OPEN_URL
  widget.setPadding(16, 16, 16, 16)

  const title = widget.addText('Widget setup needed')
  title.font = Font.boldSystemFont(16)
  title.textColor = new Color('#9A3412')

  widget.addSpacer(8)

  const detail = widget.addText(message)
  detail.font = Font.mediumSystemFont(12)
  detail.textColor = new Color('#7C2D12')
  detail.minimumScaleFactor = 0.8

  return widget
}

let widget

try {
  const data = await loadData()
  widget = buildWidget(data)
} catch (error) {
  widget = buildErrorWidget('Check your widget URL and make sure your backend is reachable from the iPhone.')
}

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  await widget.presentMedium()
}

Script.complete()
`
}

export default function Dashboard() {
  const { homeData, setHomeData, logout, setError, error, authSession } = useAppStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [widgetStatus, setWidgetStatus] = useState<string | null>(null)
  const [insights, setInsights] = useState<BudgetInsights | null>(null)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
  const widgetToken = authSession?.user.widgetToken ?? null
  const widgetUrl = widgetToken ? `${buildApiUrl('widget/summary')}?token=${encodeURIComponent(widgetToken)}` : ''
  const appUrl = typeof window === 'undefined' ? '/dashboard' : new URL('/dashboard', window.location.origin).toString()
  const scriptableScript = widgetUrl ? buildScriptableWidgetScript(widgetUrl, appUrl) : ''
  const widgetUsesLocalhost = widgetUrl.includes('localhost') || widgetUrl.includes('127.0.0.1')

  const handleCopyWidgetUrl = async () => {
    if (!widgetUrl) {
      setWidgetStatus('No widget token yet. Sign in again to generate one.')
      return
    }

    try {
      await copyText(widgetUrl)
      setWidgetStatus('Widget URL copied. Paste it into Scriptable or use it to preview the JSON.')
    } catch {
      setWidgetStatus('Could not copy the widget URL automatically.')
    }
  }

  const handleCopyScriptableScript = async () => {
    if (!scriptableScript) {
      setWidgetStatus('No widget token yet. Sign in again to generate one.')
      return
    }

    try {
      await copyText(scriptableScript)
      setWidgetStatus('Script copied. Paste it into a new Scriptable script on your iPhone.')
    } catch {
      setWidgetStatus('Could not copy the Scriptable script automatically.')
    }
  }

  const handleAnalyzeBudget = async () => {
    setIsAnalyzing(true)
    setInsightsError(null)
    try {
      const data = await api.insights()
      setInsights(data)
    } catch (err) {
      console.error('AI insights failed:', err)
      setInsightsError('Could not generate AI budget insights right now.')
    } finally {
      setIsAnalyzing(false)
    }
  }

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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5 }}>
              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass overflow-hidden">
                <div className="px-6 py-4 border-b border-warm-100/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-warm-800/40" />
                    <h3 className="font-display font-700 text-base text-warm-900 tracking-tight">AI Budget Plan</h3>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyzeBudget}
                    disabled={isAnalyzing}
                    className="px-4 py-2 rounded-xl bg-warm-900 text-white text-sm font-semibold hover:bg-warm-800 transition-colors disabled:opacity-60"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze My Budget'}
                  </motion.button>
                </div>
                <div className="p-6 space-y-4">
                  {insightsError && (
                    <div className="rounded-2xl bg-red-50 border border-red-200/70 px-4 py-3 text-sm font-medium text-red-700">
                      {insightsError}
                    </div>
                  )}
                  {!insights && !isAnalyzing && !insightsError && (
                    <p className="text-sm text-warm-800/50">
                      Generate a plan based on your balance, transaction history, spending habits, and recurring subscriptions.
                    </p>
                  )}
                  {insights && (
                    <>
                      <p className="text-sm text-warm-800/60">{insights.summary}</p>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                        <MiniStat label="Needs / week" value={formatCurrency(insights.budgetPlan.weeklyNeedsBudget)} />
                        <MiniStat label="Wants / week" value={formatCurrency(insights.budgetPlan.weeklyWantsBudget)} />
                        <MiniStat label="Savings / week" value={formatCurrency(insights.budgetPlan.weeklySavingsTarget)} />
                        <MiniStat label="Daily cap" value={formatCurrency(insights.budgetPlan.dailySpendingCap)} />
                        <MiniStat label="30-day cash flow" value={formatCurrency(insights.budgetPlan.next30DayCashFlow)} />
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl bg-warm-50/80 border border-warm-100/70 p-4">
                          <p className="text-warm-800/40 text-[11px] font-bold tracking-wider uppercase mb-3">Detected subscriptions</p>
                          <div className="space-y-2 max-h-52 overflow-auto pr-1">
                            {insights.subscriptions.length === 0 ? (
                              <p className="text-sm text-warm-800/45">No recurring subscriptions detected yet.</p>
                            ) : (
                              insights.subscriptions.map((sub, idx) => (
                                <div key={`${sub.name}-${idx}`} className="flex items-center justify-between text-sm">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-warm-900 truncate">{sub.name}</p>
                                    <p className="text-xs text-warm-800/45">{sub.frequency} · {Math.round(sub.confidence * 100)}% confidence</p>
                                  </div>
                                  <span className="font-semibold text-warm-900 ml-3">{formatCurrency(sub.amount)}</span>
                                </div>
                              ))
                            )}
                          </div>
                          <p className="text-xs text-warm-800/50 mt-3">Estimated monthly subscription load: {formatCurrency(insights.totalMonthlySubscriptions)}</p>
                        </div>

                        <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle size={14} className="text-amber-700" />
                            <p className="text-amber-800 text-[11px] font-bold tracking-wider uppercase">Step 03: Danger days prediction</p>
                          </div>
                          <p className="text-xs text-amber-800/80 mb-3">
                            Days when your balance gets risky before your next paycheck. We catch them early.
                          </p>
                          {insights.nextPayday && (
                            <p className="text-xs text-amber-900/80 mb-2">Next estimated payday: {formatDate(insights.nextPayday)}</p>
                          )}
                          {(() => {
                            const weekdays = ['S', 'M', 'T', 'W', 'Th', 'F', 'S']
                            const normalizedDangerDays = insights.dangerDays
                              .map((entry) => {
                                const iso = toIsoDate(entry.date)
                                if (!iso) return null
                                return {
                                  ...entry,
                                  dateIso: iso,
                                  severity: String(entry.severity).toLowerCase() as 'watch' | 'tight' | 'critical',
                                }
                              })
                              .filter((entry): entry is NonNullable<typeof entry> => !!entry)
                              .sort((a, b) => a.dateIso.localeCompare(b.dateIso))

                            const firstDangerDate = normalizedDangerDays[0]?.dateIso ?? null
                            const baseIso = firstDangerDate || toIsoDate(insights.nextPayday || '')
                            const base = baseIso ? new Date(`${baseIso}T00:00:00`) : new Date()
                            const monthStart = new Date(base.getFullYear(), base.getMonth(), 1)
                            const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
                            const firstDayOffset = monthStart.getDay()

                            const dayCells: Array<{ day: number; iso: string } | null> = []
                            for (let i = 0; i < firstDayOffset; i++) dayCells.push(null)
                            for (let d = 1; d <= daysInMonth; d++) {
                              const iso = new Date(base.getFullYear(), base.getMonth(), d).toISOString().slice(0, 10)
                              dayCells.push({ day: d, iso })
                            }
                            while (dayCells.length % 7 !== 0) dayCells.push(null)

                            const dangerByDate = new Map(normalizedDangerDays.map((entry) => [entry.dateIso, entry]))

                            return (
                              <div className="rounded-2xl bg-white/70 border border-amber-100 overflow-hidden">
                                <div className="px-3 py-2 border-b border-amber-100/70 text-sm font-semibold text-warm-900">
                                  {base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                                <div className="grid grid-cols-7 bg-warm-50/70 border-b border-amber-100/70">
                                  {weekdays.map((label) => (
                                    <div key={label} className="text-center text-xs font-medium text-warm-800/60 py-1.5 border-r last:border-r-0 border-amber-100/70">
                                      {label}
                                    </div>
                                  ))}
                                </div>
                                <div className="grid grid-cols-7">
                                  {dayCells.map((cell, idx) => {
                                    const danger = cell ? dangerByDate.get(cell.iso) : undefined
                                    const severityClass =
                                      danger?.severity === 'critical'
                                        ? 'bg-red-50'
                                        : danger?.severity === 'tight'
                                        ? 'bg-amber-50'
                                        : danger?.severity === 'watch'
                                        ? 'bg-yellow-50'
                                        : 'bg-white/50'

                                    return (
                                      <div
                                        key={`${idx}-${cell ? cell.iso : 'empty'}`}
                                        className={`h-16 md:h-20 border-r border-b border-amber-100/70 last:border-r-0 relative ${severityClass}`}
                                      >
                                        {cell && (
                                          <>
                                            <span className="absolute top-1.5 left-1.5 text-xs font-medium text-warm-800/70">{cell.day}</span>
                                            {danger && (
                                              <span
                                                className={`absolute bottom-1.5 right-1.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                  danger.severity === 'critical'
                                                    ? 'bg-red-100 text-red-700'
                                                    : danger.severity === 'tight'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                              >
                                                {danger.severity}
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                                {insights.dangerDays.length === 0 && (
                                  <div className="px-3 py-2 text-xs text-amber-800/70 border-t border-amber-100/70">
                                    No danger days detected in this month forecast.
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-1">
                        <div className="rounded-2xl bg-warm-50/80 border border-warm-100/70 p-4">
                          <p className="text-warm-800/40 text-[11px] font-bold tracking-wider uppercase mb-3">Action recommendations</p>
                          <div className="space-y-2 max-h-52 overflow-auto pr-1">
                            {insights.recommendations.length === 0 ? (
                              <p className="text-sm text-warm-800/45">No recommendations generated.</p>
                            ) : (
                              insights.recommendations.map((rec, idx) => (
                                <div key={`${rec.title}-${idx}`} className="rounded-xl bg-white border border-warm-100 p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-warm-900">{rec.title}</p>
                                    <span className="text-xs font-semibold text-sage-700 whitespace-nowrap">{formatCurrency(rec.impactPerMonth)}/mo</span>
                                  </div>
                                  <p className="text-xs text-warm-800/55 mt-1">{rec.reason}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
              <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass overflow-hidden">
                <div className="px-6 py-4 border-b border-warm-100/60 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-warm-800/30 text-[11px] font-bold tracking-wider uppercase">Scriptable Widget MVP</p>
                    <h3 className="font-display font-700 text-base text-warm-900 tracking-tight mt-1">Put your mascot on the iPhone home screen</h3>
                    <p className="text-sm text-warm-800/45 mt-2 max-w-2xl">
                      Copy the script into the Scriptable app, add a medium Scriptable widget on iPhone, and point it at your spending summary.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <motion.button whileTap={{ scale: 0.98 }} onClick={() => void handleCopyWidgetUrl()}
                      className="px-4 py-2 rounded-xl bg-warm-100 text-warm-900 text-sm font-semibold hover:bg-warm-200 transition-colors">
                      Copy widget URL
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.98 }} onClick={() => void handleCopyScriptableScript()}
                      className="px-4 py-2 rounded-xl bg-warm-900 text-white text-sm font-semibold hover:bg-warm-800 transition-colors">
                      Copy Scriptable script
                    </motion.button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-warm-50/80 border border-warm-100/70 p-4">
                      <p className="text-warm-800/30 text-[11px] font-bold tracking-wider uppercase mb-2">Widget token</p>
                      <p className="font-mono text-sm text-warm-900 break-all">{widgetToken ? `...${widgetToken.slice(-12)}` : 'Unavailable'}</p>
                    </div>
                    <div className="rounded-2xl bg-warm-50/80 border border-warm-100/70 p-4">
                      <p className="text-warm-800/30 text-[11px] font-bold tracking-wider uppercase mb-2">Endpoint</p>
                      <p className="text-xs text-warm-800/60 break-all">{widgetUrl || 'Sign in again to generate a widget URL.'}</p>
                    </div>
                  </div>
                  {widgetStatus && (
                    <div className="rounded-2xl bg-sage-50 border border-sage-200/70 px-4 py-3 text-sm font-medium text-sage-700">
                      {widgetStatus}
                    </div>
                  )}
                  {widgetUsesLocalhost && (
                    <div className="rounded-2xl bg-amber-50 border border-amber-200/70 px-4 py-3 text-sm font-medium text-amber-700">
                      This URL uses localhost, which will not work from your iPhone. Open the app from a LAN IP or tunnel before copying the script.
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {widgetUrl && (
                      <a href={widgetUrl} target="_blank" rel="noreferrer" className="font-semibold text-warm-900 underline underline-offset-4">
                        Preview widget JSON
                      </a>
                    )}
                    <span className="text-warm-800/45">
                      Scriptable setup is manual on purpose here. It is MVP-only, but it will give you a real iPhone widget.
                    </span>
                  </div>
                </div>
              </div>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-warm-50/80 border border-warm-100/70 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-warm-800/40">{label}</p>
      <p className="mt-1 text-sm font-semibold text-warm-900">{value}</p>
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

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LogOut, RefreshCw, Wallet, TrendingDown,
  Building2, CreditCard, ArrowDownRight, ArrowUpRight, Clock, Trash2, Copy, ExternalLink
} from 'lucide-react'
import { api, buildApiUrl } from '../api'
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
  happy: { top: '#F9FCEB', bottom: '#DFF2C8', accent: '#3F7A35', accentSoft: '#EDF8E2', orb: '#A7D37A' },
  calm: { top: '#EFF6FF', bottom: '#D6E7FF', accent: '#2F5F9F', accentSoft: '#E5F0FF', orb: '#93B9F3' },
  worried: { top: '#FFF7EA', bottom: '#FFDCA7', accent: '#A56400', accentSoft: '#FFF0D5', orb: '#F2B75A' },
  alert: { top: '#FFF2F0', bottom: '#FFD6CF', accent: '#B2443B', accentSoft: '#FFE7E2', orb: '#F09384' },
  sleepy: { top: '#F6F1FF', bottom: '#E6DEFF', accent: '#6A5AA6', accentSoft: '#F0EBFF', orb: '#B7A6F4' },
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
    minimumFractionDigits: Math.abs(value) < 100 ? 2 : 0,
    maximumFractionDigits: Math.abs(value) < 100 ? 2 : 0,
  }).format(value)
}

function formatUpdatedAt(value) {
  if (!value) return 'Updated just now'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Updated just now'

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const suffix = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return 'Updated ' + hours + ':' + minutes + ' ' + suffix
}

function shortenInstitution(value) {
  if (!value) return 'Demo mode'
  if (value.length <= 16) return value
  return value.slice(0, 15) + '…'
}

function addPill(parent, text, backgroundColor, textColor) {
  const pill = parent.addStack()
  pill.layoutHorizontally()
  pill.centerAlignContent()
  pill.backgroundColor = new Color(backgroundColor)
  pill.cornerRadius = 999
  pill.setPadding(6, 10, 6, 10)

  const label = pill.addText(text)
  label.font = Font.mediumSystemFont(10)
  label.textColor = new Color(textColor)
  label.lineLimit = 1

  return pill
}

function addSoftGlow(ctx, theme) {
  ctx.setFillColor(new Color(theme.orb, 0.18))
  ctx.fillEllipse(new Rect(20, 28, 180, 180))
  ctx.setFillColor(new Color('#FFFFFF', 0.28))
  ctx.fillEllipse(new Rect(36, 42, 92, 92))
  ctx.setFillColor(new Color('#FFFFFF', 0.12))
  ctx.fillEllipse(new Rect(54, 46, 120, 120))
}

function drawEyes(ctx, mood) {
  if (mood === 'sleepy') {
    ctx.setFillColor(new Color('#2D2D3D', 0.9))
    ctx.fillEllipse(new Rect(62, 96, 30, 6))
    ctx.fillEllipse(new Rect(128, 96, 30, 6))
    return
  }

  if (mood === 'happy') {
    ctx.setFillColor(new Color('#2D2D3D', 0.9))
    ctx.fillEllipse(new Rect(62, 94, 28, 8))
    ctx.fillEllipse(new Rect(130, 94, 28, 8))
    return
  }

  ctx.setFillColor(new Color('#FFFFFF'))
  const eyeHeight = mood === 'alert' ? 26 : 22
  ctx.fillEllipse(new Rect(58, 84, 32, eyeHeight))
  ctx.fillEllipse(new Rect(130, 84, 32, eyeHeight))

  ctx.setFillColor(new Color('#2D2D3D'))
  const pupilWidth = mood === 'alert' ? 14 : 12
  const pupilHeight = mood === 'alert' ? 14 : 12
  const pupilY = mood === 'worried' ? 90 : 92
  ctx.fillEllipse(new Rect(68, pupilY, pupilWidth, pupilHeight))
  ctx.fillEllipse(new Rect(140, pupilY, pupilWidth, pupilHeight))

  ctx.setFillColor(new Color('#FFFFFF', 0.75))
  ctx.fillEllipse(new Rect(72, 92, 4, 4))
  ctx.fillEllipse(new Rect(144, 92, 4, 4))
}

function drawMascotFace(ctx, mood) {
  drawEyes(ctx, mood)

  const mouthMap = {
    happy: { value: '◡', rect: new Rect(0, 112, 220, 28), size: 28 },
    calm: { value: '◠', rect: new Rect(0, 114, 220, 26), size: 24 },
    worried: { value: '﹏', rect: new Rect(0, 114, 220, 26), size: 24 },
    alert: { value: 'o', rect: new Rect(0, 110, 220, 30), size: 28 },
    sleepy: { value: '︵', rect: new Rect(0, 114, 220, 24), size: 22 },
  }

  const mouth = mouthMap[mood] || mouthMap.calm
  ctx.setTextAlignedCenter()
  ctx.setTextColor(new Color('#2D2D3D'))
  ctx.setFont(Font.mediumSystemFont(mouth.size))
  ctx.drawTextInRect(mouth.value, mouth.rect)
}

function drawMascot(mood, theme) {
  const ctx = new DrawContext()
  ctx.size = new Size(220, 220)
  ctx.opaque = false
  ctx.respectScreenScale = true

  addSoftGlow(ctx, theme)

  ctx.setFillColor(new Color('#C25F27', 0.22))
  ctx.fillEllipse(new Rect(58, 174, 104, 18))

  ctx.setFillColor(new Color('#DE7432'))
  ctx.fillEllipse(new Rect(62, 154, 30, 20))
  ctx.fillEllipse(new Rect(128, 154, 30, 20))

  ctx.setFillColor(new Color('#D86B2B'))
  ctx.fillEllipse(new Rect(46, 74, 128, 110))
  ctx.setFillColor(new Color('#FF914D'))
  ctx.fillEllipse(new Rect(40, 58, 136, 112))
  ctx.setFillColor(new Color('#FFB988', 0.55))
  ctx.fillEllipse(new Rect(58, 72, 70, 40))
  ctx.setFillColor(new Color('#F17937', 0.38))
  ctx.fillEllipse(new Rect(106, 94, 46, 48))
  ctx.setFillColor(new Color('#FFFFFF', 0.16))
  ctx.fillEllipse(new Rect(56, 70, 88, 56))

  ctx.setFillColor(new Color('#F78742'))
  ctx.fillEllipse(new Rect(28, 92, 24, 34))
  ctx.fillEllipse(new Rect(168, 92, 24, 34))

  ctx.setFillColor(new Color('#FF7A93', 0.34))
  ctx.fillEllipse(new Rect(44, 110, 22, 14))
  ctx.fillEllipse(new Rect(154, 110, 22, 14))

  ctx.setFillColor(new Color('#5BA65B'))
  ctx.fillRect(new Rect(105, 26, 8, 26))
  ctx.setFillColor(new Color('#6BC26B'))
  ctx.fillEllipse(new Rect(78, 18, 32, 22))
  ctx.fillEllipse(new Rect(104, 14, 38, 26))
  ctx.setFillColor(new Color('#8ED98A', 0.55))
  ctx.fillEllipse(new Rect(88, 20, 16, 10))
  ctx.fillEllipse(new Rect(112, 17, 18, 11))

  drawMascotFace(ctx, mood)

  return ctx.getImage()
}

function buildMediumWidget(data) {
  const mood = data.mood || 'calm'
  const theme = palette[mood] || palette.calm

  const widget = new ListWidget()
  const gradient = new LinearGradient()
  gradient.colors = [new Color(theme.top), new Color(theme.bottom)]
  gradient.locations = [0, 1]
  widget.backgroundGradient = gradient
  widget.setPadding(18, 18, 18, 18)
  widget.url = OPEN_URL
  widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)

  const topRow = widget.addStack()
  topRow.layoutHorizontally()
  topRow.centerAlignContent()

  const mascotCard = topRow.addStack()
  mascotCard.size = new Size(112, 112)
  mascotCard.centerAlignContent()
  mascotCard.backgroundColor = new Color('#FFFFFF', 0.2)
  mascotCard.cornerRadius = 28
  mascotCard.borderWidth = 1
  mascotCard.borderColor = new Color('#FFFFFF', 0.24)
  const mascot = mascotCard.addImage(drawMascot(mood, theme))
  mascot.imageSize = new Size(108, 108)

  topRow.addSpacer(14)

  const details = topRow.addStack()
  details.layoutVertically()
  details.centerAlignContent()

  const pillRow = details.addStack()
  pillRow.layoutHorizontally()
  addPill(
    pillRow,
    data.linked ? (data.risk || 'CHECK-IN') : 'SETUP',
    theme.accentSoft,
    theme.accent,
  )
  pillRow.addSpacer(6)
  addPill(
    pillRow,
    shortenInstitution(data.institution),
    '#FFFFFF',
    '#5B6473',
  )

  details.addSpacer(10)

  const labelLine = details.addText('SAFE TO SPEND TODAY')
  labelLine.font = Font.mediumSystemFont(10)
  labelLine.textColor = new Color('#6B7280')

  details.addSpacer(2)

  const amountLine = details.addText(formatMoney(data.safeToSpendToday))
  amountLine.font = Font.boldRoundedSystemFont(28)
  amountLine.textColor = new Color(theme.accent)
  amountLine.minimumScaleFactor = 0.7
  amountLine.lineLimit = 1

  details.addSpacer(4)

  const nameLine = details.addText(data.displayName || 'Make It to Payday')
  nameLine.font = Font.mediumSystemFont(12)
  nameLine.textColor = new Color('#4B5563')
  nameLine.lineLimit = 1

  const stateLine = details.addText(data.linked ? 'Linked and tracking' : 'Not linked yet')
  stateLine.font = Font.mediumSystemFont(10)
  stateLine.textColor = new Color('#7A8492')
  stateLine.lineLimit = 1

  widget.addSpacer(12)

  const messageCard = widget.addStack()
  messageCard.layoutHorizontally()
  messageCard.centerAlignContent()
  messageCard.backgroundColor = new Color('#FFFFFF', 0.18)
  messageCard.cornerRadius = 20
  messageCard.borderWidth = 1
  messageCard.borderColor = new Color('#FFFFFF', 0.18)
  messageCard.setPadding(11, 12, 11, 12)

  const pulse = messageCard.addStack()
  pulse.size = new Size(10, 10)
  pulse.backgroundColor = new Color(theme.accent)
  pulse.cornerRadius = 5

  messageCard.addSpacer(10)

  const messageLine = messageCard.addText(data.message || 'Open the app for details.')
  messageLine.font = Font.mediumSystemFont(12)
  messageLine.textColor = new Color('#374151')
  messageLine.minimumScaleFactor = 0.8
  messageLine.lineLimit = 2

  widget.addSpacer(10)

  const footer = widget.addStack()
  footer.layoutHorizontally()
  footer.centerAlignContent()

  const updatedLine = footer.addText(formatUpdatedAt(data.updatedAt))
  updatedLine.font = Font.mediumSystemFont(10)
  updatedLine.textColor = new Color('#6B7280')
  updatedLine.lineLimit = 1

  footer.addSpacer()

  const openLine = footer.addText('Tap to open')
  openLine.font = Font.mediumSystemFont(10)
  openLine.textColor = new Color(theme.accent)
  openLine.lineLimit = 1

  return widget
}

function buildSmallWidget(data) {
  const mood = data.mood || 'calm'
  const theme = palette[mood] || palette.calm

  const widget = new ListWidget()
  const gradient = new LinearGradient()
  gradient.colors = [new Color(theme.top), new Color(theme.bottom)]
  gradient.locations = [0, 1]
  widget.backgroundGradient = gradient
  widget.url = OPEN_URL
  widget.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000)
  widget.setPadding(14, 14, 14, 14)

  const top = widget.addStack()
  top.layoutHorizontally()
  addPill(top, data.linked ? (data.risk || 'CHECK-IN') : 'SETUP', theme.accentSoft, theme.accent)
  top.addSpacer()

  widget.addSpacer(6)

  const mascot = widget.addImage(drawMascot(mood, theme))
  mascot.imageSize = new Size(84, 84)
  mascot.centerAlignImage()

  widget.addSpacer(4)

  const amount = widget.addText(formatMoney(data.safeToSpendToday))
  amount.font = Font.boldRoundedSystemFont(22)
  amount.textColor = new Color(theme.accent)
  amount.centerAlignText()
  amount.minimumScaleFactor = 0.7
  amount.lineLimit = 1

  const label = widget.addText('Safe to spend')
  label.font = Font.mediumSystemFont(10)
  label.textColor = new Color('#6B7280')
  label.centerAlignText()
  label.lineLimit = 1

  widget.addSpacer()

  const footer = widget.addText(shortenInstitution(data.institution))
  footer.font = Font.mediumSystemFont(10)
  footer.textColor = new Color('#4B5563')
  footer.centerAlignText()
  footer.lineLimit = 1

  return widget
}

function buildWidget(data) {
  if (config.widgetFamily === 'small') return buildSmallWidget(data)
  return buildMediumWidget(data)
}

function buildErrorWidget(message) {
  const widget = new ListWidget()
  const gradient = new LinearGradient()
  gradient.colors = [new Color('#FFF8F3'), new Color('#FFE7D6')]
  gradient.locations = [0, 1]
  widget.backgroundGradient = gradient
  widget.url = OPEN_URL
  widget.setPadding(16, 16, 16, 16)
  widget.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000)

  const mascot = widget.addImage(drawMascot('sleepy', palette.sleepy))
  mascot.imageSize = new Size(80, 80)
  mascot.centerAlignImage()

  widget.addSpacer(8)

  const title = widget.addText('Widget setup needed')
  title.font = Font.boldSystemFont(16)
  title.textColor = new Color('#9A3412')
  title.centerAlignText()

  widget.addSpacer(8)

  const detail = widget.addText(message)
  detail.font = Font.mediumSystemFont(12)
  detail.textColor = new Color('#7C2D12')
  detail.minimumScaleFactor = 0.8
  detail.centerAlignText()
  detail.lineLimit = 3

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
  const showWidgetButton = Boolean(widgetToken)

  const handleCopyScriptableScript = async () => {
    if (!scriptableScript) {
      setWidgetStatus('No widget token yet. Sign in again to generate one.')
      return
    }

    if (widgetUsesLocalhost) {
      setWidgetStatus('Open the app from your computer’s LAN IP or a tunnel before copying the Scriptable setup.')
      return
    }

    try {
      await copyText(scriptableScript)
      setWidgetStatus('Script copied. Paste it into a new Scriptable script on your iPhone.')
    } catch {
      setWidgetStatus('Could not copy the Scriptable script automatically.')
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
      {showWidgetButton && (
        <div className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 flex flex-col items-end gap-2">
          <AnimatePresence>
            {widgetStatus && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className={`max-w-[280px] rounded-2xl border px-4 py-3 text-sm font-medium shadow-glass backdrop-blur-xl ${
                  widgetUsesLocalhost
                    ? 'bg-amber-50/95 border-amber-200/70 text-amber-700'
                    : 'bg-white/95 border-white/70 text-warm-800/70'
                }`}
              >
                {widgetStatus}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2">
            {widgetUrl && (
              <a
                href={widgetUrl}
                target="_blank"
                rel="noreferrer"
                className="h-11 w-11 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/70 shadow-glass text-warm-800/60 hover:text-warm-900 hover:bg-white transition-all flex items-center justify-center"
                title="Preview widget JSON"
              >
                <ExternalLink size={16} />
              </a>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void handleCopyScriptableScript()}
              className="flex items-center gap-2 rounded-2xl bg-warm-900/95 text-white px-4 py-3 shadow-glass border border-warm-900/20 hover:bg-warm-800 transition-all"
              title="Copy Scriptable widget setup"
            >
              <Copy size={15} />
              <span className="font-semibold text-sm">Copy Widget Script</span>
            </motion.button>
          </div>
        </div>
      )}
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

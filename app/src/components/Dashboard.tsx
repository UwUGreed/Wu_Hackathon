import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LogOut, RefreshCw, Wallet, TrendingDown,
  Building2, CreditCard, ArrowUpRight, Clock, Trash2, Brain, AlertTriangle,
  Copy, ExternalLink, X, UtensilsCrossed, Car, ShoppingBag, Film, ArrowLeftRight, Heart, Repeat,
  CircleDot, PieChart
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
  TIGHT: "Getting tight \u2014 maybe hold off on extras.",
  CRITICAL: 'Careful! Very little room until next paycheck.',
}

function formatCurrency(n: number | null) {
  if (n === null || n === undefined) return '\u2014'
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

async function sendDailyLimitNotification(transaction: Transaction, nextDailyLimit: number | null) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { ok: false as const, reason: 'unsupported' as const }
  }

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }

  if (permission !== 'granted') {
    return { ok: false as const, reason: permission }
  }

  const amount = formatCurrency(transaction.amount)
  const limit = formatCurrency(nextDailyLimit)
  const notification = new Notification('Gooblet daily limit updated', {
    body:
      nextDailyLimit === null
        ? `${transaction.name} (${amount}) was added to your demo feed.`
        : `${transaction.name} (${amount}) posted. Your new daily spend limit is ${limit}.`,
    icon: new URL('/gooblet-favicon.svg', window.location.origin).toString(),
    tag: 'gooblet-demo-limit',
  })

  window.setTimeout(() => notification.close(), 9000)

  return { ok: true as const }
}

function buildScriptableWidgetScript(widgetUrl: string, appUrl: string) {
  return `const API_URL = ${JSON.stringify(widgetUrl)}
const OPEN_URL = ${JSON.stringify(appUrl)}

const palette = {
  happy: { top: '#F6FDEB', mid: '#E8F8D9', bottom: '#D6EEBE', accent: '#3F7A35', orb: '#A4D47C', ink: '#25401F', sub: '#55714F' },
  calm: { top: '#EEF6FF', mid: '#E0ECFF', bottom: '#CBDFFF', accent: '#3564A2', orb: '#96BAFF', ink: '#213957', sub: '#5B6F8E' },
  worried: { top: '#FFF8E9', mid: '#FFEBC8', bottom: '#FFDCA6', accent: '#A56400', orb: '#F7B24F', ink: '#533200', sub: '#8C662B' },
  alert: { top: '#FFF3F1', mid: '#FFE2DE', bottom: '#FFC9C1', accent: '#B2443B', orb: '#FF9487', ink: '#5A231F', sub: '#8F5A52' },
  sleepy: { top: '#F7F1FF', mid: '#EEE5FF', bottom: '#E0D2FF', accent: '#6A5AA6', orb: '#B49CFF', ink: '#352B59', sub: '#73689A' },
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

function formatUpdatedAt(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Updated recently'

  const diffMs = Math.max(Date.now() - date.getTime(), 0)
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'Updated now'
  if (diffMinutes < 60) return 'Updated ' + diffMinutes + 'm ago'

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return 'Updated ' + diffHours + 'h ago'

  return 'Updated ' + date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function riskLabel(data) {
  if (!data.linked) return 'SETUP'
  return data.risk || 'CHECK-IN'
}

function institutionLabel(value) {
  if (!value) return 'Tap to open dashboard'
  return value.length > 24 ? value.slice(0, 23).trim() + '...' : value
}

function faceForMood(mood) {
  if (mood === 'happy') return '◡'
  if (mood === 'worried') return '﹏'
  if (mood === 'alert') return 'o'
  if (mood === 'sleepy') return '︵'
  return '︶'
}

function styleGlassCard(stack, alpha) {
  stack.backgroundColor = new Color('#FFFFFF', alpha)
  stack.cornerRadius = 24
  stack.borderWidth = 1
  stack.borderColor = new Color('#FFFFFF', 0.35)
}

function stylePill(stack, bgColor, borderColor) {
  stack.backgroundColor = bgColor
  stack.cornerRadius = 999
  stack.borderWidth = 1
  stack.borderColor = borderColor
  stack.setPadding(5, 10, 5, 10)
}

function addMetricPill(parent, label, value, theme) {
  const pill = parent.addStack()
  pill.layoutVertically()
  stylePill(pill, new Color('#FFFFFF', 0.22), new Color('#FFFFFF', 0.28))

  const labelLine = pill.addText(label.toUpperCase())
  labelLine.font = Font.semiboldSystemFont(8)
  labelLine.textColor = new Color(theme.sub, 0.9)

  const valueLine = pill.addText(value)
  valueLine.font = Font.semiboldSystemFont(10)
  valueLine.textColor = new Color(theme.ink)
  valueLine.minimumScaleFactor = 0.75
}

function drawMascot(mood, theme) {
  const ctx = new DrawContext()
  ctx.size = new Size(220, 220)
  ctx.opaque = false
  ctx.respectScreenScale = true

  ctx.setFillColor(new Color(theme.orb, 0.24))
  ctx.fillEllipse(new Rect(28, 18, 160, 154))

  ctx.setFillColor(new Color('#0F172A', 0.14))
  ctx.fillEllipse(new Rect(58, 170, 104, 20))

  ctx.setFillColor(new Color('#D86E2B', 0.95))
  ctx.fillEllipse(new Rect(62, 62, 106, 98))

  ctx.setFillColor(new Color('#FF9648'))
  ctx.fillEllipse(new Rect(48, 48, 110, 100))

  ctx.setFillColor(new Color('#FFB97D', 0.9))
  ctx.fillEllipse(new Rect(66, 60, 66, 42))

  ctx.setFillColor(new Color('#FFFFFF', 0.22))
  ctx.fillEllipse(new Rect(84, 70, 20, 10))
  ctx.fillEllipse(new Rect(74, 84, 34, 16))

  ctx.setFillColor(new Color('#D86E2B', 0.55))
  ctx.fillEllipse(new Rect(116, 82, 26, 46))

  ctx.setFillColor(new Color('#E77932'))
  ctx.fillEllipse(new Rect(76, 140, 18, 30))
  ctx.fillEllipse(new Rect(114, 140, 18, 30))

  ctx.setFillColor(new Color('#C96227', 0.95))
  ctx.fillEllipse(new Rect(80, 146, 14, 24))
  ctx.fillEllipse(new Rect(118, 146, 14, 24))

  ctx.setFillColor(new Color('#3E8E43'))
  ctx.fillRect(new Rect(102, 22, 8, 30))
  ctx.setFillColor(new Color('#5DBB63'))
  ctx.fillRect(new Rect(100, 20, 8, 28))

  ctx.setFillColor(new Color('#3F8A43'))
  ctx.fillEllipse(new Rect(74, 8, 34, 24))
  ctx.fillEllipse(new Rect(106, 8, 34, 24))
  ctx.setFillColor(new Color('#70D874'))
  ctx.fillEllipse(new Rect(70, 6, 34, 24))
  ctx.fillEllipse(new Rect(102, 6, 34, 24))
  ctx.setFillColor(new Color('#BDF7B5', 0.8))
  ctx.fillEllipse(new Rect(82, 12, 12, 8))
  ctx.fillEllipse(new Rect(110, 12, 12, 8))

  ctx.setFillColor(new Color('#FF8DA2', 0.75))
  ctx.fillEllipse(new Rect(60, 98, 18, 12))
  ctx.fillEllipse(new Rect(128, 98, 18, 12))

  ctx.setFillColor(new Color('#FFFFFF'))
  const eyeHeight = mood === 'sleepy' ? 7 : 18
  ctx.fillEllipse(new Rect(76, 90, 18, eyeHeight))
  ctx.fillEllipse(new Rect(114, 90, 18, eyeHeight))

  ctx.setFillColor(new Color('#2D2D3D'))
  const pupilHeight = mood === 'sleepy' ? 3 : mood === 'alert' ? 12 : 9
  ctx.fillEllipse(new Rect(81, 95, 9, pupilHeight))
  ctx.fillEllipse(new Rect(119, 95, 9, pupilHeight))

  ctx.setFillColor(new Color('#FFFFFF', 0.85))
  ctx.fillEllipse(new Rect(84, 97, 3, 3))
  ctx.fillEllipse(new Rect(122, 97, 3, 3))

  ctx.setTextAlignedCenter()
  ctx.setTextColor(new Color('#2D2D3D'))
  ctx.setFont(Font.mediumSystemFont(mood === 'alert' ? 30 : 28))
  ctx.drawTextInRect(faceForMood(mood), new Rect(0, 118, 220, 30))

  return ctx.getImage()
}

function buildHeader(widget, data, theme) {
  const topRow = widget.addStack()
  topRow.layoutHorizontally()
  topRow.centerAlignContent()

  const brandPill = topRow.addStack()
  stylePill(brandPill, new Color('#FFFFFF', 0.18), new Color('#FFFFFF', 0.24))
  const brand = brandPill.addText('GOOBLET')
  brand.font = Font.boldSystemFont(10)
  brand.textColor = new Color(theme.ink)

  topRow.addSpacer()

  const updatedPill = topRow.addStack()
  stylePill(updatedPill, new Color('#FFFFFF', 0.16), new Color('#FFFFFF', 0.22))
  const updated = updatedPill.addText(formatUpdatedAt(data.updatedAt))
  updated.font = Font.mediumSystemFont(10)
  updated.textColor = new Color(theme.sub)
  updated.minimumScaleFactor = 0.8
}

function buildSmallWidget(data, theme, mood) {
  const widget = new ListWidget()
  const gradient = new LinearGradient()
  gradient.colors = [new Color(theme.top), new Color(theme.mid), new Color(theme.bottom)]
  gradient.locations = [0, 0.56, 1]
  widget.backgroundGradient = gradient
  widget.url = OPEN_URL
  widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 20)
  widget.setPadding(14, 14, 14, 14)

  buildHeader(widget, data, theme)
  widget.addSpacer(8)

  const hero = widget.addStack()
  hero.layoutVertically()
  hero.centerAlignContent()
  styleGlassCard(hero, 0.36)
  hero.setPadding(12, 12, 12, 12)

  const mascot = hero.addImage(drawMascot(mood, theme))
  mascot.imageSize = new Size(72, 72)

  hero.addSpacer(6)

  const amountLine = hero.addText(formatMoney(data.safeToSpendToday))
  amountLine.font = Font.boldRoundedSystemFont(21)
  amountLine.textColor = new Color(theme.accent)
  amountLine.minimumScaleFactor = 0.75

  const messageLine = hero.addText(data.message || 'Open Gooblet for details.')
  messageLine.font = Font.mediumSystemFont(10)
  messageLine.textColor = new Color(theme.ink, 0.88)
  messageLine.centerAlignText()
  messageLine.lineLimit = 2
  messageLine.minimumScaleFactor = 0.75

  hero.addSpacer(8)

  const badge = hero.addStack()
  stylePill(badge, new Color('#FFFFFF', 0.28), new Color('#FFFFFF', 0.32))
  const badgeText = badge.addText(riskLabel(data))
  badgeText.font = Font.semiboldSystemFont(10)
  badgeText.textColor = new Color(theme.ink)

  return widget
}

function buildMediumWidget(data, theme, mood) {
  const widget = new ListWidget()
  const gradient = new LinearGradient()
  gradient.colors = [new Color(theme.top), new Color(theme.mid), new Color(theme.bottom)]
  gradient.locations = [0, 0.56, 1]
  widget.backgroundGradient = gradient
  widget.url = OPEN_URL
  widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 20)
  widget.setPadding(16, 16, 16, 16)

  buildHeader(widget, data, theme)
  widget.addSpacer(12)

  const hero = widget.addStack()
  hero.layoutHorizontally()
  hero.centerAlignContent()
  styleGlassCard(hero, 0.38)
  hero.setPadding(14, 14, 14, 14)

  const mascot = hero.addImage(drawMascot(mood, theme))
  mascot.imageSize = new Size(92, 92)

  hero.addSpacer(12)

  const details = hero.addStack()
  details.layoutVertically()

  const kicker = details.addText('SAFE TO SPEND TODAY')
  kicker.font = Font.semiboldSystemFont(9)
  kicker.textColor = new Color(theme.sub)

  details.addSpacer(2)

  const amountLine = details.addText(formatMoney(data.safeToSpendToday))
  amountLine.font = Font.boldRoundedSystemFont(28)
  amountLine.textColor = new Color(theme.accent)
  amountLine.minimumScaleFactor = 0.7

  details.addSpacer(4)

  const nameLine = details.addText((data.displayName || 'Gooblet') + ' • ' + riskLabel(data))
  nameLine.font = Font.mediumSystemFont(11)
  nameLine.textColor = new Color(theme.sub)
  nameLine.minimumScaleFactor = 0.8

  details.addSpacer(4)

  const messageLine = details.addText(data.message || 'Open the app for details.')
  messageLine.font = Font.mediumSystemFont(12)
  messageLine.textColor = new Color(theme.ink, 0.92)
  messageLine.lineLimit = 2
  messageLine.minimumScaleFactor = 0.76

  widget.addSpacer(10)

  const metrics = widget.addStack()
  metrics.layoutHorizontally()
  metrics.centerAlignContent()
  metrics.spacing = 8

  addMetricPill(metrics, 'Status', riskLabel(data), theme)
  metrics.addSpacer(8)
  addMetricPill(metrics, 'Bank', institutionLabel(data.institution), theme)
  metrics.addSpacer(8)
  addMetricPill(metrics, 'Tap', 'Open dashboard', theme)

  return widget
}

function buildWidget(data) {
  const mood = data.mood || 'calm'
  const theme = palette[mood] || palette.calm

  if (config.widgetFamily === 'small') {
    return buildSmallWidget(data, theme, mood)
  }

  return buildMediumWidget(data, theme, mood)
}

function buildErrorWidget(message) {
  const widget = new ListWidget()
  const gradient = new LinearGradient()
  gradient.colors = [new Color('#FFF8ED'), new Color('#FFE6C7')]
  gradient.locations = [0, 1]
  widget.backgroundGradient = gradient
  widget.url = OPEN_URL
  widget.setPadding(16, 16, 16, 16)
  widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 10)

  const card = widget.addStack()
  card.layoutVertically()
  styleGlassCard(card, 0.48)
  card.setPadding(14, 14, 14, 14)

  const title = card.addText('Widget setup needed')
  title.font = Font.boldSystemFont(16)
  title.textColor = new Color('#9A3412')

  card.addSpacer(8)

  const detail = card.addText(message)
  detail.font = Font.mediumSystemFont(12)
  detail.textColor = new Color('#7C2D12')
  detail.lineLimit = 3
  detail.minimumScaleFactor = 0.8

  return widget
}

let widget

try {
  const data = await loadData()
  if (data && data.error) {
    widget = buildErrorWidget(data.error.message || 'Check your widget token and try again.')
  } else {
    widget = buildWidget(data)
  }
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

// \u2500\u2500\u2500 Dashboard helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const riskLevels = ['CALM', 'WATCH', 'TIGHT', 'CRITICAL'] as const
const riskGaugeColors: Record<string, string> = {
  CALM: 'bg-sage-400',
  WATCH: 'bg-blue-400',
  TIGHT: 'bg-amber-400',
  CRITICAL: 'bg-red-400',
}
interface CategoryStyle {
  label: string
  icon: React.ReactNode
  barColor: string
  iconBg: string
  iconText: string
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Food & Drink': {
    label: 'Food & Drink',
    icon: <UtensilsCrossed size={14} />,
    barColor: 'bg-brand-400',
    iconBg: 'bg-brand-50',
    iconText: 'text-brand-400',
  },
  Shopping: {
    label: 'Shopping',
    icon: <ShoppingBag size={14} />,
    barColor: 'bg-lavender-400',
    iconBg: 'bg-lavender-50',
    iconText: 'text-lavender-500',
  },
  Transport: {
    label: 'Transport',
    icon: <Car size={14} />,
    barColor: 'bg-blue-400',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
  },
  Entertainment: {
    label: 'Entertainment',
    icon: <Film size={14} />,
    barColor: 'bg-amber-400',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
  },
  'Health & Fitness': {
    label: 'Health & Fitness',
    icon: <Heart size={14} />,
    barColor: 'bg-red-300',
    iconBg: 'bg-red-50',
    iconText: 'text-red-400',
  },
  'Bills & Subscriptions': {
    label: 'Bills & Subscriptions',
    icon: <Repeat size={14} />,
    barColor: 'bg-sage-400',
    iconBg: 'bg-sage-50',
    iconText: 'text-sage-500',
  },
  Transfer: {
    label: 'Transfer',
    icon: <ArrowLeftRight size={14} />,
    barColor: 'bg-warm-400',
    iconBg: 'bg-warm-100',
    iconText: 'text-warm-800/50',
  },
  Income: {
    label: 'Income',
    icon: <ArrowUpRight size={14} />,
    barColor: 'bg-sage-400',
    iconBg: 'bg-sage-50',
    iconText: 'text-sage-500',
  },
  Other: {
    label: 'Other',
    icon: <CircleDot size={14} />,
    barColor: 'bg-warm-300',
    iconBg: 'bg-warm-100',
    iconText: 'text-warm-800/40',
  },
}

const FALLBACK_BAR_COLORS = [
  'bg-brand-400', 'bg-sage-400', 'bg-lavender-400', 'bg-blue-400', 'bg-amber-400',
]

const NAME_RULES: [RegExp, string][] = [
  [/mcdonald|domino|dairy queen|tim horton|subway|seamless|tous les jours|starbucks|chick-?fil|wendy|burger king|taco bell|chipotle|panera|panda express|popeyes|dunkin|pizza hut|papa john|five guys|shake shack|wingstop|ihop|denny|waffle house|jack in the box|sonic drive|arby|little caesars|qdoba|noodles/i, 'Food & Drink'],
  [/kroger|harris teeter|frys food|whole foods|trader joe|aldi|safeway|publix|wegmans|costco|sam.?s club|food lion|piggly|h-?e-?b|giant eagle|meijer|sprouts|7-?eleven|wawa|sheetz|circle k/i, 'Food & Drink'],
  [/amazon|amzn|duane reade|target|walmart|best buy|walgreens|cvs|dollar|home depot|lowe|ikea|bath.*body|tj.?maxx|marshalls|nordstrom|macy|gap|old navy|kohls|ross/i, 'Shopping'],
  [/uber|lyft|pilot oil|shell|chevron|exxon|bp |sunoco|marathon|speedway|valero|wawa fuel|gas|parking|transit|metro/i, 'Transport'],
  [/fandango|xbox|playstation|psn|steam|netflix|hulu|disney|spotify|apple music|youtube|twitch|billiard|cinema|amc theatre|regal|dave.?buster|topgolf|bowl/i, 'Entertainment'],
  [/planet fit|gym|fitness|peloton|crossfit|yoga|health|medical|pharmacy|cvs pharmacy|walgreens pharmacy|doctor|dental|optom|urgent care|hospital/i, 'Health & Fitness'],
  [/sirius|sxm|subscription|dave\.com|patreon|substack|comcast|verizon|at.?t|t-?mobile|spectrum|internet|utility|electric|water bill|insurance|geico|state farm|progressive/i, 'Bills & Subscriptions'],
  [/venmo|zelle|paypal|cash app|transfer|wire|ach|direct deposit/i, 'Transfer'],
]

function normalizeCategory(categories: string[], txnName: string): string {
  for (const cat of categories) {
    const c = cat.toLowerCase()
    if (c.includes('food') || c.includes('restaurant') || c.includes('coffee')) return 'Food & Drink'
    if (c.includes('shop') || c.includes('store') || c.includes('merchandise')) return 'Shopping'
    if (c.includes('travel') || c.includes('transport') || c.includes('taxi')) return 'Transport'
    if (c.includes('entertainment') || c.includes('recreation') || c.includes('music') || c.includes('sport')) return 'Entertainment'
    if (c.includes('health') || c.includes('medical') || c.includes('fitness') || c.includes('gym')) return 'Health & Fitness'
    if (c.includes('subscription') || c.includes('service') || c.includes('utility') || c.includes('telecom') || c.includes('internet') || c.includes('phone')) return 'Bills & Subscriptions'
    if (c.includes('payment') || c.includes('transfer') || c.includes('debit')) return 'Transfer'
  }
  for (const [pattern, category] of NAME_RULES) {
    if (pattern.test(txnName)) return category
  }
  return 'Other'
}

function getCategoryStyle(categories: string[], txnName: string): CategoryStyle {
  const name = normalizeCategory(categories, txnName)
  return CATEGORY_STYLES[name] || CATEGORY_STYLES.Other
}

function getGreeting(name: string | null) {
  const hour = new Date().getHours()
  const who = name || 'there'
  if (hour < 12) return `Good morning, ${who}`
  if (hour < 17) return `Good afternoon, ${who}`
  return `Good evening, ${who}`
}

function getTodayString() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function getDateLabel(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  d.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function groupTransactionsByDate(txns: Transaction[]) {
  const map = new Map<string, Transaction[]>()
  for (const t of txns) {
    const label = getDateLabel(t.date)
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(t)
  }
  return [...map.entries()].map(([label, transactions]) => ({ label, transactions }))
}

function getSpendingBreakdown(txns: Transaction[]) {
  const map = new Map<string, number>()
  for (const t of txns) {
    if (t.amount <= 0) continue
    const cat = normalizeCategory(t.category || [], t.name)
    map.set(cat, (map.get(cat) || 0) + t.amount)
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = sorted[0]?.[1] || 1
  return sorted.map(([name, amount]) => ({ name, amount, pct: (amount / max) * 100 }))
}

// \u2500\u2500\u2500 Skeleton components \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function HeroSkeleton() {
  return (
    <div className="rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/60 shadow-glass p-6 md:p-8 animate-pulse">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-[110px] h-[110px] rounded-full bg-warm-200/40 shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="flex gap-2 justify-center md:justify-start">
            <div className="h-6 w-16 rounded-full bg-warm-200/40" />
            <div className="h-6 w-24 rounded-full bg-warm-200/40" />
          </div>
          <div className="h-3 w-28 rounded bg-warm-200/30 mx-auto md:mx-0" />
          <div className="h-14 w-52 rounded-xl bg-warm-200/40 mx-auto md:mx-0" />
          <div className="h-4 w-64 rounded bg-warm-200/30 mx-auto md:mx-0" />
          <div className="flex gap-1.5 justify-center md:justify-start">
            {[0, 1, 2, 3].map(i => <div key={i} className="flex-1 h-1.5 rounded-full bg-warm-200/30" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-warm-200/40" />
        <div className="h-3 w-16 rounded bg-warm-200/30" />
      </div>
      <div className="h-5 w-24 rounded bg-warm-200/40" />
    </div>
  )
}

// \u2500\u2500\u2500 Sub-components \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function RiskGauge({ risk }: { risk: string }) {
  const activeIdx = riskLevels.indexOf(risk as (typeof riskLevels)[number])
  return (
    <div className="flex items-center gap-1.5 mt-4 max-w-xs">
      {riskLevels.map((level, i) => (
        <div key={level} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`h-1.5 w-full rounded-full transition-all duration-500 ${
              i <= activeIdx ? riskGaugeColors[level] : 'bg-warm-200/40'
            }`}
          />
          <span
            className={`text-[9px] font-bold tracking-wider transition-colors ${
              i === activeIdx ? 'text-warm-800/70' : 'text-warm-800/20'
            }`}
          >
            {level}
          </span>
        </div>
      ))}
    </div>
  )
}

function SpendingBreakdownSection({ transactions }: { transactions: Transaction[] }) {
  const breakdown = useMemo(() => getSpendingBreakdown(transactions), [transactions])
  if (breakdown.length === 0) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-lavender-50 flex items-center justify-center">
            <PieChart size={16} className="text-lavender-500" />
          </div>
          <h3 className="font-display font-700 text-base text-warm-900 tracking-tight">Spending Breakdown</h3>
        </div>
        <div className="space-y-3.5">
          {breakdown.map((cat, i) => {
            const style = CATEGORY_STYLES[cat.name]
            const barColor = style?.barColor || FALLBACK_BAR_COLORS[i % FALLBACK_BAR_COLORS.length]
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${style?.iconBg || 'bg-warm-100'} ${style?.iconText || 'text-warm-800/40'}`}>
                      {style?.icon || <CircleDot size={12} />}
                    </div>
                    <span className="text-sm font-medium text-warm-800/70">{cat.name}</span>
                  </div>
                  <span className="text-sm font-display font-700 text-warm-800/60 tabular-nums">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-warm-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

function UnlinkConfirmDialog({
  onConfirm,
  onCancel,
  isLoading,
}: {
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-warm-900/30 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-white/70 shadow-glass p-6 md:p-8 max-w-sm w-full text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h3 className="font-display font-800 text-lg text-warm-900 tracking-tight mb-2">Unlink all accounts?</h3>
        <p className="text-warm-800/50 text-sm leading-relaxed mb-6">
          This will remove all linked bank accounts and clear your transaction data. You can always reconnect later.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-2xl bg-warm-100 text-warm-800/70 font-semibold text-sm hover:bg-warm-200/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Unlinking\u2026' : 'Unlink'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
  accentBorder,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: boolean
  accentBorder?: boolean
}) {
  return (
    <div
      className={`rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-card p-5 hover:shadow-card-hover hover:scale-[1.01] transition-all duration-200 ${
        accentBorder ? 'border-l-[3px] border-l-brand-400' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            accent ? 'bg-brand-50 text-brand-500' : 'bg-warm-100 text-warm-800/40'
          }`}
        >
          {icon}
        </div>
        <span className="text-[11px] font-bold tracking-wider uppercase text-warm-800/30">{label}</span>
      </div>
      <p
        className={`font-display font-700 text-base tracking-tight truncate ${
          accent ? 'text-warm-900' : 'text-warm-800/70'
        }`}
      >
        {value}
      </p>
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
  const style = isIncome
    ? CATEGORY_STYLES.Income
    : getCategoryStyle(txn.category || [], txn.name)
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
      className="flex items-center justify-between px-4 md:px-6 py-3 hover:bg-warm-50/50 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconText}`}
        >
          {style.icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-warm-900 truncate">{txn.name}</p>
          <p className="text-[11px] text-warm-800/30 font-medium">
            {style.label}
            {txn.pending && <span className="ml-1.5 text-amber-500">&bull; Pending</span>}
          </p>
        </div>
      </div>
      <span
        className={`font-display font-700 text-sm tabular-nums shrink-0 ml-3 ${
          isIncome ? 'text-sage-600' : 'text-warm-900'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(Math.abs(txn.amount)).replace('$', '$\u200A')}
      </span>
    </motion.div>
  )
}

// \u2500\u2500\u2500 Main Dashboard \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export default function Dashboard() {
  const { homeData, setHomeData, logout, setError, error, authSession } = useAppStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isRunningTransactionDemo, setIsRunningTransactionDemo] = useState(false)
  const [widgetStatus, setWidgetStatus] = useState<string | null>(null)
  const [demoStatus, setDemoStatus] = useState<{ tone: 'success' | 'warning'; message: string } | null>(null)
  const [insights, setInsights] = useState<BudgetInsights | null>(null)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(!homeData)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [txnPanelOpen, setTxnPanelOpen] = useState(false)

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

  useEffect(() => {
    if (!homeData) {
      setIsInitialLoading(true)
      fetchHome().finally(() => setIsInitialLoading(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await api.unlinkAllBanks()
      setHomeData(null)
      setShowUnlinkConfirm(false)
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
  const displayName = authSession?.user.displayName ?? null
  const widgetToken = authSession?.user.widgetToken ?? null
  const widgetUrl = widgetToken
    ? `${buildApiUrl('widget/summary')}?token=${encodeURIComponent(widgetToken)}`
    : ''
  const appUrl =
    typeof window === 'undefined'
      ? '/dashboard'
      : new URL('/dashboard', window.location.origin).toString()
  const scriptableScript = widgetUrl ? buildScriptableWidgetScript(widgetUrl, appUrl) : ''
  const widgetUsesLocalhost = widgetUrl.includes('localhost') || widgetUrl.includes('127.0.0.1')
  const showWidgetButton = Boolean(widgetToken)
  const transactionGroups = useMemo(
    () => groupTransactionsByDate(homeData?.transactions ?? []),
    [homeData?.transactions],
  )

  const handleCopyScriptableScript = async () => {
    if (!scriptableScript) {
      setWidgetStatus('No widget token yet. Sign in again to generate one.')
      return
    }
    if (widgetUsesLocalhost) {
      setWidgetStatus(
        'Open the app from your computer\u2019s LAN IP or a tunnel before copying the Scriptable setup.',
      )
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

  const handleTransactionDemoTest = async () => {
    setIsRunningTransactionDemo(true)
    setDemoStatus(null)
    setError(null)

    try {
      const result = await api.simulateDemoTransaction()
      setHomeData(result.homeData)
      setTxnPanelOpen(true)

      if (insights) {
        try {
          const refreshedInsights = await api.insights()
          setInsights(refreshedInsights)
          setInsightsError(null)
        } catch (err) {
          console.error('AI insights refresh failed after demo transaction:', err)
          setInsightsError('Transaction added, but AI insights could not be refreshed right now.')
        }
      }

      const notification = await sendDailyLimitNotification(
        result.transaction,
        result.homeData.safeToSpendToday,
      )
      const amountLabel = formatCurrency(result.transaction.amount)
      const limitLabel = formatCurrency(result.homeData.safeToSpendToday)

      if (notification.ok) {
        setDemoStatus({
          tone: 'success',
          message: `${result.transaction.name} for ${amountLabel} was added. A browser notification was sent with your new daily spend limit of ${limitLabel}.`,
        })
      } else {
        setDemoStatus({
          tone: 'warning',
          message: `${result.transaction.name} for ${amountLabel} was added and the dashboard was updated to ${limitLabel}. Allow browser notifications to receive the daily limit alert from the web app.`,
        })
      }
    } catch (err) {
      console.error('Transaction demo test failed:', err)
      setError('Could not run the transaction demo test right now.')
    } finally {
      setIsRunningTransactionDemo(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 font-body">
      {/* Background blurs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[15%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-brand-200/15 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-lavender-200/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-warm-50/80 backdrop-blur-xl border-b border-warm-200/40">
        <div className="section-pad flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display font-700 text-sm text-warm-900 tracking-tight">
              Gooblet
            </span>
          </div>
          <div className="flex items-center gap-1">
            {linked && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchHome(true)}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl hover:bg-warm-100 text-warm-800/40 hover:text-warm-800/70 transition-colors disabled:opacity-40"
                title="Refresh data"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </motion.button>
            )}
            {linked && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUnlinkConfirm(true)}
                className="p-2.5 rounded-xl hover:bg-red-50 text-warm-800/30 hover:text-red-500 transition-colors"
                title="Unlink all bank accounts"
              >
                <Trash2 size={16} />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-warm-100 text-warm-800/40 hover:text-warm-800/70 text-sm font-medium transition-colors"
            >
              <LogOut size={14} /> Sign out
            </motion.button>
          </div>
        </div>
      </header>

      <main className="section-pad py-6 md:py-8 relative z-10">
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-2xl bg-brand-50 border border-brand-200/60 text-brand-700 text-sm font-medium flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 rounded-lg hover:bg-brand-100 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {demoStatus && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium flex items-center justify-between gap-3 ${
                demoStatus.tone === 'success'
                  ? 'bg-sage-50 border-sage-200/70 text-sage-700'
                  : 'bg-amber-50 border-amber-200/70 text-amber-700'
              }`}
            >
              <span>{demoStatus.message}</span>
              <button
                onClick={() => setDemoStatus(null)}
                className="p-1 rounded-lg hover:bg-white/50 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="font-display font-800 text-2xl md:text-3xl text-warm-900 tracking-tight">
            {getGreeting(displayName)}
          </h1>
          <p className="text-warm-800/40 text-sm font-medium mt-0.5">{getTodayString()}</p>
        </motion.div>

        {/* Loading skeleton */}
        {isInitialLoading ? (
          <div className="space-y-5">
            <HeroSkeleton />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(i => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : !linked ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto mt-8"
          >
            <div className="rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass p-8 md:p-10 text-center">
              <Mascot mood="sleepy" size={100} />
              <h2 className="font-display font-800 text-2xl text-warm-900 tracking-tight mt-4 mb-2">
                Let&apos;s get started
              </h2>
              <p className="text-warm-800/50 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Connect your bank account to see your safe-to-spend amount, risk level, and recent
                transactions.
              </p>
              <PlaidLinkButton onLinked={() => fetchHome()} />
              <p className="text-warm-800/20 text-xs mt-4">
                Uses Plaid Sandbox &mdash; no real bank data
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Hero card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className={`relative rounded-[2rem] bg-gradient-to-br ${colors.bg} border border-white/60 shadow-glass p-6 md:p-8 overflow-hidden noise`}
              >
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                  <div className="shrink-0">
                    <Mascot mood={mood} size={110} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                        {risk}
                      </span>
                      <span className="text-warm-800/30 text-xs font-medium">
                        {homeData?.institution}
                      </span>
                    </div>
                    <p className="text-warm-800/40 text-[10px] font-bold tracking-widest uppercase mt-4 mb-1">
                      Safe to spend today
                    </p>
                    <p
                      className={`font-display font-800 text-5xl md:text-6xl tracking-tight ${colors.text}`}
                    >
                      {formatCurrency(homeData?.safeToSpendToday ?? 0)}
                    </p>
                    <p className="text-warm-800/45 text-sm mt-2 font-medium max-w-md">
                      {riskMessages[risk]}
                    </p>
                    <RiskGauge risk={risk} />
                    <div className="mt-5 flex flex-col md:flex-row md:items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => void handleTransactionDemoTest()}
                        disabled={isRunningTransactionDemo}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-warm-900/95 text-white px-4 py-3 text-sm font-semibold shadow-glass border border-warm-900/10 hover:bg-warm-800 transition-colors disabled:opacity-60"
                      >
                        <CreditCard size={15} />
                        <span>
                          {isRunningTransactionDemo ? 'Running Demo Test...' : 'Transaction Demo Test'}
                        </span>
                      </motion.button>
                      <p className="text-xs text-warm-800/35 max-w-sm">
                        Adds a realistic demo purchase, refreshes the dashboard totals, and sends a browser notification with your new daily spend limit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <StatCard icon={<Building2 size={18} />} label="Institution" value={homeData?.institution ?? '\u2014'} />
              <StatCard icon={<CreditCard size={18} />} label="Account" value={homeData?.accountName ?? '\u2014'} />
              <StatCard
                icon={<Wallet size={18} />}
                label="Current Balance"
                value={formatCurrency(homeData?.balance ?? null)}
                accent
                accentBorder
              />
              <StatCard
                icon={<TrendingDown size={18} />}
                label="Available"
                value={formatCurrency(homeData?.availableBalance ?? null)}
              />
            </motion.div>

            {/* AI Budget Plan */}
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

            {/* Spending breakdown */}
            <SpendingBreakdownSection transactions={homeData?.transactions ?? []} />
          </div>
        )}
      </main>

      {/* Transactions tab handle (right edge) */}
      {linked && !txnPanelOpen && (
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5, type: 'spring', stiffness: 200 }}
          whileHover={{ x: -4, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setTxnPanelOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5 py-5 px-3 md:px-3.5 rounded-l-2xl bg-brand-500 shadow-glow cursor-pointer border border-r-0 border-brand-400/30"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Clock size={18} className="text-white" />
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-bold tabular-nums">
            {homeData?.transactions?.length ?? 0}
          </span>
          <span
            className="text-[11px] font-bold tracking-wider uppercase text-white/90"
            style={{ writingMode: 'vertical-rl' }}
          >
            Transactions
          </span>
        </motion.button>
      )}

      {/* Transactions slide-out drawer */}
      <AnimatePresence>
        {txnPanelOpen && (
          <>
            <motion.div
              key="txn-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[59] bg-warm-900/20 backdrop-blur-[2px]"
              onClick={() => setTxnPanelOpen(false)}
            />
            <motion.div
              key="txn-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full z-[60] w-[380px] max-w-[90vw] bg-warm-50/95 backdrop-blur-2xl border-l border-warm-200/40 shadow-glass flex flex-col"
            >
              <div className="px-5 py-4 border-b border-warm-100/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-warm-100 flex items-center justify-center">
                    <Clock size={16} className="text-warm-800/40" />
                  </div>
                  <h3 className="font-display font-700 text-base text-warm-900 tracking-tight">
                    Recent Transactions
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-warm-100 text-warm-800/40 text-xs font-bold tabular-nums">
                    {homeData?.transactions?.length ?? 0}
                  </span>
                  <button
                    onClick={() => setTxnPanelOpen(false)}
                    className="p-2 rounded-xl hover:bg-warm-100 text-warm-800/40 hover:text-warm-800/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {transactionGroups.length === 0 ? (
                  <div className="px-6 py-10 text-center text-warm-800/30 text-sm">
                    No transactions yet
                  </div>
                ) : (
                  transactionGroups.map(group => (
                    <div key={group.label}>
                      <div className="px-5 py-2 bg-warm-50/80 border-b border-warm-100/40 sticky top-0 z-10 backdrop-blur-sm">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-warm-800/30">
                          {group.label}
                        </span>
                      </div>
                      <div className="divide-y divide-warm-50/80">
                        {group.transactions.map((txn, i) => (
                          <TransactionRow key={txn.id} txn={txn} index={i} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Widget FAB */}
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
              className="flex items-center gap-2 rounded-2xl bg-warm-900/95 text-white px-3 py-2.5 md:px-4 md:py-3 shadow-glass border border-warm-900/20 hover:bg-warm-800 transition-all"
              title="Copy Scriptable widget setup"
            >
              <Copy size={15} />
              <span className="font-semibold text-sm hidden md:inline">Copy Widget Script</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Unlink confirmation */}
      <AnimatePresence>
        {showUnlinkConfirm && (
          <UnlinkConfirmDialog
            onConfirm={handleReset}
            onCancel={() => setShowUnlinkConfirm(false)}
            isLoading={isResetting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

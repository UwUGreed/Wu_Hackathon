import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LogOut, RefreshCw, Wallet, TrendingDown,
  Building2, CreditCard, ArrowDownRight, ArrowUpRight, Clock, Trash2, Copy, ExternalLink,
  AlertTriangle, X, UtensilsCrossed, Car, ShoppingBag, Film, ArrowLeftRight, Heart, Repeat,
  CircleDot, PieChart
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
  return value.slice(0, 15) + '\u2026'
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
    happy: { value: '\u25E1', rect: new Rect(0, 112, 220, 28), size: 28 },
    calm: { value: '\u25E0', rect: new Rect(0, 114, 220, 26), size: 24 },
    worried: { value: '\uFE4F', rect: new Rect(0, 114, 220, 26), size: 24 },
    alert: { value: 'o', rect: new Rect(0, 110, 220, 30), size: 28 },
    sleepy: { value: '\uFE35', rect: new Rect(0, 114, 220, 24), size: 22 },
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

function TransactionSkeleton() {
  return (
    <div className="divide-y divide-warm-50">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center justify-between px-4 md:px-6 py-3.5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warm-200/40" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-warm-200/40" />
              <div className="h-3 w-20 rounded bg-warm-200/30" />
            </div>
          </div>
          <div className="h-4 w-16 rounded bg-warm-200/40" />
        </div>
      ))}
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
  const [widgetStatus, setWidgetStatus] = useState<string | null>(null)
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
              Make It to Payday
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

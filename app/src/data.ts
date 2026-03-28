export type MascotMood = 'happy' | 'calm' | 'worried' | 'alert' | 'sleepy'

export interface DemoDay {
  day: number
  label: string
  event: string
  amount: number
  balance: number
  mood: MascotMood
  message: string
}

export const demoDays: DemoDay[] = [
  {
    day: 1,
    label: 'Friday',
    event: 'Paycheck arrives',
    amount: 487,
    balance: 1241,
    mood: 'happy',
    message: "You're looking great! Payday hit — enjoy the weekend.",
  },
  {
    day: 3,
    label: 'Sunday',
    event: 'Spotify + Netflix',
    amount: -16,
    balance: 1225,
    mood: 'calm',
    message: 'Subscriptions went through. Still plenty of room.',
  },
  {
    day: 5,
    label: 'Tuesday',
    event: 'Chipotle, Starbucks, Uber',
    amount: -38,
    balance: 1187,
    mood: 'calm',
    message: 'Normal spending day. You can safely spend about $20 more today.',
  },
  {
    day: 7,
    label: 'Thursday',
    event: 'Phone bill auto-pays',
    amount: -45,
    balance: 1142,
    mood: 'calm',
    message: 'Phone bill came out. Still on track for rent next week.',
  },
  {
    day: 9,
    label: 'Saturday',
    event: 'Concert tix + dinner out',
    amount: -112,
    balance: 1030,
    mood: 'worried',
    message: "Big night! Fun's important, but rent is 3 days away. Let's keep an eye on things.",
  },
  {
    day: 10,
    label: 'Sunday',
    event: 'Groceries + pharmacy',
    amount: -47,
    balance: 983,
    mood: 'worried',
    message: 'Essentials are good. But rent takes $625 in 2 days — that leaves you $358 after.',
  },
  {
    day: 11,
    label: 'Monday',
    event: 'Target impulse buy',
    amount: -63,
    balance: 920,
    mood: 'alert',
    message: "⚠ Danger day tomorrow. Rent is $625, and you'd only have $295 left until next paycheck.",
  },
  {
    day: 12,
    label: 'Tuesday',
    event: '🏠 Rent due',
    amount: -625,
    balance: 295,
    mood: 'alert',
    message: 'Rent cleared. You have $295 for the next 10 days. That\'s about $29/day. Take it easy.',
  },
  {
    day: 14,
    label: 'Thursday',
    event: 'Careful week — light spending',
    amount: -22,
    balance: 273,
    mood: 'calm',
    message: 'Nice restraint. You\'re making it work. Keep going — payday is next Friday.',
  },
  {
    day: 15,
    label: 'Friday',
    event: '💰 Next paycheck',
    amount: 487,
    balance: 760,
    mood: 'happy',
    message: 'You made it! Paycheck just hit. You survived the danger zone. 🎉',
  },
]

export const howItWorksSteps = [
  {
    number: '01',
    title: 'Connect your bank',
    description: 'Securely link your checking account. We only look at transactions — nothing else.',
    icon: '🔗',
    color: 'from-lavender-100 to-lavender-50',
    border: 'border-lavender-200',
  },
  {
    number: '02',
    title: 'We learn your patterns',
    description: 'Subscriptions, food runs, rent — we quietly figure out where your money flows.',
    icon: '🔍',
    color: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
  },
  {
    number: '03',
    title: 'We predict danger days',
    description: "Days when your balance gets risky before your next paycheck. We catch them early.",
    icon: '📅',
    color: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
  },
  {
    number: '04',
    title: 'Friendly heads-up',
    description: "A calm nudge, not a lecture. \"Hey, maybe skip Uber tomorrow — rent hits Thursday.\"",
    icon: '💬',
    color: 'from-brand-50 to-brand-100',
    border: 'border-brand-200',
  },
  {
    number: '05',
    title: 'Build confidence',
    description: "Over time, you start feeling in control. No spreadsheets. No guilt. Just clarity.",
    icon: '✨',
    color: 'from-sage-50 to-sage-100',
    border: 'border-sage-200',
  },
]

export const companionStates: { mood: MascotMood; label: string; tagline: string; bgClass: string }[] = [
  { mood: 'happy', label: 'Happy', tagline: "You're crushing it! Spend freely today.", bgClass: 'from-sage-100 to-sage-50' },
  { mood: 'calm', label: 'Calm', tagline: "Everything's on track. No worries.", bgClass: 'from-blue-50 to-indigo-50' },
  { mood: 'worried', label: 'Worried', tagline: 'Things are getting a little tight...', bgClass: 'from-amber-50 to-orange-50' },
  { mood: 'alert', label: 'Alert', tagline: 'Careful — a danger day is coming.', bgClass: 'from-brand-50 to-red-50' },
  { mood: 'sleepy', label: 'Sleepy', tagline: 'No big moves today. Rest easy.', bgClass: 'from-lavender-50 to-lavender-100' },
]

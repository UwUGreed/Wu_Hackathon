/**
 * API client for the backend.
 * Uses /api prefix which Vite proxies to localhost:3001 in dev.
 */

const BASE = import.meta.env.VITE_API_URL || '/api'
const AUTH_STORAGE_KEY = 'gooblet-auth'

export interface AuthSession {
  token: string
  user: {
    id: string
    email: string
    displayName: string
    widgetToken: string | null
  }
}

export interface AuthUser {
  id: string
  email: string
  displayName: string
  widgetToken: string | null
}

export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function setStoredAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredAuthSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthSession()?.token
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()
  if (!res.ok) throw data
  return data as T
}

export function getApiBaseUrl() {
  if (BASE.startsWith('http://') || BASE.startsWith('https://')) {
    return BASE.replace(/\/$/, '')
  }

  if (typeof window === 'undefined') {
    return BASE.replace(/\/$/, '')
  }

  return new URL(BASE, window.location.origin).toString().replace(/\/$/, '')
}

export function buildApiUrl(path: string) {
  return new URL(path.replace(/^\//, ''), `${getApiBaseUrl()}/`).toString()
}

// ─── Types matching backend responses ─────────────────────────────

export interface HomeData {
  institution: string | null;
  accountName: string | null;
  balance: number | null;
  availableBalance: number | null;
  safeToSpendToday: number | null;
  risk: 'CALM' | 'WATCH' | 'TIGHT' | 'CRITICAL' | null;
  linked: boolean;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  category: string[];
}

export interface AccountInfo {
  id: string;
  name: string;
  officialName: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  currentBalance: number | null;
  availableBalance: number | null;
  isoCurrencyCode: string | null;
}

export interface AISubscription {
  name: string;
  amount: number;
  frequency: string;
  confidence: number;
  transactions: string[];
}

export interface AISpendingPattern {
  category: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface AIBudgetPlan {
  weeklyNeedsBudget: number;
  weeklyWantsBudget: number;
  weeklySavingsTarget: number;
  dailySpendingCap: number;
  next30DayCashFlow: number;
}

export interface AIRecommendation {
  title: string;
  reason: string;
  impactPerMonth: number;
}

export interface AIDangerDay {
  date: string;
  projectedBalance: number;
  severity: 'watch' | 'tight' | 'critical';
  reason: string;
}

export interface BudgetInsights {
  subscriptions: AISubscription[];
  spendingPatterns: AISpendingPattern[];
  summary: string;
  totalMonthlySubscriptions: number;
  budgetPlan: AIBudgetPlan;
  nextPayday: string | null;
  dangerDays: AIDangerDay[];
  recommendations: AIRecommendation[];
}

export interface DemoTransactionResponse {
  success: boolean
  message: string
  transaction: Transaction
  homeData: HomeData
}

// ─── API methods ──────────────────────────────────────────────────

export const api = {
  health: () => request<{ ok: boolean }>('/health'),

  login: (username: string, password: string) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<AuthUser>('/auth/me'),

  createLinkToken: () =>
    request<{ link_token: string; expiration: string }>('/plaid/link-token', {
      method: 'POST',
    }),

  exchangePublicToken: (publicToken: string) =>
    request<HomeData & { success: boolean }>('/plaid/exchange-public-token', {
      method: 'POST',
      body: JSON.stringify({ public_token: publicToken }),
    }),

  unlinkAllBanks: () =>
    request<{ success: boolean; message: string }>("/plaid/unlink-all", {
      method: 'POST',
    }),

  home: () => request<HomeData>('/home'),

  accounts: () => request<{ accounts: AccountInfo[] }>('/accounts'),

  transactions: () => request<{ transactions: Transaction[] }>('/transactions'),

  insights: () => request<BudgetInsights>('/insights'),

  seedCustomUser: (institutionId = 'ins_109508') =>
    request<HomeData & { success: boolean }>('/dev/seed-custom-user', {
      method: 'POST',
      body: JSON.stringify({ institution_id: institutionId }),
    }),

  resetDemo: () =>
    request<{ success: boolean; message: string }>('/dev/reset-demo', {
      method: 'POST',
    }),

  simulateDemoTransaction: () =>
    request<DemoTransactionResponse>('/dev/simulate-transaction', {
      method: 'POST',
    }),
};

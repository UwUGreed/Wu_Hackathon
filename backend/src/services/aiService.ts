import { env } from "../config/env";
import Groq from "groq-sdk";

const groq = env.GROQ_API_KEY ? new Groq({ apiKey: env.GROQ_API_KEY }) : null;

interface Transaction {
  transaction_id: string;
  name: string;
  merchant_name?: string;
  amount: number;
  date: string;
  category?: string[];
}

interface Subscription {
  name: string;
  amount: number;
  frequency: string;
  confidence: number;
  transactions: string[];
}

interface SpendingPattern {
  category: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  trend: "increasing" | "stable" | "decreasing";
}

interface AIInsights {
  subscriptions: Subscription[];
  spendingPatterns: SpendingPattern[];
  summary: string;
  totalMonthlySubscriptions: number;
}

export interface BudgetPlan {
  weeklyNeedsBudget: number;
  weeklyWantsBudget: number;
  weeklySavingsTarget: number;
  dailySpendingCap: number;
  next30DayCashFlow: number;
}

export interface Recommendation {
  title: string;
  reason: string;
  impactPerMonth: number;
}

export interface DangerDay {
  date: string;
  projectedBalance: number;
  severity: "watch" | "tight" | "critical";
  reason: string;
}

export interface BudgetInsights extends AIInsights {
  budgetPlan: BudgetPlan;
  recommendations: Recommendation[];
  nextPayday: string | null;
  dangerDays: DangerDay[];
}

interface BudgetInsightsInput {
  availableBalance: number;
  currentBalance: number;
  safeToSpendToday: number;
  transactions: Transaction[];
}

export async function analyzeTransactions(transactions: Transaction[]): Promise<AIInsights> {
  if (!groq) {
    return buildFallbackInsights(transactions, 0, 0, 0);
  }

  const prompt = `
    Analyze the following JSON array of transactions and identify recurring subscriptions and spending patterns.
    
    Transactions:
    ${JSON.stringify(transactions.slice(0, 100), null, 2)}

    Please provide the analysis in a JSON object with the following structure:
    {
      "subscriptions": [
        {
          "name": "Merchant Name",
          "amount": 12.99,
          "frequency": "monthly" | "weekly" | "yearly" | "quarterly",
          "confidence": 0.95,
          "transactions": ["transaction_id_1", "transaction_id_2"]
        }
      ],
      "spendingPatterns": [
        {
          "category": "Category Name",
          "totalAmount": 500.00,
          "transactionCount": 10,
          "averageAmount": 50.00,
          "trend": "increasing" | "stable" | "decreasing"
        }
      ],
      "summary": "A brief summary of the financial analysis.",
      "totalMonthlySubscriptions": 150.00
    }

    Based on the transactions, identify subscriptions. A subscription is a recurring payment to the same merchant with a similar amount at regular intervals (weekly, monthly, quarterly, yearly). Calculate a confidence score (0 to 1) for each identified subscription.

    Analyze spending patterns by categorizing transactions and calculating the total amount, transaction count, and average amount for each category. Determine the spending trend for each category by comparing spending over time.

    Provide a concise summary of the key insights from your analysis.

    Calculate the total estimated monthly cost of all identified subscriptions. For weekly subscriptions, multiply the amount by 4. For yearly, divide by 12.

    Return ONLY the JSON object. Do not include any other text or explanations.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: env.GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No content in Groq API response.");
    }

    const insights: AIInsights = JSON.parse(responseContent);
    return insights;
  } catch (error) {
    console.error("Error analyzing transactions with Groq:", error);
    return buildFallbackInsights(transactions, 0, 0, 0);
  }
}

export async function generateBudgetInsights(input: BudgetInsightsInput): Promise<BudgetInsights> {
  if (!groq) {
    return buildFallbackInsights(
      input.transactions,
      input.availableBalance,
      input.currentBalance,
      input.safeToSpendToday
    );
  }

  const prompt = `
You are a strict personal finance analyst. Analyze this user's finances and return ONLY JSON.

Financial context:
- availableBalance: ${input.availableBalance}
- currentBalance: ${input.currentBalance}
- safeToSpendToday: ${input.safeToSpendToday}

Transactions (up to 120 recent):
${JSON.stringify(input.transactions.slice(0, 120), null, 2)}

Return JSON with exactly this schema:
{
  "subscriptions": [{
    "name": "string",
    "amount": 0,
    "frequency": "weekly|monthly|quarterly|yearly",
    "confidence": 0,
    "transactions": ["transaction_id"]
  }],
  "spendingPatterns": [{
    "category": "string",
    "totalAmount": 0,
    "transactionCount": 0,
    "averageAmount": 0,
    "trend": "increasing|stable|decreasing"
  }],
  "summary": "string",
  "totalMonthlySubscriptions": 0,
  "budgetPlan": {
    "weeklyNeedsBudget": 0,
    "weeklyWantsBudget": 0,
    "weeklySavingsTarget": 0,
    "dailySpendingCap": 0,
    "next30DayCashFlow": 0
  },
  "nextPayday": "YYYY-MM-DD or null",
  "dangerDays": [{
    "date": "YYYY-MM-DD",
    "projectedBalance": 0,
    "severity": "watch|tight|critical",
    "reason": "string"
  }],
  "recommendations": [{
    "title": "string",
    "reason": "string",
    "impactPerMonth": 0
  }]
}

Rules:
- Treat positive transaction amounts as spending/outflow.
- Identify recurring subscriptions from merchant/name + interval consistency.
- Build a realistic budget using balances + spending habits.
- Infer paycheck cadence from income transactions (negative amounts) when possible.
- Predict danger days until next paycheck (or next 30 days if paycheck unknown).
- Danger days are dates where projected available balance is at risk (<$100 watch, <$50 tight, <=$0 critical).
- Provide 3-5 recommendations with concrete monthly impact estimates.
- Return JSON only, no markdown.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: env.GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in Groq API response");
    }

    const parsed = JSON.parse(content) as BudgetInsights;
    if (
      !parsed.budgetPlan ||
      !Array.isArray(parsed.recommendations) ||
      !Array.isArray(parsed.dangerDays)
    ) {
      throw new Error("Incomplete AI response");
    }
    return parsed;
  } catch (error) {
    console.error("Error generating budget insights with Groq:", error);
    return buildFallbackInsights(
      input.transactions,
      input.availableBalance,
      input.currentBalance,
      input.safeToSpendToday
    );
  }
}

function buildFallbackInsights(
  transactions: Transaction[],
  availableBalance: number,
  currentBalance: number,
  safeToSpendToday: number
): BudgetInsights {
  const spendingTxns = transactions.filter((t) => t.amount > 0);
  const monthlySpent = spendingTxns.reduce((sum, t) => sum + t.amount, 0);
  const subscriptions: Subscription[] = [];

  const merchantCounts = new Map<string, { total: number; count: number; ids: string[] }>();
  for (const t of spendingTxns) {
    const key = (t.merchant_name || t.name || "Unknown").trim();
    const entry = merchantCounts.get(key) || { total: 0, count: 0, ids: [] };
    entry.total += t.amount;
    entry.count += 1;
    entry.ids.push(t.transaction_id);
    merchantCounts.set(key, entry);
  }

  for (const [name, data] of merchantCounts.entries()) {
    if (data.count >= 2) {
      subscriptions.push({
        name,
        amount: Number((data.total / data.count).toFixed(2)),
        frequency: "monthly",
        confidence: 0.6,
        transactions: data.ids.slice(0, 4),
      });
    }
  }

  const byCategory = new Map<string, Transaction[]>();
  for (const t of spendingTxns) {
    const cat = t.category?.[0] || "Uncategorized";
    const arr = byCategory.get(cat) || [];
    arr.push(t);
    byCategory.set(cat, arr);
  }

  const spendingPatterns: SpendingPattern[] = Array.from(byCategory.entries())
    .map(([category, txns]): SpendingPattern => {
      const total = txns.reduce((sum, t) => sum + t.amount, 0);
      return {
        category,
        totalAmount: Number(total.toFixed(2)),
        transactionCount: txns.length,
        averageAmount: Number((total / Math.max(txns.length, 1)).toFixed(2)),
        trend: "stable",
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const totalMonthlySubscriptions = Number(
    subscriptions.reduce((sum, s) => sum + s.amount, 0).toFixed(2)
  );
  const weeklyBase = monthlySpent / 4.33;
  const dailySpendingCap = Math.max(safeToSpendToday, 0);
  const nextPayday = inferNextPayday(transactions);
  const dangerDays = projectDangerDays({
    startingBalance: availableBalance || currentBalance,
    transactions,
    horizonDays: nextPayday ? daysUntil(nextPayday) : 30,
  });

  return {
    subscriptions,
    spendingPatterns,
    summary:
      "AI fallback analysis was used. Connect more transaction history and add GROQ_API_KEY for richer budgeting guidance.",
    totalMonthlySubscriptions,
    budgetPlan: {
      weeklyNeedsBudget: Number((weeklyBase * 0.55).toFixed(2)),
      weeklyWantsBudget: Number((weeklyBase * 0.30).toFixed(2)),
      weeklySavingsTarget: Number((weeklyBase * 0.15).toFixed(2)),
      dailySpendingCap: Number(dailySpendingCap.toFixed(2)),
      next30DayCashFlow: Number((availableBalance - monthlySpent).toFixed(2)),
    },
    recommendations: [
      {
        title: "Review top recurring charges",
        reason: "Recurring merchants were detected and may include cancelable subscriptions.",
        impactPerMonth: Number((totalMonthlySubscriptions * 0.2).toFixed(2)),
      },
      {
        title: "Cap discretionary spend",
        reason: "A daily spending cap helps protect your balance until next payday.",
        impactPerMonth: Number((Math.max(currentBalance, availableBalance) * 0.05).toFixed(2)),
      },
      {
        title: "Automate a weekly transfer",
        reason: "Small automatic savings allocations improve consistency.",
        impactPerMonth: Number((weeklyBase * 0.15 * 4.33).toFixed(2)),
      },
    ],
    nextPayday,
    dangerDays,
  };
}

function inferNextPayday(transactions: Transaction[]): string | null {
  const incomeDates = transactions
    .filter((t) => t.amount < 0)
    .map((t) => new Date(`${t.date}T00:00:00`))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (incomeDates.length === 0) return null;
  const latest = incomeDates[0];

  let cadenceDays = 14;
  if (incomeDates.length >= 2) {
    const diffMs = Math.abs(incomeDates[0].getTime() - incomeDates[1].getTime());
    const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    cadenceDays = diffDays <= 10 ? 7 : diffDays <= 20 ? 14 : 30;
  }

  const next = new Date(latest);
  next.setDate(next.getDate() + cadenceDays);
  return next.toISOString().slice(0, 10);
}

function daysUntil(dateIso: string): number {
  const target = new Date(`${dateIso}T00:00:00`).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(30, diff));
}

function projectDangerDays(input: {
  startingBalance: number;
  transactions: Transaction[];
  horizonDays: number;
}): DangerDay[] {
  const spending = input.transactions.filter((t) => t.amount > 0);
  const avgDailySpend = spending.reduce((sum, t) => sum + t.amount, 0) / Math.max(30, spending.length);

  let projected = Number.isFinite(input.startingBalance) ? input.startingBalance : 0;
  const out: DangerDay[] = [];
  const today = new Date();

  for (let i = 1; i <= input.horizonDays; i++) {
    projected -= avgDailySpend;

    let severity: DangerDay["severity"] | null = null;
    if (projected <= 0) severity = "critical";
    else if (projected < 50) severity = "tight";
    else if (projected < 100) severity = "watch";

    if (severity) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      out.push({
        date: d.toISOString().slice(0, 10),
        projectedBalance: Number(projected.toFixed(2)),
        severity,
        reason:
          severity === "critical"
            ? "Projected balance drops to zero or below before payday."
            : severity === "tight"
            ? "Projected balance becomes very tight before payday."
            : "Projected balance enters watch range before payday.",
      });
    }

    if (out.length >= 5) break;
  }

  return out;
}

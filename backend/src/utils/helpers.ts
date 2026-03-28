import { RiskLevel, NormalizedTransaction } from "../types";
import { Transaction as PlaidTransaction } from "plaid";
import { Account } from "@prisma/client";

export function selectPrimaryAccount(accounts: Account[]): Account | null {
  const checking = accounts.find((a) => a.subtype === "checking");
  if (checking) return checking;
  const depository = accounts.find((a) => a.type === "depository");
  if (depository) return depository;
  return accounts[0] ?? null;
}

export function computeSafeToSpendToday(availableBalance: number | null, currentBalance: number | null, reserveBuffer: number): number {
  const balance = availableBalance ?? currentBalance ?? 0;
  return Math.max(balance - reserveBuffer, 0);
}

export function classifyRisk(safeToSpend: number): RiskLevel {
  if (safeToSpend > 100) return "CALM";
  if (safeToSpend >= 50) return "WATCH";
  if (safeToSpend >= 1) return "TIGHT";
  return "CRITICAL";
}

export function normalizeTransactions(plaidTransactions: PlaidTransaction[]): Array<{
  plaidTransactionId: string; plaidAccountId: string; name: string; amount: number;
  date: string; pending: boolean; categoryJson: string; rawJson: string;
}> {
  return plaidTransactions.map((t) => ({
    plaidTransactionId: t.transaction_id, plaidAccountId: t.account_id,
    name: t.name, amount: t.amount, date: t.date, pending: t.pending,
    categoryJson: JSON.stringify(t.category ?? []), rawJson: JSON.stringify(t),
  }));
}

export function toNormalizedTransaction(
  t: { plaidTransactionId: string; name: string; amount: number; date: string; pending: boolean; categoryJson: string | null }
): NormalizedTransaction {
  let category: string[] = [];
  try { category = JSON.parse(t.categoryJson ?? "[]"); } catch { /* ignore */ }
  return { id: t.plaidTransactionId, name: t.name, amount: t.amount, date: t.date, pending: t.pending, category };
}

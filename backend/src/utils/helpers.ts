import { RiskLevel, NormalizedTransaction } from "../types";
import { Transaction as PlaidTransaction } from "plaid";
import { Account } from "@prisma/client";

export const DEMO_TRANSACTION_PREFIX = "demo_txn_";

export function selectPrimaryAccount(accounts: Account[]): Account | null {
  const checking = accounts.find((a) => a.subtype === "checking");
  if (checking) return checking;
  const depository = accounts.find((a) => a.type === "depository");
  if (depository) return depository;
  return accounts[0] ?? null;
}

export function applyTransactionOffsetToBalance(balance: number | null | undefined, offset: number): number | null {
  if (balance === null || balance === undefined) return null;
  return Number((balance - offset).toFixed(2));
}

export function getAdjustedPrimaryBalances(account: Account, transactionOffset: number) {
  const currentBalance = applyTransactionOffsetToBalance(
    account.currentBalance ?? account.availableBalance ?? 0,
    transactionOffset
  );
  const availableBalance = applyTransactionOffsetToBalance(
    account.availableBalance ?? account.currentBalance ?? 0,
    transactionOffset
  );

  return {
    currentBalance,
    availableBalance,
  };
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

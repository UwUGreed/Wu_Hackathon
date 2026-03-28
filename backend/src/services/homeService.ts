import { prisma } from "../db/client";
import { env } from "../config/env";
import { HomeResponse } from "../types";
import {
  selectPrimaryAccount,
  computeSafeToSpendToday,
  classifyRisk,
  toNormalizedTransaction,
  DEMO_TRANSACTION_PREFIX,
  getAdjustedPrimaryBalances,
} from "../utils/helpers";
import * as plaidService from "./plaidService";

const UNLINKED_RESPONSE: HomeResponse = { institution: null, accountName: null, balance: null, availableBalance: null, safeToSpendToday: null, risk: null, linked: false, transactions: [] };

export async function buildHomeResponse(userId: string): Promise<HomeResponse> {
  const plaidItem = await prisma.plaidItem.findFirst({ where: { userId } });
  if (!plaidItem) return UNLINKED_RESPONSE;

  try {
    const freshAccounts = await plaidService.getAccountBalances(plaidItem.accessToken);
    for (const acct of freshAccounts) {
      await prisma.account.updateMany({ where: { plaidAccountId: acct.account_id }, data: { currentBalance: acct.balances.current, availableBalance: acct.balances.available } });
    }
  } catch (err) { console.warn("Failed to refresh balances from Plaid, using cached:", err); }

  const accounts = await prisma.account.findMany({ where: { userId } });
  if (accounts.length === 0) return UNLINKED_RESPONSE;

  const primary = selectPrimaryAccount(accounts);
  if (!primary) return UNLINKED_RESPONSE;

  const demoOffsetAggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      plaidAccountId: primary.plaidAccountId,
      plaidTransactionId: { startsWith: DEMO_TRANSACTION_PREFIX },
    },
    _sum: { amount: true },
  });

  const demoTransactionOffset = demoOffsetAggregate._sum.amount ?? 0;
  const adjustedBalances = getAdjustedPrimaryBalances(primary, demoTransactionOffset);
  const availableBalance = adjustedBalances.availableBalance ?? 0;
  const currentBalance = adjustedBalances.currentBalance ?? 0;
  const adjustedSafeToSpend = computeSafeToSpendToday(
    adjustedBalances.availableBalance,
    adjustedBalances.currentBalance,
    env.RESERVE_BUFFER_NUM
  );
  const risk = classifyRisk(adjustedSafeToSpend);

  const txns = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 25 });

  return {
    institution: plaidItem.institutionName ?? "Unknown", accountName: primary.officialName ?? primary.name,
    balance: currentBalance, availableBalance, safeToSpendToday: adjustedSafeToSpend,
    risk, linked: true, transactions: txns.map(toNormalizedTransaction),
  };
}

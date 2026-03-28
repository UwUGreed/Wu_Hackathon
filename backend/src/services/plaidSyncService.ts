import { prisma } from "../db/client";
import * as plaidService from "./plaidService";
import { normalizeTransactions } from "../utils/helpers";
import { buildHomeResponse } from "./homeService";

function getTransactionWindow() {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  return { startDate, endDate };
}

export async function syncPlaidItemForUser(userId: string, accessToken: string, itemId: string) {
  const item = await plaidService.getItem(accessToken);
  const institutionName = item.institution_id ? await plaidService.getInstitutionName(item.institution_id) : "Unknown Institution";
  const accounts = await plaidService.getAccountBalances(accessToken);
  const { startDate, endDate } = getTransactionWindow();
  const { transactions } = await plaidService.getTransactions(accessToken, startDate, endDate);
  const normalizedTransactions = normalizeTransactions(transactions);

  await prisma.$transaction(async (tx) => {
    await tx.transaction.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.plaidItem.deleteMany({ where: { userId } });
    await tx.plaidItem.create({ data: { userId, itemId, accessToken, institutionName } });
    for (const account of accounts) {
      await tx.account.create({
        data: {
          userId, plaidAccountId: account.account_id, itemId, name: account.name,
          officialName: account.official_name ?? null, type: account.type, subtype: account.subtype ?? null,
          mask: account.mask ?? null, currentBalance: account.balances.current, availableBalance: account.balances.available,
          isoCurrencyCode: account.balances.iso_currency_code ?? null,
        },
      });
    }
    for (const transaction of normalizedTransactions) {
      await tx.transaction.create({ data: { userId, ...transaction } });
    }
  });

  return buildHomeResponse(userId);
}

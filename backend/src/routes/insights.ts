import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../db/client";
import {
  toNormalizedTransaction,
  selectPrimaryAccount,
  computeSafeToSpendToday,
  DEMO_TRANSACTION_PREFIX,
  getAdjustedPrimaryBalances,
} from "../utils/helpers";
import { env } from "../config/env";
import { generateBudgetInsights } from "../services/aiService";

const router = Router();

router.get("/insights", authMiddleware, async (req: Request, res: Response) => {
  try {
    const [transactions, accounts, demoOffsetAggregate] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.user!.id },
        orderBy: { date: "desc" },
        take: 120,
      }),
      prisma.account.findMany({ where: { userId: req.user!.id } }),
      prisma.transaction.aggregate({
        where: {
          userId: req.user!.id,
          plaidTransactionId: { startsWith: DEMO_TRANSACTION_PREFIX },
        },
        _sum: { amount: true },
      }),
    ]);

    const normalizedTransactions = transactions.map(toNormalizedTransaction).map((t) => ({
      transaction_id: t.id,
      name: t.name,
      merchant_name: t.name,
      amount: t.amount,
      date: t.date,
      category: t.category,
    }));

    const primary = selectPrimaryAccount(accounts);
    const demoTransactionOffset = demoOffsetAggregate._sum.amount ?? 0;
    const adjustedBalances = primary
      ? getAdjustedPrimaryBalances(primary, demoTransactionOffset)
      : { currentBalance: 0, availableBalance: 0 };
    const availableBalance = adjustedBalances.availableBalance ?? 0;
    const currentBalance = adjustedBalances.currentBalance ?? 0;
    const safeToSpendToday = computeSafeToSpendToday(
      adjustedBalances.availableBalance,
      adjustedBalances.currentBalance,
      env.RESERVE_BUFFER_NUM
    );

    const insights = await generateBudgetInsights({
      availableBalance,
      currentBalance,
      safeToSpendToday,
      transactions: normalizedTransactions,
    });

    res.json(insights);
  } catch (err: any) {
    console.error("insights error:", err);
    res.status(500).json({
      error: {
        code: "INSIGHTS_ERROR",
        message: "Failed to generate AI budget insights",
      },
    });
  }
});

export default router;

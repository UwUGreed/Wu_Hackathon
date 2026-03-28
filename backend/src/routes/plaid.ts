import { Router, Request, Response } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../db/client";
import { normalizeTransactions } from "../utils/helpers";
import * as plaidService from "../services/plaidService";
import { syncPlaidItemForUser } from "../services/plaidSyncService";

const router = Router();

router.post("/plaid/link-token", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = await plaidService.createLinkToken(req.user!.id);
    res.json({ link_token: data.link_token, expiration: data.expiration });
  } catch (err: any) {
    console.error("createLinkToken error:", err?.response?.data ?? err);
    res.status(500).json({ error: { code: "PLAID_LINK_TOKEN_ERROR", message: "Failed to create link token" } });
  }
});

const exchangeSchema = z.object({ public_token: z.string().min(1, "public_token is required") });

router.post("/plaid/exchange-public-token", authMiddleware, async (req: Request, res: Response) => {
  const parsed = exchangeSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: { code: "INVALID_BODY", message: parsed.error.issues[0].message } }); return; }
  const userId = req.user!.id;
  try {
    const exchangeData = await plaidService.exchangePublicToken(parsed.data.public_token);
    const homeData = await syncPlaidItemForUser(userId, exchangeData.access_token, exchangeData.item_id);
    res.json({ success: true, ...homeData });
  } catch (err: any) {
    console.error("exchangePublicToken error:", err?.response?.data ?? err);
    res.status(500).json({ error: { code: "PLAID_EXCHANGE_ERROR", message: "Failed to exchange public token and fetch data" } });
  }
});

router.post("/plaid/unlink-all", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.plaidItem.deleteMany({ where: { userId } }),
    ]);
    res.json({ success: true, message: "All linked bank accounts were removed" });
  } catch (err: any) {
    console.error("unlink-all error:", err?.response?.data ?? err);
    res.status(500).json({ error: { code: "PLAID_UNLINK_ERROR", message: "Failed to unlink all banks" } });
  }
});

router.post("/plaid/webhook", async (req: Request, res: Response) => {
  console.log("Plaid webhook received:", JSON.stringify(req.body, null, 2));
  res.json({ received: true });
  const itemId = req.body?.item_id;
  if (!itemId) return;
  try {
    const plaidItem = await prisma.plaidItem.findUnique({ where: { itemId } });
    if (!plaidItem) { console.warn("Webhook: no matching item for", itemId); return; }
    const accounts = await plaidService.getAccountBalances(plaidItem.accessToken);
    for (const acct of accounts) {
      await prisma.account.updateMany({ where: { plaidAccountId: acct.account_id }, data: { currentBalance: acct.balances.current, availableBalance: acct.balances.available } });
    }
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { transactions } = await plaidService.getTransactions(plaidItem.accessToken, startDate, endDate);
    const normalized = normalizeTransactions(transactions);
    for (const t of normalized) {
      await prisma.transaction.upsert({ where: { plaidTransactionId: t.plaidTransactionId }, create: { userId: plaidItem.userId, ...t }, update: { ...t } });
    }
    console.log(`Webhook refresh complete for item ${itemId}`);
  } catch (err) { console.error("Webhook background refresh error:", err); }
});

export default router;

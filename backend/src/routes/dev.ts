import { Router, Request, Response } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../db/client";
import * as plaidService from "../services/plaidService";
import { syncPlaidItemForUser } from "../services/plaidSyncService";
import { buildHomeResponse } from "../services/homeService";
import { Products } from "plaid";
import { DEMO_TRANSACTION_PREFIX, selectPrimaryAccount, toNormalizedTransaction } from "../utils/helpers";

const router = Router();
const seedSchema = z.object({ institution_id: z.string().default("ins_109508"), seed: z.string().trim().min(1).optional() });

const demoTransactionFixtures = [
  {
    name: "Starbucks Reserve",
    amount: 8.75,
    category: ["Food and Drink", "Coffee Shop"],
  },
  {
    name: "Target Run",
    amount: 42.19,
    category: ["Shops", "Department Stores"],
  },
  {
    name: "Shell Fuel",
    amount: 31.46,
    category: ["Travel", "Gas Stations"],
  },
  {
    name: "Netflix",
    amount: 15.49,
    category: ["Service", "Subscription"],
  },
  {
    name: 'Sweetgreen Lunch',
    amount: 16.84,
    category: ["Food and Drink", "Restaurants"],
  },
];

router.post("/dev/seed-custom-user", authMiddleware, async (req: Request, res: Response) => {
  const parsed = seedSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: { code: "INVALID_BODY", message: parsed.error.issues[0].message } }); return; }
  const userId = req.user!.id;
  const seed = parsed.data.seed ?? req.user!.displayName.trim().toLowerCase();
  try {
    const sandboxData = await plaidService.createSandboxPublicToken(parsed.data.institution_id, [Products.Transactions], seed);
    const exchangeData = await plaidService.exchangePublicToken(sandboxData.public_token);
    const homeData = await syncPlaidItemForUser(userId, exchangeData.access_token, exchangeData.item_id);
    res.json({ success: true, ...homeData });
  } catch (err: any) {
    console.error("seed-custom-user error:", err?.response?.data ?? err);
    res.status(500).json({ error: { code: "SEED_ERROR", message: "Failed to seed custom user" } });
  }
});

router.post("/dev/reset-demo", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    await prisma.transaction.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.plaidItem.deleteMany({ where: { userId } });
    res.json({ success: true, message: "Demo data reset" });
  } catch (err: any) {
    console.error("reset-demo error:", err);
    res.status(500).json({ error: { code: "RESET_ERROR", message: "Failed to reset demo data" } });
  }
});

router.post("/dev/simulate-transaction", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const accounts = await prisma.account.findMany({ where: { userId } });
    const primary = selectPrimaryAccount(accounts);

    if (!primary) {
      res.status(400).json({
        error: {
          code: "NO_LINKED_ACCOUNT",
          message: "Link a bank account before running the transaction demo test",
        },
      });
      return;
    }

    const fixture = demoTransactionFixtures[Math.floor(Math.random() * demoTransactionFixtures.length)];
    const now = new Date();
    const created = await prisma.transaction.create({
      data: {
        userId,
        plaidTransactionId: `${DEMO_TRANSACTION_PREFIX}${now.getTime()}`,
        plaidAccountId: primary.plaidAccountId,
        name: fixture.name,
        amount: fixture.amount,
        date: now.toISOString().slice(0, 10),
        pending: false,
        categoryJson: JSON.stringify(fixture.category),
        rawJson: JSON.stringify({
          source: "demo",
          createdAt: now.toISOString(),
          ...fixture,
        }),
      },
    });

    const homeData = await buildHomeResponse(userId);

    res.json({
      success: true,
      message: "Demo transaction created",
      transaction: toNormalizedTransaction(created),
      homeData,
    });
  } catch (err: any) {
    console.error("simulate-transaction error:", err);
    res.status(500).json({
      error: {
        code: "SIMULATE_TRANSACTION_ERROR",
        message: "Failed to simulate demo transaction",
      },
    });
  }
});

export default router;

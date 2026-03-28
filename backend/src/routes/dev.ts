import { Router, Request, Response } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../db/client";
import * as plaidService from "../services/plaidService";
import { syncPlaidItemForUser } from "../services/plaidSyncService";
import { Products } from "plaid";

const router = Router();
const seedSchema = z.object({ institution_id: z.string().default("ins_109508"), seed: z.string().trim().min(1).optional() });

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

export default router;

import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../db/client";

const router = Router();

router.get("/accounts", authMiddleware, async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: "asc" } });
    res.json({
      accounts: accounts.map((a) => ({
        id: a.plaidAccountId, name: a.name, officialName: a.officialName, type: a.type,
        subtype: a.subtype, mask: a.mask, currentBalance: a.currentBalance,
        availableBalance: a.availableBalance, isoCurrencyCode: a.isoCurrencyCode,
      })),
    });
  } catch (err: any) {
    console.error("accounts error:", err);
    res.status(500).json({ error: { code: "ACCOUNTS_ERROR", message: "Failed to fetch accounts" } });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { prisma } from "../db/client";
import { toNormalizedTransaction } from "../utils/helpers";

const router = Router();

router.get("/transactions", authMiddleware, async (req: Request, res: Response) => {
  try {
    const txns = await prisma.transaction.findMany({ where: { userId: req.user!.id }, orderBy: { date: "desc" } });
    res.json({ transactions: txns.map(toNormalizedTransaction) });
  } catch (err: any) {
    console.error("transactions error:", err);
    res.status(500).json({ error: { code: "TRANSACTIONS_ERROR", message: "Failed to fetch transactions" } });
  }
});

export default router;

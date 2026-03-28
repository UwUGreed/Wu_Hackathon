import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { buildHomeResponse } from "../services/homeService";

const router = Router();

router.get("/home", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = await buildHomeResponse(req.user!.id);
    res.json(data);
  } catch (err: any) {
    console.error("buildHomeResponse error:", err);
    res.status(500).json({ error: { code: "HOME_ERROR", message: "Failed to build home data" } });
  }
});

export default router;

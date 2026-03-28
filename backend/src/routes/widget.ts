import { Request, Response, Router } from "express";
import { prisma } from "../db/client";
import { buildHomeResponse } from "../services/homeService";
import { WidgetMood, WidgetSummaryResponse } from "../types";

const router = Router();

const riskToMood: Record<string, WidgetMood> = {
  CALM: "happy",
  WATCH: "calm",
  TIGHT: "worried",
  CRITICAL: "alert",
};

const riskMessages: Record<string, string> = {
  CALM: "You're doing great. Spend freely today.",
  WATCH: "Looking okay. Keep an eye on extras.",
  TIGHT: "Getting tight. Hold off on nonessentials.",
  CRITICAL: "Very little room left until payday.",
};

function getWidgetToken(req: Request) {
  const queryToken = typeof req.query.token === "string" ? req.query.token.trim() : "";
  if (queryToken) return queryToken;

  const headerToken = typeof req.headers["x-widget-token"] === "string" ? req.headers["x-widget-token"].trim() : "";
  if (headerToken) return headerToken;

  return null;
}

router.get("/widget/summary", async (req: Request, res: Response) => {
  const token = getWidgetToken(req);
  if (!token) {
    res.status(401).json({ error: { code: "MISSING_WIDGET_TOKEN", message: "Widget token is required" } });
    return;
  }

  const rows = await prisma.$queryRaw<Array<{ id: string; displayName: string }>>`
    SELECT id, display_name AS displayName
    FROM users
    WHERE widget_token = ${token}
    LIMIT 1
  `;

  const user = rows[0];
  if (!user) {
    res.status(401).json({ error: { code: "INVALID_WIDGET_TOKEN", message: "Invalid widget token" } });
    return;
  }

  try {
    const home = await buildHomeResponse(user.id);
    const mood = home.risk ? (riskToMood[home.risk] ?? "calm") : "sleepy";
    const message = home.risk
      ? (riskMessages[home.risk] ?? "Check in with your spending today.")
      : "Link your bank in Make It to Payday to fill this widget.";

    const response: WidgetSummaryResponse = {
      linked: home.linked,
      displayName: user.displayName,
      institution: home.institution,
      safeToSpendToday: home.safeToSpendToday,
      risk: home.risk,
      mood,
      message,
      updatedAt: new Date().toISOString(),
    };

    res.json(response);
  } catch (err: any) {
    console.error("widget summary error:", err);
    res.status(500).json({ error: { code: "WIDGET_SUMMARY_ERROR", message: "Failed to build widget summary" } });
  }
});

export default router;

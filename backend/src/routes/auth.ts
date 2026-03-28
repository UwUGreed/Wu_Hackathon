import { randomBytes, randomUUID, createHash } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/client";
import { env } from "../config/env";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const loginSchema = z.object({ username: z.string().trim().min(1, "Username is required"), password: z.string().min(1, "Password is required") });

function normalizeUsername(username: string) { return username.trim().toLowerCase(); }
function usernameToEmail(username: string) { return createHash("sha256").update(normalizeUsername(username)).digest("hex").slice(0, 24) + "@demo.local"; }
function createAuthToken() { return randomBytes(24).toString("hex"); }
function createWidgetToken() { return randomBytes(18).toString("hex"); }

async function ensureWidgetToken(userId: string) {
  const rows = await prisma.$queryRaw<Array<{ widgetToken: string | null }>>`
    SELECT widget_token AS widgetToken
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  const existingToken = rows[0]?.widgetToken ?? null;
  if (existingToken) return existingToken;

  const widgetToken = createWidgetToken();
  await prisma.$executeRaw`
    UPDATE users
    SET widget_token = ${widgetToken}
    WHERE id = ${userId}
  `;

  return widgetToken;
}

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: { code: "INVALID_BODY", message: parsed.error.issues[0].message } }); return; }
  const { username, password } = parsed.data;
  if (password !== env.DEMO_PASSWORD) { res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" } }); return; }

  const authToken = createAuthToken();
  const displayName = username.trim();
  const email = usernameToEmail(displayName);

  let user = await prisma.user.upsert({
    where: { email },
    create: { id: randomUUID(), email, displayName, authToken },
    update: { displayName, authToken },
  });
  const widgetToken = await ensureWidgetToken(user.id);

  // Clean slate on every login
  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId: user.id } }),
    prisma.account.deleteMany({ where: { userId: user.id } }),
    prisma.plaidItem.deleteMany({ where: { userId: user.id } }),
  ]);

  res.json({
    token: authToken,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      widgetToken,
    },
  });
});

router.get("/auth/me", authMiddleware, async (req, res) => {
  const user = req.user!;
  const widgetToken = await ensureWidgetToken(user.id);
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    widgetToken,
  });
});

export default router;

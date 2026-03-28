import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/client";
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) { res.status(401).json({ error: { code: "MISSING_AUTH", message: "Authorization header is required" } }); return; }
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") { res.status(401).json({ error: { code: "INVALID_AUTH_FORMAT", message: "Expected: Bearer <token>" } }); return; }
  const user = await prisma.user.findFirst({ where: { authToken: parts[1] } });
  if (!user) { res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Invalid auth token" } }); return; }
  req.user = user;
  next();
}

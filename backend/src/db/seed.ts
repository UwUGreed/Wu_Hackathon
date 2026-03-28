import { prisma } from "./client";
async function seed() {
  const existing = await prisma.user.findUnique({ where: { id: "demo-user-1" } });
  if (existing) { console.log("Demo user already exists"); return; }
  await prisma.user.create({ data: { id: "demo-user-1", email: "demo@student.com", displayName: "Demo User", authToken: "demo-token" } });
  console.log("Demo user seeded: demo-user-1");
}
seed().catch((e) => { console.error("Seed error:", e); process.exit(1); }).finally(() => prisma.$disconnect());

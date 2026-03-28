import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const envSchema = z.object({
  PORT: z.string().default("3001"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PLAID_CLIENT_ID: z.string().min(1, "PLAID_CLIENT_ID is required"),
  PLAID_SECRET: z.string().min(1, "PLAID_SECRET is required"),
  PLAID_ENV: z.enum(["sandbox", "development", "production"]).default("sandbox"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  DEMO_AUTH_TOKEN: z.string().default("demo-token"),
  DEMO_PASSWORD: z.string().default("payday"),
  RESERVE_BUFFER: z.string().default("75"),
  DATABASE_URL: z.string().default("file:./dev.db"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) { console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors); process.exit(1); }
export const env = { ...parsed.data, PORT_NUM: parseInt(parsed.data.PORT, 10), RESERVE_BUFFER_NUM: parseInt(parsed.data.RESERVE_BUFFER, 10) };

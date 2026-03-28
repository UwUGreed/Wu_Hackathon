import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load .env from the backend root even when the process is started elsewhere.
const backendRootEnvPath = path.resolve(__dirname, "../../.env");

const backendEnvLoad = dotenv.config({ path: backendRootEnvPath, override: true });
if (backendEnvLoad.error) {
  dotenv.config({ override: true });
}

const envSchema = z.object({
  PORT: z.string().default("3001"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PLAID_CLIENT_ID: z.string().min(1, "PLAID_CLIENT_ID is required"),
  PLAID_SECRET: z.string().min(1, "PLAID_SECRET is required"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
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

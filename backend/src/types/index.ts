import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export type RiskLevel = "CALM" | "WATCH" | "TIGHT" | "CRITICAL";

export interface HomeResponse {
  institution: string | null;
  accountName: string | null;
  balance: number | null;
  availableBalance: number | null;
  safeToSpendToday: number | null;
  risk: RiskLevel | null;
  linked: boolean;
  transactions: NormalizedTransaction[];
}

export interface NormalizedTransaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  category: string[];
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

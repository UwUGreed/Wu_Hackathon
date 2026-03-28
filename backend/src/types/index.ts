import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export type RiskLevel = "CALM" | "WATCH" | "TIGHT" | "CRITICAL";
export type WidgetMood = "happy" | "calm" | "worried" | "alert" | "sleepy";

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

export interface WidgetSummaryResponse {
  linked: boolean;
  displayName: string;
  institution: string | null;
  safeToSpendToday: number | null;
  risk: RiskLevel | null;
  mood: WidgetMood;
  message: string;
  updatedAt: string;
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

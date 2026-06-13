// ═══════════════════════════════════════════════════
// WishList — Core Type Definitions
// ═══════════════════════════════════════════════════

export type GoalType =
  | "TRAVEL"
  | "HOUSE"
  | "CAR"
  | "EDUCATION"
  | "WEDDING"
  | "EMERGENCY"
  | "RETIREMENT"
  | "BUSINESS"
  | "BIKE"
  | "GADGET"
  | "RENOVATION"
  | "OTHER";

export type RiskAppetite = "conservative" | "balanced" | "aggressive";

export type GoalStatus = "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "COMPLETED";

export type Plan = "FREE" | "PRO" | "PREMIUM";

export type InsightType = "warning" | "suggestion" | "positive";
export type ImpactLevel = "high" | "medium" | "low";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetDate: Date;
  targetAmountToday: number;
  inflationRate: number;
  currentCorpus: number;
  currentSIP: number;
  lumpSumAvailable: number;
  riskAppetite: RiskAppetite;
  priority: number;
  status: GoalStatus;
  aiInsights?: AIInsights;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan: Plan;
  goals: Goal[];
  createdAt: Date;
}

export interface AIInsights {
  explanation: string;
  insights: AIInsight[];
  instruments: InvestmentInstrument[];
  riskWarning: string | null;
}

export interface AIInsight {
  type: InsightType;
  text: string;
  impact: ImpactLevel;
}

export interface InvestmentInstrument {
  name: string;
  allocation: number;
  expectedReturn: string;
  risk: string;
  why?: string;
}

export interface AllocationMap {
  equity: number;
  debt: number;
  gold: number;
  cash: number;
}

export interface InvestmentCategory {
  name: string;
  instruments: string[];
  expectedReturn: { min: number; max: number };
  risk: RiskAppetite;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  chartData?: number[];
}

export interface GoalTypeOption {
  type: GoalType;
  emoji: string;
  label: string;
}

export const GOAL_TYPE_OPTIONS: GoalTypeOption[] = [
  { type: "TRAVEL", emoji: "🌍", label: "Europe Trip" },
  { type: "HOUSE", emoji: "🏠", label: "Buy a House" },
  { type: "CAR", emoji: "🚗", label: "Buy a Car" },
  { type: "EDUCATION", emoji: "🎓", label: "Education" },
  { type: "WEDDING", emoji: "💍", label: "Wedding" },
  { type: "EMERGENCY", emoji: "🛡️", label: "Emergency Fund" },
  { type: "RETIREMENT", emoji: "👴", label: "Retirement" },
  { type: "BUSINESS", emoji: "🚀", label: "Business" },
  { type: "TRAVEL", emoji: "✈️", label: "World Tour" },
  { type: "BIKE", emoji: "🏍️", label: "Dream Bike" },
  { type: "GADGET", emoji: "💻", label: "MacBook" },
  { type: "RENOVATION", emoji: "🏗️", label: "Renovation" },
];

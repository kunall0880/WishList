import { create } from "zustand";
import type { Goal, GoalStatus, RiskAppetite } from "@/types";

/**
 * Mock goals data for development.
 * These provide realistic data across all dashboard views.
 */
const MOCK_GOALS: Goal[] = [
  {
    id: "goal-1",
    userId: "user-1",
    name: "Europe Trip",
    type: "TRAVEL",
    targetDate: new Date("2027-12-01"),
    targetAmountToday: 420000,
    inflationRate: 6,
    currentCorpus: 40000,
    currentSIP: 8250,
    lumpSumAvailable: 0,
    riskAppetite: "balanced",
    priority: 4,
    status: "ON_TRACK",
    aiInsights: {
      explanation:
        "To achieve your Europe Trip goal of ₹4.2L (₹5.1L inflation-adjusted) by December 2027, you need to invest ₹8,250 every month in a Short Duration Debt Fund returning ~8% annually. Your current corpus of ₹40,000 gives you a head start. Based on these projections, your goal has an 82% probability of success.",
      insights: [
        {
          type: "warning",
          text: "Increase SIP by ₹2,500/mo for 95% success rate",
          impact: "high",
        },
        {
          type: "suggestion",
          text: "Add ₹50,000 lump sum to reduce monthly burden 18%",
          impact: "medium",
        },
        {
          type: "positive",
          text: "Current allocation is well-suited for your timeline",
          impact: "low",
        },
        {
          type: "suggestion",
          text: "Switch to Flexi Cap for 2% better RoI potential",
          impact: "medium",
        },
      ],
      instruments: [
        {
          name: "Liquid Fund",
          allocation: 30,
          expectedReturn: "5–6%",
          risk: "Low",
        },
        {
          name: "Short Duration Debt Fund",
          allocation: 50,
          expectedReturn: "7–8%",
          risk: "Low",
        },
        {
          name: "Arbitrage Fund",
          allocation: 20,
          expectedReturn: "6–7%",
          risk: "Low",
        },
      ],
      riskWarning:
        "Past returns do not guarantee future performance. Debt fund returns may vary based on interest rate movements.",
    },
    createdAt: new Date("2025-06-15"),
    updatedAt: new Date("2025-06-15"),
  },
  {
    id: "goal-2",
    userId: "user-1",
    name: "Buy a House",
    type: "HOUSE",
    targetDate: new Date("2030-06-01"),
    targetAmountToday: 2500000,
    inflationRate: 6,
    currentCorpus: 300000,
    currentSIP: 25000,
    lumpSumAvailable: 100000,
    riskAppetite: "aggressive",
    priority: 5,
    status: "ON_TRACK",
    aiInsights: {
      explanation:
        "For your home down payment of ₹25L, you need ₹25,000/month in a diversified equity portfolio. Your ₹3L corpus and aggressive risk profile allow for higher equity allocation targeting 12-14% returns.",
      insights: [
        {
          type: "positive",
          text: "On track with current SIP of ₹25,000/month",
          impact: "high",
        },
        {
          type: "suggestion",
          text: "Consider lump sum of ₹1L to boost corpus by 4%",
          impact: "medium",
        },
      ],
      instruments: [
        {
          name: "Flexi Cap Fund",
          allocation: 50,
          expectedReturn: "12–14%",
          risk: "High",
        },
        {
          name: "Mid Cap Fund",
          allocation: 30,
          expectedReturn: "13–15%",
          risk: "High",
        },
        {
          name: "Index Fund (Nifty 50)",
          allocation: 20,
          expectedReturn: "11–13%",
          risk: "Moderate",
        },
      ],
      riskWarning:
        "Equity investments are subject to market risk. Consider rebalancing to debt funds 2 years before your target date.",
    },
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "goal-3",
    userId: "user-1",
    name: "Emergency Fund",
    type: "EMERGENCY",
    targetDate: new Date("2026-03-01"),
    targetAmountToday: 300000,
    inflationRate: 6,
    currentCorpus: 180000,
    currentSIP: 15000,
    lumpSumAvailable: 0,
    riskAppetite: "conservative",
    priority: 5,
    status: "ON_TRACK",
    aiInsights: {
      explanation:
        "Your emergency fund is 60% funded at ₹1.8L. At ₹15,000/month in liquid funds, you'll reach ₹3L by March 2026.",
      insights: [
        {
          type: "positive",
          text: "Already 60% of the way to your target",
          impact: "high",
        },
      ],
      instruments: [
        {
          name: "Liquid Fund",
          allocation: 70,
          expectedReturn: "5–6%",
          risk: "Very Low",
        },
        {
          name: "Savings Account",
          allocation: 30,
          expectedReturn: "3–4%",
          risk: "Very Low",
        },
      ],
      riskWarning: null,
    },
    createdAt: new Date("2025-04-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "goal-4",
    userId: "user-1",
    name: "New Car",
    type: "CAR",
    targetDate: new Date("2028-01-01"),
    targetAmountToday: 800000,
    inflationRate: 6,
    currentCorpus: 50000,
    currentSIP: 12000,
    lumpSumAvailable: 0,
    riskAppetite: "balanced",
    priority: 3,
    status: "AT_RISK",
    aiInsights: {
      explanation:
        "Your car goal of ₹8L needs ₹15,000/month but you're currently investing ₹12,000. Consider increasing SIP or extending timeline by 6 months.",
      insights: [
        {
          type: "warning",
          text: "Current SIP ₹3,000 short of required amount",
          impact: "high",
        },
        {
          type: "suggestion",
          text: "Increase SIP to ₹15,000 or extend to July 2028",
          impact: "high",
        },
      ],
      instruments: [
        {
          name: "Balanced Advantage Fund",
          allocation: 50,
          expectedReturn: "9–11%",
          risk: "Moderate",
        },
        {
          name: "Short Duration Debt Fund",
          allocation: 30,
          expectedReturn: "7–8%",
          risk: "Low",
        },
        {
          name: "Liquid Fund",
          allocation: 20,
          expectedReturn: "5–6%",
          risk: "Very Low",
        },
      ],
      riskWarning: null,
    },
    createdAt: new Date("2025-03-20"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "goal-5",
    userId: "user-1",
    name: "Daughter's Education",
    type: "EDUCATION",
    targetDate: new Date("2035-06-01"),
    targetAmountToday: 5000000,
    inflationRate: 8,
    currentCorpus: 200000,
    currentSIP: 15000,
    lumpSumAvailable: 0,
    riskAppetite: "aggressive",
    priority: 5,
    status: "ON_TRACK",
    aiInsights: {
      explanation:
        "With a 10-year horizon, your ₹50L education goal benefits from equity-heavy allocation. ₹15,000/month with 13% expected returns projects well.",
      insights: [
        {
          type: "positive",
          text: "Long horizon allows for aggressive equity exposure",
          impact: "high",
        },
        {
          type: "suggestion",
          text: "Increase SIP annually by 10% with salary growth",
          impact: "medium",
        },
      ],
      instruments: [
        {
          name: "Small Cap Fund",
          allocation: 40,
          expectedReturn: "14–18%",
          risk: "Very High",
        },
        {
          name: "Flexi Cap Fund",
          allocation: 40,
          expectedReturn: "12–14%",
          risk: "High",
        },
        {
          name: "Index Fund (Nifty Next 50)",
          allocation: 20,
          expectedReturn: "12–15%",
          risk: "High",
        },
      ],
      riskWarning:
        "Small cap funds can be volatile in the short term. Plan to shift to debt 3 years before the goal.",
    },
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "goal-6",
    userId: "user-1",
    name: "Retirement",
    type: "RETIREMENT",
    targetDate: new Date("2050-01-01"),
    targetAmountToday: 50000000,
    inflationRate: 6,
    currentCorpus: 500000,
    currentSIP: 20000,
    lumpSumAvailable: 0,
    riskAppetite: "aggressive",
    priority: 4,
    status: "ON_TRACK",
    aiInsights: {
      explanation:
        "Your retirement corpus of ₹5Cr is achievable with ₹20,000/month over 25 years in a diversified equity portfolio targeting 13% returns.",
      insights: [
        {
          type: "positive",
          text: "25-year horizon is ideal for wealth compounding",
          impact: "high",
        },
        {
          type: "suggestion",
          text: "Step-up SIP by 10% yearly to reach goal faster",
          impact: "high",
        },
      ],
      instruments: [
        {
          name: "Flexi Cap Fund",
          allocation: 40,
          expectedReturn: "12–14%",
          risk: "High",
        },
        {
          name: "Mid Cap Fund",
          allocation: 35,
          expectedReturn: "13–15%",
          risk: "High",
        },
        {
          name: "Index Fund (Nifty 50)",
          allocation: 25,
          expectedReturn: "11–13%",
          risk: "Moderate",
        },
      ],
      riskWarning:
        "Review and rebalance portfolio every 5 years. Shift to conservative allocation 5 years before retirement.",
    },
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "goal-7",
    userId: "user-1",
    name: "Dream Bike",
    type: "BIKE",
    targetDate: new Date("2026-12-01"),
    targetAmountToday: 250000,
    inflationRate: 6,
    currentCorpus: 80000,
    currentSIP: 10000,
    lumpSumAvailable: 0,
    riskAppetite: "balanced",
    priority: 2,
    status: "ON_TRACK",
    aiInsights: {
      explanation:
        "Your bike goal is well-funded. ₹10,000/month for 18 months with your existing ₹80K corpus will comfortably reach ₹2.5L.",
      insights: [
        {
          type: "positive",
          text: "On track to achieve goal 2 months early",
          impact: "medium",
        },
      ],
      instruments: [
        {
          name: "Liquid Fund",
          allocation: 50,
          expectedReturn: "5–6%",
          risk: "Very Low",
        },
        {
          name: "Ultra Short Duration Fund",
          allocation: 50,
          expectedReturn: "5.5–6.5%",
          risk: "Low",
        },
      ],
      riskWarning: null,
    },
    createdAt: new Date("2025-05-01"),
    updatedAt: new Date("2025-06-01"),
  },
  {
    id: "goal-8",
    userId: "user-1",
    name: "Wedding Fund",
    type: "WEDDING",
    targetDate: new Date("2029-02-01"),
    targetAmountToday: 1500000,
    inflationRate: 7,
    currentCorpus: 100000,
    currentSIP: 18000,
    lumpSumAvailable: 50000,
    riskAppetite: "balanced",
    priority: 4,
    status: "AT_RISK",
    aiInsights: {
      explanation:
        "Your wedding fund of ₹15L needs careful planning. Current SIP of ₹18,000 is slightly below the recommended ₹20,000. Consider the lump sum to bridge the gap.",
      insights: [
        {
          type: "warning",
          text: "SIP ₹2,000 below recommended for 90% success",
          impact: "high",
        },
        {
          type: "suggestion",
          text: "Deploy ₹50K lump sum to improve success to 85%",
          impact: "medium",
        },
      ],
      instruments: [
        {
          name: "Aggressive Hybrid Fund",
          allocation: 45,
          expectedReturn: "10–12%",
          risk: "Moderate",
        },
        {
          name: "Corporate Bond Fund",
          allocation: 35,
          expectedReturn: "7–8%",
          risk: "Low",
        },
        {
          name: "Arbitrage Fund",
          allocation: 20,
          expectedReturn: "6–7%",
          risk: "Low",
        },
      ],
      riskWarning: null,
    },
    createdAt: new Date("2025-04-15"),
    updatedAt: new Date("2025-06-01"),
  },
];

interface GoalStore {
  goals: Goal[];
  selectedGoalId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  removeGoal: (id: string) => void;
  selectGoal: (id: string | null) => void;
  getGoalById: (id: string) => Goal | undefined;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  totalMonthlyInvestment: () => number;
  totalCorpus: () => number;
  goalsByStatus: (status: GoalStatus) => Goal[];
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  selectedGoalId: null,
  isLoading: false,
  error: null,

  setGoals: (goals) => set({ goals }),

  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),

  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
      ),
    })),

  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
      selectedGoalId:
        state.selectedGoalId === id ? null : state.selectedGoalId,
    })),

  removeGoal: (id) => get().deleteGoal(id),

  selectGoal: (id) => set({ selectedGoalId: id }),

  getGoalById: (id) => get().goals.find((g) => g.id === id),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  totalMonthlyInvestment: () =>
    get().goals.reduce((sum, g) => sum + g.currentSIP, 0),

  totalCorpus: () =>
    get().goals.reduce((sum, g) => sum + g.currentCorpus, 0),

  goalsByStatus: (status) => get().goals.filter((g) => g.status === status),
}));

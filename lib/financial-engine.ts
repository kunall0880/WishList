/**
 * WishList — Financial Calculation Engine
 *
 * Pure TypeScript functions for all financial computations.
 * No external dependencies — pure math only.
 *
 * Formulas reference:
 * - FV = PV × (1 + r)^n                           (Lump sum future value)
 * - SIP FV = P × [((1+r)^n - 1) / r] × (1+r)     (Annuity due formula)
 * - Required SIP = FV × r / [((1+r)^n - 1) × (1+r)] (Reverse SIP)
 */

import type { RiskAppetite, AllocationMap, InvestmentCategory } from "@/types";

/**
 * Future value adjusted for inflation.
 * Answers: "What will ₹X today cost in Y years?"
 *
 * Formula: FV = PV × (1 + inflationRate)^years
 */
export function inflationAdjustedFV(
  presentValue: number,
  inflationRate: number,
  years: number
): number {
  return presentValue * Math.pow(1 + inflationRate / 100, years);
}

/**
 * Future value of a Systematic Investment Plan (SIP).
 * Assumes monthly contributions at the beginning of each month.
 *
 * Formula: FV = P × [((1 + r)^n - 1) / r] × (1 + r)
 * where r = monthly rate, n = total months
 */
export function sipFutureValue(
  monthlyAmount: number,
  annualReturn: number,
  months: number
): number {
  if (months <= 0 || monthlyAmount <= 0) return 0;
  const monthlyRate = annualReturn / 100 / 12;
  if (monthlyRate === 0) return monthlyAmount * months;

  return (
    monthlyAmount *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)
  );
}

/**
 * Calculate the required monthly SIP to reach a target amount.
 * Takes into account existing corpus that will grow.
 *
 * Reverse of sipFutureValue, minus the growth of existing corpus.
 */
export function requiredSIP(
  targetAmount: number,
  annualReturn: number,
  months: number,
  currentCorpus: number = 0
): number {
  if (months <= 0) return targetAmount - currentCorpus;
  const monthlyRate = annualReturn / 100 / 12;

  // Future value of current corpus
  const corpusFV = currentCorpus * Math.pow(1 + monthlyRate, months);

  // Remaining amount to be funded via SIP
  const remaining = targetAmount - corpusFV;
  if (remaining <= 0) return 0;

  if (monthlyRate === 0) return remaining / months;

  // SIP = remaining × r / [((1+r)^n - 1) × (1+r)]
  return (
    remaining /
    (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate))
  );
}

/**
 * Calculate the lump sum needed today to reach a target amount.
 *
 * Formula: PV = FV / (1 + r)^n
 */
export function requiredLumpSum(
  targetAmount: number,
  annualReturn: number,
  years: number
): number {
  if (years <= 0) return targetAmount;
  return targetAmount / Math.pow(1 + annualReturn / 100, years);
}

/**
 * Monte Carlo simulation for goal success probability.
 * Runs multiple iterations with random return variance to determine
 * the likelihood of reaching the target.
 *
 * Uses normal distribution around expected return with ±2% std dev.
 *
 * @returns Probability between 0 and 100
 */
export function goalSuccessProbability(
  targetAmount: number,
  monthlyInvestment: number,
  annualReturn: number,
  years: number,
  currentCorpus: number = 0,
  iterations: number = 1000
): number {
  const months = years * 12;
  let successes = 0;
  const stdDev = 2; // ±2% annual return variance

  for (let i = 0; i < iterations; i++) {
    let corpus = currentCorpus;

    for (let m = 0; m < months; m++) {
      // Generate random monthly return with Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      // Random annual return, converted to monthly
      const randomAnnualReturn = annualReturn + z * stdDev;
      const monthlyRate = randomAnnualReturn / 100 / 12;

      // Grow existing corpus + add SIP contribution
      corpus = corpus * (1 + monthlyRate) + monthlyInvestment;
    }

    if (corpus >= targetAmount) {
      successes++;
    }
  }

  return Math.round((successes / iterations) * 100);
}

/**
 * Select investment category based on time horizon and risk appetite.
 * Uses standard Indian mutual fund categorization.
 */
export function selectInvestmentCategory(
  years: number,
  riskAppetite: RiskAppetite
): InvestmentCategory {
  // Short-term: < 3 years
  if (years < 3) {
    const categories: Record<RiskAppetite, InvestmentCategory> = {
      conservative: {
        name: "Ultra Short Duration",
        instruments: ["Liquid Fund", "Ultra Short Duration Fund", "FD"],
        expectedReturn: { min: 5, max: 6.5 },
        risk: "conservative",
      },
      balanced: {
        name: "Short Duration Blend",
        instruments: [
          "Short Duration Debt Fund",
          "Arbitrage Fund",
          "Liquid Fund",
        ],
        expectedReturn: { min: 6, max: 8 },
        risk: "balanced",
      },
      aggressive: {
        name: "Dynamic Bond",
        instruments: [
          "Dynamic Bond Fund",
          "Corporate Bond Fund",
          "Arbitrage Fund",
        ],
        expectedReturn: { min: 7, max: 9 },
        risk: "aggressive",
      },
    };
    return categories[riskAppetite];
  }

  // Medium-term: 3–7 years
  if (years < 7) {
    const categories: Record<RiskAppetite, InvestmentCategory> = {
      conservative: {
        name: "Conservative Hybrid",
        instruments: [
          "Conservative Hybrid Fund",
          "Banking & PSU Fund",
          "Short Duration Fund",
        ],
        expectedReturn: { min: 7, max: 9 },
        risk: "conservative",
      },
      balanced: {
        name: "Balanced Advantage",
        instruments: [
          "Balanced Advantage Fund",
          "Aggressive Hybrid Fund",
          "Multi Cap Fund",
        ],
        expectedReturn: { min: 9, max: 12 },
        risk: "balanced",
      },
      aggressive: {
        name: "Flexi Cap",
        instruments: ["Flexi Cap Fund", "Mid Cap Fund", "Index Fund (Nifty 50)"],
        expectedReturn: { min: 11, max: 15 },
        risk: "aggressive",
      },
    };
    return categories[riskAppetite];
  }

  // Long-term: 7+ years
  const categories: Record<RiskAppetite, InvestmentCategory> = {
    conservative: {
      name: "Large Cap Equity",
      instruments: [
        "Large Cap Fund",
        "Index Fund (Nifty 50)",
        "Balanced Advantage Fund",
      ],
      expectedReturn: { min: 10, max: 12 },
      risk: "conservative",
    },
    balanced: {
      name: "Diversified Equity",
      instruments: ["Flexi Cap Fund", "Mid Cap Fund", "Index Fund (Nifty Next 50)"],
      expectedReturn: { min: 12, max: 14 },
      risk: "balanced",
    },
    aggressive: {
      name: "High Growth Equity",
      instruments: ["Small Cap Fund", "Mid Cap Fund", "Sectoral/Thematic Fund"],
      expectedReturn: { min: 14, max: 18 },
      risk: "aggressive",
    },
  };
  return categories[riskAppetite];
}

/**
 * Calculate the funding gap between target and projected corpus.
 * Positive value means shortfall, negative means surplus.
 */
export function fundingGap(
  futureValue: number,
  projectedCorpus: number
): number {
  return Math.max(0, futureValue - projectedCorpus);
}

/**
 * Calculate portfolio risk score on a 0–100 scale.
 * Based on allocation percentages across asset classes.
 *
 * Equity = highest risk weight, Cash = lowest.
 */
export function calculateRiskScore(allocation: AllocationMap): number {
  const weights = {
    equity: 1.0,    // Full risk weight
    gold: 0.5,      // Medium risk weight
    debt: 0.25,     // Low risk weight
    cash: 0.05,     // Minimal risk weight
  };

  const totalAllocation =
    allocation.equity + allocation.debt + allocation.gold + allocation.cash;
  if (totalAllocation === 0) return 0;

  const weightedScore =
    (allocation.equity * weights.equity +
      allocation.gold * weights.gold +
      allocation.debt * weights.debt +
      allocation.cash * weights.cash) /
    totalAllocation;

  return Math.round(weightedScore * 100);
}

/**
 * Calculate future value of a lump sum investment.
 *
 * Formula: FV = PV × (1 + r)^n
 */
export function lumpSumFutureValue(
  principal: number,
  annualReturn: number,
  years: number
): number {
  return principal * Math.pow(1 + annualReturn / 100, years);
}

/**
 * Generate corpus growth projection data for charts.
 * Returns monthly data points showing corpus growth over time.
 */
export function generateCorpusProjection(
  monthlyInvestment: number,
  annualReturn: number,
  months: number,
  currentCorpus: number = 0,
  inflationRate: number = 6
): Array<{
  month: number;
  year: number;
  corpus: number;
  invested: number;
  withoutInvestment: number;
}> {
  const data: Array<{
    month: number;
    year: number;
    corpus: number;
    invested: number;
    withoutInvestment: number;
  }> = [];

  const monthlyRate = annualReturn / 100 / 12;
  const monthlyInflation = inflationRate / 100 / 12;
  let corpus = currentCorpus;
  let totalInvested = currentCorpus;
  let withoutInvestment = currentCorpus;

  for (let m = 0; m <= months; m++) {
    data.push({
      month: m,
      year: Math.round((m / 12) * 10) / 10,
      corpus: Math.round(corpus),
      invested: Math.round(totalInvested),
      withoutInvestment: Math.round(withoutInvestment),
    });

    if (m < months) {
      corpus = corpus * (1 + monthlyRate) + monthlyInvestment;
      totalInvested += monthlyInvestment;
      // Without investment, only inflation erodes purchasing power
      withoutInvestment = withoutInvestment * (1 - monthlyInflation);
    }
  }

  return data;
}

/**
 * Calculates a goal risk score (0-100) based on corpus funding status and timeline.
 */
export function riskScore(
  currentCorpus: number,
  futureValue: number,
  currentSIP: number,
  neededSIP: number,
  years: number
): number {
  if (futureValue <= 0) return 10;
  
  const shortfallRatio = neededSIP > 0 ? Math.max(0, (neededSIP - currentSIP) / neededSIP) : 0;
  let score = shortfallRatio * 75;
  
  if (years < 3 && shortfallRatio > 0) {
    score += 20;
  } else if (years > 8) {
    score -= 15;
  }
  
  return Math.min(95, Math.max(15, Math.round(score)));
}

/**
 * Calculates a consolidated Financial Health Score (0-100) based on
 * goal success odds, savings habits, and emergency buffer setup.
 */
export function calculateFinancialHealthScore(
  avgSuccessProbability: number,
  savingsRate: number,
  hasEmergencyFund: boolean
): number {
  let score = 0;
  
  // 1. Goal Success Probability contribution (40%)
  score += (Math.max(0, Math.min(100, avgSuccessProbability)) / 100) * 40;
  
  // 2. Savings Rate contribution (30%, optimized at 40% savings rate)
  const savingsScore = Math.min(30, (Math.max(0, savingsRate) / 40) * 30);
  score += savingsScore;
  
  // 3. Emergency Fund buffer (20%)
  if (hasEmergencyFund) {
    score += 20;
  }
  
  // 4. Baseline starting buffer (10%)
  score += 10;
  
  return Math.min(100, Math.max(10, Math.round(score)));
}


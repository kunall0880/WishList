/**
 * Wishlist AI — Stateless Calculation API
 *
 * POST /api/calculate
 * No auth required — used by simulator and goal preview.
 * Runs all financial calculations and returns results + projection data.
 */
import { NextResponse } from "next/server";
import {
  sipFutureValue,
  lumpSumFutureValue,
  inflationAdjustedFV,
  requiredSIP,
  goalSuccessProbability,
  riskScore,
  generateCorpusProjection,
} from "@/lib/financial-engine";
import { z } from "zod";

const CalculateSchema = z.object({
  goalAmount: z.number().min(1000),
  monthlySIP: z.number().min(0),
  lumpSum: z.number().min(0).optional().default(0),
  expectedReturn: z.number().min(1).max(30),
  inflation: z.number().min(0).max(20).optional().default(6),
  timeHorizon: z.number().min(0.5).max(40), // years
  currentCorpus: z.number().min(0).optional().default(0),
  riskAppetite: z.enum(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CalculateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      goalAmount,
      monthlySIP,
      lumpSum,
      expectedReturn,
      inflation,
      timeHorizon,
      currentCorpus,
    } = parsed.data;

    const months = Math.round(timeHorizon * 12);

    // Core calculations
    const sipFV = sipFutureValue(monthlySIP, expectedReturn, months);
    const lumpFV = lumpSumFutureValue(lumpSum + currentCorpus, expectedReturn, timeHorizon);
    const totalFV = sipFV + lumpFV;
    const totalInvested = monthlySIP * months + lumpSum + currentCorpus;
    const returnsEarned = totalFV - totalInvested;
    const inflAdjGoal = inflationAdjustedFV(goalAmount, inflation, timeHorizon);
    const achievable = totalFV >= inflAdjGoal;

    // Required SIP to meet inflation-adjusted goal
    const neededSIP = requiredSIP(inflAdjGoal, expectedReturn, months, currentCorpus + lumpSum);

    // Funding gap
    const fundingGap = Math.max(0, neededSIP - monthlySIP);

    // Success probability (Monte Carlo)
    const successProb = goalSuccessProbability(
      currentCorpus + lumpSum,
      monthlySIP,
      expectedReturn,
      months,
      inflAdjGoal
    );

    // Risk score
    const risk = riskScore(currentCorpus, inflAdjGoal, monthlySIP, neededSIP, timeHorizon);

    // When can goal be achieved (months)?
    let achieveMonths = 0;
    if (monthlySIP > 0 || currentCorpus > 0 || lumpSum > 0) {
      let corpus = currentCorpus + lumpSum;
      const monthlyRate = expectedReturn / 100 / 12;
      for (let m = 1; m <= 480; m++) {
        corpus = corpus * (1 + monthlyRate) + monthlySIP;
        const inflTarget = inflationAdjustedFV(goalAmount, inflation, m / 12);
        if (corpus >= inflTarget) {
          achieveMonths = m;
          break;
        }
      }
    }

    // XIRR approximation
    const wealthMultiple = totalInvested > 0 ? totalFV / totalInvested : 0;

    // Projection data (year by year)
    const projectionData = generateCorpusProjection(
      monthlySIP,
      expectedReturn,
      months,
      currentCorpus + lumpSum,
      inflation
    );

    // Downsample projection for chart
    const step = Math.max(1, Math.floor(projectionData.length / 24));
    const chartData = projectionData.filter(
      (_, i) => i % step === 0 || i === projectionData.length - 1
    );

    // Three-scenario comparison
    const scenarios = [
      { label: "Conservative (8%)", returnRate: 8 },
      { label: "Balanced (11%)", returnRate: 11 },
      { label: "Aggressive (14%)", returnRate: 14 },
    ].map((s) => {
      const sFV = sipFutureValue(monthlySIP, s.returnRate, months) +
        lumpSumFutureValue(lumpSum + currentCorpus, s.returnRate, timeHorizon);
      return { ...s, totalFV: Math.round(sFV), achievable: sFV >= inflAdjGoal };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalFV: Math.round(totalFV),
        totalInvested: Math.round(totalInvested),
        returnsEarned: Math.round(returnsEarned),
        inflAdjGoal: Math.round(inflAdjGoal),
        achievable,
        achieveMonths,
        requiredSIP: Math.round(neededSIP),
        fundingGap: Math.round(fundingGap),
        successProbability: Math.round(successProb),
        riskScore: Math.round(risk),
        wealthMultiple: Math.round(wealthMultiple * 100) / 100,
        chartData,
        scenarios,
      },
    });
  } catch (error) {
    console.error("POST /api/calculate error:", error);
    return NextResponse.json(
      { success: false, error: "Calculation failed" },
      { status: 500 }
    );
  }
}

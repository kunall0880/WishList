/**
 * Wishlist AI — AI Recommendation API
 *
 * POST /api/ai/recommend
 * Body: { goalId: string } or { goalData: GoalInput }
 *
 * Calls Google Gemini to generate personalized investment recommendations.
 * Falls back to mock insights when Gemini is not configured.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  inflationAdjustedFV,
  requiredSIP,
  goalSuccessProbability,
  riskScore,
} from "@/lib/financial-engine";
import { WISHLIST_SYSTEM_PROMPT, buildGoalPrompt } from "@/lib/ai-prompts";
import { z } from "zod";

const RecommendSchema = z.union([
  z.object({ goalId: z.string(), force: z.boolean().optional() }),
  z.object({
    goalData: z.object({
      name: z.string(),
      type: z.string(),
      targetAmountToday: z.number(),
      targetDate: z.string(),
      inflationRate: z.number(),
      currentCorpus: z.number(),
      currentSIP: z.number(),
      lumpSumAvailable: z.number(),
      riskAppetite: z.string(),
    }),
  }),
]);

function isDbConfigured(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("user:password")
  );
}

// ── Mock AI response for when OpenAI isn't configured ──
function generateMockInsights(goalName: string, riskAppetite: string, reqSIP: number, successProb: number) {
  const instrumentsByRisk: Record<string, Array<{
    name: string; allocation: number; expectedReturn: string; risk: string; why: string;
  }>> = {
    CONSERVATIVE: [
      { name: "HDFC Short Duration Debt Fund", allocation: 40, expectedReturn: "7–8%", risk: "Low", why: "Stable returns with minimal volatility for short-term goals" },
      { name: "SBI Liquid Fund", allocation: 35, expectedReturn: "5–6%", risk: "Very Low", why: "High liquidity for emergency needs" },
      { name: "ICICI Pru Corporate Bond Fund", allocation: 25, expectedReturn: "7–8.5%", risk: "Low", why: "Higher yield than FDs with similar safety" },
    ],
    BALANCED: [
      { name: "Parag Parikh Flexi Cap Fund", allocation: 40, expectedReturn: "12–14%", risk: "Moderate", why: "Diversified equity exposure across geographies" },
      { name: "HDFC Balanced Advantage Fund", allocation: 30, expectedReturn: "9–11%", risk: "Moderate", why: "Dynamic asset allocation reduces drawdowns" },
      { name: "Kotak Short Term Debt Fund", allocation: 30, expectedReturn: "7–8%", risk: "Low", why: "Stability and regular component" },
    ],
    AGGRESSIVE: [
      { name: "Nifty 50 Index Fund", allocation: 40, expectedReturn: "12–15%", risk: "High", why: "Low-cost exposure to India's top 50 companies" },
      { name: "Mirae Asset Emerging Bluechip", allocation: 35, expectedReturn: "14–16%", risk: "High", why: "Large & mid cap blend for growth" },
      { name: "Axis Small Cap Fund", allocation: 25, expectedReturn: "15–18%", risk: "Very High", why: "High-growth potential for long-term goals" },
    ],
  };

  return {
    explanation: `Your ${goalName} goal looks promising! With a systematic investment of ₹${reqSIP.toLocaleString("en-IN")}/month, you have a ${successProb}% probability of reaching your target. Based on your ${riskAppetite.toLowerCase()} risk profile, we've recommended a diversified portfolio to help you stay on track.`,
    insights: [
      { type: "positive" as const, text: `${successProb}% success probability — your goal is well-funded`, impact: "high" as const },
      { type: "suggestion" as const, text: "Consider setting up auto-debit SIP for consistency", impact: "medium" as const },
      { type: "suggestion" as const, text: "Review allocation annually to rebalance risk", impact: "medium" as const },
      ...(successProb < 70 ? [{ type: "warning" as const, text: "Increase SIP or extend timeline to improve odds", impact: "high" as const }] : []),
    ],
    instruments: instrumentsByRisk[riskAppetite] ?? instrumentsByRisk.BALANCED,
    riskWarning: successProb < 50 ? "Your current SIP may not be sufficient. Consider increasing your monthly investment or extending your timeline." : null,
    alternativeScenarios: [
      { label: "Delay by 6 months", newSIP: Math.round(reqSIP * 0.82), impact: "Reduces monthly SIP by 18%" },
      { label: "Add ₹50K lump sum", newSIP: Math.round(reqSIP * 0.86), impact: "Reduces monthly SIP by 14%" },
      { label: "Switch to Aggressive", newSIP: Math.round(reqSIP * 0.75), impact: "Reduces SIP by 25% but higher risk" },
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RecommendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error },
        { status: 400 }
      );
    }

    let goalData: {
      name: string;
      type: string;
      targetAmountToday: number;
      targetDate: string;
      inflationRate: number;
      currentCorpus: number;
      currentSIP: number;
      lumpSumAvailable: number;
      riskAppetite: string;
    };

    // Fetch from DB if goalId provided
    if ("goalId" in parsed.data) {
      if (!isDbConfigured()) {
        return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
      }
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const goal = await prisma.goal.findFirst({
        where: { id: parsed.data.goalId, userId: session.user.id },
      });
      if (!goal) {
        return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
      }

      // Check cache — return cached if < 1hr old unless force is true
      const bypassCache = "force" in parsed.data ? !!parsed.data.force : false;
      if (!bypassCache && goal.aiInsights && goal.aiInsightsUpdatedAt) {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (goal.aiInsightsUpdatedAt > hourAgo) {
          return NextResponse.json({ success: true, data: goal.aiInsights, cached: true });
        }
      }

      goalData = {
        name: goal.name,
        type: goal.type,
        targetAmountToday: goal.targetAmountToday,
        targetDate: goal.targetDate.toISOString(),
        inflationRate: goal.inflationRate,
        currentCorpus: goal.currentCorpus,
        currentSIP: goal.currentSIP,
        lumpSumAvailable: goal.lumpSumAvailable,
        riskAppetite: goal.riskAppetite,
      };
    } else {
      goalData = parsed.data.goalData;
    }

    // Run calculations
    const targetDate = new Date(goalData.targetDate);
    const msRemaining = targetDate.getTime() - Date.now();
    const yearsRemaining = Math.max(0.5, msRemaining / (1000 * 60 * 60 * 24 * 365.25));
    const monthsRemaining = Math.round(yearsRemaining * 12);
    const riskReturnMap: Record<string, number> = { CONSERVATIVE: 7, BALANCED: 10, AGGRESSIVE: 13 };
    const expectedReturn = riskReturnMap[goalData.riskAppetite] ?? 10;

    const futureValue = inflationAdjustedFV(goalData.targetAmountToday, goalData.inflationRate, yearsRemaining);
    const reqSIP = requiredSIP(futureValue, expectedReturn, monthsRemaining, goalData.currentCorpus);
    const successProb = goalSuccessProbability(goalData.currentCorpus, goalData.currentSIP, expectedReturn, monthsRemaining, futureValue);
    const risk = riskScore(goalData.currentCorpus, futureValue, goalData.currentSIP, reqSIP, yearsRemaining);

    const calcs = {
      futureValue: Math.round(futureValue),
      requiredSIP: Math.round(reqSIP),
      successProbability: Math.round(successProb),
      riskScore: Math.round(risk),
      yearsRemaining: Math.round(yearsRemaining * 10) / 10,
    };

    // Fetch user profile if logged in & DB is configured
    let userProfile = null;
    try {
      const session = await auth();
      if (isDbConfigured() && session?.user?.id) {
        userProfile = await prisma.userProfile.findUnique({
          where: { userId: session.user.id },
        });
      }
    } catch (profileError) {
      console.error("Failed to fetch user profile for AI recommendations:", profileError);
    }

    let insights;

    // Try Gemini if configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We use gemini-1.5-flash which is fast, cost-effective, and supports JSON output
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" },
          systemInstruction: WISHLIST_SYSTEM_PROMPT,
        });

        const prompt = buildGoalPrompt(goalData, calcs, userProfile || undefined);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        if (responseText) {
          insights = JSON.parse(responseText);
        }
      } catch (aiError) {
        console.error("Gemini call failed, using mock insights:", aiError);
      }
    }

    // Fallback to mock insights
    if (!insights) {
      insights = generateMockInsights(goalData.name, goalData.riskAppetite, calcs.requiredSIP, calcs.successProbability);
    }

    // Cache in DB if goalId was provided
    if ("goalId" in parsed.data && isDbConfigured()) {
      try {
        await prisma.goal.update({
          where: { id: parsed.data.goalId },
          data: {
            aiInsights: insights,
            aiInsightsUpdatedAt: new Date(),
          },
        });
      } catch {
        // Caching failure is non-critical
      }
    }

    return NextResponse.json({
      success: true,
      data: insights,
      calculations: calcs,
      cached: false,
    });
  } catch (error) {
    console.error("POST /api/ai/recommend error:", error);
    return NextResponse.json(
      { success: false, error: "AI recommendation failed" },
      { status: 500 }
    );
  }
}

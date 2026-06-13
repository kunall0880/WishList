/**
 * Wishlist AI — Single Goal API Routes
 *
 * GET    /api/goals/[id]  → Get goal detail with calculations + AI insights
 * PATCH  /api/goals/[id]  → Update goal fields
 * DELETE /api/goals/[id]  → Soft delete (archive)
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  inflationAdjustedFV,
  requiredSIP,
  goalSuccessProbability,
  riskScore,
  generateCorpusProjection,
} from "@/lib/financial-engine";
import { z } from "zod";

const GoalUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  type: z.enum([
    "TRAVEL", "HOUSE", "CAR", "EDUCATION", "WEDDING", "EMERGENCY",
    "RETIREMENT", "BUSINESS", "BIKE", "GADGET", "RENOVATION", "OTHER",
  ]).optional(),
  emoji: z.string().optional(),
  targetDate: z.string().transform((s) => new Date(s)).optional(),
  targetAmountToday: z.number().min(1000).optional(),
  inflationRate: z.number().min(0).max(20).optional(),
  currentCorpus: z.number().min(0).optional(),
  currentSIP: z.number().min(0).optional(),
  lumpSumAvailable: z.number().min(0).optional(),
  monthlySalary: z.number().min(0).optional(),
  salaryGrowthRate: z.number().min(0).max(50).optional(),
  monthlyBudget: z.number().min(0).optional(),
  riskAppetite: z.enum(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  status: z.enum(["ON_TRACK", "AT_RISK", "OFF_TRACK", "COMPLETED"]).optional(),
  notes: z.string().max(1000).optional(),
});

function isDbConfigured(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("user:password")
  );
}

function computeGoalDetails(goal: {
  targetAmountToday: number;
  inflationRate: number;
  targetDate: Date;
  currentCorpus: number;
  currentSIP: number;
  riskAppetite: string;
  lumpSumAvailable: number;
}) {
  const now = new Date();
  const msRemaining = new Date(goal.targetDate).getTime() - now.getTime();
  const yearsRemaining = Math.max(0, msRemaining / (1000 * 60 * 60 * 24 * 365.25));
  const monthsRemaining = Math.max(0, Math.round(yearsRemaining * 12));

  const riskReturnMap: Record<string, number> = {
    CONSERVATIVE: 7,
    BALANCED: 10,
    AGGRESSIVE: 13,
  };
  const expectedReturn = riskReturnMap[goal.riskAppetite] ?? 10;

  const futureValue = inflationAdjustedFV(goal.targetAmountToday, goal.inflationRate, yearsRemaining);
  const needed = requiredSIP(futureValue, expectedReturn, monthsRemaining, goal.currentCorpus);
  const fundingGap = Math.max(0, needed - goal.currentSIP);
  const successProb = goalSuccessProbability(
    goal.currentCorpus, goal.currentSIP, expectedReturn, monthsRemaining, futureValue
  );
  const risk = riskScore(goal.currentCorpus, futureValue, goal.currentSIP, needed, yearsRemaining);

  const projectionData = generateCorpusProjection(
    goal.currentSIP > 0 ? goal.currentSIP : needed,
    expectedReturn,
    monthsRemaining,
    goal.currentCorpus,
    goal.inflationRate
  );

  return {
    futureValue: Math.round(futureValue),
    requiredSIP: Math.round(needed),
    fundingGap: Math.round(fundingGap),
    successProbability: Math.round(successProb),
    riskScore: Math.round(risk),
    yearsRemaining: Math.round(yearsRemaining * 10) / 10,
    expectedReturn,
    projectionData,
  };
}

interface RouteParams {
  params: { id: string };
}

// ── GET /api/goals/[id] ──
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const goal = await prisma.goal.findFirst({
      where: { id: params.id, userId: session.user.id, isArchived: false },
    });

    if (!goal) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }

    const calculations = computeGoalDetails(goal);

    return NextResponse.json({
      success: true,
      data: { ...goal, calculations },
    });
  } catch (error) {
    console.error(`GET /api/goals/${params.id} error:`, error);
    return NextResponse.json({ success: false, error: "Failed to fetch goal" }, { status: 500 });
  }
}

// ── PATCH /api/goals/[id] ──
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.goal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = GoalUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.goal.update({
      where: { id: params.id },
      data: parsed.data,
    });

    const calculations = computeGoalDetails(updated);

    return NextResponse.json({
      success: true,
      data: { ...updated, calculations },
    });
  } catch (error) {
    console.error(`PATCH /api/goals/${params.id} error:`, error);
    return NextResponse.json({ success: false, error: "Failed to update goal" }, { status: 500 });
  }
}

// ── DELETE /api/goals/[id] ──
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.goal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.goal.update({
      where: { id: params.id },
      data: { isArchived: true },
    });

    return NextResponse.json({ success: true, message: "Goal archived" });
  } catch (error) {
    console.error(`DELETE /api/goals/${params.id} error:`, error);
    return NextResponse.json({ success: false, error: "Failed to delete goal" }, { status: 500 });
  }
}

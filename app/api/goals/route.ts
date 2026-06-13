/**
 * Wishlist AI — Goals API Routes
 *
 * GET  /api/goals  → List all goals for authenticated user
 * POST /api/goals  → Create a new goal
 *
 * Falls back to Zustand mock data when DB is not configured.
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
import { z } from "zod";

// ── Zod schema for goal creation ──
const GoalCreateSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.enum([
    "TRAVEL", "HOUSE", "CAR", "EDUCATION", "WEDDING", "EMERGENCY",
    "RETIREMENT", "BUSINESS", "BIKE", "GADGET", "RENOVATION", "OTHER",
  ]),
  emoji: z.string().optional().default("🎯"),
  targetDate: z.string().transform((s) => new Date(s)),
  targetAmountToday: z.number().min(1000),
  inflationRate: z.number().min(0).max(20).optional().default(6),
  currentCorpus: z.number().min(0).optional().default(0),
  currentSIP: z.number().min(0).optional().default(0),
  lumpSumAvailable: z.number().min(0).optional().default(0),
  monthlySalary: z.number().min(0).optional().default(0),
  salaryGrowthRate: z.number().min(0).max(50).optional().default(10),
  monthlyBudget: z.number().min(0).optional().default(0),
  riskAppetite: z.enum(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]).optional().default("BALANCED"),
  priority: z.number().int().min(1).max(5).optional().default(3),
});

function attachCalculations(goal: {
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
    goal.currentCorpus,
    goal.currentSIP,
    expectedReturn,
    monthsRemaining,
    futureValue
  );
  const risk = riskScore(
    goal.currentCorpus,
    futureValue,
    goal.currentSIP,
    needed,
    yearsRemaining
  );

  return {
    futureValue: Math.round(futureValue),
    requiredSIP: Math.round(needed),
    fundingGap: Math.round(fundingGap),
    successProbability: Math.round(successProb),
    riskScore: Math.round(risk),
    yearsRemaining: Math.round(yearsRemaining * 10) / 10,
    expectedReturn,
  };
}

// ── Check if DB is available ──
function isDbConfigured(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("user:password")
  );
}

// ── GET /api/goals ──
export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Database not configured. Using client-side mock data.",
      });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id, isArchived: false },
      orderBy: [{ priority: "desc" }, { targetDate: "asc" }],
    });

    const goalsWithCalcs = goals.map((goal: any) => ({
      ...goal,
      calculations: attachCalculations(goal),
    }));

    return NextResponse.json({ success: true, data: goalsWithCalcs });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// ── POST /api/goals ──
export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = GoalCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    const calculations = attachCalculations(goal);

    return NextResponse.json(
      { success: true, data: { ...goal, calculations } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/goals error:", error);

    // Handle Prisma unique constraint violations
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "A goal with that name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

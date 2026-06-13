/**
 * Wishlist AI — User Profile API
 *
 * GET  /api/user/profile  → Fetch authenticated user's profile metadata
 * PATCH /api/user/profile  → Update authenticated user's profile and metadata
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function isDbConfigured(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("user:password")
  );
}

const ProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  age: z.number().int().min(1).max(120).optional().nullable(),
  monthlySalary: z.number().nonnegative().optional(),
  monthlyExpenses: z.number().nonnegative().optional(),
  currentInvestments: z.number().nonnegative().optional(),
  riskComfort: z.enum(["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]).optional(),
  hasEmergencyFund: z.boolean().optional(),
  investmentStyle: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isDbConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          name: session.user.name || "Demo User",
          email: session.user.email || "demo@example.com",
          profile: {
            age: 28,
            monthlySalary: 100000,
            monthlyExpenses: 40000,
            currentInvestments: 500000,
            riskComfort: "BALANCED",
            hasEmergencyFund: true,
            savingsRate: 60,
            investmentStyle: "Mutual Funds",
          },
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      age,
      monthlySalary = 0,
      monthlyExpenses = 0,
      currentInvestments = 0,
      riskComfort = "BALANCED",
      hasEmergencyFund = false,
      investmentStyle,
    } = parsed.data;

    // Calculate savings rate
    const savingsRate = monthlySalary > 0 
      ? Math.round(((monthlySalary - monthlyExpenses) / monthlySalary) * 100)
      : 0;

    if (isDbConfigured()) {
      // 1. Update basic User info
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });

      // 2. Upsert UserProfile
      const profile = await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          age,
          monthlySalary,
          monthlyExpenses,
          currentInvestments,
          riskComfort,
          hasEmergencyFund,
          savingsRate,
          investmentStyle,
        },
        create: {
          userId: session.user.id,
          age,
          monthlySalary,
          monthlyExpenses,
          currentInvestments,
          riskComfort,
          hasEmergencyFund,
          savingsRate,
          investmentStyle,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...user,
          profile,
        },
      });
    }

    // Otherwise, return success with body data for mockup purposes
    return NextResponse.json({
      success: true,
      data: {
        name: name || session.user.name,
        email: email || session.user.email,
        profile: {
          age,
          monthlySalary,
          monthlyExpenses,
          currentInvestments,
          riskComfort,
          hasEmergencyFund,
          savingsRate,
          investmentStyle,
        },
      },
      message: "Database not configured. Profile updated in demo session.",
    });
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile details" },
      { status: 500 }
    );
  }
}

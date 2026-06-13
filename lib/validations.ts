import { z } from "zod";

/**
 * WishList — Zod Validation Schemas
 */

export const goalFormSchema = z.object({
  name: z
    .string()
    .min(2, "Goal name must be at least 2 characters")
    .max(100, "Goal name must be under 100 characters"),
  type: z.enum([
    "TRAVEL",
    "HOUSE",
    "CAR",
    "EDUCATION",
    "WEDDING",
    "EMERGENCY",
    "RETIREMENT",
    "BUSINESS",
    "BIKE",
    "GADGET",
    "RENOVATION",
    "OTHER",
  ]),
  targetAmountToday: z
    .number()
    .min(1000, "Minimum target amount is ₹1,000")
    .max(1000000000, "Maximum target amount is ₹100 Cr"),
  targetDate: z.string().min(1, "Please select a target date"),
  priority: z.number().min(1).max(5).default(3),

  // Financial info
  currentCorpus: z.number().min(0).default(0),
  currentSIP: z.number().min(0).default(0),
  lumpSumAvailable: z.number().min(0).default(0),
  monthlyBudget: z.number().min(0).optional(),
  monthlySalary: z.number().min(0).optional(),
  expectedSalaryGrowth: z.number().min(0).max(50).optional(),
  inflationRate: z.number().min(3).max(12).default(6),
  hasEmergencyFund: z.boolean().default(false),

  // Risk profile
  riskAppetite: z
    .enum(["conservative", "balanced", "aggressive"])
    .default("balanced"),
});

export type GoalFormData = z.infer<typeof goalFormSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export const aiRecommendationSchema = z.object({
  goalName: z.string(),
  goalType: z.string(),
  targetAmountToday: z.number().positive(),
  targetDate: z.string(),
  currentCorpus: z.number().min(0),
  currentSIP: z.number().min(0),
  lumpSumAvailable: z.number().min(0),
  riskAppetite: z.enum(["conservative", "balanced", "aggressive"]),
  inflationRate: z.number().min(3).max(12),
});

export const simulatorSchema = z.object({
  goalAmount: z.number().min(100000).max(100000000),
  monthlySIP: z.number().min(500).max(10000000),
  lumpSum: z.number().min(0).max(500000000),
  expectedReturn: z.number().min(6).max(20),
  inflation: z.number().min(3).max(12),
  timeHorizon: z.number().min(1).max(30),
});

export type SimulatorFormData = z.infer<typeof simulatorSchema>;

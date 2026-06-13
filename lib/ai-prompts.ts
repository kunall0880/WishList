/**
 * WishList — System Prompts for AI Recommendation Engine
 */

export const WISHLIST_SYSTEM_PROMPT = `You are WishList, a certified financial planner assistant for Indian retail investors.

Given a user's goal details, provide:
1. A plain-English explanation of their investment plan (2–3 sentences, warm and confident tone)
2. 3–5 specific, actionable insights (each under 15 words, with impact level: high/medium/low)
3. Top 3 investment instruments with allocation percentages
4. One risk warning if applicable

Rules:
- All amounts in Indian Rupees (₹)
- Use Indian number formatting (lakhs, crores)
- Never guarantee returns
- Always mention that past returns don't guarantee future performance
- Be encouraging but realistic

Respond ONLY in this JSON format:
{
  "explanation": "string",
  "insights": [{ "type": "warning"|"suggestion"|"positive", "text": "string", "impact": "high"|"medium"|"low" }],
  "instruments": [{ "name": "string", "allocation": number, "expectedReturn": "string", "risk": "string", "why": "string" }],
  "riskWarning": "string | null",
  "alternativeScenarios": [{ "label": "string", "newSIP": number, "impact": "string" }]
}`;

export interface GoalPromptInput {
  name: string;
  type: string;
  targetAmountToday: number;
  targetDate: string;
  currentCorpus: number;
  currentSIP: number;
  riskAppetite: string;
  inflationRate: number;
  lumpSumAvailable: number;
}

export interface CalculationResult {
  futureValue: number;
  requiredSIP: number;
  successProbability: number;
  riskScore: number;
  yearsRemaining: number;
}

export interface UserProfileInput {
  age?: number | null;
  monthlySalary?: number;
  monthlyExpenses?: number;
  currentInvestments?: number;
  riskComfort?: string;
  hasEmergencyFund?: boolean;
  savingsRate?: number;
  investmentStyle?: string | null;
}

/**
 * Build the user prompt for AI recommendation.
 * Includes both raw goal inputs and calculated projections, plus optional user profile.
 */
export function buildGoalPrompt(
  goal: GoalPromptInput,
  calcs: CalculationResult,
  profile?: UserProfileInput
): string {
  let prompt = `
Analyze this financial goal and provide investment recommendations:

Goal: ${goal.name} (${goal.type})
Target Amount Today: ₹${goal.targetAmountToday.toLocaleString("en-IN")}
Target Date: ${goal.targetDate}
Years Remaining: ${calcs.yearsRemaining.toFixed(1)}
Inflation Rate: ${goal.inflationRate}%
Inflation-Adjusted Future Value: ₹${calcs.futureValue.toLocaleString("en-IN")}
Current Corpus: ₹${goal.currentCorpus.toLocaleString("en-IN")}
Current Monthly SIP: ₹${goal.currentSIP.toLocaleString("en-IN")}
Required Monthly SIP: ₹${calcs.requiredSIP.toLocaleString("en-IN")}
Goal Success Probability: ${calcs.successProbability}%
Risk Score: ${calcs.riskScore}/100
Risk Appetite: ${goal.riskAppetite}
Lump Sum Available: ₹${goal.lumpSumAvailable.toLocaleString("en-IN")}
`;

  if (profile) {
    prompt += `
Investor Profile Context:
- Age: ${profile.age ?? "Not specified"}
- Monthly Income: ₹${(profile.monthlySalary ?? 0).toLocaleString("en-IN")}
- Monthly Expenses: ₹${(profile.monthlyExpenses ?? 0).toLocaleString("en-IN")}
- Current Investments: ₹${(profile.currentInvestments ?? 0).toLocaleString("en-IN")}
- Risk Comfort Level: ${profile.riskComfort ?? "BALANCED"}
- Has Emergency Fund: ${profile.hasEmergencyFund ? "Yes" : "No"}
- Savings Rate: ${profile.savingsRate ?? 0}%
- Preferred Asset Classes: ${profile.investmentStyle ?? "Not specified"}
`;
  }

  prompt += `\nPlease provide your analysis and recommendations.`;
  return prompt.trim();
}

// Keep legacy export for backwards compatibility
export const WISHLIST_GOAL_PROMPT = (goal: GoalPromptInput) =>
  buildGoalPrompt(goal, {
    futureValue: 0,
    requiredSIP: 0,
    successProbability: 0,
    riskScore: 0,
    yearsRemaining: 0,
  });


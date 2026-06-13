import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import type { Goal } from "@/types";

// Register Inter font from Google Fonts CDN
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnJ1PVTXM36g.ttf", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnJ1PVTXM36gop.ttf", fontWeight: "bold" },
  ],
});

// Indian rupee formatter
function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Goals status colors
const COLORS = {
  bg: "#0A0B14",
  surface: "#111226",
  border: "rgba(255, 255, 255, 0.08)",
  textPrimary: "#FFFFFF",
  textSecondary: "#9B9BC0",
  primary: "#6C63FF", // violet
  secondary: "#06D6A0", // mint
  accent: "#FF6B6B", // coral
  gold: "#FFD166", // amber
};

const GOAL_EMOJIS: Record<string, string> = {
  TRAVEL: "🌍", HOUSE: "🏠", CAR: "🚗", EDUCATION: "🎓", WEDDING: "💍",
  EMERGENCY: "🛡️", RETIREMENT: "👴", BUSINESS: "🚀", BIKE: "🏍️",
  GADGET: "💻", RENOVATION: "🏗️", OTHER: "🎯",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    fontFamily: "Inter",
    padding: 40,
    color: COLORS.textPrimary,
  },
  topBar: {
    height: 8,
    backgroundColor: COLORS.primary,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 180,
    marginBottom: 10,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 160,
    textAlign: "center",
  },
  coverMetaBox: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    marginTop: "auto",
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 1.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 5,
  },
  row2col: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 25,
  },
  col: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 11,
  },
  metricLabel: {
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 10,
    alignItems: "center",
  },
  tableCellName: { flex: 2, color: COLORS.textPrimary, fontWeight: "bold" },
  tableCellDate: { flex: 1.5, color: COLORS.textSecondary },
  tableCellAmount: { flex: 1.5, color: COLORS.textPrimary, textAlign: "right" },
  tableCellSip: { flex: 1.2, color: COLORS.textPrimary, textAlign: "right" },
  tableCellStatus: { flex: 1, textAlign: "center" },
  badge: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: "bold",
    alignSelf: "center",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  aiSection: {
    backgroundColor: "rgba(108, 99, 255, 0.05)",
    borderColor: "rgba(108, 99, 255, 0.15)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 6,
  },
  aiExplanation: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  instrumentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.04)",
    fontSize: 10,
  },
  insightRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 4,
    fontSize: 9,
  },
  insightIcon: {
    width: 12,
    fontWeight: "bold",
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 15,
    textAlign: "center",
    marginTop: 60,
  },
  disclaimerText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 1.8,
    marginBottom: 10,
    textAlign: "justify",
  },
});

export interface GoalWithCalculations extends Goal {
  calculations?: {
    futureValue: number;
    requiredSIP: number;
    fundingGap: number;
    successProbability: number;
    riskScore: number;
    yearsRemaining: number;
    expectedReturn: number;
    projectionData: Array<{ year: number; corpus: number; invested: number }>;
  };
}

interface GoalsPDFDocumentProps {
  goals: GoalWithCalculations[];
  userName: string;
}

export function GoalsPDFDocument({ goals, userName }: GoalsPDFDocumentProps) {
  const formattedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Calculate Executive Summary values
  const totalGoals = goals.length;
  const onTrackGoals = goals.filter((g) => g.status === "ON_TRACK").length;
  const atRiskGoals = goals.filter((g) => g.status === "AT_RISK").length;
  const totalSIP = goals.reduce((sum, g) => sum + (g.calculations?.requiredSIP ?? g.currentSIP), 0);
  const totalFutureValue = goals.reduce((sum, g) => sum + (g.calculations?.futureValue ?? g.targetAmountToday), 0);

  const avgSuccessProbability =
    totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + (g.calculations?.successProbability ?? 0), 0) / totalGoals)
      : 0;

  const highestPriorityGoal = [...goals].sort((a, b) => b.priority - a.priority)[0]?.name || "N/A";

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "ON_TRACK":
        return { backgroundColor: "rgba(6, 214, 160, 0.15)", color: COLORS.secondary };
      case "AT_RISK":
        return { backgroundColor: "rgba(255, 209, 102, 0.15)", color: COLORS.gold };
      default:
        return { backgroundColor: "rgba(255, 107, 107, 0.15)", color: COLORS.accent };
    }
  };

  return (
    <Document>
      {/* Page 1 — Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />
        <Text style={styles.coverTitle}>WishList AI</Text>
        <Text style={styles.coverSubtitle}>Every dream deserves a financial plan.</Text>

        <View style={styles.coverMetaBox}>
          <Text>Prepared for: {userName}</Text>
          <Text>Generated on: {formattedDate}</Text>
          <Text style={{ marginTop: 15, fontWeight: "bold" }}>Confidential — For personal use only</Text>
        </View>
      </Page>

      {/* Page 2 — Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />
        <Text style={styles.sectionTitle}>Executive Summary</Text>

        <View style={styles.row2col}>
          {/* Left Column */}
          <View style={styles.col}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Active Goals</Text>
              <Text style={styles.metricValue}>{totalGoals}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Goals On Track</Text>
              <Text style={styles.metricValue}>{onTrackGoals}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Monthly SIP</Text>
              <Text style={styles.metricValue}>{formatINR(totalSIP)}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Future Value</Text>
              <Text style={styles.metricValue}>{formatINR(totalFutureValue)}</Text>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.col}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Avg. Success Probability</Text>
              <Text style={styles.metricValue}>{avgSuccessProbability}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Goals At Risk</Text>
              <Text style={styles.metricValue}>{atRiskGoals}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Highest Priority Goal</Text>
              <Text style={styles.metricValue}>{highestPriorityGoal}</Text>
            </View>
          </View>
        </View>

        {/* Goals Table */}
        <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 10 }]}>Goals Ledger</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellName}>Goal Name</Text>
            <Text style={styles.tableCellDate}>Target Date</Text>
            <Text style={[styles.tableCellAmount, { textAlign: "right" }]}>Future Value</Text>
            <Text style={[styles.tableCellSip, { textAlign: "right" }]}>Required SIP</Text>
            <Text style={[styles.tableCellStatus, { textAlign: "center" }]}>Status</Text>
          </View>

          {goals.map((g) => {
            const rowBadgeStyle = getStatusBadgeStyles(g.status);
            return (
              <View key={g.id} style={styles.tableRow}>
                <Text style={styles.tableCellName}>{g.name}</Text>
                <Text style={styles.tableCellDate}>
                  {new Date(g.targetDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                </Text>
                <Text style={styles.tableCellAmount}>
                  {formatINR(g.calculations?.futureValue ?? g.targetAmountToday)}
                </Text>
                <Text style={styles.tableCellSip}>
                  {formatINR(g.calculations?.requiredSIP ?? g.currentSIP)}
                </Text>
                <View style={styles.tableCellStatus}>
                  <Text style={[styles.badge, rowBadgeStyle]}>
                    {g.status.replace("_", " ")}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>

      {/* Pages per Goal */}
      {goals.map((g) => {
        const calcs = g.calculations;
        const badgeStyle = getStatusBadgeStyles(g.status);
        const instruments = g.aiInsights?.instruments ?? [];
        const insightsList = g.aiInsights?.insights ?? [];

        return (
          <Page size="A4" key={g.id} style={styles.page}>
            <View style={styles.topBar} />
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>
                {GOAL_EMOJIS[g.type] || "🎯"} {g.name}
              </Text>
              <Text style={[styles.badge, badgeStyle, { fontSize: 9, paddingVertical: 3, paddingHorizontal: 8 }]}>
                {g.status.replace("_", " ")}
              </Text>
            </View>

            <View style={styles.detailGrid}>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Target Amount (Today)</Text>
                <Text style={styles.detailValue}>{formatINR(g.targetAmountToday)}</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Future Value (Inflation-adjusted)</Text>
                <Text style={styles.detailValue}>{formatINR(calcs?.futureValue ?? g.targetAmountToday)}</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Target Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(g.targetDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Years Remaining</Text>
                <Text style={styles.detailValue}>
                  {calcs?.yearsRemaining ? `${calcs.yearsRemaining.toFixed(1)} years` : "—"}
                </Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Required Monthly SIP</Text>
                <Text style={styles.detailValue}>{formatINR(calcs?.requiredSIP ?? g.currentSIP)}</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Funding Gap</Text>
                <Text style={styles.detailValue}>{formatINR(calcs?.fundingGap ?? 0)}</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Success Probability</Text>
                <Text style={styles.detailValue}>{calcs?.successProbability ?? 0}%</Text>
              </View>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Risk Appetite</Text>
                <Text style={[styles.detailValue, { textTransform: "capitalize" }]}>
                  {g.riskAppetite.toLowerCase()}
                </Text>
              </View>
            </View>

            {/* AI Insights & Allocations */}
            {g.aiInsights && (
              <View style={styles.aiSection}>
                <Text style={styles.aiTitle}>AI Recommendation</Text>
                <Text style={styles.aiExplanation}>{g.aiInsights.explanation}</Text>
              </View>
            )}

            {/* Recommended Instruments */}
            {instruments.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text style={[styles.sectionTitle, { fontSize: 12, marginBottom: 8 }]}>
                  Recommended Asset Allocation
                </Text>
                {instruments.map((inst, index) => (
                  <View key={index} style={styles.instrumentRow}>
                    <Text style={{ color: COLORS.textPrimary, fontWeight: "bold" }}>
                      {inst.name} ({inst.allocation}%)
                    </Text>
                    <Text style={{ color: COLORS.secondary }}>Expected {inst.expectedReturn}</Text>
                    <Text style={{ color: COLORS.textSecondary }}>{inst.risk} Risk</Text>
                  </View>
                ))}
              </View>
            )}

            {/* AI Insights Checklist */}
            {insightsList.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { fontSize: 12, marginBottom: 8 }]}>AI Plan Audit</Text>
                {insightsList.map((ins, index) => (
                  <View key={index} style={styles.insightRow}>
                    <Text
                      style={[
                        styles.insightIcon,
                        { color: ins.type === "warning" ? COLORS.accent : COLORS.secondary },
                      ]}
                    >
                      {ins.type === "warning" ? "⚠" : "✓"}
                    </Text>
                    <Text style={{ color: COLORS.textSecondary }}>{ins.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </Page>
        );
      })}

      {/* Page Last — Disclaimer */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />
        <Text style={styles.disclaimerTitle}>IMPORTANT FINANCIAL DISCLAIMER</Text>
        <Text style={styles.disclaimerText}>
          WishList AI is not a SEBI (Securities and Exchange Board of India) registered investment advisor, broker,
          or tax planner. All projections, calculations, and recommendations generated by this application are
          mathematical estimates based on historical assets returns and expected input growth parameters.
        </Text>
        <Text style={styles.disclaimerText}>
          Past market performance does not guarantee future results. Expected returns are illustrative only and can
          deviate significantly depending on global indexes volatility, inflation pressure, and specific fund exposures.
        </Text>
        <Text style={styles.disclaimerText}>
          Before committing capital to any systematic investment plan (SIP) or executing portfolio allocations,
          users should consult a certified financial planner or registered wealth advisor. WishList AI holds zero liability
          for any portfolio drawdowns, capital losses, or investment choices made based on platform outputs.
        </Text>
      </Page>
    </Document>
  );
}

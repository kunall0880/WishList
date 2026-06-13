import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { GoalWithCalculations } from "./pdf-generator";
import { sipFutureValue, inflationAdjustedFV } from "./financial-engine";

export async function generateGoalsExcel(goals: GoalWithCalculations[]): Promise<any> {
  const workbook = new ExcelJS.Workbook();
  
  // ────────────────────────────────────────────────────────
  // SHEET 1: GOALS OVERVIEW
  // ────────────────────────────────────────────────────────
  const sheet1 = workbook.addWorksheet("Goals Overview");
  
  sheet1.columns = [
    { header: "Goal Name", key: "name", width: 20 },
    { header: "Type", key: "type", width: 15 },
    { header: "Priority", key: "priority", width: 12 },
    { header: "Target Date", key: "targetDate", width: 15 },
    { header: "Today's Cost", key: "targetAmountToday", width: 15 },
    { header: "Future Value", key: "futureValue", width: 15 },
    { header: "Inflation Rate", key: "inflationRate", width: 15 },
    { header: "Current Corpus", key: "currentCorpus", width: 15 },
    { header: "Current SIP", key: "currentSIP", width: 15 },
    { header: "Required SIP", key: "requiredSIP", width: 15 },
    { header: "Lump Sum Needed", key: "lumpSumNeeded", width: 15 },
    { header: "Funding Gap", key: "fundingGap", width: 15 },
    { header: "Success %", key: "successProbability", width: 12 },
    { header: "Risk", key: "riskAppetite", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];

  // Apply dark/theme styles to header row
  const headerRow = sheet1.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6C63FF" }, // brand primary (violet)
    };
    cell.font = {
      color: { argb: "FFFFFFFF" },
      bold: true,
      size: 11,
      name: "Segoe UI",
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Populate goals data
  goals.forEach((g, index) => {
    const calcs = g.calculations;
    const isOdd = index % 2 === 0;
    const rowColor = isOdd ? "FF1A1B2E" : "FF111226"; // surface-700 / surface-800

    const formattedDate = new Date(g.targetDate).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });

    const yearsRemaining = calcs?.yearsRemaining ?? 0;
    const returnRate = calcs?.expectedReturn ?? 10;
    // Lump sum needed formula: target / (1 + r)^n
    const lumpSumNeeded = Math.round(
      (calcs?.futureValue ?? g.targetAmountToday) / Math.pow(1 + returnRate / 100, yearsRemaining)
    );

    const dataRow = sheet1.addRow({
      name: g.name,
      type: g.type,
      priority: g.priority,
      targetDate: formattedDate,
      targetAmountToday: g.targetAmountToday,
      futureValue: calcs?.futureValue ?? g.targetAmountToday,
      inflationRate: g.inflationRate,
      currentCorpus: g.currentCorpus,
      currentSIP: g.currentSIP,
      requiredSIP: calcs?.requiredSIP ?? g.currentSIP,
      lumpSumNeeded: lumpSumNeeded,
      fundingGap: calcs?.fundingGap ?? 0,
      successProbability: calcs?.successProbability ?? 0,
      riskAppetite: g.riskAppetite,
      status: g.status.replace("_", " "),
    });

    dataRow.height = 20;

    dataRow.eachCell((cell, colNum) => {
      // Style cells
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowColor },
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        size: 10,
        name: "Segoe UI",
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };

      // Number formats
      // Money columns: Today's Cost (5), Future Value (6), Current Corpus (8), Current SIP (9), Required SIP (10), Lump Sum Needed (11), Funding Gap (12)
      if ([5, 6, 8, 9, 10, 11, 12].includes(colNum)) {
        cell.numFmt = "[$₹-439]#,##,##0";
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
      
      // Percentage columns: Inflation (7), Success (13)
      // Note: Values in DB are like 6 (not 0.06), so format 0.00"%" is appropriate.
      if ([7, 13].includes(colNum)) {
        cell.numFmt = '0.00"%"';
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
      
      // Center align specific columns
      if ([3, 4, 14, 15].includes(colNum)) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
    });
  });

  // Freeze top row
  sheet1.views = [{ state: "frozen", ySplit: 1 }];
  
  // Add auto-filter
  sheet1.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: goals.length + 1, column: 15 },
  };

  // ────────────────────────────────────────────────────────
  // SHEET 2: YEAR-BY-YEAR PROJECTIONS
  // ────────────────────────────────────────────────────────
  const sheet2 = workbook.addWorksheet("Year-by-Year Projections");
  sheet2.columns = [
    { header: "Goal Name", key: "goalName", width: 20 },
    { header: "Year", key: "year", width: 10 },
    { header: "Years from Now", key: "yearsFromNow", width: 15 },
    { header: "Corpus (₹)", key: "corpus", width: 18 },
    { header: "Target (₹)", key: "target", width: 18 },
    { header: "Gap (₹)", key: "gap", width: 18 },
    { header: "On Track?", key: "onTrack", width: 12 },
  ];

  // Header styles
  const headerRow2 = sheet2.getRow(1);
  headerRow2.height = 24;
  headerRow2.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6C63FF" },
    };
    cell.font = {
      color: { argb: "FFFFFFFF" },
      bold: true,
      size: 11,
      name: "Segoe UI",
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  let projRowIndex = 2;

  goals.forEach((g) => {
    const calcs = g.calculations;
    const yearsRemaining = calcs?.yearsRemaining ?? 0;
    const totalYears = Math.ceil(yearsRemaining);
    const returnRate = calcs?.expectedReturn ?? 10;
    const reqSIP = calcs?.requiredSIP ?? g.currentSIP;

    // Loop through years (0 to totalYears)
    for (let y = 0; y <= totalYears; y++) {
      const lumpSumGrowth = g.currentCorpus * Math.pow(1 + returnRate / 100, y);
      const sipGrowth = sipFutureValue(reqSIP, returnRate, y * 12);
      const corpusVal = Math.round(lumpSumGrowth + sipGrowth);
      const targetVal = Math.round(inflationAdjustedFV(g.targetAmountToday, g.inflationRate, y));
      const fundingGapVal = Math.max(0, targetVal - corpusVal);
      const onTrack = corpusVal >= targetVal ? "Yes" : "No";

      const projRow = sheet2.addRow({
        goalName: g.name,
        year: `Year ${y}`,
        yearsFromNow: y,
        corpus: corpusVal,
        target: targetVal,
        gap: fundingGapVal,
        onTrack: onTrack,
      });

      projRow.height = 20;
      
      const rowColor = projRowIndex % 2 === 0 ? "FF1A1B2E" : "FF111226";

      projRow.eachCell((cell, colNum) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowColor },
        };
        cell.font = {
          color: { argb: "FFFFFFFF" },
          size: 10,
          name: "Segoe UI",
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };

        if ([4, 5, 6].includes(colNum)) {
          cell.numFmt = "[$₹-439]#,##,##0";
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }
        if ([2, 3, 7].includes(colNum)) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      projRowIndex++;
    }

    // Add empty row separating goals
    const separatorRow = sheet2.addRow({});
    separatorRow.height = 15;
    separatorRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0A0B14" },
      };
    });
    projRowIndex++;
  });

  // Freeze top row
  sheet2.views = [{ state: "frozen", ySplit: 1 }];

  // ────────────────────────────────────────────────────────
  // SHEET 3: INVESTMENT PLAN
  // ────────────────────────────────────────────────────────
  const sheet3 = workbook.addWorksheet("Investment Plan");
  sheet3.columns = [
    { header: "Goal Name", key: "goalName", width: 20 },
    { header: "Instrument", key: "instrumentName", width: 25 },
    { header: "Allocation %", key: "allocationPct", width: 15 },
    { header: "Allocation Amount (₹)", key: "allocationAmt", width: 20 },
    { header: "Expected Return", key: "expectedReturn", width: 15 },
    { header: "Risk Level", key: "riskLevel", width: 15 },
    { header: "Reason", key: "reason", width: 40 },
  ];

  // Header styles
  const headerRow3 = sheet3.getRow(1);
  headerRow3.height = 24;
  headerRow3.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6C63FF" },
    };
    cell.font = {
      color: { argb: "FFFFFFFF" },
      bold: true,
      size: 11,
      name: "Segoe UI",
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  let planRowIndex = 2;

  goals.forEach((g) => {
    const calcs = g.calculations;
    const reqSIP = calcs?.requiredSIP ?? g.currentSIP;
    const instruments = g.aiInsights?.instruments ?? [];

    if (instruments.length > 0) {
      instruments.forEach((inst) => {
        const allocationAmt = Math.round((reqSIP * inst.allocation) / 100);
        
        const planRow = sheet3.addRow({
          goalName: g.name,
          instrumentName: inst.name,
          allocationPct: inst.allocation,
          allocationAmt: allocationAmt,
          expectedReturn: inst.expectedReturn,
          riskLevel: inst.risk,
          reason: inst.why || "",
        });

        planRow.height = 20;
        const rowColor = planRowIndex % 2 === 0 ? "FF1A1B2E" : "FF111226";

        planRow.eachCell((cell, colNum) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: rowColor },
          };
          cell.font = {
            color: { argb: "FFFFFFFF" },
            size: 10,
            name: "Segoe UI",
          };
          cell.alignment = { vertical: "middle", horizontal: "left" };

          if (colNum === 3) {
            cell.numFmt = '0"%"';
            cell.alignment = { vertical: "middle", horizontal: "right" };
          }
          if (colNum === 4) {
            cell.numFmt = "[$₹-439]#,##,##0";
            cell.alignment = { vertical: "middle", horizontal: "right" };
          }
          if ([5, 6].includes(colNum)) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          }
        });

        planRowIndex++;
      });
    } else {
      const planRow = sheet3.addRow({
        goalName: g.name,
        instrumentName: "Run AI analysis to see recommendations",
        allocationPct: null,
        allocationAmt: null,
        expectedReturn: "—",
        riskLevel: "—",
        reason: "—",
      });

      planRow.height = 20;
      const rowColor = planRowIndex % 2 === 0 ? "FF1A1B2E" : "FF111226";

      planRow.eachCell((cell, colNum) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowColor },
        };
        cell.font = {
          color: { argb: "FFFFFFFF" },
          size: 10,
          name: "Segoe UI",
          italic: colNum === 2,
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };

        if ([5, 6, 7].includes(colNum)) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      planRowIndex++;
    }

    // Add empty row separating goals
    const separatorRow = sheet3.addRow({});
    separatorRow.height = 15;
    separatorRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0A0B14" },
      };
    });
    planRowIndex++;
  });

  // Freeze top row
  sheet3.views = [{ state: "frozen", ySplit: 1 }];

  // Auto-fit columns for all sheets (min 15, max 30)
  [sheet1, sheet2, sheet3].forEach((sh) => {
    sh.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const valStr = cell.value ? cell.value.toString() : "";
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      column.width = Math.min(30, Math.max(15, maxLen + 2));
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function downloadGoalsExcel(goals: GoalWithCalculations[]) {
  const buffer = await generateGoalsExcel(goals);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `GoalWise-Report-${new Date().toISOString().split("T")[0]}.xlsx`);
}

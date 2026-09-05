/**
 * FinScore Utility (0–1000 Metric for Indian Personal Finances)
 * Evaluates comprehensive financial resilience, wealth-building velocity, and risk management.
 */

export const FINSCORE_TIERS = {
  FORTRESS: { label: "Financial Fortress", min: 850, max: 1000, color: "emerald", badge: "🛡️ Master", description: "World-class financial discipline, exceptional runway and diversified assets." },
  COMPOUNDER: { label: "Wealth Compounder", min: 720, max: 849, color: "blue", badge: "🚀 High Growth", description: "Strong savings velocity with well-structured debt and investment portfolio." },
  BUILDER: { label: "Stable Builder", min: 580, max: 719, color: "indigo", badge: "📈 Growing", description: "Healthy core foundation with clear opportunities to optimize savings and tax." },
  EMERGING: { label: "Emerging Foundation", min: 420, max: 579, color: "amber", badge: "⚠️ Caution", description: "Vulnerable to unexpected shocks. Needs stronger emergency reserves and lower debt." },
  CRITICAL: { label: "Action Required", min: 0, max: 419, color: "rose", badge: "🚨 High Risk", description: "Expenses exceed safe thresholds or high unmanaged debt obligations." },
};

/**
 * Calculates complete FinScore Breakdown (0–1000)
 * 
 * @param {Object} finances - Financial data object
 * @returns {Object} Full score breakdown with sub-scores, tier, and milestone badges
 */
export function calculateFinScore(finances = {}) {
  if (!finances || typeof finances !== "object") {
    return {
      totalScore: 0,
      tier: FINSCORE_TIERS.CRITICAL,
      subScores: { savings: 0, emergency: 0, debt: 0, diversification: 0, investments: 0 },
      metrics: {
        savingsRate: 0,
        emergencyMonths: 0,
        dtiRatio: 0,
        debtRatio: 0,
        investmentRate: 0,
        assetClassesCount: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netWorth: 0,
      },
      badges: [],
      strengths: [],
      improvements: [],
    };
  }

  const sumSafe = (obj) => {
    if (!obj || typeof obj !== "object") return 0;
    return Object.values(obj).reduce((sum, val) => {
      const num = Number(val);
      return sum + (Number.isFinite(num) ? num : 0);
    }, 0);
  };

  const income = sumSafe(finances.income);
  const fixedExpenses = sumSafe(finances.fixedExpenses);
  const variableExpenses = sumSafe(finances.variableExpenses);
  const totalExpenses = fixedExpenses + variableExpenses;
  const totalInvestments = sumSafe(finances.investments);
  const totalLoans = sumSafe(finances.loans);

  // 1. Savings Rate Score (0 - 300 pts) [30% Weight]
  const netSavings = income > 0 ? income - totalExpenses : 0;
  const savingsRate = income > 0 ? Math.max(0, (netSavings / income) * 100) : 0;

  let savingsScore = 0;
  if (savingsRate >= 45) savingsScore = 300;
  else if (savingsRate >= 35) savingsScore = 260 + ((savingsRate - 35) / 10) * 40;
  else if (savingsRate >= 20) savingsScore = 180 + ((savingsRate - 20) / 15) * 80;
  else if (savingsRate >= 10) savingsScore = 100 + ((savingsRate - 10) / 10) * 80;
  else if (savingsRate > 0) savingsScore = (savingsRate / 10) * 100;
  else savingsScore = 0;

  // 2. Emergency Buffer Score (0 - 250 pts) [25% Weight]
  // Estimate liquid funds = Fixed Deposits + 20% of Mutual Funds + 6mo monthly savings
  const fd = Number(finances.investments?.fd);
  const ppf = Number(finances.investments?.ppf);
  const liquidEstimate = (Number.isFinite(fd) ? Math.max(0, fd) : 0) +
                         (Number.isFinite(ppf) ? Math.max(0, ppf) * 0.1 : 0) +
                         Math.max(0, netSavings * 4);
  const monthlyBurn = totalExpenses > 0 ? totalExpenses : 1;
  const emergencyMonthsRaw = liquidEstimate / monthlyBurn;
  const emergencyMonths = Number.isFinite(emergencyMonthsRaw) ? Number(emergencyMonthsRaw.toFixed(1)) : 0;

  let emergencyScore = 0;
  if (emergencyMonths >= 6) emergencyScore = 250;
  else if (emergencyMonths >= 3) emergencyScore = 160 + ((emergencyMonths - 3) / 3) * 90;
  else if (emergencyMonths >= 1) emergencyScore = 80 + ((emergencyMonths - 1) / 2) * 80;
  else emergencyScore = Math.max(0, emergencyMonths * 80);

  // 3. Debt-to-Income Health Score (0 - 250 pts) [25% Weight]
  const homeLoan = Number(finances.loans?.home);
  const carLoan = Number(finances.loans?.car);
  const personalLoan = Number(finances.loans?.personal);
  const educationLoan = Number(finances.loans?.education);
  const ccLoan = Number(finances.loans?.credit_card);

  const estimatedMonthlyDebt = (Number.isFinite(homeLoan) ? Math.max(0, homeLoan) * 0.0085 : 0) +
                               (Number.isFinite(carLoan) ? Math.max(0, carLoan) * 0.02 : 0) +
                               (Number.isFinite(personalLoan) ? Math.max(0, personalLoan) * 0.025 : 0) +
                               (Number.isFinite(educationLoan) ? Math.max(0, educationLoan) * 0.012 : 0) +
                               (Number.isFinite(ccLoan) ? Math.max(0, ccLoan) * 0.05 : 0);

  const dtiRatio = income > 0 ? Number(((estimatedMonthlyDebt / income) * 100).toFixed(1)) : (totalLoans > 0 ? 100 : 0);

  let debtScore = 0;
  if (totalLoans === 0 || dtiRatio === 0) debtScore = 250;
  else if (dtiRatio <= 15) debtScore = 240 - (dtiRatio / 15) * 20;
  else if (dtiRatio <= 30) debtScore = 200 - ((dtiRatio - 15) / 15) * 40;
  else if (dtiRatio <= 45) debtScore = 140 - ((dtiRatio - 30) / 15) * 50;
  else if (dtiRatio <= 60) debtScore = 80 - ((dtiRatio - 45) / 15) * 50;
  else debtScore = Math.max(10, 30 - ((dtiRatio - 60) / 40) * 30);

  // 4. Asset Diversification Score (0 - 200 pts) [20% Weight]
  const assetKeys = ["equity", "mutual_funds", "fd", "ppf", "epf", "nps", "gold", "real_estate", "crypto"];
  const activeAssets = assetKeys.filter(k => {
    const val = Number(finances.investments?.[k]);
    return Number.isFinite(val) && val > 10000;
  });
  const assetClassesCount = activeAssets.length;

  let diversificationScore = 0;
  if (assetClassesCount >= 5) diversificationScore = 200;
  else if (assetClassesCount === 4) diversificationScore = 175;
  else if (assetClassesCount === 3) diversificationScore = 140;
  else if (assetClassesCount === 2) diversificationScore = 95;
  else if (assetClassesCount === 1) diversificationScore = 50;
  else diversificationScore = 0;

  const rawTotalScore = savingsScore + emergencyScore + debtScore + diversificationScore;
  const totalScore = Number.isFinite(rawTotalScore) ? Math.min(1000, Math.max(0, Math.round(rawTotalScore))) : 0;

  // Determine Tier
  let tier = FINSCORE_TIERS.CRITICAL;
  if (totalScore >= FINSCORE_TIERS.FORTRESS.min) tier = FINSCORE_TIERS.FORTRESS;
  else if (totalScore >= FINSCORE_TIERS.COMPOUNDER.min) tier = FINSCORE_TIERS.COMPOUNDER;
  else if (totalScore >= FINSCORE_TIERS.BUILDER.min) tier = FINSCORE_TIERS.BUILDER;
  else if (totalScore >= FINSCORE_TIERS.EMERGING.min) tier = FINSCORE_TIERS.EMERGING;

  // Compute Achievements & Badges
  const badges = [];
  if (emergencyMonths >= 6) {
    badges.push({ id: "shield_6m", name: "6-Month Shield", icon: "🛡️", desc: "Solid liquid emergency buffer" });
  }
  if (dtiRatio <= 15 && totalLoans > 0) {
    badges.push({ id: "debt_slayer", name: "Debt Slayer", icon: "🗡️", desc: "Outstanding debt well below 15% DTI" });
  } else if (totalLoans === 0 && totalInvestments > 100000) {
    badges.push({ id: "debt_free", name: "Debt Free Hero", icon: "✨", desc: "100% Zero liabilities" });
  }
  if (savingsRate >= 35) {
    badges.push({ id: "high_velocity", name: "Velocity Saver", icon: "🚀", desc: "Saving over 35% of monthly cash flow" });
  }
  if (assetClassesCount >= 4) {
    badges.push({ id: "diversified", name: "Master Allocator", icon: "🌐", desc: "Assets distributed across 4+ classes" });
  }
  if (totalInvestments >= 10000000) {
    badges.push({ id: "crorepati", name: "Crorepati Club", icon: "👑", desc: "Portfolio exceeds ₹1 Crore" });
  } else if (totalInvestments >= 2500000) {
    badges.push({ id: "quarter_crore", name: "25 Lakh Milestone", icon: "💎", desc: "Quarter crore invested assets" });
  }

  // Strengths & Opportunities
  const strengths = [];
  const improvements = [];

  if (savingsRate >= 30) strengths.push(`Strong savings rate of ${savingsRate.toFixed(0)}%`);
  else improvements.push(`Increase monthly savings rate (currently ${savingsRate.toFixed(0)}%, target 30%+)`);

  if (emergencyMonths >= 5) strengths.push(`Healthy emergency buffer of ${emergencyMonths} months`);
  else improvements.push(`Build liquid reserves to at least 6 months of expenses (currently ${emergencyMonths} mos)`);

  if (dtiRatio <= 25) strengths.push(`Low debt obligations (${dtiRatio}% of income)`);
  else improvements.push(`Reduce high-interest debt to bring DTI ratio under 25% (currently ${dtiRatio}%)`);

  if (assetClassesCount >= 3) strengths.push(`Diversified across ${assetClassesCount} asset classes`);
  else improvements.push(`Diversify into additional asset classes like Index SIPs, Gold, or PPF`);

  const rawInvestmentRate = income > 0 ? (totalInvestments / income) * 100 : 0;
  const investmentRate = Number.isFinite(rawInvestmentRate) ? Number(rawInvestmentRate.toFixed(1)) : 0;

  return {
    totalScore,
    tier,
    subScores: {
      savings: Number.isFinite(savingsScore) ? Math.round(savingsScore) : 0,
      emergency: Number.isFinite(emergencyScore) ? Math.round(emergencyScore) : 0,
      debt: Number.isFinite(debtScore) ? Math.round(debtScore) : 0,
      diversification: Number.isFinite(diversificationScore) ? Math.round(diversificationScore) : 0,
      investments: Number.isFinite(diversificationScore) ? Math.round(diversificationScore) : 0,
    },
    metrics: {
      savingsRate: Number.isFinite(savingsRate) ? Number(savingsRate.toFixed(1)) : 0,
      emergencyMonths: Number.isFinite(emergencyMonths) ? Number(emergencyMonths) : 0,
      dtiRatio: Number.isFinite(dtiRatio) ? Number(dtiRatio) : 0,
      debtRatio: Number.isFinite(dtiRatio) ? Number(dtiRatio) : 0,
      investmentRate,
      assetClassesCount: Number.isFinite(assetClassesCount) ? Number(assetClassesCount) : 0,
      totalIncome: Number.isFinite(income) ? income : 0,
      totalExpenses: Number.isFinite(totalExpenses) ? totalExpenses : 0,
      netWorth: Number.isFinite(totalInvestments - totalLoans) ? totalInvestments - totalLoans : 0,
    },
    badges,
    strengths,
    improvements,
  };
}

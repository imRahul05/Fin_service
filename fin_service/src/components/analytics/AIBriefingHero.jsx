import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  RotateCcw, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink,
  Activity,
  Layers
} from "lucide-react";
import { formatCurrency } from "../../utils/financialUtils";

export default function AIBriefingHero({
  summaryData,
  aiAdvice,
  loading,
  isRefreshing,
  cacheInfo,
  onRefresh,
  onOpenFullAdvice
}) {
  const {
    monthlySavings = 0,
    debtToIncomeRatio = 0,
    totalIncome = 0,
    totalExpenses = 0,
    totalInvestments = 0
  } = summaryData || {};

  const numMonthlySavings = Number(monthlySavings) || 0;
  const numTotalIncome = Number(totalIncome) || 0;
  const numTotalExpenses = Number(totalExpenses) || 0;
  const numTotalInvestments = Number(totalInvestments) || 0;
  const numDebtRatio = Number.isFinite(Number(debtToIncomeRatio)) ? Number(debtToIncomeRatio) : 0;

  const savingsRate = numTotalIncome > 0 ? (numMonthlySavings / numTotalIncome) * 100 : 0;
  const investmentRatio = numTotalIncome > 0 ? (numTotalInvestments / numTotalIncome) * 100 : 0;

  // Calculate Financial Health Score (0-100)
  const healthScore = useMemo(() => {
    if (numTotalIncome <= 0) return 50;

    let score = 0;

    // 1. Savings Rate Score (0 - 30 pts)
    if (savingsRate >= 25) score += 30;
    else if (savingsRate >= 20) score += 26;
    else if (savingsRate >= 10) score += 18;
    else if (savingsRate > 0) score += 10;
    else score += 0;

    // 2. Debt to Income Score (0 - 30 pts)
    if (numDebtRatio === 0) score += 30;
    else if (numDebtRatio <= 20) score += 28;
    else if (numDebtRatio <= 36) score += 20;
    else if (numDebtRatio <= 50) score += 10;
    else score += 0;

    // 3. Investment Habit Score (0 - 20 pts)
    if (investmentRatio >= 15) score += 20;
    else if (investmentRatio >= 10) score += 15;
    else if (investmentRatio > 0) score += 8;
    else score += 0;

    // 4. Cash Flow & Net Balance (0 - 20 pts)
    if (numMonthlySavings > 0 && numTotalExpenses > 0) {
      const emergencyMonths = (numMonthlySavings * 6) / numTotalExpenses;
      if (emergencyMonths >= 6) score += 20;
      else if (emergencyMonths >= 3) score += 15;
      else score += 10;
    } else {
      score += 5;
    }

    return Math.min(100, Math.max(10, Math.round(score)));
  }, [numTotalIncome, savingsRate, numDebtRatio, investmentRatio, numMonthlySavings, numTotalExpenses]);

  // Health Score Badge Details with sober tone
  const scoreBadge = useMemo(() => {
    if (healthScore >= 80) {
      return { 
        label: "Optimal Standing", 
        color: "text-foreground", 
        bg: "bg-foreground", 
        lightBg: "bg-muted border-border/80" 
      };
    }
    if (healthScore >= 65) {
      return { 
        label: "Good Standing", 
        color: "text-foreground", 
        bg: "bg-foreground", 
        lightBg: "bg-muted border-border/80" 
      };
    }
    if (healthScore >= 50) {
      return { 
        label: "Optimization Needed", 
        color: "text-foreground", 
        bg: "bg-muted-foreground", 
        lightBg: "bg-muted border-border/80" 
      };
    }
    return { 
      label: "Attention Required", 
      color: "text-foreground", 
      bg: "bg-muted-foreground", 
      lightBg: "bg-muted border-border/80" 
    };
  }, [healthScore]);

  // Extract a brief 1-2 sentence excerpt from the advice if available
  const aiSummarySnippet = useMemo(() => {
    if (!aiAdvice || typeof aiAdvice !== "string") {
      return "FinSage is ready to analyze your cash flow, investments, and debt ratios.";
    }
    
    const summaryMatch = aiAdvice.match(/## Financial Summary\s*\n+([^#\n]+(?:\n+[^#\n]+)?)/i);
    if (summaryMatch && summaryMatch[1]) {
      const text = summaryMatch[1].replace(/[*_#>`]/g, "").trim();
      return text.length > 220 ? `${text.slice(0, 220)}...` : text;
    }

    const clean = aiAdvice.replace(/[*_#>`]/g, "").trim().split("\n").filter(Boolean);
    if (clean.length > 0) {
      return clean[0].length > 220 ? `${clean[0].slice(0, 220)}...` : clean[0];
    }
    return "Personalized financial guidance based on your live financial profile.";
  }, [aiAdvice]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-card transition-colors">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shrink-0 shadow-2xs">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Executive Financial Briefing
              </h3>
              <span className="inline-flex items-center rounded-full bg-muted border border-border/70 px-2.5 py-0.5 text-2xs font-semibold text-foreground">
                Live Assessment
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalized intelligence computed from your income, debt, and spending habits
            </p>
          </div>
        </div>

        {/* Right side cache & refresh controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {cacheInfo?.cached && cacheInfo?.formattedTime && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted px-3 py-1 text-xs font-medium text-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Cached ({cacheInfo.formattedTime})
            </span>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-2xs hover:bg-muted focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
              title="Refresh Advice"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Health Score + Bento Highlights + Synthesis */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Financial Health Score Gauge */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-border/60 bg-muted/30 p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Health Score
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold border ${scoreBadge.lightBg} ${scoreBadge.color}`}>
                {scoreBadge.label}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                {healthScore}
              </span>
              <span className="text-sm font-medium text-muted-foreground">/ 100</span>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ease-out ${scoreBadge.bg}`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
              Savings: {savingsRate.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-foreground" />
              DTI: {numDebtRatio.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-foreground" />
              Invest: {investmentRatio.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* 3 Bento Highlight Cards */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Highlight 1: Savings */}
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className="h-2 w-2 rounded-full bg-foreground" />
                <span>Monthly Savings</span>
              </div>
              <div className="mt-2 font-bold text-foreground text-base">
                {formatCurrency(numMonthlySavings)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                {savingsRate >= 20 
                  ? `Healthy ${savingsRate.toFixed(1)}% rate` 
                  : savingsRate > 0 
                    ? `Modest ${savingsRate.toFixed(1)}% rate` 
                    : numMonthlySavings < 0
                      ? "Expenses exceed income"
                      : "Zero net savings"}
              </p>
            </div>

            {/* Highlight 2: Debt */}
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className="h-2 w-2 rounded-full bg-foreground" />
                <span>Debt-to-Income</span>
              </div>
              <div className="mt-2 font-bold text-foreground text-base">
                {numDebtRatio.toFixed(1)}%
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                {numDebtRatio <= 20 
                  ? "Safe debt buffer" 
                  : numDebtRatio <= 36 
                    ? "Manageable range" 
                    : "High debt exposure"}
              </p>
            </div>

            {/* Highlight 3: Investments */}
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className="h-2 w-2 rounded-full bg-foreground" />
                <span>Investments</span>
              </div>
              <div className="mt-2 font-bold text-foreground text-base">
                {formatCurrency(numTotalInvestments)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                {investmentRatio >= 15 
                  ? "Good 15%+ allocation" 
                  : numTotalInvestments > 0 
                    ? "Consider boosting SIPs" 
                    : "No active investments"}
              </p>
            </div>
          </div>

          {/* Strategic Executive Summary Callout Bar */}
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
              <div className="line-clamp-2">
                <span className="font-semibold text-foreground">Strategic Synthesis: </span>
                {loading ? "Analyzing your latest metrics..." : aiSummarySnippet}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={onOpenFullAdvice}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <span>Read Strategy</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <Link
                to="/scenarios"
                className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground px-3.5 py-2 text-xs font-medium transition-colors"
              >
                <span>Simulate</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

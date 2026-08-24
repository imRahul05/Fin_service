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

  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0;
  const investmentRatio = totalIncome > 0 ? (totalInvestments / totalIncome) * 100 : 0;

  // Calculate Financial Health Score (0-100)
  const healthScore = useMemo(() => {
    if (!totalIncome || totalIncome <= 0) return 50;

    let score = 0;

    // 1. Savings Rate Score (0 - 30 pts)
    if (savingsRate >= 25) score += 30;
    else if (savingsRate >= 20) score += 26;
    else if (savingsRate >= 10) score += 18;
    else if (savingsRate > 0) score += 10;
    else score += 0;

    // 2. Debt to Income Score (0 - 30 pts)
    if (debtToIncomeRatio === 0) score += 30;
    else if (debtToIncomeRatio <= 20) score += 28;
    else if (debtToIncomeRatio <= 36) score += 20;
    else if (debtToIncomeRatio <= 50) score += 10;
    else score += 0;

    // 3. Investment Habit Score (0 - 20 pts)
    if (investmentRatio >= 15) score += 20;
    else if (investmentRatio >= 10) score += 15;
    else if (investmentRatio > 0) score += 8;
    else score += 0;

    // 4. Cash Flow & Net Balance (0 - 20 pts)
    if (monthlySavings > 0 && totalExpenses > 0) {
      const emergencyMonths = (monthlySavings * 6) / totalExpenses;
      if (emergencyMonths >= 6) score += 20;
      else if (emergencyMonths >= 3) score += 15;
      else score += 10;
    } else {
      score += 5;
    }

    return Math.min(100, Math.max(10, Math.round(score)));
  }, [totalIncome, savingsRate, debtToIncomeRatio, investmentRatio, monthlySavings, totalExpenses]);

  // Health Score Badge Details with sober tone
  const scoreBadge = useMemo(() => {
    if (healthScore >= 80) {
      return { 
        label: "Optimal Standing", 
        color: "text-emerald-700 dark:text-emerald-400", 
        bg: "bg-emerald-600 dark:bg-emerald-500", 
        lightBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" 
      };
    }
    if (healthScore >= 65) {
      return { 
        label: "Good Standing", 
        color: "text-slate-800 dark:text-slate-200", 
        bg: "bg-slate-800 dark:bg-slate-200", 
        lightBg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
      };
    }
    if (healthScore >= 50) {
      return { 
        label: "Optimization Needed", 
        color: "text-amber-800 dark:text-amber-400", 
        bg: "bg-amber-600 dark:bg-amber-500", 
        lightBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" 
      };
    }
    return { 
      label: "Attention Required", 
      color: "text-rose-800 dark:text-rose-400", 
      bg: "bg-rose-600 dark:bg-rose-500", 
      lightBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800" 
    };
  }, [healthScore]);

  // Extract a brief 1-2 sentence excerpt from the advice if available
  const aiSummarySnippet = useMemo(() => {
    if (!aiAdvice) return "FinSage is ready to analyze your cash flow, investments, and debt ratios.";
    
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 lg:p-7 shadow-sm transition-colors mb-8">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Executive Financial Briefing
              </h3>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-2xs font-semibold text-slate-700 dark:text-slate-300">
                Live Assessment
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personalized intelligence computed from your income, debt, and spending habits
            </p>
          </div>
        </div>

        {/* Right side cache & refresh controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {cacheInfo?.cached && cacheInfo?.formattedTime && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              Cached ({cacheInfo.formattedTime})
            </span>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none disabled:opacity-50 transition-colors cursor-pointer"
              title="Refresh Advice"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-slate-600 dark:text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Health Score + Bento Highlights + Synthesis */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Financial Health Score Gauge (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-4 sm:p-5 shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Health Score
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold border ${scoreBadge.lightBg} ${scoreBadge.color}`}>
                {scoreBadge.label}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {healthScore}
              </span>
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/ 100</span>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ease-out ${scoreBadge.bg}`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Savings: {savingsRate.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              DTI: {debtToIncomeRatio.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Invest: {investmentRatio.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* 3 Bento Highlight Cards (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Highlight 1: Savings & Cashflow */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className={`h-2 w-2 rounded-full ${
                  savingsRate >= 20 ? "bg-emerald-500" : savingsRate > 0 ? "bg-amber-500" : "bg-rose-500"
                }`} />
                <span>Monthly Savings</span>
              </div>
              <div className="mt-1.5 font-bold text-slate-900 dark:text-white text-base">
                {formatCurrency(monthlySavings)}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                {savingsRate >= 20 
                  ? `Healthy ${savingsRate.toFixed(1)}% rate` 
                  : savingsRate > 0 
                    ? `Modest ${savingsRate.toFixed(1)}% rate` 
                    : "Expenses exceed income"}
              </p>
            </div>

            {/* Highlight 2: Debt Exposure */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className={`h-2 w-2 rounded-full ${
                  debtToIncomeRatio <= 20 ? "bg-emerald-500" : debtToIncomeRatio <= 36 ? "bg-amber-500" : "bg-rose-500"
                }`} />
                <span>Debt-to-Income</span>
              </div>
              <div className="mt-1.5 font-bold text-slate-900 dark:text-white text-base">
                {debtToIncomeRatio.toFixed(1)}%
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                {debtToIncomeRatio <= 20 
                  ? "Safe debt buffer" 
                  : debtToIncomeRatio <= 36 
                    ? "Manageable range" 
                    : "High debt exposure"}
              </p>
            </div>

            {/* Highlight 3: Investments & Growth */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white" />
                <span>Investments</span>
              </div>
              <div className="mt-1.5 font-bold text-slate-900 dark:text-white text-base">
                {formatCurrency(totalInvestments)}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                {investmentRatio >= 15 
                  ? "Good 15%+ allocation" 
                  : totalInvestments > 0 
                    ? "Consider boosting SIPs" 
                    : "No active investments"}
              </p>
            </div>
          </div>

          {/* Strategic Executive Summary Callout Bar */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <div className="line-clamp-2">
                <span className="font-semibold text-slate-900 dark:text-white">Strategic Synthesis: </span>
                {loading ? "Analyzing your latest metrics..." : aiSummarySnippet}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={onOpenFullAdvice}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <span>Read Strategy</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <Link
                to="/scenarios"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <span>Simulate</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

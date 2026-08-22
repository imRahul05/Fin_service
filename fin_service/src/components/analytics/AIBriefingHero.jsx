import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink,
  Zap
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

  // Health Score Badge Details with high dark mode contrast
  const scoreBadge = useMemo(() => {
    if (healthScore >= 80) {
      return { 
        label: "Strong Health", 
        color: "text-emerald-700 dark:text-emerald-300", 
        bg: "bg-emerald-500", 
        lightBg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800" 
      };
    }
    if (healthScore >= 65) {
      return { 
        label: "Good Standing", 
        color: "text-blue-700 dark:text-blue-300", 
        bg: "bg-blue-500", 
        lightBg: "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800" 
      };
    }
    if (healthScore >= 50) {
      return { 
        label: "Needs Optimization", 
        color: "text-amber-800 dark:text-amber-300", 
        bg: "bg-amber-500", 
        lightBg: "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800" 
      };
    }
    return { 
      label: "Attention Required", 
      color: "text-rose-800 dark:text-rose-300", 
      bg: "bg-rose-500", 
      lightBg: "bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800" 
    };
  }, [healthScore]);

  // Extract a brief 1-2 sentence excerpt from the AI advice if available
  const aiSummarySnippet = useMemo(() => {
    if (!aiAdvice) return "FinSage AI is ready to analyze your cash flow, investments, and debt ratios.";
    
    // Find text under ## Financial Summary or first clean paragraph
    const summaryMatch = aiAdvice.match(/## Financial Summary\s*\n+([^#\n]+(?:\n+[^#\n]+)?)/i);
    if (summaryMatch && summaryMatch[1]) {
      const text = summaryMatch[1].replace(/[*_#>`]/g, "").trim();
      return text.length > 220 ? `${text.slice(0, 220)}...` : text;
    }

    const clean = aiAdvice.replace(/[*_#>`]/g, "").trim().split("\n").filter(Boolean);
    if (clean.length > 0) {
      return clean[0].length > 220 ? `${clean[0].slice(0, 220)}...` : clean[0];
    }
    return "Personalized AI financial guidance based on your live financial profile.";
  }, [aiAdvice]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6 lg:p-7 shadow-sm dark:shadow-gray-950/60 transition-colors mb-8">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100 dark:border-gray-700/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                FinSage AI Executive Briefing
              </h3>
              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                Live Advisor
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Personalized intelligence computed from your income, debt, and spending habits
            </p>
          </div>
        </div>

        {/* Right side cache & refresh controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {cacheInfo?.cached && cacheInfo?.formattedTime && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              Cached ({cacheInfo.formattedTime})
            </span>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
              title="Refresh AI Advice"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Health Score + Bento Highlights + Synthesis */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Financial Health Score Gauge (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/70 p-4 sm:p-5 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Financial Health Score
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${scoreBadge.lightBg} ${scoreBadge.color}`}>
                {scoreBadge.label}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {healthScore}
              </span>
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500">/ 100</span>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ease-out ${scoreBadge.bg}`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Savings: {savingsRate.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              DTI: {debtToIncomeRatio.toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              Invest: {investmentRatio.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* 3 Bento Highlight Cards (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Highlight 1: Savings & Cashflow */}
            <div className={`p-3.5 rounded-xl border transition-colors ${
              savingsRate >= 20 
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70" 
                : savingsRate > 0 
                  ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/70" 
                  : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/70"
            }`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                <span className={`h-2 w-2 rounded-full ${
                  savingsRate >= 20 ? "bg-emerald-500" : savingsRate > 0 ? "bg-amber-500" : "bg-rose-500"
                }`} />
                <span>Monthly Savings</span>
              </div>
              <div className="mt-1.5 font-bold text-gray-900 dark:text-white text-base">
                {formatCurrency(monthlySavings)}
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 font-medium">
                {savingsRate >= 20 
                  ? `Strong ${savingsRate.toFixed(1)}% savings rate` 
                  : savingsRate > 0 
                    ? `Modest ${savingsRate.toFixed(1)}% savings rate` 
                    : "Expenses exceed monthly income"}
              </p>
            </div>

            {/* Highlight 2: Debt Exposure */}
            <div className={`p-3.5 rounded-xl border transition-colors ${
              debtToIncomeRatio <= 20 
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70" 
                : debtToIncomeRatio <= 36 
                  ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/70" 
                  : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/70"
            }`}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                <span className={`h-2 w-2 rounded-full ${
                  debtToIncomeRatio <= 20 ? "bg-emerald-500" : debtToIncomeRatio <= 36 ? "bg-amber-500" : "bg-rose-500"
                }`} />
                <span>Debt-to-Income</span>
              </div>
              <div className="mt-1.5 font-bold text-gray-900 dark:text-white text-base">
                {debtToIncomeRatio.toFixed(1)}%
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 font-medium">
                {debtToIncomeRatio <= 20 
                  ? "Safe debt-to-income buffer" 
                  : debtToIncomeRatio <= 36 
                    ? "Manageable, near standard limit" 
                    : "Exceeds 36% limit; reduce debt"}
              </p>
            </div>

            {/* Highlight 3: Investments & Growth */}
            <div className="p-3.5 rounded-xl border bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/70 transition-colors">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Investments</span>
              </div>
              <div className="mt-1.5 font-bold text-gray-900 dark:text-white text-base">
                {formatCurrency(totalInvestments)}
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 font-medium">
                {investmentRatio >= 15 
                  ? "Healthy 15%+ allocation target" 
                  : totalInvestments > 0 
                    ? "Consider boosting SIPs" 
                    : "No active investments reported"}
              </p>
            </div>
          </div>

          {/* AI Executive Summary Callout Bar */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-900/90 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5 text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="line-clamp-2">
                <span className="font-semibold text-gray-900 dark:text-white">AI Synthesis: </span>
                {loading ? "Analyzing your latest metrics..." : aiSummarySnippet}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={onOpenFullAdvice}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:shadow cursor-pointer"
              >
                <span>Read Full Strategy</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <Link
                to="/scenarios"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <span>Simulate</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

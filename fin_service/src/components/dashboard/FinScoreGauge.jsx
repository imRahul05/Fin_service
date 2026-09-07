import { useMemo } from "react";
import { calculateFinScore, calculateHealthScore } from "../../utils/finScore.utils";
import { ShieldCheck, ArrowUpRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function FinScoreGauge({ finances, className = "" }) {
  const finScoreData = useMemo(() => calculateFinScore(finances), [finances]);
  const { totalScore = 0, tier = {}, subScores = {}, metrics = {} } = finScoreData || {};

  const safeNum = (val, fallback = 0) => (Number.isFinite(Number(val)) ? Number(val) : fallback);

  const score = safeNum(totalScore);
  const finPercentage = Math.min(100, Math.max(0, (score / 1000) * 100));
  // 2 * PI * 38 ≈ 238.76
  const finCircumference = 238.76;
  const finDashoffset = finCircumference - (finCircumference * finPercentage) / 100;

  const healthData = useMemo(() => calculateHealthScore(finances, metrics), [finances, metrics]);
  const healthScore = safeNum(healthData.score, 50);
  const healthPercentage = Math.min(100, Math.max(0, healthScore));
  const healthCircumference = 238.76;
  const healthDashoffset = healthCircumference - (healthCircumference * healthPercentage) / 100;

  const savingsRate = safeNum(metrics?.savingsRate);
  const debtRatio = safeNum(metrics?.debtRatio ?? metrics?.dtiRatio);
  const emergencyMonths = safeNum(metrics?.emergencyMonths);
  const investmentRate = safeNum(metrics?.investmentRate);

  const savingsScore = safeNum(subScores?.savings);
  const debtScore = safeNum(subScores?.debt);
  const emergencyScore = safeNum(subScores?.emergency);
  const investmentsScore = safeNum(subScores?.investments ?? subScores?.diversification);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* CARD 1: FinScore Index (0–1000) */}
      <div className="bg-card rounded-3xl border border-border/80 p-5 sm:p-6 shadow-card flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-foreground text-background shrink-0 shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-none">
                FinScore Index
              </h3>
              <p className="text-2xs text-muted-foreground mt-1">Composite Resilience (0–1000)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
              {tier?.label || "Assessment"}
            </span>
            <Link
              to="/analytics"
              className="text-2xs font-semibold text-foreground hover:underline flex items-center gap-0.5"
              title="Deep Analytics"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Body: Radial Gauge + 4 Pillar Bars */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Radial Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 sm:w-22 sm:h-22 transform -rotate-90" viewBox="0 0 92 92">
              <circle
                cx="46"
                cy="46"
                r="38"
                className="stroke-muted"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="46"
                cy="46"
                r="38"
                className="stroke-foreground transition-all duration-1000 ease-out"
                strokeWidth="6"
                strokeDasharray={finCircumference}
                strokeDashoffset={finDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-none">
                {score}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                / 1000
              </span>
            </div>
          </div>

          {/* 4 Pillars in a high-density 2x2 grid */}
          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2.5 min-w-0">
            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-muted-foreground font-medium truncate">Savings</span>
                <span className="font-bold text-foreground shrink-0">{savingsScore}/300</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (savingsScore / 300) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-muted-foreground font-medium truncate">Debt Shield</span>
                <span className="font-bold text-foreground shrink-0">{debtScore}/250</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (debtScore / 250) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-muted-foreground font-medium truncate">Emergency</span>
                <span className="font-bold text-foreground shrink-0">{emergencyScore}/250</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (emergencyScore / 250) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-muted-foreground font-medium truncate">Investments</span>
                <span className="font-bold text-foreground shrink-0">{investmentsScore}/200</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (investmentsScore / 200) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-2xs text-muted-foreground">
          <span className="truncate">{tier?.description || "High resilience and wealth discipline trajectory."}</span>
        </div>
      </div>

      {/* CARD 2: Financial Health Score (0–100) */}
      <div className="bg-card rounded-3xl border border-border/80 p-5 sm:p-6 shadow-card flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-foreground text-background shrink-0 shadow-2xs">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-none">
                Financial Health
              </h3>
              <p className="text-2xs text-muted-foreground mt-1">Operational Index (0–100)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
              {healthData.label}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        {/* Body: Radial Gauge + 4 Diagnostic Metrics */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Radial Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 sm:w-22 sm:h-22 transform -rotate-90" viewBox="0 0 92 92">
              <circle
                cx="46"
                cy="46"
                r="38"
                className="stroke-muted"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="46"
                cy="46"
                r="38"
                className="stroke-foreground transition-all duration-1000 ease-out"
                strokeWidth="6"
                strokeDasharray={healthCircumference}
                strokeDashoffset={healthDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-none">
                {healthScore}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                / 100
              </span>
            </div>
          </div>

          {/* 4 Health Factors in a matching 2x2 grid */}
          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2.5 min-w-0">
            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-muted-foreground font-medium truncate">Savings Rate</span>
                <span className="font-bold text-foreground shrink-0">{savingsRate.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (healthData.breakdown.savings / 30) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-muted-foreground font-medium truncate">Debt-to-Income</span>
                <span className="font-bold text-foreground shrink-0">{debtRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (healthData.breakdown.debt / 30) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-muted-foreground font-medium truncate">Runway</span>
                <span className="font-bold text-foreground shrink-0">{emergencyMonths.toFixed(1)}m</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (healthData.breakdown.cushion / 20) * 100))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-2xs mb-1">
                <span className="text-muted-foreground font-medium truncate">Invest Ratio</span>
                <span className="font-bold text-foreground shrink-0">{investmentRate.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (healthData.breakdown.investment / 20) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-2xs text-muted-foreground">
          <span className="truncate">
            {healthScore >= 80 
              ? "Optimal liquidity buffer and disciplined debt exposure."
              : healthScore >= 65 
                ? "Solid financial foundation with manageable risk exposure."
                : "Optimization recommended for debt coverage and reserve runway."}
          </span>
        </div>
      </div>
    </div>
  );
}

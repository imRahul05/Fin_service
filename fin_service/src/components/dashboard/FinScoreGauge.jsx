import { useMemo } from "react";
import { calculateFinScore, calculateHealthScore } from "../../utils/finScore.utils";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
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
    <div
      className={`rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-card space-y-4 ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background shrink-0 shadow-2xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Financial Health & Resilience
              </h3>
              <span className="inline-flex items-center rounded-full bg-muted border border-border/70 px-2 py-0.5 text-2xs font-semibold text-foreground">
                Dual Engine
              </span>
            </div>
            <p className="text-2xs text-muted-foreground mt-0.5">
              Comprehensive telemetry evaluating reserve strength, debt coverage, and asset velocity
            </p>
          </div>
        </div>

        <Link
          to="/analytics"
          className="text-2xs font-semibold text-foreground hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Deep Analytics</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Dual Score Bento Grid: FinScore (Left) & Health Score (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: FinScore (0–1000) */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
              FinScore Index
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
              {tier?.label || "Assessment"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Compact Radial Gauge */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 sm:w-22 sm:h-22 transform -rotate-90" viewBox="0 0 92 92">
                <circle
                  cx="46"
                  cy="46"
                  r="38"
                  className="stroke-muted"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="46"
                  cy="46"
                  r="38"
                  className="stroke-foreground transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={finCircumference}
                  strokeDashoffset={finDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-foreground tracking-tight leading-none">
                  {score}
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground mt-0.5">
                  / 1000
                </span>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="flex-1 space-y-2.5 min-w-0">
              <div>
                <div className="flex justify-between text-2xs mb-1">
                  <span className="text-muted-foreground font-medium truncate">Savings Velocity</span>
                  <span className="font-bold text-foreground shrink-0">{savingsScore} / 300</span>
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
                  <span className="font-bold text-foreground shrink-0">{debtScore} / 250</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, (debtScore / 250) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-2xs text-muted-foreground line-clamp-1">
            {tier?.description || "World-class financial discipline and runway."}
          </p>
        </div>

        {/* CARD 2: Health Score (0–100) */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
              Health Score
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
              {healthData.label}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Compact Radial Gauge */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 sm:w-22 sm:h-22 transform -rotate-90" viewBox="0 0 92 92">
                <circle
                  cx="46"
                  cy="46"
                  r="38"
                  className="stroke-muted"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="46"
                  cy="46"
                  r="38"
                  className="stroke-foreground transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={healthCircumference}
                  strokeDashoffset={healthDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-foreground tracking-tight leading-none">
                  {healthScore}
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="flex-1 space-y-2.5 min-w-0">
              <div>
                <div className="flex justify-between text-2xs mb-1">
                  <span className="text-muted-foreground font-medium truncate">Emergency Buffer</span>
                  <span className="font-bold text-foreground shrink-0">{emergencyScore} / 250</span>
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
                  <span className="text-muted-foreground font-medium truncate">Investment Momentum</span>
                  <span className="font-bold text-foreground shrink-0">{investmentsScore} / 200</span>
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

          <div className="flex items-center justify-between text-2xs text-muted-foreground">
            <span>Runway: {emergencyMonths.toFixed(1)} mos</span>
            <span>DTI: {debtRatio.toFixed(1)}%</span>
            <span>Invest: {investmentRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Bottom 4-Metric Compact Strip */}
      <div className="pt-3 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs">
        <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Savings Velocity</span>
          <span className="font-bold text-foreground">{savingsRate.toFixed(1)}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Debt-to-Income</span>
          <span className="font-bold text-foreground">{debtRatio.toFixed(1)}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Emergency Runway</span>
          <span className="font-bold text-foreground">{emergencyMonths.toFixed(1)} mos</span>
        </div>
        <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Asset Allocation</span>
          <span className="font-bold text-foreground">{metrics?.assetClassesCount || 4} classes</span>
        </div>
      </div>
    </div>
  );
}

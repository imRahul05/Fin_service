import { useMemo } from "react";
import { calculateFinScore } from "../../utils/finScore.utils";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FinScoreGauge({ finances, className = "" }) {
  const finScoreData = useMemo(() => calculateFinScore(finances), [finances]);
  const { totalScore = 0, tier = {}, subScores = {}, metrics = {} } = finScoreData || {};

  const safeNum = (val, fallback = 0) => (Number.isFinite(Number(val)) ? Number(val) : fallback);

  const score = safeNum(totalScore);
  // Percentage for radial ring
  const percentage = Math.min(100, Math.max(0, (score / 1000) * 100));
  const strokeDashoffset = 440 - (440 * percentage) / 100;

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
      className={`rounded-3xl bg-card border border-border/80 p-6 shadow-card ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Radial Dial Indicator */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-muted"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Animated Gauge Ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-foreground transition-all duration-1000 ease-out"
              strokeWidth="12"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Score Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black tracking-tight text-foreground">
              {score}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              / 1000 FinScore
            </span>
            <span className="mt-1 text-[11px] font-bold px-3 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
              {tier?.label || "Assessment"}
            </span>
          </div>
        </div>

        {/* Breakdown & Health Pillars */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-foreground" />
                Financial Health & Resilience
              </h3>
              <Link
                to="/analytics"
                className="text-xs font-semibold text-foreground hover:underline flex items-center gap-1"
              >
                Deep Analytics <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tier?.description || "Financial resilience and wealth trajectory assessment"}
            </p>
          </div>

          {/* 4 Pillar Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Savings Rate */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">
                  Savings Velocity ({savingsRate.toFixed(1)}%)
                </span>
                <span className="font-bold text-foreground">
                  {savingsScore} / 300
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (savingsScore / 300) * 100))}%` }}
                />
              </div>
            </div>

            {/* Debt to Income */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">
                  Debt-to-Income ({debtRatio.toFixed(1)}%)
                </span>
                <span className="font-bold text-foreground">
                  {debtScore} / 250
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (debtScore / 250) * 100))}%` }}
                />
              </div>
            </div>

            {/* Emergency Cushion */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">
                  Emergency Runway ({emergencyMonths.toFixed(1)} mos)
                </span>
                <span className="font-bold text-foreground">
                  {emergencyScore} / 250
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (emergencyScore / 250) * 100))}%` }}
                />
              </div>
            </div>

            {/* Investment Momentum */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">
                  Investment Ratio ({investmentRate.toFixed(1)}%)
                </span>
                <span className="font-bold text-foreground">
                  {investmentsScore} / 200
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, (investmentsScore / 200) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

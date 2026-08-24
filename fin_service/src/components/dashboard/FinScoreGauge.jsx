import { useMemo } from "react";
import { calculateFinScore } from "../../utils/finScore.utils";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FinScoreGauge({ finances, className = "" }) {
  const finScoreData = useMemo(() => calculateFinScore(finances), [finances]);
  const { totalScore, tier, subScores, metrics, badges } = finScoreData;

  // Percentage for radial ring
  const percentage = Math.min(100, Math.max(0, (totalScore / 1000) * 100));
  const strokeDashoffset = 440 - (440 * percentage) / 100;

  // Tier color mapping
  const tierColorClasses = {
    emerald: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      stroke: "#10b981",
      glow: "shadow-emerald-500/20",
    },
    blue: {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800",
      stroke: "#3b82f6",
      glow: "shadow-blue-500/20",
    },
    indigo: {
      text: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      border: "border-indigo-200 dark:border-indigo-800",
      stroke: "#6366f1",
      glow: "shadow-indigo-500/20",
    },
    amber: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      stroke: "#f59e0b",
      glow: "shadow-amber-500/20",
    },
    rose: {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      stroke: "#f43f5e",
      glow: "shadow-rose-500/20",
    },
  };

  const themeColors = tierColorClasses[tier.color] || tierColorClasses.blue;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm ${className}`}
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
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Animated Gauge Ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke={themeColors.stroke}
              strokeWidth="12"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Score Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {totalScore}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              / 1000 FinScore
            </span>
            <span
              className={`mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${themeColors.bg} ${themeColors.text} ${themeColors.border} border`}
            >
              {tier.label}
            </span>
          </div>
        </div>

        {/* Breakdown & Health Pillars */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Financial Health & Resilience
              </h3>
              <Link
                to="/analytics"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Deep Analytics <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tier.description}
            </p>
          </div>

          {/* 4 Pillar Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Savings Rate */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Savings Velocity ({metrics.savingsRate}%)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subScores.savings} / 300
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${(subScores.savings / 300) * 100}%` }}
                />
              </div>
            </div>

            {/* Emergency Runway */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Emergency Shield ({metrics.emergencyMonths} mos)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subScores.emergency} / 250
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${(subScores.emergency / 250) * 100}%` }}
                />
              </div>
            </div>

            {/* Debt Health */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Debt-to-Income ({metrics.dtiRatio}%)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subScores.debt} / 250
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${(subScores.debt / 250) * 100}%` }}
                />
              </div>
            </div>

            {/* Asset Diversification */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  Asset Classes ({metrics.assetClassesCount} active)
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subScores.diversification} / 200
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${(subScores.diversification / 200) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestone Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Unlocked Badges:
              </span>
              {badges.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60"
                  title={b.desc}
                >
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

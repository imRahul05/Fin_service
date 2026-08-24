import { useState, useMemo } from "react";
import { compareTaxRegimes } from "../../utils/taxCalculator";
import { formatCurrency } from "../../utils/financialUtils";
import { getTaxOptimizationAdvice } from "../../services/AIService";
import { Sparkles, Calculator, CheckCircle2, TrendingDown, ArrowRight, ShieldCheck, FileText, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function TaxRegimeOptimizer({ finances, className = "" }) {
  // Pre-fill from user financial profile
  const monthlySalary = finances?.income?.salary || 0;
  const initialAnnualIncome = (monthlySalary * 12) || 1800000;

  const [grossIncome, setGrossIncome] = useState(initialAnnualIncome);
  const [deductions, setDeductions] = useState({
    section80C: (finances?.investments?.ppf || 0) + (finances?.investments?.epf || 0) + (finances?.investments?.mutual_funds ? 50000 : 0) || 150000,
    section80D: 25000,
    section80CCD1B: finances?.investments?.nps ? Math.min(50000, finances.investments.nps) : 50000,
    homeLoanInterest: finances?.loans?.home ? 200000 : 0,
    hra: (finances?.fixedExpenses?.rent ? finances.fixedExpenses.rent * 12 * 0.4 : 0) || 120000,
  });

  const [aiTaxAdvice, setAiTaxAdvice] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const comparison = useMemo(() => {
    return compareTaxRegimes(Number(grossIncome || 0), deductions);
  }, [grossIncome, deductions]);

  const handleGenerateAdvice = async () => {
    setLoadingAi(true);
    try {
      const advice = await getTaxOptimizationAdvice(finances, comparison);
      setAiTaxAdvice(advice);
    } catch (err) {
      console.error("Failed to generate tax advice:", err);
      setAiTaxAdvice("Unable to generate AI tax recommendations right now.");
    } finally {
      setLoadingAi(false);
    }
  };

  const isNewBetter = comparison.diff > 0;
  const isOldBetter = comparison.diff < 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>FY 2024-25 / FY 2025-26 Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Indian Income Tax Regime Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
              Compare Old vs New Tax Regime (Section 115BAC) with Budget 2024 revised standard deductions, Section 87A rebate, and Chapter VI-A investments.
            </p>
          </div>

          <button
            onClick={handleGenerateAdvice}
            disabled={loadingAi}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition disabled:opacity-60 shrink-0"
          >
            {loadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                <span>Analyzing Tax Strategy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI CA Tax Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inputs & Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Inputs & Deductions Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>💼</span> Gross Salary & Deductions
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Annual Gross Total Income (₹)
              </label>
              <input
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                Monthly: {formatCurrency(Math.round(grossIncome / 12))}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Old Regime Deductions (Chapter VI-A)
              </p>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Section 80C (PPF, EPF, ELSS)</span>
                  <span className="font-semibold">{formatCurrency(deductions.section80C)} / ₹1.5L</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="5000"
                  value={deductions.section80C}
                  onChange={(e) => setDeductions({ ...deductions, section80C: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Section 80D (Health Insurance)</span>
                  <span className="font-semibold">{formatCurrency(deductions.section80D)} / ₹75k</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="75000"
                  step="2500"
                  value={deductions.section80D}
                  onChange={(e) => setDeductions({ ...deductions, section80D: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Section 80CCD(1B) (NPS Extra)</span>
                  <span className="font-semibold">{formatCurrency(deductions.section80CCD1B)} / ₹50k</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="5000"
                  value={deductions.section80CCD1B}
                  onChange={(e) => setDeductions({ ...deductions, section80CCD1B: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Section 24(b) Home Loan Interest</span>
                  <span className="font-semibold">{formatCurrency(deductions.homeLoanInterest)} / ₹2L</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="10000"
                  value={deductions.homeLoanInterest}
                  onChange={(e) => setDeductions({ ...deductions, homeLoanInterest: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">HRA Exemption Claim</span>
                  <span className="font-semibold">{formatCurrency(deductions.hra)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="10000"
                  value={deductions.hra}
                  onChange={(e) => setDeductions({ ...deductions, hra: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results & Verdict (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Verdict Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isNewBetter
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
                : isOldBetter
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recommended Choice
                </p>
                <h4 className="text-base font-extrabold">
                  {comparison.recommendedRegime} is more beneficial
                </h4>
              </div>
            </div>
            {comparison.savings > 0 && (
              <div className="text-right">
                <span className="text-2xs font-semibold text-slate-500 uppercase">You Save</span>
                <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(comparison.savings)}/yr
                </p>
              </div>
            )}
          </div>

          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* New Regime Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isNewBetter
                  ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  New Tax Regime
                </h4>
                {isNewBetter && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Recommended
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Standard Deduction</span>
                  <span className="font-semibold text-emerald-600">₹75,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Taxable Income</span>
                  <span className="font-bold">{formatCurrency(comparison.newRegime.taxableIncome)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Effective Tax Rate</span>
                  <span className="font-bold">{comparison.newRegime.effectiveRate}%</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Total Tax Payable</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {formatCurrency(comparison.newRegime.totalTax)}
                  </span>
                </div>
              </div>
            </div>

            {/* Old Regime Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isOldBetter
                  ? "bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Old Tax Regime
                </h4>
                {isOldBetter && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    Recommended
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total Deductions</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(comparison.oldRegime.totalDeductions)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Taxable Income</span>
                  <span className="font-bold">{formatCurrency(comparison.oldRegime.taxableIncome)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Effective Tax Rate</span>
                  <span className="font-bold">{comparison.oldRegime.effectiveRate}%</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Total Tax Payable</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {formatCurrency(comparison.oldRegime.totalTax)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tax Strategy Markdown Card */}
          {aiTaxAdvice && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Chartered Accountant Tax Optimization Plan
                </h4>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300">
                <ReactMarkdown>{aiTaxAdvice}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

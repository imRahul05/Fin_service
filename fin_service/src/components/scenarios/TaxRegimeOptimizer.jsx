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
      {/* Header Banner - Soft Bento Clay Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Calculator className="w-3.5 h-3.5" />
              <span>FY 2024-25 / FY 2025-26 Tax Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Income Tax Regime Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Compare Old vs New Tax Regime (Section 115BAC) with Budget 2024 revised standard deductions, Section 87A rebate, and Chapter VI-A investments.
            </p>
          </div>

          <button
            onClick={handleGenerateAdvice}
            disabled={loadingAi}
            className="self-start sm:self-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-foreground text-background hover:opacity-90 font-semibold text-xs shadow-xs transition-all disabled:opacity-60 shrink-0 cursor-pointer"
          >
            {loadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Tax Strategy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
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
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-card space-y-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>💼</span> Gross Salary & Deductions
            </h3>

            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
                Annual Gross Total Income (₹)
              </label>
              <input
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
              <span className="text-2xs text-muted-foreground mt-1.5 block">
                Monthly: {formatCurrency(Math.round(grossIncome / 12))}
              </span>
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <p className="text-xs font-bold text-foreground">
                Old Regime Deductions (Chapter VI-A)
              </p>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Section 80C (PPF, EPF, ELSS)</span>
                  <span className="font-semibold text-foreground">{formatCurrency(deductions.section80C)} / ₹1.5L</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="5000"
                  value={deductions.section80C}
                  onChange={(e) => setDeductions({ ...deductions, section80C: Number(e.target.value) })}
                  className="w-full accent-foreground cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Section 80D (Health Insurance)</span>
                  <span className="font-semibold text-foreground">{formatCurrency(deductions.section80D)} / ₹75k</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="75000"
                  step="2500"
                  value={deductions.section80D}
                  onChange={(e) => setDeductions({ ...deductions, section80D: Number(e.target.value) })}
                  className="w-full accent-foreground cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Section 80CCD(1B) (NPS Extra)</span>
                  <span className="font-semibold text-foreground">{formatCurrency(deductions.section80CCD1B)} / ₹50k</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="5000"
                  value={deductions.section80CCD1B}
                  onChange={(e) => setDeductions({ ...deductions, section80CCD1B: Number(e.target.value) })}
                  className="w-full accent-foreground cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Section 24(b) Home Loan Interest</span>
                  <span className="font-semibold text-foreground">{formatCurrency(deductions.homeLoanInterest)} / ₹2L</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="10000"
                  value={deductions.homeLoanInterest}
                  onChange={(e) => setDeductions({ ...deductions, homeLoanInterest: Number(e.target.value) })}
                  className="w-full accent-foreground cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">HRA Exemption Claim</span>
                  <span className="font-semibold text-foreground">{formatCurrency(deductions.hra)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="10000"
                  value={deductions.hra}
                  onChange={(e) => setDeductions({ ...deductions, hra: Number(e.target.value) })}
                  className="w-full accent-foreground cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results & Verdict (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Verdict Banner */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border flex items-center justify-between gap-4 transition-colors ${
              isNewBetter
                ? "bg-muted/40 border-border text-foreground"
                : isOldBetter
                ? "bg-muted/40 border-border text-foreground"
                : "bg-muted/30 border-border text-foreground"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-card border border-border shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recommended Choice
                </p>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  {comparison.recommendedRegime} is more beneficial
                </h4>
              </div>
            </div>
            {comparison.savings > 0 && (
              <div className="text-right">
                <span className="text-2xs font-semibold text-muted-foreground uppercase">You Save</span>
                <p className="text-base sm:text-lg font-black text-foreground">
                  {formatCurrency(comparison.savings)}/yr
                </p>
              </div>
            )}
          </div>

          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* New Regime Card */}
            <div
              className={`p-6 rounded-3xl border transition-all ${
                isNewBetter
                  ? "bg-card border-foreground/30 shadow-card ring-1 ring-foreground/20"
                  : "bg-card border-border/80 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-foreground">
                  New Tax Regime
                </h4>
                {isNewBetter && (
                  <span className="text-2xs font-bold px-2.5 py-1 rounded-full bg-foreground text-background">
                    Recommended
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Standard Deduction</span>
                  <span className="font-semibold text-foreground">₹75,000</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Taxable Income</span>
                  <span className="font-bold text-foreground">{formatCurrency(comparison.newRegime.taxableIncome)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Effective Tax Rate</span>
                  <span className="font-bold text-foreground">{comparison.newRegime.effectiveRate}%</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-xs font-bold text-foreground">Total Tax Payable</span>
                  <span className="text-base font-black text-foreground">
                    {formatCurrency(comparison.newRegime.totalTax)}
                  </span>
                </div>
              </div>
            </div>

            {/* Old Regime Card */}
            <div
              className={`p-6 rounded-3xl border transition-all ${
                isOldBetter
                  ? "bg-card border-foreground/30 shadow-card ring-1 ring-foreground/20"
                  : "bg-card border-border/80 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-foreground">
                  Old Tax Regime
                </h4>
                {isOldBetter && (
                  <span className="text-2xs font-bold px-2.5 py-1 rounded-full bg-foreground text-background">
                    Recommended
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Total Deductions</span>
                  <span className="font-semibold text-foreground">{formatCurrency(comparison.oldRegime.totalDeductions)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Taxable Income</span>
                  <span className="font-bold text-foreground">{formatCurrency(comparison.oldRegime.taxableIncome)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Effective Tax Rate</span>
                  <span className="font-bold text-foreground">{comparison.oldRegime.effectiveRate}%</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-xs font-bold text-foreground">Total Tax Payable</span>
                  <span className="text-base font-black text-foreground">
                    {formatCurrency(comparison.oldRegime.totalTax)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tax Strategy Markdown Card */}
          {aiTaxAdvice && (
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-card animate-in fade-in">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <Sparkles className="w-4 h-4 text-foreground" />
                <h4 className="text-sm font-bold text-foreground">
                  AI Chartered Accountant Tax Optimization Plan
                </h4>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground leading-relaxed">
                <ReactMarkdown>{aiTaxAdvice}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useRef } from "react";
import { formatCurrency, aggregateFinancials } from "../../utils/financialUtils";
import { calculateFinScore } from "../../utils/finScore.utils";
import { compareTaxRegimes } from "../../utils/taxCalculator";
import { detectSubscriptions } from "../../utils/subscriptionDetector";
import { Printer, Download, X, Sparkles, ShieldCheck, CheckCircle2, FileText, ArrowUpRight } from "lucide-react";

export default function FinancialDossierModal({
  isOpen,
  onClose,
  finances,
  transactions = [],
  userEmail = "user@finsage.ai",
}) {
  const printRef = useRef(null);

  if (!isOpen || !finances) return null;

  const {
    totalIncome,
    totalExpenses,
    monthlySavings,
    netWorth,
  } = aggregateFinancials(finances);

  const finScore = calculateFinScore(finances);
  const taxComparison = compareTaxRegimes(totalIncome * 12);
  const subscriptionAudit = detectSubscriptions(transactions, finances.fixedExpenses);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Executive Financial Dossier
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 text-slate-900 dark:text-slate-100">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-blue-600">FinSage AI</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  CONFIDENTIAL AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Generated for {userEmail} • {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Overall FinScore</span>
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {finScore.totalScore}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {finScore.tier.label}
                </span>
              </div>
            </div>
          </div>

          {/* Key Financial KPIs Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Executive Cash Flow & Net Worth
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Monthly Inflow</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Monthly Burn</span>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Savings Velocity</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(monthlySavings)} ({finScore.metrics.savingsRate}%)
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Est. Net Worth</span>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </div>

          {/* FinScore Health Pillars */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              2. Financial Resilience Audit
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Emergency Buffer</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">
                  {finScore.metrics.emergencyMonths} Months
                </p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Debt-to-Income</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">
                  {finScore.metrics.dtiRatio}%
                </p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Asset Classes</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">
                  {finScore.metrics.assetClassesCount} Active
                </p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Tax Optimization</span>
                <p className="font-bold text-emerald-600 mt-1">
                  {taxComparison.recommendedRegime}
                </p>
              </div>
            </div>
          </div>

          {/* Subscriptions & Leakage */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Subscription & Recurring Drain
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {subscriptionAudit.totalCount} Active Recurring Subscriptions Detected
                </p>
                <p className="text-slate-500 mt-0.5">
                  Annual Drain: {formatCurrency(subscriptionAudit.annualTotal)}/yr
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-600 font-bold uppercase">10-Yr SIP Cost</span>
                <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                  {formatCurrency(subscriptionAudit.tenYearOpportunityCost)}
                </p>
              </div>
            </div>
          </div>

          {/* AI Action Plan Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              4. Key Strategic Recommendations
            </h4>
            <div className="space-y-2 text-xs">
              {finScore.strengths.map((str, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{str}</span>
                </div>
              ))}
              {finScore.improvements.map((imp, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>FinSage AI Personal Finance Management System</span>
            <span>Generated securely • Confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
}

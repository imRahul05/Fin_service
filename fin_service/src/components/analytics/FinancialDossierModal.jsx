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
    totalIncome = 0,
    totalExpenses = 0,
    monthlySavings = 0,
    netWorth = 0,
  } = aggregateFinancials(finances) || {};

  const finScore = calculateFinScore(finances);
  const taxComparison = compareTaxRegimes((Number.isFinite(totalIncome) ? totalIncome : 0) * 12);
  const subscriptionAudit = detectSubscriptions(transactions, finances?.fixedExpenses);

  const handlePrint = () => {
    if (typeof window !== "undefined" && window.print) {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-card rounded-3xl border border-border/80 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="p-4 border-b border-border/80 bg-muted/30 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-foreground" />
            <h3 className="text-sm font-bold text-foreground">
              Executive Financial Dossier
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              title="Close Dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 text-foreground">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/80 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-foreground">FinSage AI</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                  CONFIDENTIAL AUDIT
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Generated for {userEmail} • {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Overall FinScore</span>
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-2xl font-black text-foreground">
                  {finScore?.totalScore ?? 0}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border/60">
                  {finScore?.tier?.label || "Assessment"}
                </span>
              </div>
            </div>
          </div>

          {/* Key Financial KPIs Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              1. Executive Cash Flow & Net Worth
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Monthly Inflow</span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Monthly Burn</span>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Savings Velocity</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(monthlySavings)} ({finScore?.metrics?.savingsRate ?? 0}%)
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Est. Net Worth</span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </div>

          {/* FinScore Health Pillars */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              2. Financial Resilience Audit
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20">
                <span className="text-muted-foreground">Emergency Buffer</span>
                <p className="font-bold text-foreground mt-1">
                  {finScore?.metrics?.emergencyMonths ?? 0} Months
                </p>
              </div>
              <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20">
                <span className="text-muted-foreground">Debt-to-Income</span>
                <p className="font-bold text-foreground mt-1">
                  {finScore?.metrics?.dtiRatio ?? 0}%
                </p>
              </div>
              <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20">
                <span className="text-muted-foreground">Asset Classes</span>
                <p className="font-bold text-foreground mt-1">
                  {finScore?.metrics?.assetClassesCount ?? 0} Active
                </p>
              </div>
              <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20">
                <span className="text-muted-foreground">Tax Optimization</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {taxComparison?.recommendedRegime || "New Regime"}
                </p>
              </div>
            </div>
          </div>

          {/* Subscriptions & Leakage */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              3. Subscription & Recurring Drain
            </h4>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-foreground">
                  {subscriptionAudit?.totalCount ?? 0} Active Recurring Subscriptions Detected
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Annual Drain: {formatCurrency(subscriptionAudit?.annualTotal ?? 0)}/yr
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">10-Yr SIP Cost</span>
                <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                  {formatCurrency(subscriptionAudit?.tenYearOpportunityCost ?? 0)}
                </p>
              </div>
            </div>
          </div>

          {/* AI Action Plan Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              4. Key Strategic Recommendations
            </h4>
            <div className="space-y-2 text-xs">
              {(finScore?.strengths || []).map((str, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{str}</span>
                </div>
              ))}
              {(finScore?.improvements || []).map((imp, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-border/60 text-[10px] text-muted-foreground flex justify-between">
            <span>FinSage AI Personal Finance Management System</span>
            <span>Generated securely • Confidential</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { detectSubscriptions } from "../../utils/subscriptionDetector";
import { formatCurrency } from "../../utils/financialUtils";
import { Radio, AlertTriangle, TrendingUp, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export default function SubscriptionRadar({
  transactions = [],
  fixedExpenses = {},
  className = "",
}) {
  const audit = useMemo(() => {
    return detectSubscriptions(transactions, fixedExpenses);
  }, [transactions, fixedExpenses]);

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subscription & Recurring Leakage Radar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI scans transactions for dormant auto-debits & recurring micro-leakages
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          {audit.totalCount} Active Auto-Debits
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Monthly Auto-Debit
          </span>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(audit.monthlyTotal)}/mo
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Annualized Drain
          </span>
          <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
            {formatCurrency(audit.annualTotal)}/yr
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase">
              10-Yr SIP Opportunity Cost
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">
            {formatCurrency(audit.tenYearOpportunityCost)}
          </p>
          <span className="text-[10px] text-amber-800/80 dark:text-amber-400/70">
            If redirected to Nifty 50 Index @ 12% CAGR
          </span>
        </div>
      </div>

      {/* Subscriptions List */}
      {audit.subscriptions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Identified Recurring Services
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            {audit.subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {sub.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {sub.name}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {sub.category} • {sub.paymentMode}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatCurrency(sub.amount)}
                  </p>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {sub.period}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-400">
          No recurring subscriptions detected in transaction records.
        </div>
      )}
    </div>
  );
}

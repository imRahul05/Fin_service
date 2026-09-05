import { useMemo } from "react";
import { detectSubscriptions } from "../../utils/subscriptionDetector";
import { formatCurrency } from "../../utils/financialUtils";
import { Radio, TrendingUp, AlertTriangle } from "lucide-react";

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
      className={`rounded-3xl bg-card border border-border/80 p-6 shadow-card ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-muted text-foreground flex items-center justify-center border border-border/80 shadow-2xs">
            <Radio className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Subscription & Recurring Leakage Radar
            </h3>
            <p className="text-xs text-muted-foreground">
              AI scans transactions for dormant auto-debits & recurring micro-leakages
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-muted text-foreground border border-border/70">
          {audit.totalCount} Active Auto-Debits
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Auto-Debit
          </span>
          <p className="text-xl font-black text-foreground mt-1">
            {formatCurrency(audit.monthlyTotal)}/mo
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Annualized Drain
          </span>
          <p className="text-xl font-black text-foreground mt-1">
            {formatCurrency(audit.annualTotal)}/yr
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              10-Yr SIP Opportunity Cost
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-xl font-black text-foreground mt-1">
            {formatCurrency(audit.tenYearOpportunityCost)}
          </p>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            If redirected to Nifty 50 Index @ 12% CAGR
          </span>
        </div>
      </div>

      {/* Subscriptions List */}
      {audit.subscriptions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-foreground mb-2">
            Identified Recurring Services
          </p>
          <div className="divide-y divide-border/60 border border-border/70 rounded-2xl overflow-hidden">
            {audit.subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3.5 bg-card hover:bg-muted/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-muted border border-border/80 flex items-center justify-center font-bold text-xs text-foreground">
                    {sub.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {sub.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {sub.category} • {sub.paymentMode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(sub.amount)}
                  </span>
                  {sub.potentialLeak && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
                      <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                      Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-border/60">
          No recurring subscriptions detected. Add recurring expenses to see opportunity costs.
        </div>
      )}
    </div>
  );
}

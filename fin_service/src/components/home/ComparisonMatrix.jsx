import { CheckCircle2, XCircle, Minus } from "lucide-react";

const COMPARISON_ROWS = [
  {
    feature: "Indian Tax Regimes (Old vs New & 80C/NPS/24b)",
    finsage: "Automated real-time tax optimization & comparisons",
    excel: "Requires manual complex tax formulas",
    traditional: "Not supported or generic US tax assumptions"
  },
  {
    feature: "24/7 AI Financial Advisor on Demand",
    finsage: "Personalized Gemini 2.5 AI guidance for any query",
    excel: "None",
    traditional: "Basic rule-based generic chatbots"
  },
  {
    feature: "What-If Life & Scenario Simulator",
    finsage: "Simulates Career jumps, Home loans, FIRE in 1 click",
    excel: "Tedious spreadsheet modeling & broken cells",
    traditional: "No future scenario stress-testing"
  },
  {
    feature: "Native Indian Instruments (PPF, NPS, SSY, SGB)",
    finsage: "Full built-in support with accurate interest rules",
    excel: "Manual input and custom math required",
    traditional: "Only basic bank account syncing"
  },
  {
    feature: "Zero Spam & Strict DPDP 2023 Privacy",
    finsage: "100% Private, zero data sold to loan telemarketers",
    excel: "Private but lacks cloud intelligence & sync",
    traditional: "Often monetizes user data to pitch credit cards"
  },
  {
    feature: "Automated Financial Health & Spending Leak Radar",
    finsage: "Instant score (0-1000), DTI & emergency runway audit",
    excel: "Must calculate formulas manually",
    traditional: "Basic historical bar charts only"
  }
];

export default function ComparisonMatrix() {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border/80 text-foreground text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <span>Platform Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How FinSage Compares
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            See why forward-thinking Indian professionals are upgrading from spreadsheets and legacy apps.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto bg-card rounded-3xl border border-border/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-muted/40">
                  <th className="py-4 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground w-1/3">
                    Feature & Capability
                  </th>
                  <th className="py-4 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider text-foreground bg-muted/70 w-1/3 border-x border-border/70">
                    <span className="inline-flex items-center gap-1.5 font-extrabold">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      FinSage AI
                    </span>
                  </th>
                  <th className="py-4 px-5 sm:px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground w-1/3">
                    Excel & Legacy Apps
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-5 sm:px-6 font-semibold text-foreground">
                      {row.feature}
                    </td>
                    <td className="py-4 px-5 sm:px-6 bg-muted/30 border-x border-border/70 text-foreground font-medium">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{row.finsage}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 sm:px-6 text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                        <span>{row.excel}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}

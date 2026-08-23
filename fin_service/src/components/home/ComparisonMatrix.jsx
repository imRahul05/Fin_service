import { CheckCircle2, XCircle, Minus, Sparkles } from "lucide-react";

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
    finsage: "Instant score (0-100), DTI & emergency runway audit",
    excel: "Must calculate formulas manually",
    traditional: "Basic historical bar charts only"
  }
];

export default function ComparisonMatrix() {
  return (
    <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200 dark:border-blue-900">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why FinSage AI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How FinSage AI Compares
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            See why forward-thinking Indian professionals are upgrading from spreadsheets and legacy apps.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <th className="py-4 px-4 sm:px-6 text-sm font-bold text-slate-900 dark:text-white w-1/3">
                    Feature & Capability
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/60 w-1/3 border-x border-blue-200 dark:border-blue-900">
                    <span className="inline-flex items-center gap-1.5">
                      <span>FinSage AI</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                        Recommended
                      </span>
                    </span>
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-sm font-semibold text-slate-500 dark:text-slate-400 w-1/6 hidden sm:table-cell">
                    Spreadsheets
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-sm font-semibold text-slate-500 dark:text-slate-400 w-1/6 hidden sm:table-cell">
                    Generic Apps
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 dark:text-slate-200">
                      {row.feature}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900 dark:text-white bg-blue-50/30 dark:bg-blue-950/20 border-x border-blue-200/50 dark:border-blue-900/40">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{row.finsage}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      <div className="flex items-start gap-1.5">
                        <Minus className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{row.excel}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      <div className="flex items-start gap-1.5">
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{row.traditional}</span>
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

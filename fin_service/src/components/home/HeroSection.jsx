import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Lock,
  ChevronRight,
  Calculator
} from "lucide-react";

const HERO_PREVIEWS = [
  {
    id: "tax",
    title: "Tax Optimization (80C & NPS)",
    tag: "₹38,400 Saved",
    healthScore: 92,
    badgeText: "Old vs New Regime",
    summary: "Switching to the New Tax Regime plus claiming ₹50,000 under Sec 80CCD(1B) saves ₹38,400 in net taxes this FY.",
    highlights: [
      "Zero paperwork simulation",
      "NPS 80CCD(1B) additional ₹50k benefit",
      "HRA & 24b home loan interest comparison"
    ]
  },
  {
    id: "fire",
    title: "FIRE by Age 42",
    tag: "3.8 Yrs Earlier",
    healthScore: 88,
    badgeText: "Retirement Target",
    summary: "Target corpus of ₹3.2 Crore achievable. Increasing monthly SIP by 10% annually advances your financial independence milestone by 3.8 years.",
    highlights: [
      "Assumes 12.5% CAGR equity compounding",
      "4% safe withdrawal rate post-retirement",
      "Inflation-adjusted living expense cushion"
    ]
  },
  {
    id: "loan_vs_sip",
    title: "Prepay Loan vs Invest SIP",
    tag: "+₹18.6L Alpha",
    healthScore: 85,
    badgeText: "Wealth Maximizer",
    summary: "At 8.4% home loan ROI, deploying surplus into Nifty 50 Index generates ₹18.6 Lakhs higher net worth over 15 years than aggressive prepayment.",
    highlights: [
      "Considers tax rebate on loan interest",
      "Historical 13.2% 10-yr rolling equity return",
      "Maintains 8-month emergency liquidity"
    ]
  },
  {
    id: "leak",
    title: "Spending Leak Radar",
    tag: "₹5,200/mo Found",
    healthScore: 90,
    badgeText: "Cashflow Recovery",
    summary: "Identified 3 dormant recurring OTT subscriptions and food delivery micro-leaks totaling ₹5,200/month. Redirected to Flexi-SIP.",
    highlights: [
      "Automatic category leak detection",
      "Annualized reinvestment value: ₹84,000 in 1 yr",
      "Debt-to-income ratio optimized to 18%"
    ]
  }
];

export default function HeroSection() {
  const { currentUser } = useAuth();
  const [activePreview, setActivePreview] = useState(HERO_PREVIEWS[0]);

  const scrollToCalculator = () => {
    const el = document.getElementById("wealth-calculator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs mb-6 transition-colors">
            <span className="flex h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white" />
            <span className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-200">
              Financial Architecture & Strategy
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Master your money with precision and clarity.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            FinSage models your Indian taxes, PPF, NPS, mutual funds, and life scenarios to help you eliminate leaks, optimize deductions, and build lasting wealth.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-all group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <button
                  type="button"
                  onClick={scrollToCalculator}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>Simulate Growth</span>
                </button>
              </>
            )}
          </div>

          {/* Trust reassurance micro-bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>256-Bit Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Zero Bank Data Selling</span>
            </div>
          </div>
        </div>

        {/* Clean Interactive Showcase Card */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            
            {/* Header bar */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Strategic Financial Ledger Preview
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Interactive Model
              </span>
            </div>

            {/* Interactive Strategy Selector */}
            <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <p className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Select a financial scenario to preview calculations:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HERO_PREVIEWS.map((preview) => {
                  const isSelected = activePreview.id === preview.id;
                  return (
                    <button
                      key={preview.id}
                      onClick={() => setActivePreview(preview)}
                      className={`text-left p-2.5 sm:p-3 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-semibold shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold truncate">{preview.title.split(" ")[0]}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isSelected 
                            ? "bg-slate-800 text-slate-100 dark:bg-slate-200 dark:text-slate-900" 
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}>
                          {preview.tag}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${
                        isSelected 
                          ? "text-slate-300 dark:text-slate-700" 
                          : "text-slate-500 dark:text-slate-400"
                      }`}>
                        {preview.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Output Box */}
            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900">
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {activePreview.badgeText}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activePreview.title}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activePreview.summary}
                  </p>

                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {activePreview.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clean Financial Health Score Metric */}
                <div className="w-full md:w-44 shrink-0 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Health Score
                  </span>
                  <div className="my-2 relative flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-white flex items-center justify-center">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {activePreview.healthScore}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    Tier: Excellent
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Top 10% in peer cohort
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>Real-time Indian market benchmarks</span>
                </div>
                <Link
                  to={currentUser ? "/advisor" : "/register"}
                  className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white hover:underline"
                >
                  <span>Run your personalized analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Clean Metric Stats Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">₹140Cr+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Wealth Simulated</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">12,500+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Scenarios Optimized</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">₹32,000</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Avg Tax Saved / User</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">100%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Private & Encrypted</p>
          </div>
        </div>

      </div>
    </section>
  );
}

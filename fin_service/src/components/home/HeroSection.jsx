import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
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
    <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Augment-style floating curved hero wrapper */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-[2.5rem] sm:rounded-[3rem] border border-border/80 bg-card/60 backdrop-blur-xl shadow-card overflow-hidden p-6 sm:p-12 lg:p-16">
          
          <div className="text-center max-w-3xl mx-auto">
            {/* Eyebrow badge with glowing indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/80 border border-border/80 shadow-2xs mb-6 sm:mb-8 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-foreground">
                Financial Architecture & Strategy
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Master your money with precision and clarity.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              FinSage models your Indian taxes, PPF, NPS, mutual funds, and life scenarios to help you eliminate leaks, optimize deductions, and build lasting wealth.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              {currentUser ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-card transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-card hover:shadow-card-hover transition-all group"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button
                    type="button"
                    onClick={scrollToCalculator}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-foreground bg-card hover:bg-muted/80 border border-border/80 shadow-2xs transition-all cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-muted-foreground" />
                    <span>Simulate Growth</span>
                  </button>
                </>
              )}
            </div>

            {/* Trust reassurance micro-bar */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>256-Bit Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Zero Bank Data Selling</span>
              </div>
            </div>
          </div>

          {/* Clean Interactive Bento Showcase Card */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
            <div className="rounded-3xl bg-card border border-border/80 shadow-card overflow-hidden">
              
              {/* Header bar */}
              <div className="px-6 py-4 bg-muted/40 border-b border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Strategic Financial Ledger Preview
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-zinc-900 dark:text-zinc-200 border border-emerald-200/80 dark:border-zinc-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Interactive Model
                </span>
              </div>

              {/* Interactive Strategy Selector Pills */}
              <div className="p-4 sm:p-5 bg-card/60 border-b border-border/70">
                <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Select a financial scenario to preview calculations:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HERO_PREVIEWS.map((preview) => {
                    const isSelected = activePreview.id === preview.id;
                    return (
                      <button
                        key={preview.id}
                        onClick={() => setActivePreview(preview)}
                        className={`text-left p-3 rounded-2xl text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-foreground text-background font-semibold shadow-2xs"
                            : "bg-muted/40 text-foreground hover:bg-muted/80 border border-border/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold truncate">{preview.title.split(" ")[0]}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            isSelected 
                              ? "bg-background/20 text-background" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {preview.tag}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate ${
                          isSelected 
                            ? "text-background/80" 
                            : "text-muted-foreground"
                        }`}>
                          {preview.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Output Box */}
              <div className="p-6 sm:p-7 bg-card">
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                  <div className="flex-1 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border/80">
                        {activePreview.badgeText}
                      </span>
                      <h3 className="text-lg font-bold text-foreground">
                        {activePreview.title}
                      </h3>
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {activePreview.summary}
                    </p>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {activePreview.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Health Score Metric */}
                  <div className="w-full md:w-44 shrink-0 bg-muted/30 p-5 rounded-2xl border border-border/70 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Health Score
                    </span>
                    <div className="my-2.5 relative flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-border border-t-foreground flex items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">
                          {activePreview.healthScore}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-zinc-200">
                      Tier: Excellent
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Top 10% in peer cohort
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Real-time Indian market benchmarks</span>
                  </div>
                  <Link
                    to={currentUser ? "/advisor" : "/register"}
                    className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
                  >
                    <span>Run your personalized analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* Metric Stats Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-center">
            <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">₹140Cr+</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">Wealth Simulated</p>
            </div>
            <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">12,500+</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">Scenarios Optimized</p>
            </div>
            <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">₹32,000</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">Avg Tax Saved / User</p>
            </div>
            <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">Private & Encrypted</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

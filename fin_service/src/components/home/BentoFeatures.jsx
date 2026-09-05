import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Bot, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  ArrowRight,
  Layers
} from "lucide-react";

const INSTRUMENTS = [
  { name: "NPS Tier 1", tax: "Sec 80CCD(1B)", returnRate: "10-12%", tag: "Retirement" },
  { name: "Public Provident Fund (PPF)", tax: "EEE Status (80C)", returnRate: "7.1% Tax-Free", tag: "Guaranteed" },
  { name: "Mutual Funds (SIP)", tax: "LTCG 12.5%", returnRate: "12-15%", tag: "Equity" },
  { name: "Sovereign Gold Bonds (SGB)", tax: "Tax-Free at Maturity", returnRate: "2.5% + Gold", tag: "Hedge" },
  { name: "Sukanya Samriddhi (SSY)", tax: "Sec 80C Tax-Free", returnRate: "8.2%", tag: "Girl Child" },
  { name: "Home Loan Interest", tax: "Sec 24b (Up to ₹2L)", returnRate: "Tax Rebate", tag: "Real Estate" }
];

export default function BentoFeatures() {
  const { currentUser } = useAuth();
  const [selectedPrompt, setSelectedPrompt] = useState(0);

  const samplePrompts = [
    {
      q: "Compare Old vs New Tax Regime for ₹24 LPA salary with ₹4L deductions.",
      a: "Under the New Tax Regime with standard deduction & 80CCD(1B), you save ₹34,200 more compared to Old Regime. Recommended: Switch to New Regime and invest the difference into Nifty 50 Index SIP."
    },
    {
      q: "Can I afford a ₹12 Lakh car on a ₹1.2L monthly salary?",
      a: "Keeping EMI under 15% of net income (₹18,000/mo for 5 yrs) maintains your 30% savings rate safely without disrupting your emergency fund or SIPs."
    },
    {
      q: "How to eliminate ₹6 Lakhs high-interest personal debt fastest?",
      a: "Using the Debt Avalanche method (targeting 14.5% interest first) saves ₹68,000 in interest charges and cuts payoff time from 42 months to 26 months."
    }
  ];

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border/80 text-foreground text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Engineered for Indian Financial Realities
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            From Section 80C to Sovereign Gold Bonds and FIRE planning, FinSage combines precision calculations with deep financial modeling.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento Card 1: Advisor Model */}
          <div className="md:col-span-2 rounded-3xl p-6 sm:p-8 bg-card border border-border/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-2xs">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border/70">
                  Advisory Model
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Conversational Financial Advisor
              </h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                Ask any complex financial question in plain language. FinSage computes tax regimes, debt payoffs, and inflation-adjusted roadmaps with zero bias.
              </p>

              {/* Interactive prompt sample chips */}
              <div className="mt-5 space-y-2">
                {samplePrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPrompt(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl text-xs transition-all cursor-pointer ${
                      selectedPrompt === idx
                        ? "bg-muted text-foreground font-semibold border border-border"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                    }`}
                  >
                    <span className="font-semibold text-foreground">Q: </span>
                    {item.q}
                  </button>
                ))}
              </div>

              {/* Live Answer preview */}
              <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-foreground mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>FinSage Response:</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {samplePrompts[selectedPrompt].a}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Trained on FY 2024-25 Indian tax codes</span>
              <Link
                to={currentUser ? "/advisor" : "/register"}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline"
              >
                <span>Ask custom question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Spending Leaks Radar */}
          <div className="rounded-3xl p-6 sm:p-8 bg-card border border-border/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-2xl bg-muted text-foreground flex items-center justify-center border border-border/80 shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border/70">
                  Radar
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground">
                Spending Leak Radar
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Pinpoint micro-leaks across food delivery, unused streaming subscriptions, and hidden bank charges.
              </p>

              <div className="mt-5 space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">OTT & Cloud Leaks</span>
                  <span className="font-bold text-foreground">₹2,400/mo</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">Food Delivery Markups</span>
                  <span className="font-bold text-foreground">₹3,800/mo</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">Unclaimed Deductions</span>
                  <span className="font-bold text-foreground">₹12,500/yr</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/70">
              <Link
                to={currentUser ? "/analytics" : "/register"}
                className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
              >
                <span>Audit your spending leaks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 3: Indian Asset Ecosystem */}
          <div className="rounded-3xl p-6 sm:p-8 bg-card border border-border/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-2xl bg-muted text-foreground flex items-center justify-center border border-border/80 shadow-2xs">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border/70">
                  Tax Architecture
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground">
                India-Specific Ledger
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Native support for Indian instruments with automated tax classification.
              </p>

              <div className="mt-5 space-y-2">
                {INSTRUMENTS.slice(0, 4).map((inst, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{inst.name}</p>
                      <p className="text-[11px] text-muted-foreground">{inst.tax}</p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/60">
                      {inst.returnRate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/70">
              <Link
                to={currentUser ? "/finance-input" : "/register"}
                className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
              >
                <span>Model your Indian portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 4: FinScore Health Gauge */}
          <div className="md:col-span-2 rounded-3xl p-6 sm:p-8 bg-card border border-border/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-2xs">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border/70">
                  0-1000 FinScore
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    Comprehensive Financial Vitality Score
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Unlike credit scores that only measure how well you borrow, FinScore measures your emergency cushion, savings efficiency, debt leverage, and retirement readiness on a 1000-point scale.
                  </p>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/60">
                      <p className="font-bold text-foreground">Savings Rate</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">30% Weight</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/60">
                      <p className="font-bold text-foreground">Debt/Income</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">25% Weight</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/60">
                      <p className="font-bold text-foreground">Emergency Fund</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">25% Weight</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/30 border border-border/60">
                      <p className="font-bold text-foreground">Investment</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">20% Weight</p>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-4 flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-muted/30 border border-border/70">
                  <div className="w-20 h-20 rounded-full border-3 border-border border-t-foreground flex items-center justify-center mb-2">
                    <span className="text-3xl font-black text-foreground">845</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">Grade: Excellent</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Ready for FIRE</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Dynamic recomputation with each transaction update</span>
              <Link
                to={currentUser ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline"
              >
                <span>Calculate your FinScore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

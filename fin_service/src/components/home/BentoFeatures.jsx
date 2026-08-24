import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Sparkles, 
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
    <section className="py-20 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider mb-3 border border-slate-200 dark:border-slate-700">
            <Layers className="w-3.5 h-3.5" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for Indian Financial Realities
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            From Section 80C to Sovereign Gold Bonds and FIRE planning, FinSage combines precision calculations with deep financial modeling.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          
          {/* Bento Card 1: Advisor Model */}
          <div className="md:col-span-2 rounded-2xl p-6 sm:p-7 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Advisory Model
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Conversational Financial Advisor
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Ask any complex financial question in plain language. FinSage computes tax regimes, debt payoffs, and inflation-adjusted roadmaps with zero bias.
              </p>

              {/* Sample Queries */}
              <div className="mt-5 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPrompt(idx)}
                      className={`text-xs px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                        selectedPrompt === idx
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      Sample {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-2.5 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1">
                    {samplePrompts[selectedPrompt].q}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                    {samplePrompts[selectedPrompt].a}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Available 24/7 with zero waiting time</span>
              <Link
                to={currentUser ? "/advisor" : "/register"}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white hover:underline"
              >
                <span>Consult Advisor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Spending Leak Radar */}
          <div className="rounded-2xl p-6 sm:p-7 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Spending Leak Radar
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Identifies recurring micro-drains and unused subscriptions that silently erode your savings rate.
              </p>

              {/* Visual Leak Alert */}
              <div className="mt-5 space-y-2">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-200">
                    <span>Dormant Subscriptions</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">-₹2,400/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    2 unused streaming services identified.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-200">
                    <span>Reinvestment Target</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">+₹4.8L in 10 yrs</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Automated SIP redirect suggestion.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Link
                to={currentUser ? "/analytics" : "/register"}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white hover:underline"
              >
                <span>View Analytics Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 3: Indian Instrument Radar */}
          <div className="md:col-span-2 rounded-2xl p-6 sm:p-7 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-2xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  Tax Law Aware
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Indian Tax & Wealth Instrument Radar
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Native support for Indian instruments with accurate lock-ins, tax deductions, and compounding rates.
              </p>

              {/* Instrument Pills */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {INSTRUMENTS.map((inst) => (
                  <div
                    key={inst.name}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {inst.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        {inst.tag}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{inst.tax}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{inst.returnRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Section 80C, 80CCD, 80D, 24b supported</span>
              <Link
                to={currentUser ? "/finance-input" : "/register"}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white hover:underline"
              >
                <span>Track Your Assets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 4: Health Score & Runway */}
          <div className="rounded-2xl p-6 sm:p-7 bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center mb-4">
                <Activity className="w-4 h-4" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Live Health Score & Runway
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Calculates your Debt-to-Income (DTI) ratio, savings rate, and emergency fund runway.
              </p>

              {/* Health Score Mini Stats */}
              <div className="mt-5 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Savings Rate</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">38% (Ideal &gt; 25%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[38%] h-full bg-slate-900 dark:bg-white rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Emergency Runway</span>
                    <span className="text-slate-900 dark:text-white font-semibold">7.2 Months</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[72%] h-full bg-slate-700 dark:bg-slate-300 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Debt-to-Income (DTI)</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">16% (Low Risk)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[16%] h-full bg-slate-800 dark:bg-slate-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Link
                to={currentUser ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white hover:underline"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

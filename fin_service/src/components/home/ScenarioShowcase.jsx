import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  GitFork, 
  Briefcase, 
  Home as HomeIcon, 
  Flame, 
  ArrowRight, 
  Sparkles
} from "lucide-react";

const SCENARIOS = [
  {
    id: "career",
    title: "Career Switch (+35% Hike)",
    icon: Briefcase,
    badge: "Income Acceleration",
    description: "Model how a salary jump from ₹18 LPA to ₹24 LPA impacts your 5-year and 10-year net worth trajectory without falling into lifestyle creep.",
    metrics: [
      { label: "Incremental Savings", val: "+₹42,000/mo", highlight: true },
      { label: "5-Yr Net Worth Gain", val: "+₹34.8 Lakhs", highlight: true },
      { label: "Tax Drag Mitigation", val: "New Regime Optimized", highlight: false },
      { label: "Emergency Cushion", val: "Expanded to 9 Mos", highlight: false }
    ],
    aiInsight: "By capping lifestyle upgrades to 15% and routing the remaining 85% of your increment into Flexi-Cap SIPs, you achieve your ₹1 Crore milestone 3.2 years earlier."
  },
  {
    id: "home",
    title: "Buying a ₹75L Dream Home",
    icon: HomeIcon,
    badge: "Real Estate & Loan",
    description: "Simulate EMI cashflow stress-tests, Section 24b tax deductions, down payment liquidation impact, and compare Rent+SIP vs Buy.",
    metrics: [
      { label: "Estimated EMI", val: "₹54,200/mo @ 8.4%", highlight: false },
      { label: "Sec 24b Tax Saved", val: "₹62,400 / year", highlight: true },
      { label: "Liquid Runway Post-Purchase", val: "6.2 Months Intact", highlight: true },
      { label: "Portfolio Rebalance", val: "Debt allocation trimmed", highlight: false }
    ],
    aiInsight: "Maintaining a ₹16L down payment preserves your core equity portfolio without needing to break compounding PPF or emergency FD accounts."
  },
  {
    id: "fire",
    title: "FIRE Milestone (Age 45)",
    icon: Flame,
    badge: "Financial Independence",
    description: "Calculate your exact FIRE number, safe withdrawal rate (SWR), and inflation-adjusted corpus required to retire stress-free in India.",
    metrics: [
      { label: "Target FIRE Corpus", val: "₹3.65 Crore", highlight: true },
      { label: "Safe Monthly Draw", val: "₹1.15 Lakhs / mo", highlight: true },
      { label: "Target Freedom Date", val: "Achievable in 8.5 Yrs", highlight: true },
      { label: "Annual Step-up Needed", val: "10% SIP Hike", highlight: false }
    ],
    aiInsight: "A 10% annual SIP top-up offsets inflation and lets you transition into consulting or passion projects before age 45 with zero debt pressure."
  }
];

export default function ScenarioShowcase() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(SCENARIOS[0].id);

  const currentScenario = SCENARIOS.find((s) => s.id === activeTab) || SCENARIOS[0];
  const IconComponent = currentScenario.icon;

  return (
    <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200 dark:border-blue-900">
            <GitFork className="w-3.5 h-3.5" />
            <span>Multi-Variable Modeling</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Simulate Decisions Before You Make Them
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Life changes fast. FinSage AI stress-tests your future so you can take bold career and lifestyle steps with clarity.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {SCENARIOS.map((scenario) => {
              const isActive = activeTab === scenario.id;
              const TabIcon = scenario.icon;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActiveTab(scenario.id)}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850/50"
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                  <span className="truncate">{scenario.title.split("(")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-7 items-start justify-between">
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {currentScenario.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {currentScenario.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentScenario.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {currentScenario.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${
                      m.highlight
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80"
                        : "bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80"
                    }`}
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{m.label}</p>
                    <p className={`text-base sm:text-lg font-bold mt-0.5 ${
                      m.highlight
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-900 dark:text-white"
                    }`}>
                      {m.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation Box */}
            <div className="w-full md:w-80 shrink-0 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>FinSage AI Analysis</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{currentScenario.aiInsight}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                  to={currentUser ? "/scenarios" : "/register"}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
                >
                  <span>Simulate Your Scenario</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

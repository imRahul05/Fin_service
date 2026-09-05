import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  GitFork, 
  Briefcase, 
  Home as HomeIcon, 
  Flame, 
  ArrowRight
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
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border/80 shadow-2xs text-foreground text-xs font-semibold uppercase tracking-wider mb-4">
            <GitFork className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Multi-Variable Modeling</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Simulate Decisions Before You Make Them
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            Life changes fast. FinSage stress-tests your future so you can take bold career and lifestyle steps with clarity.
          </p>
        </div>

        {/* Pill Tab Selector */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-full bg-card border border-border/80 shadow-2xs">
            {SCENARIOS.map((scenario) => {
              const isActive = activeTab === scenario.id;
              const TabIcon = scenario.icon;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActiveTab(scenario.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-foreground text-background shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-background" : "text-muted-foreground"}`} />
                  <span className="truncate">{scenario.title.split("(")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario Bento Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-card border border-border/80 shadow-card overflow-hidden p-6 sm:p-10">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-muted text-foreground flex items-center justify-center border border-border/80 shadow-2xs">
                  <IconComponent className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                    {currentScenario.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    {currentScenario.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {currentScenario.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {currentScenario.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-border/70 bg-muted/30"
                  >
                    <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
                    <p className="text-base sm:text-lg font-bold mt-1 text-foreground">
                      {m.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Recommendation Box */}
            <div className="w-full md:w-80 shrink-0 p-6 rounded-2xl bg-muted/40 border border-border/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Scenario Analysis</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  "{currentScenario.aiInsight}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/70">
                <Link
                  to={currentUser ? "/scenarios" : "/register"}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-card transition-all"
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

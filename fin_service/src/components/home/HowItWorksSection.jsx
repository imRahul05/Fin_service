import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  ClipboardList, 
  Cpu, 
  TrendingUp, 
  ArrowRight,
  Check
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Map Your Financial Baseline",
    desc: "Input your monthly cashflow and Indian assets (PPF, NPS, SIPs, Loans) in under 2 minutes. No bank passwords or sensitive linking required.",
    icon: ClipboardList,
    badge: "2-Min Setup"
  },
  {
    step: "02",
    title: "Intelligent Diagnostic & Optimization",
    desc: "Our financial engine audits tax regime efficiency, detects dormant spending leaks, evaluates DTI ratios, and calculates your Health Score.",
    icon: Cpu,
    badge: "Strategic Engine"
  },
  {
    step: "03",
    title: "Simulate & Accelerate Wealth",
    desc: "Run unlimited what-if scenarios (career jumps, home buying, FIRE), consult the advisor for tailored strategies, and watch your net worth compound.",
    icon: TrendingUp,
    badge: "Milestones"
  }
];

export default function HowItWorksSection() {
  const { currentUser } = useAuth();

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border/80 text-foreground text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <Check className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Structured Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How FinSage Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            Take complete command of your personal finances in three clear steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-3xl p-7 sm:p-8 bg-card border border-border/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-muted-foreground/30">
                      {s.step}
                    </span>
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground mb-3 border border-border/70">
                    {s.badge}
                  </span>

                  <h3 className="text-lg font-bold text-foreground mb-2.5">
                    {s.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border/70 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <span>Step {idx + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action */}
        <div className="mt-12 text-center">
          <Link
            to={currentUser ? "/dashboard" : "/register"}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-card transition-all"
          >
            <span>{currentUser ? "Open Dashboard" : "Start 2-Minute Setup"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  ClipboardList, 
  Cpu, 
  TrendingUp, 
  ArrowRight,
  Zap
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
    title: "AI Diagnoses & Optimizes",
    desc: "Our Gemini-powered engine audits tax regime efficiency, detects dormant spending leaks, evaluates DTI ratios, and calculates your Health Score.",
    icon: Cpu,
    badge: "Gemini 2.5 AI"
  },
  {
    step: "03",
    title: "Simulate & Accelerate Wealth",
    desc: "Run unlimited what-if scenarios (career jumps, home buying, FIRE), ask the AI advisor for tailored advice, and watch your net worth compound.",
    icon: TrendingUp,
    badge: "Milestones"
  }
];

export default function HowItWorksSection() {
  const { currentUser } = useAuth();

  return (
    <section className="py-20 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Simple 3-Step Flow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How FinSage AI Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Take complete command of your personal finances in three steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-2xl p-6 sm:p-7 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700">
                      {s.step}
                    </span>
                  </div>

                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 mb-2.5 border border-blue-200 dark:border-blue-800">
                    {s.badge}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {s.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
          >
            <span>{currentUser ? "Open Dashboard" : "Start 2-Minute Setup"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

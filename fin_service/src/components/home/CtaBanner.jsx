import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function CtaBanner() {
  const { currentUser } = useAuth();

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-blue-600 dark:bg-blue-950 text-white transition-colors">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transform Your Financial Journey</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to build your financial roadmap?
        </h2>

        {/* Description */}
        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-blue-100 dark:text-blue-200 max-w-2xl mx-auto leading-relaxed">
          Plug spending leaks, optimize Section 80C & NPS taxes, and simulate multi-crore life milestones with AI guidance.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {currentUser ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-blue-900 bg-white hover:bg-blue-50 shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-blue-900 bg-white hover:bg-blue-50 shadow-lg shadow-black/10 transition-all transform hover:-translate-y-0.5 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-blue-600 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Micro-guarantees */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-blue-100 dark:text-blue-300 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>100% Free to start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>DPDP 2023 Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>No bank passwords needed</span>
          </div>
        </div>

      </div>
    </section>
  );
}

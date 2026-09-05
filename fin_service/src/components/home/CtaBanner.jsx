import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function CtaBanner() {
  const { currentUser } = useAuth();

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-[2.5rem] sm:rounded-[3rem] bg-card border border-border/80 shadow-card p-8 sm:p-14 lg:p-16 text-center overflow-hidden">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border/80 text-foreground text-xs font-semibold uppercase tracking-wider mb-6 shadow-2xs">
            <span>Strategic Wealth Architecture</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight max-w-2xl mx-auto">
            Ready to build your financial roadmap?
          </h2>

          {/* Description */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plug spending leaks, optimize Section 80C & NPS taxes, and simulate multi-crore life milestones with structured modeling.
          </p>

          {/* Primary CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-card transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
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
            )}
          </div>

          {/* Micro-guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
              <span>100% Free to start</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
              <span>DPDP 2023 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-foreground" />
              <span>No bank passwords needed</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

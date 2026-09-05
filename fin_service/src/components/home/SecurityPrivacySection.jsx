import { ShieldCheck, Lock, EyeOff, FileCheck, CheckCircle2 } from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: FileCheck,
    title: "DPDP Act 2023 Compliant",
    description: "Designed from ground-up adhering to India's Digital Personal Data Protection Act. You maintain full data ownership, export, and one-click erasure rights.",
    badge: "Government Standard"
  },
  {
    icon: Lock,
    title: "256-Bit Encryption",
    description: "All financial records and what-if simulation data are protected via AES-256 encryption in transit and at rest.",
    badge: "Bank-Grade"
  },
  {
    icon: EyeOff,
    title: "Zero Spam & No Data Selling",
    description: "Unlike free trackers, we NEVER sell your financial profile or contact details to third-party lenders, credit card issuers, or telemarketers.",
    badge: "100% Private"
  }
];

export default function SecurityPrivacySection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border/80 text-foreground text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Privacy First</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Your Money. Your Privacy.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            Intelligent wealth guidance should never come at the cost of your personal data sovereignty.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-3xl p-7 sm:p-8 bg-card border border-border/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-muted text-foreground flex items-center justify-center border border-border/80 shadow-2xs">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-2xs font-semibold px-3 py-1 rounded-full bg-muted text-foreground border border-border/70">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2.5">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border/70 flex items-center gap-1.5 text-xs text-foreground font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Strictly Enforced</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

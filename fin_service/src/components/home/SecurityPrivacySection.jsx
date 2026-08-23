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
    <section className="py-20 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy First</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your Money. Your Privacy.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Intelligent wealth guidance should never come at the cost of your personal data sovereignty.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl p-6 sm:p-7 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
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

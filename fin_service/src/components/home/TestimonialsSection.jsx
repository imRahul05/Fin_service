import { Star, CheckCircle2, MessageSquare } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Pooja Sharma",
    role: "Senior Engineering Manager",
    location: "Bengaluru",
    avatar: "PS",
    tag: "₹42,000 Tax Saved",
    quote: "FinSage AI's regime analyzer immediately showed me that switching to the New Tax Regime plus claiming ₹50k in NPS 80CCD(1B) would save ₹42,000. It's sharper and faster than any advisor I've hired."
  },
  {
    name: "Arjun Menon",
    role: "Product Designer",
    location: "Gurugram",
    avatar: "AM",
    tag: "₹70L Home Planned",
    quote: "The What-If scenario engine gave me total clarity. I modeled purchasing a ₹70 Lakh apartment and saw the exact EMI impact and how to keep my retirement SIPs compounding untouched."
  },
  {
    name: "Vikram Singhania",
    role: "Chartered Accountant",
    location: "Mumbai",
    avatar: "VS",
    tag: "Verified CA Review",
    quote: "Most personal finance apps only work for US tax codes. FinSage AI natively understands Indian financial reality—from PPF's EEE status and NPS to 12.5% equity LTCG rules."
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-200 dark:border-blue-900">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>User Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by Smart Indian Investors
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Real professionals taking control of their taxes, investments, and life milestones.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Stars and Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {t.tag}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  "{t.quote}"
                </p>
              </div>

              {/* User Profile */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {t.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.role} • {t.location}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

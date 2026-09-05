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
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border/80 text-foreground text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
            <span>User Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Loved by Smart Indian Investors
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            Real professionals taking control of their taxes, investments, and life milestones.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-3xl p-7 sm:p-8 bg-card border border-border/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Stars and Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex text-foreground gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-foreground text-foreground" />
                    ))}
                  </div>
                  <span className="text-2xs font-semibold px-3 py-1 rounded-full bg-muted text-foreground border border-border/70">
                    {t.tag}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              {/* User Profile */}
              <div className="mt-8 pt-4 border-t border-border/70 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-2xs">
                  {t.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-foreground">{t.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
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

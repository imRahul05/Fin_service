import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Calculator, 
  TrendingUp, 
  ArrowRight, 
  Coins, 
  Clock, 
  Percent 
} from "lucide-react";

const PRESETS = [
  { label: "Starter", monthly: 5000, rate: 12, years: 10 },
  { label: "Growth Pro", monthly: 20000, rate: 13.5, years: 15 },
  { label: "Wealth Builder", monthly: 50000, rate: 14, years: 20 },
  { label: "Conservative", monthly: 15000, rate: 8.5, years: 10 }
];

function formatIndianNumber(num) {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${Math.round(num).toLocaleString("en-IN")}`;
}

export default function WealthCalculatorWidget() {
  const { currentUser } = useAuth();
  const [monthlyInvestment, setMonthlyInvestment] = useState(15000);
  const [expectedRate, setExpectedRate] = useState(12);
  const [tenureYears, setTenureYears] = useState(15);

  const { totalInvested, totalWealth, wealthGain, alphaWealth, extraGain } = useMemo(() => {
    const months = tenureYears * 12;
    const monthlyRate = expectedRate / 12 / 100;
    const invested = monthlyInvestment * months;

    const futureValue = 
      monthlyRate > 0
        ? monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
        : invested;

    const gain = Math.max(0, futureValue - invested);

    const alphaMonthlyRate = (expectedRate + 2.2) / 12 / 100;
    const alphaFutureValue = 
      monthlyInvestment * ((Math.pow(1 + alphaMonthlyRate, months) - 1) / alphaMonthlyRate) * (1 + alphaMonthlyRate);
    const extra = Math.max(0, alphaFutureValue - futureValue);

    return {
      totalInvested: invested,
      totalWealth: futureValue,
      wealthGain: gain,
      alphaWealth: alphaFutureValue,
      extraGain: extra
    };
  }, [monthlyInvestment, expectedRate, tenureYears]);

  const investedPercent = totalWealth > 0 ? (totalInvested / totalWealth) * 100 : 50;
  const gainPercent = totalWealth > 0 ? (wealthGain / totalWealth) * 100 : 50;

  return (
    <section id="wealth-calculator" className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border/80 shadow-2xs text-foreground text-xs font-semibold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            See how your wealth compounds
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            Adjust your monthly investment to visualize how consistent discipline builds substantial wealth.
          </p>

          {/* Quick Presets */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground mr-1 font-medium">Quick Presets:</span>
            {PRESETS.map((p) => {
              const isActive =
                monthlyInvestment === p.monthly &&
                expectedRate === p.rate &&
                tenureYears === p.years;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    setMonthlyInvestment(p.monthly);
                    setExpectedRate(p.rate);
                    setTenureYears(p.years);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-foreground text-background font-semibold shadow-2xs"
                      : "bg-card text-foreground border border-border/80 hover:bg-muted"
                  }`}
                >
                  {p.label} (₹{(p.monthly / 1000).toFixed(0)}k/mo)
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculator Main Bento Card */}
        <div className="bg-card rounded-3xl border border-border/80 shadow-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Controls */}
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-7 border-b lg:border-b-0 lg:border-r border-border/70">
              
              {/* Slider 1: Monthly Investment */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Coins className="w-4 h-4 text-muted-foreground" />
                    Monthly Investment
                  </label>
                  <span className="text-sm font-bold text-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/70">
                    ₹{monthlyInvestment.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="150000"
                  step="1000"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 font-medium">
                  <span>₹1,000/mo</span>
                  <span>₹75,000/mo</span>
                  <span>₹1.5 Lakh/mo</span>
                </div>
              </div>

              {/* Slider 2: Expected Return Rate */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    Expected Annual Return (CAGR)
                  </label>
                  <span className="text-sm font-bold text-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/70">
                    {expectedRate}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="22"
                  step="0.5"
                  value={expectedRate}
                  onChange={(e) => setExpectedRate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 font-medium">
                  <span>6% (FD/Debt)</span>
                  <span>12% (Nifty Index)</span>
                  <span>22% (High Growth)</span>
                </div>
              </div>

              {/* Slider 3: Time Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Investment Period
                  </label>
                  <span className="text-sm font-bold text-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/70">
                    {tenureYears} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 font-medium">
                  <span>1 Year</span>
                  <span>15 Years</span>
                  <span>30 Years</span>
                </div>
              </div>

              {/* Note */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground leading-relaxed">
                FinSage automatically models tax-optimized allocations across Equity, PPF, and NPS to protect returns against tax drag.
              </div>

            </div>

            {/* Results Column */}
            <div className="lg:col-span-5 p-6 sm:p-10 bg-muted/20 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Projected Wealth
                </span>

                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Total Future Corpus</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1">
                    {formatIndianNumber(totalWealth)}
                  </p>
                </div>

                {/* Ratio Bar */}
                <div className="mt-6">
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${investedPercent}%` }}
                      className="bg-muted-foreground/60 transition-all duration-300"
                    />
                    <div
                      style={{ width: `${gainPercent}%` }}
                      className="bg-foreground transition-all duration-300"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2.5 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                      <span>Invested: <strong className="text-foreground">{formatIndianNumber(totalInvested)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-foreground" />
                      <span>Gain: <strong className="text-foreground">{formatIndianNumber(wealthGain)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Strategic Alpha Pill Card */}
                <div className="mt-6 p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> FinSage Strategic Alpha
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-muted text-foreground rounded-full border border-border/70">
                      +2.2% Alpha
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By optimizing tax deductions and trimming leaks, you could reach{" "}
                    <strong className="text-foreground font-bold">{formatIndianNumber(alphaWealth)}</strong>{" "}
                    (<span className="text-emerald-600 dark:text-zinc-200 font-semibold">+{formatIndianNumber(extraGain)}</span> extra).
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-border/70">
                <Link
                  to={currentUser ? "/scenarios" : "/register"}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-card transition-all"
                >
                  <span>Build Your Personalized Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

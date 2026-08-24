import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Calculator, 
  TrendingUp, 
  Sparkles, 
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
    <section id="wealth-calculator" className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider mb-3 border border-slate-200 dark:border-slate-700">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            See how your wealth compounds
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Adjust your monthly investment to visualize how consistent discipline builds substantial wealth.
          </p>

          {/* Quick Presets */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 font-medium">Quick Presets:</span>
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {p.label} (₹{(p.monthly / 1000).toFixed(0)}k/mo)
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculator Main Card */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Controls */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
              
              {/* Slider 1: Monthly Investment */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Monthly Investment
                  </label>
                  <span className="text-base font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
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
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  <span>₹1,000/mo</span>
                  <span>₹75,000/mo</span>
                  <span>₹1.5 Lakh/mo</span>
                </div>
              </div>

              {/* Slider 2: Expected Return Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Expected Annual Return (CAGR)
                  </label>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
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
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  <span>6% (FD/Debt)</span>
                  <span>12% (Nifty Index)</span>
                  <span>22% (High Growth)</span>
                </div>
              </div>

              {/* Slider 3: Time Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Investment Period
                  </label>
                  <span className="text-base font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
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
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  <span>1 Year</span>
                  <span>15 Years</span>
                  <span>30 Years</span>
                </div>
              </div>

              {/* Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <p>
                  FinSage automatically models tax-optimized allocations across Equity, PPF, and NPS to protect returns against tax drag.
                </p>
              </div>

            </div>

            {/* Results Column */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50/80 dark:bg-slate-850 dark:bg-slate-900 flex flex-col justify-between border-t lg:border-t-0">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Projected Wealth
                </span>

                <div className="mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Future Corpus</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {formatIndianNumber(totalWealth)}
                  </p>
                </div>

                {/* Ratio Bar */}
                <div className="mt-5">
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${investedPercent}%` }}
                      className="bg-slate-800 dark:bg-slate-300 transition-all duration-300"
                    />
                    <div
                      style={{ width: `${gainPercent}%` }}
                      className="bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-300" />
                      <span>Invested: <strong>{formatIndianNumber(totalInvested)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                      <span>Gain: <strong>{formatIndianNumber(wealthGain)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* FinSage Boost */}
                <div className="mt-5 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> FinSage Strategic Alpha
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-900">
                      +2.2% Alpha
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    By optimizing tax deductions and trimming leaks, you could reach{" "}
                    <strong className="text-slate-900 dark:text-white font-bold">{formatIndianNumber(alphaWealth)}</strong>{" "}
                    (<span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{formatIndianNumber(extraGain)}</span> extra).
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Link
                  to={currentUser ? "/scenarios" : "/register"}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-all"
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

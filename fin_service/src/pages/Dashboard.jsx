import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useFinances } from "../hooks/useFinances";
import { Link } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  formatCurrency, 
  calculateMonthlySavings, 
  calculateDebtToIncomeRatio, 
  calculateNetWorth 
} from "../utils/financialUtils";
import { getFinancialAdvice } from "../services/AIService";
import { computeFinancialDataHash, getAiCacheInfo } from "../utils/aiCache";
import FinancialAnalysis from "../components/analytics/FinancialAnalysis";
import AIBriefingHero from "../components/analytics/AIBriefingHero";
import AIDrawerModal from "../components/analytics/AIDrawerModal";
import PersonaSelector from "../components/common/PersonaSelector";
import FinScoreGauge from "../components/dashboard/FinScoreGauge";
import FinancialDossierModal from "../components/analytics/FinancialDossierModal";
import { 
  ArrowRight, 
  TrendingUp, 
  Wallet, 
  UserPlus, 
  FileText,
  Calendar,
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const { currentUser, isGuestMode } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    finances,
    transactions = [],
    loading: financesLoading,
    activePersonaId,
    switchPersona,
    resetSandbox,
  } = useFinances();

  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const timeframe = "Last month";

  // Compute summary KPI metrics from finances
  const summaryData = useMemo(() => {
    if (!finances || typeof finances !== "object") {
      return {
        monthlySavings: 0,
        debtToIncomeRatio: 0,
        netWorth: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalInvestments: 0,
        totalLoans: 0
      };
    }

    const sumSafe = (obj) => {
      if (!obj || typeof obj !== "object") return 0;
      return Object.values(obj).reduce((sum, val) => {
        const num = Number(val);
        return sum + (Number.isFinite(num) ? num : 0);
      }, 0);
    };

    const totalIncome = sumSafe(finances.income);
    const totalFixedExpenses = sumSafe(finances.fixedExpenses);
    const totalVariableExpenses = sumSafe(finances.variableExpenses);
    const totalExpenses = totalFixedExpenses + totalVariableExpenses;
    const totalInvestments = sumSafe(finances.investments);
    const totalLoans = sumSafe(finances.loans);
    
    const monthlySavings = calculateMonthlySavings(totalIncome, totalExpenses);
    const debtToIncomeRatio = calculateDebtToIncomeRatio(totalLoans, totalIncome);
    
    const assets = {
      investments: totalInvestments,
      savings: monthlySavings > 0 ? monthlySavings * 6 : 0
    };
    const liabilities = {
      loans: totalLoans
    };
    const netWorth = calculateNetWorth(assets, liabilities);

    return {
      monthlySavings: Number.isFinite(monthlySavings) ? monthlySavings : 0,
      debtToIncomeRatio: Number.isFinite(debtToIncomeRatio) ? debtToIncomeRatio : 0,
      netWorth: Number.isFinite(netWorth) ? netWorth : 0,
      totalIncome,
      totalExpenses,
      totalInvestments,
      totalLoans
    };
  }, [finances]);

  // Fetches financial advice with caching support
  const fetchAdvice = useCallback(async (forceRefresh = false) => {
    if (!finances || typeof finances !== "object") return;
    const userId = currentUser?.uid || "guest";

    const sumSafe = (obj) => {
      if (!obj || typeof obj !== "object") return 0;
      return Object.values(obj).reduce((sum, val) => {
        const num = Number(val);
        return sum + (Number.isFinite(num) ? num : 0);
      }, 0);
    };

    const totalIncome = sumSafe(finances.income);
    const totalFixed = sumSafe(finances.fixedExpenses);
    const totalVariable = sumSafe(finances.variableExpenses);

    const financialData = {
      income: totalIncome,
      fixedExpenses: totalFixed,
      variableExpenses: totalVariable,
      investments: finances.investments || {},
      loans: finances.loans || {},
      goals: finances.goals || ""
    };

    const dataHash = computeFinancialDataHash(financialData);

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      const info = getAiCacheInfo(userId, "personal_advice", dataHash);
      if (info && info.cached) {
        setCacheInfo(info);
      } else {
        setAiLoading(true);
      }
    }

    try {
      const advice = await getFinancialAdvice(financialData, {
        userId,
        forceRefresh
      });

      setAiAdvice(typeof advice === "string" ? advice : "");
      const updatedInfo = getAiCacheInfo(userId, "personal_advice", dataHash);
      if (updatedInfo) {
        setCacheInfo(updatedInfo);
      }
    } catch (error) {
      console.error("Error getting AI advice:", error);
      setAiAdvice("Unable to generate AI advice at this time. Please try again later.");
    } finally {
      setAiLoading(false);
      setIsRefreshing(false);
    }
  }, [finances, currentUser]);

  useEffect(() => {
    if (finances && typeof finances === "object") {
      fetchAdvice(false);
    }
  }, [finances, fetchAdvice]);

  const handleRefreshAdvice = () => {
    fetchAdvice(true);
  };

  const rawSavingsRate = summaryData.totalIncome > 0 
    ? (summaryData.monthlySavings / summaryData.totalIncome) * 100 
    : 0;
  const savingsRate = Number.isFinite(rawSavingsRate) ? rawSavingsRate : 0;

  // Chart configuration with clean monochromatic dark mode colors
  const chartOptions = useMemo(() => {
    const textColor = isDark ? '#A1A1AA' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

    return {
      bar: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? '#18181B' : '#0F172A',
            titleColor: '#FAFAFA',
            bodyColor: '#D4D4D8',
            cornerRadius: 12,
            padding: 10
          }
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 11 } },
            grid: { display: false }
          },
          y: {
            ticks: { color: textColor, font: { size: 11 } },
            grid: { color: gridColor }
          }
        }
      },
      doughnut: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, font: { size: 11 }, boxWidth: 10 }
          }
        }
      }
    };
  }, [isDark]);

  // Cash flow chart data
  const monthlyCashFlow = useMemo(() => ({
    labels: ['Income', 'Expenses', 'Savings'],
    datasets: [
      {
        data: [
          summaryData.totalIncome, 
          summaryData.totalExpenses, 
          summaryData.monthlySavings
        ],
        backgroundColor: isDark ? [
          '#FAFAFA',
          '#71717A',
          '#27272A'
        ] : [
          '#0F172A',
          '#94A3B8',
          '#CBD5E1'
        ],
        borderRadius: 12,
        barPercentage: 0.55
      }
    ]
  }), [summaryData, isDark]);

  const expenseEntries = useMemo(() => {
    if (!finances || typeof finances !== "object") return [];
    const fixedObj = (finances.fixedExpenses && typeof finances.fixedExpenses === "object" && !Array.isArray(finances.fixedExpenses)) ? finances.fixedExpenses : {};
    const varObj = (finances.variableExpenses && typeof finances.variableExpenses === "object" && !Array.isArray(finances.variableExpenses)) ? finances.variableExpenses : {};

    const fixed = Object.entries(fixedObj)
      .filter(([, v]) => Number.isFinite(Number(v)) && Number(v) > 0)
      .map(([k, v]) => [String(k), Number(v)]);
    const variable = Object.entries(varObj)
      .filter(([, v]) => Number.isFinite(Number(v)) && Number(v) > 0)
      .map(([k, v]) => [String(k), Number(v)]);
    return [...fixed, ...variable];
  }, [finances]);

  const expensesData = useMemo(() => {
    const palette = isDark ? [
      '#FAFAFA',
      '#D4D4D8',
      '#A1A1AA',
      '#71717A',
      '#52525B',
      '#3F3F46',
      '#27272A',
      '#18181B'
    ] : [
      '#0F172A',
      '#334155',
      '#475569',
      '#64748B',
      '#94A3B8',
      '#CBD5E1',
      '#E2E8F0',
      '#F1F5F9'
    ];

    return {
      labels: expenseEntries.map(([category]) =>
        String(category).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      ),
      datasets: [
        {
          data: expenseEntries.map(([, amount]) => amount),
          backgroundColor: expenseEntries.map((_, i) => palette[i % palette.length]),
          borderWidth: 2,
          borderColor: isDark ? '#121214' : '#FFFFFF'
        }
      ]
    };
  }, [expenseEntries, isDark]);

  if (financesLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-foreground"></div>
        <p className="text-xs font-medium text-muted-foreground">Loading financial dashboard...</p>
      </div>
    );
  }

  const hasNoData = !finances || (typeof finances === "object" && Object.keys(finances).length === 0);

  if (hasNoData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center bg-card rounded-3xl border border-border/80 p-8 sm:p-12 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground mb-6 shadow-2xs">
            <Wallet className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome to FinSage Dashboard
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            You haven't added your financial profile yet. Add your income, expenses, and assets to unlock real-time strategic guidance.
          </p>
          <div className="mt-8">
            <Link
              to="/finance-input"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-card transition-all"
            >
              <span>Add Financial Information</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Sandbox Guest Mode Banner */}
      {isGuestMode && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-3xl bg-card border border-border/80 shadow-2xs gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  Exploring in Sandbox Guest Mode
                </p>
                <p className="text-2xs sm:text-xs text-muted-foreground">
                  Switch personas below to test scenarios with zero signup required.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-2xs transition shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Claim & Save Plan
            </Link>
          </div>

          <PersonaSelector
            activePersonaId={activePersonaId}
            onSelectPersona={switchPersona}
            onReset={resetSandbox}
          />
        </div>
      )}

      {/* Slide-over Drawer for Full AI Strategy */}
      <AIDrawerModal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        analysis={aiAdvice}
        loading={aiLoading}
        isRefreshing={isRefreshing}
        cacheInfo={cacheInfo}
        onRefresh={handleRefreshAdvice}
      />

      {/* Dashboard Top Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border/70 px-3 py-0.5 text-2xs font-semibold text-foreground">
              Active Assessment
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Real-time financial metrics, cash flow distribution, and strategic intelligence
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDossierOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border/80 rounded-full shadow-2xs text-xs font-semibold text-foreground bg-card hover:bg-muted transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export Dossier</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="xl:hidden inline-flex items-center gap-1.5 px-4 py-2 border border-border/80 rounded-full shadow-2xs text-xs font-semibold text-foreground bg-card hover:bg-muted transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Strategy</span>
          </button>
        </div>
      </div>

      {/* Dribbble-Style 3-Column Core Grid: Center (8 cols) + Right Strategic Panel (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* CENTER COLUMN (8 cols): Overview Card + Cash Flow Bar Chart + FinScore + AI Briefing */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Reference Image 2: OVERVIEW BENTO CARD */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-7 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Overview</h2>
                <span className="text-2xs text-muted-foreground">Live telemetry</span>
              </div>

              {/* Timeframe selector pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/70 text-xs font-medium text-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{timeframe}</span>
              </div>
            </div>

            {/* Dual Bold Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Savings Card */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Monthly Savings
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {formatCurrency(summaryData.monthlySavings)}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-2xs font-bold bg-muted text-foreground border border-border/70">
                      {savingsRate > 0 ? `+${savingsRate.toFixed(1)}%` : `${savingsRate.toFixed(1)}%`}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Cushion: {(summaryData.monthlySavings > 0 && summaryData.totalExpenses > 0 ? (summaryData.monthlySavings * 6 / summaryData.totalExpenses).toFixed(1) : "0")} months expenses
                </p>
              </div>

              {/* Net Worth Card */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Estimated Net Worth
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {formatCurrency(summaryData.netWorth)}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-2xs font-bold bg-muted text-foreground border border-border/70">
                      Optimal
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Assets minus recorded debts
                </p>
              </div>
            </div>

            {/* Avatar Stack & Insight Message */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-7 w-7 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
                    AI
                  </div>
                  <div className="inline-block h-7 w-7 rounded-full bg-muted text-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card border border-border">
                    CA
                  </div>
                  <div className="inline-block h-7 w-7 rounded-full bg-muted text-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card border border-border">
                    FS
                  </div>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  857 active insights computed today
                </span>
              </div>

              <Link
                to="/analytics"
                className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* CASH FLOW & EXPENSES BENTO SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Cash Flow Rounded Bar Chart */}
            <div className="lg:col-span-7 bg-card rounded-3xl border border-border/80 p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Monthly Cash Flow</h3>
                  <p className="text-2xs text-muted-foreground">Income vs Expenses vs Savings</p>
                </div>
                <div className="flex items-center gap-3 text-2xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-foreground" /> Income
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60" /> Expenses
                  </span>
                </div>
              </div>
              <div className="h-56">
                <Bar data={monthlyCashFlow} options={chartOptions.bar} />
              </div>
            </div>

            {/* Expense Distribution Doughnut */}
            <div className="lg:col-span-5 bg-card rounded-3xl border border-border/80 p-6 shadow-card flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Expense Breakdown</h3>
                <p className="text-2xs text-muted-foreground mb-4">Categorized monthly outflow</p>
                <div className="h-44 flex items-center justify-center">
                  {expenseEntries.length > 0 ? (
                    <Doughnut data={expensesData} options={chartOptions.doughnut} />
                  ) : (
                    <div className="text-xs text-muted-foreground">No expenses recorded</div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-2xs text-muted-foreground">
                <span>Total: {formatCurrency(summaryData.totalExpenses)}</span>
                <Link to="/finance-input" className="font-semibold text-foreground hover:underline">
                  Edit →
                </Link>
              </div>
            </div>
          </div>

          {/* FINSCORE VITALITY DIAL CARD */}
          <FinScoreGauge finances={finances} />

          {/* AI EXECUTIVE BRIEFING HERO */}
          <AIBriefingHero
            summaryData={summaryData}
            aiAdvice={aiAdvice}
            loading={aiLoading}
            isRefreshing={isRefreshing}
            cacheInfo={cacheInfo}
            onRefresh={handleRefreshAdvice}
            onOpenFullAdvice={() => setIsDrawerOpen(true)}
          />

          {/* FULL FINANCIAL ANALYSIS REPORT (Embedded) */}
          <div className="hidden lg:block">
            <FinancialAnalysis
              analysis={aiAdvice}
              loading={aiLoading}
              isRefreshing={isRefreshing}
              cacheInfo={cacheInfo}
              onRefresh={handleRefreshAdvice}
            />
          </div>

        </div>

        {/* RIGHT COLUMN (4 cols): STRATEGIC RECOMMENDATIONS PANEL (Matching Reference 2) */}
        <div className="xl:col-span-4 space-y-6">
          
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-foreground" />
                  Strategic Guidance
                </h2>
                <p className="text-2xs text-muted-foreground mt-0.5">High-impact optimizations</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
                Live
              </span>
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              {/* Item 1: Tax Optimization */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tax Architecture
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
                    Optimized
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  New Tax Regime + 80CCD(1B)
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Save ₹38,400 net taxes this year by claiming NPS Tier-1 deductions.
                </p>
                <div className="pt-1 flex items-center justify-between text-2xs">
                  <span className="font-bold text-foreground">₹38,400 / savings</span>
                  <Link
                    to="/scenarios"
                    className="font-semibold text-foreground hover:underline flex items-center gap-0.5"
                  >
                    <span>Simulate</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Item 2: Subscription Leak Radar */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cashflow Radar
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
                    Active
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  Trim Unused OTT & Micro-Leaks
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  3 recurring streaming subscriptions detected. Redirect to index SIPs.
                </p>
                <div className="pt-1 flex items-center justify-between text-2xs">
                  <span className="font-bold text-foreground">₹5,200 / mo found</span>
                  <Link
                    to="/analytics"
                    className="font-semibold text-foreground hover:underline flex items-center gap-0.5"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Item 3: Loan Prepayment vs SIP */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                    Debt Strategy
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
                    Alpha
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  Deploy Surplus to Nifty SIP
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  At 8.4% home loan ROI, equity compounding beats prepayment by ₹18.6L.
                </p>
                <div className="pt-1 flex items-center justify-between text-2xs">
                  <span className="font-bold text-foreground">+₹18.6L Alpha</span>
                  <Link
                    to="/scenarios"
                    className="font-semibold text-foreground hover:underline flex items-center gap-0.5"
                  >
                    <span>Review</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Item 4: Emergency Cushion */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                    Liquidity Cushion
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/70">
                    In Progress
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  6-Month Emergency Runway
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Maintain liquid funds in high-yield flexi-deposit before high equity bets.
                </p>
                <div className="pt-1 flex items-center justify-between text-2xs">
                  <span className="font-bold text-foreground">6.2 Mos Runway</span>
                  <Link
                    to="/finance-input"
                    className="font-semibold text-foreground hover:underline flex items-center gap-0.5"
                  >
                    <span>Update</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* View All Actions Pill Button */}
            <div className="pt-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-2xs transition-all cursor-pointer"
              >
                <span>View Full AI Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Pill Bento Card */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-foreground">Key Financial Ratios</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-muted-foreground">Savings Velocity</span>
                <span className="font-bold text-foreground">{(savingsRate ?? 0).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-muted-foreground">Debt-to-Income</span>
                <span className="font-bold text-foreground">{(summaryData?.debtToIncomeRatio ?? 0).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
                <span className="text-muted-foreground">Total Invested</span>
                <span className="font-bold text-foreground">{formatCurrency(summaryData.totalInvestments)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Printable Executive Dossier Modal */}
      <FinancialDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        finances={finances}
        transactions={transactions}
        userEmail={currentUser?.email || "guest@finsage.ai"}
      />
    </div>
  );
}
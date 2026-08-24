import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useFinances } from "../hooks/useFinances";
import { Link } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
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
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, TrendingUp, Wallet, UserPlus, FileText } from "lucide-react";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Dashboard() {
  const { currentUser, isGuestMode } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    finances,
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

  // Compute summary KPI metrics from finances
  const summaryData = useMemo(() => {
    if (!finances) {
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

    const totalIncome = Object.values(finances.income || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    const totalFixedExpenses = Object.values(finances.fixedExpenses || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    const totalVariableExpenses = Object.values(finances.variableExpenses || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    const totalExpenses = totalFixedExpenses + totalVariableExpenses;
    const totalInvestments = Object.values(finances.investments || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    const totalLoans = Object.values(finances.loans || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    
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
      monthlySavings,
      debtToIncomeRatio,
      netWorth,
      totalIncome,
      totalExpenses,
      totalInvestments,
      totalLoans
    };
  }, [finances]);

  // Fetches financial advice with caching support
  const fetchAdvice = useCallback(async (forceRefresh = false) => {
    if (!finances) return;
    const userId = currentUser?.uid || "guest";

    const totalIncome = Object.values(finances.income || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    const totalFixed = Object.values(finances.fixedExpenses || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    const totalVariable = Object.values(finances.variableExpenses || {}).reduce((sum, val) => sum + Number(val || 0), 0);

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
      if (info.cached) {
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

      setAiAdvice(advice);
      const updatedInfo = getAiCacheInfo(userId, "personal_advice", dataHash);
      setCacheInfo(updatedInfo);
    } catch (error) {
      console.error("Error getting AI advice:", error);
      setAiAdvice("Unable to generate AI advice at this time. Please try again later.");
    } finally {
      setAiLoading(false);
      setIsRefreshing(false);
    }
  }, [finances, currentUser]);

  // Load AI advice on initial mount when finances are available
  useEffect(() => {
    if (finances) {
      fetchAdvice(false);
    }
  }, [finances, fetchAdvice]);

  const handleRefreshAdvice = () => {
    fetchAdvice(true);
  };

  const savingsRate = summaryData.totalIncome > 0 
    ? (summaryData.monthlySavings / summaryData.totalIncome) * 100 
    : 0;

  const investmentRate = summaryData.totalIncome > 0 
    ? (summaryData.totalInvestments / summaryData.totalIncome) * 100 
    : 0;

  // Chart configuration with dark mode colors
  const chartOptions = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const titleColor = isDark ? '#f3f4f6' : '#111827';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    return {
      bar: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { size: 11 } }
          },
          title: {
            display: true,
            text: 'Monthly Cash Flow (₹)',
            color: titleColor,
            font: { size: 13, weight: 'bold' }
          },
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 11 } },
            grid: { color: gridColor }
          },
          y: {
            ticks: { color: textColor, font: { size: 11 } },
            grid: { color: gridColor }
          }
        }
      },
      pie: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, font: { size: 11 }, boxWidth: 12 }
          }
        }
      }
    };
  }, [isDark]);

  // Prepare chart data
  const monthlyCashFlow = {
    labels: ['Income', 'Expenses', 'Savings'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [
          summaryData.totalIncome, 
          summaryData.totalExpenses, 
          summaryData.monthlySavings
        ],
        backgroundColor: isDark ? [
          'rgba(248, 250, 252, 0.85)',
          'rgba(148, 163, 184, 0.6)',
          'rgba(52, 211, 153, 0.8)'
        ] : [
          'rgba(15, 23, 42, 0.85)',
          'rgba(100, 116, 139, 0.75)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: isDark ? [
          'rgb(248, 250, 252)',
          'rgb(148, 163, 184)',
          'rgb(52, 211, 153)'
        ] : [
          'rgb(15, 23, 42)',
          'rgb(100, 116, 139)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const expensesData = {
    labels: [
      ...(finances?.fixedExpenses ? Object.keys(finances.fixedExpenses) : []),
      ...(finances?.variableExpenses ? Object.keys(finances.variableExpenses) : [])
    ],
    datasets: [
      {
        data: [
          ...(finances?.fixedExpenses ? Object.values(finances.fixedExpenses) : []),
          ...(finances?.variableExpenses ? Object.values(finances.variableExpenses) : [])
        ],
        backgroundColor: [
          '#1e293b',
          '#334155',
          '#475569',
          '#64748b',
          '#94a3b8',
          '#0f766e',
          '#b45309',
          '#9f1239'
        ],
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2
      }
    ]
  };

  if (financesLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-white"></div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Loading financial dashboard...</p>
      </div>
    );
  }

  if (!finances) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white mb-6 shadow-xs">
            <Wallet className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome to FinSage Dashboard
          </h2>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You haven't added your financial profile yet. Add your income, expenses, and assets to unlock real-time strategic guidance.
          </p>
          <div className="mt-8">
            <Link
              to="/finance-input"
              className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-xs text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Guest Mode Sandbox Bar */}
      {isGuestMode && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm gap-3 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  You are currently exploring in Sandbox Guest Mode
                </p>
                <p className="text-2xs sm:text-xs text-slate-300 dark:text-slate-600">
                  Switch personas below to test scenarios with zero signup required.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 rounded-lg shadow-2xs transition shrink-0"
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

      {/* Slide-over Drawer for Mobile / Instant full access */}
      <AIDrawerModal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        analysis={aiAdvice}
        loading={aiLoading}
        isRefreshing={isRefreshing}
        cacheInfo={cacheInfo}
        onRefresh={handleRefreshAdvice}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Financial Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-2xs font-semibold text-slate-700 dark:text-slate-300">
              Active Assessment
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time financial metrics, cash flow distribution, and strategic intelligence
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDossierOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Export Dossier</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <span>Strategy</span>
          </button>

          <Link
            to="/finance-input"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xs text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            Update Finances
          </Link>
        </div>
      </div>

      {/* FinScore 0-1000 Health Indicator */}
      <FinScoreGauge finances={finances} />

      {/* ABOVE THE FOLD: AI Executive Briefing Hero Card */}
      <AIBriefingHero
        summaryData={summaryData}
        aiAdvice={aiAdvice}
        loading={aiLoading}
        isRefreshing={isRefreshing}
        cacheInfo={cacheInfo}
        onRefresh={handleRefreshAdvice}
        onOpenFullAdvice={() => setIsDrawerOpen(true)}
      />

      {/* Summary KPI Cards with Contextual Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Monthly Savings Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs rounded-2xl p-5 transition-colors relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Monthly Savings
                </dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(summaryData.monthlySavings)}
                </dd>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs">
            <span className="text-slate-500 dark:text-slate-400">Rate: {savingsRate.toFixed(1)}%</span>
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
              savingsRate >= 20 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
                : savingsRate > 0 
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800" 
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            }`}>
              {savingsRate >= 20 ? "Optimal" : savingsRate > 0 ? "Fair" : "Deficit"}
            </span>
          </div>
        </div>

        {/* Debt-to-Income Ratio Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs rounded-2xl p-5 transition-colors relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Debt-to-Income
                </dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {summaryData.debtToIncomeRatio.toFixed(1)}%
                </dd>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs">
            <span className="text-slate-500 dark:text-slate-400">Threshold: &lt;36%</span>
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
              summaryData.debtToIncomeRatio <= 36 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            }`}>
              {summaryData.debtToIncomeRatio <= 36 ? "Healthy" : "High Leverage"}
            </span>
          </div>
        </div>

        {/* Net Worth Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs rounded-2xl p-5 transition-colors relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Est. Net Worth
                </dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(summaryData.netWorth)}
                </dd>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs">
            <span className="text-slate-500 dark:text-slate-400">Assets - Debts</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {summaryData.netWorth >= 0 ? "Positive" : "Negative"}
            </span>
          </div>
        </div>

        {/* Investment Ratio Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs rounded-2xl p-5 transition-colors relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Invested
                </dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(summaryData.totalInvestments)}
                </dd>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs">
            <span className="text-slate-500 dark:text-slate-400">Ratio vs Income</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">
              {investmentRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cash Flow Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Monthly Cash Flow (Income vs Expenses vs Savings)
          </h2>
          <div className="h-64 sm:h-72">
            <Bar data={monthlyCashFlow} options={chartOptions.bar} />
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Expense Category Breakdown
          </h2>
          <div className="h-64 sm:h-72">
            {expensesData.labels.length > 0 ? (
              <Pie data={expensesData} options={chartOptions.pie} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No expense data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Full Financial Analysis Report */}
      <div className="hidden lg:block">
        <FinancialAnalysis
          analysis={aiAdvice}
          loading={aiLoading}
          isRefreshing={isRefreshing}
          cacheInfo={cacheInfo}
          onRefresh={handleRefreshAdvice}
        />
      </div>

      {/* Printable Executive Dossier Modal */}
      <FinancialDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        finances={finances}
        userEmail={currentUser?.email || "guest@finsage.ai"}
      />
    </div>
  );
}

export default Dashboard;
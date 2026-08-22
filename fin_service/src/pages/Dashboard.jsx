import { useState, useEffect, useMemo, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
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
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, TrendingUp, Wallet, Activity } from "lucide-react";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Dashboard() {
  const { currentUser } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState(null);
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [summaryData, setSummaryData] = useState({
    monthlySavings: 0,
    debtToIncomeRatio: 0,
    netWorth: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    totalLoans: 0
  });

  // Load user's financial data
  useEffect(() => {
    async function loadUserFinances() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const docRef = doc(db, "userFinances", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userFinances = docSnap.data().finances;
          setFinances(userFinances);
          
          // Calculate summary data
          const totalIncome = Object.values(userFinances.income || {}).reduce((sum, val) => sum + Number(val || 0), 0);
          const totalFixedExpenses = Object.values(userFinances.fixedExpenses || {}).reduce((sum, val) => sum + Number(val || 0), 0);
          const totalVariableExpenses = Object.values(userFinances.variableExpenses || {}).reduce((sum, val) => sum + Number(val || 0), 0);
          const totalExpenses = totalFixedExpenses + totalVariableExpenses;
          const totalInvestments = Object.values(userFinances.investments || {}).reduce((sum, val) => sum + Number(val || 0), 0);
          const totalLoans = Object.values(userFinances.loans || {}).reduce((sum, val) => sum + Number(val || 0), 0);
          
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
          
          setSummaryData({
            monthlySavings,
            debtToIncomeRatio,
            netWorth,
            totalIncome,
            totalExpenses,
            totalInvestments,
            totalLoans
          });
        }
      } catch (error) {
        console.error("Error loading finances:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserFinances();
  }, [currentUser]);

  // Fetches financial advice with caching support
  const fetchAdvice = useCallback(async (forceRefresh = false) => {
    if (!finances || !currentUser) return;

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
      // Check if already in cache
      const info = getAiCacheInfo(currentUser.uid, "personal_advice", dataHash);
      if (info.cached) {
        setCacheInfo(info);
      } else {
        setAiLoading(true);
      }
    }

    try {
      const advice = await getFinancialAdvice(financialData, {
        userId: currentUser.uid,
        forceRefresh
      });

      setAiAdvice(advice);
      
      const updatedInfo = getAiCacheInfo(currentUser.uid, "personal_advice", dataHash);
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
    if (finances && currentUser) {
      fetchAdvice(false);
    }
  }, [finances, currentUser, fetchAdvice]);

  const handleRefreshAdvice = () => {
    fetchAdvice(true);
  };

  // Contextual smart badges for metric cards
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
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const incomeData = {
    labels: finances?.income ? Object.keys(finances.income) : [],
    datasets: [
      {
        data: finances?.income ? Object.values(finances.income) : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.75)',
          'rgba(16, 185, 129, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(139, 92, 246, 0.75)',
          'rgba(236, 72, 153, 0.75)'
        ],
        borderColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: 2
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
          'rgba(239, 68, 68, 0.75)',
          'rgba(249, 115, 22, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(16, 185, 129, 0.75)',
          'rgba(6, 182, 212, 0.75)',
          'rgba(59, 130, 246, 0.75)',
          'rgba(139, 92, 246, 0.75)',
          'rgba(236, 72, 153, 0.75)'
        ],
        borderColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const investmentsData = {
    labels: finances?.investments ? Object.keys(finances.investments) : [],
    datasets: [
      {
        data: finances?.investments ? Object.values(finances.investments) : [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.75)',
          'rgba(59, 130, 246, 0.75)',
          'rgba(139, 92, 246, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(236, 72, 153, 0.75)',
          'rgba(6, 182, 212, 0.75)'
        ],
        borderColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: 2
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500/20 border-t-blue-600"></div>
          <Sparkles className="w-5 h-5 text-blue-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading your financial dashboard...</p>
      </div>
    );
  }

  if (!finances) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-6 shadow-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome to FinSage AI Dashboard
          </h2>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You haven't added your financial profile yet. Add your income, expenses, and assets to unlock real-time AI strategic guidance.
          </p>
          <div className="mt-8">
            <Link
              to="/finance-input"
              className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:shadow-lg"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Financial Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3 h-3 text-blue-500" />
              AI Active
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time financial metrics, cash flow distribution, and AI intelligence
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 border border-blue-200 dark:border-blue-800 rounded-xl shadow-xs text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Strategy</span>
          </button>

          <Link
            to="/finance-input"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xs text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Update Finances
          </Link>
        </div>
      </div>

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

      {/* Summary KPI Cards with Contextual AI Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        
        {/* Monthly Savings Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-xs dark:shadow-gray-950/40 rounded-2xl p-5 transition-colors relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl p-2.5">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Monthly Savings
                </dt>
                <dd className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(summaryData.monthlySavings)}
                </dd>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-2xs">
            <span className="text-gray-500 dark:text-gray-400">Rate: {savingsRate.toFixed(1)}%</span>
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
              savingsRate >= 20 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" 
                : savingsRate > 0 
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" 
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
            }`}>
              {savingsRate >= 20 ? "✨ Optimal" : savingsRate > 0 ? "⚠️ Fair" : "🚨 Deficit"}
            </span>
          </div>
        </div>

        {/* Debt-to-Income Ratio Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-xs dark:shadow-gray-950/40 rounded-2xl p-5 transition-colors relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl p-2.5">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Debt-to-Income Ratio
                </dt>
                <dd className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {summaryData.debtToIncomeRatio.toFixed(1)}%
                </dd>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-2xs">
            <span className="text-gray-500 dark:text-gray-400">Limit: 36.0%</span>
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
              summaryData.debtToIncomeRatio <= 20 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" 
                : summaryData.debtToIncomeRatio <= 36 
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" 
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
            }`}>
              {summaryData.debtToIncomeRatio <= 20 ? "✅ Healthy" : summaryData.debtToIncomeRatio <= 36 ? "⚠️ Moderate" : "🚨 High Risk"}
            </span>
          </div>
        </div>

        {/* Total Investments Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-xs dark:shadow-gray-950/40 rounded-2xl p-5 transition-colors relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-2.5">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Monthly Investments
                </dt>
                <dd className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(summaryData.totalInvestments)}
                </dd>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-2xs">
            <span className="text-gray-500 dark:text-gray-400">Ratio: {investmentRate.toFixed(1)}%</span>
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
              investmentRate >= 15 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" 
                : summaryData.totalInvestments > 0 
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            }`}>
              {investmentRate >= 15 ? "✨ 15%+ Target" : summaryData.totalInvestments > 0 ? "📈 Active" : "💡 Start SIP"}
            </span>
          </div>
        </div>

        {/* Estimated Net Worth Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-xs dark:shadow-gray-950/40 rounded-2xl p-5 transition-colors relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl p-2.5">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Estimated Net Worth
                </dt>
                <dd className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {formatCurrency(summaryData.netWorth)}
                </dd>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-2xs">
            <span className="text-gray-500 dark:text-gray-400">Assets - Liabilities</span>
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              📊 Net Position
            </span>
          </div>
        </div>

      </div>

      {/* MAIN CONTENT SECTION: Responsive Split Layout (Desktop 2-Column: Left Charts + Right Sticky Copilot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Left Column: Visual Analytics & Charts (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Visual Cash Flow & Allocations
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Interactive financial breakdowns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Monthly Cash Flow Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-xs dark:shadow-gray-950/40 p-5 transition-colors sm:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Cash Flow Overview</h3>
              <div className="h-60">
                <Bar
                  data={monthlyCashFlow}
                  options={chartOptions.bar}
                />
              </div>
            </div>

            {/* Income Distribution */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-xs dark:shadow-gray-950/40 p-5 transition-colors">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Income Distribution</h3>
              <div className="h-56">
                <Pie 
                  data={incomeData} 
                  options={chartOptions.pie}
                />
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-xs dark:shadow-gray-950/40 p-5 transition-colors">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Expense Breakdown</h3>
              <div className="h-56">
                <Pie 
                  data={expensesData} 
                  options={chartOptions.pie}
                />
              </div>
            </div>

            {/* Investment Allocation */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-xs dark:shadow-gray-950/40 p-5 transition-colors sm:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Investment Allocation</h3>
              <div className="h-56">
                {Object.keys(finances?.investments || {}).length > 0 ? (
                  <Pie 
                    data={investmentsData} 
                    options={chartOptions.pie}
                  />
                ) : (
                  <div className="flex flex-col justify-center items-center h-full text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
                    <p>No investment data recorded yet.</p>
                    <Link to="/finance-input" className="text-blue-600 dark:text-blue-400 underline font-medium">Add Investments</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Strategic Financial Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/scenarios" className="block group">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 group-hover:border-blue-500 dark:group-hover:border-blue-500 shadow-xs dark:shadow-gray-950/40 rounded-xl transition-all p-4">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">"What-If" Scenarios</h4>
                  <p className="mt-1 text-2xs text-gray-500 dark:text-gray-400">
                    Simulate salary hikes, career shifts, or major home loans
                  </p>
                </div>
              </Link>
              <Link to="/analytics" className="block group">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 group-hover:border-blue-500 dark:group-hover:border-blue-500 shadow-xs dark:shadow-gray-950/40 rounded-xl transition-all p-4">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">Spending Analytics</h4>
                  <p className="mt-1 text-2xs text-gray-500 dark:text-gray-400">
                    Analyze variable expenses and find savings leaks
                  </p>
                </div>
              </Link>
              <Link to="/advisor" className="block group">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 group-hover:border-blue-500 dark:group-hover:border-blue-500 shadow-xs dark:shadow-gray-950/40 rounded-xl transition-all p-4">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">Custom AI Advisor</h4>
                  <p className="mt-1 text-2xs text-gray-500 dark:text-gray-400">
                    Ask questions directly with your live financial context
                  </p>
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky AI Advisor Copilot (5 cols on large screens, always visible side-by-side) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <FinancialAnalysis 
            analysis={aiAdvice} 
            loading={aiLoading} 
            onRefresh={handleRefreshAdvice}
            isRefreshing={isRefreshing}
            cacheInfo={cacheInfo}
            isSidebar={true}
          />
        </div>

      </div>

      {/* Floating Action Pill for Mobile / Tablet to open AI strategy anytime without scrolling */}
      <div className="lg:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer font-semibold text-xs border border-white/20"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>AI Strategy Report</span>
        </button>
      </div>

    </div>
  );
}

export default Dashboard;
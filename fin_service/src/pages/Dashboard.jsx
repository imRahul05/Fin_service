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
            savings: monthlySavings * 6
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
            labels: { color: textColor }
          },
          title: {
            display: true,
            text: 'Monthly Cash Flow (₹)',
            color: titleColor
          },
        },
        scales: {
          x: {
            ticks: { color: textColor },
            grid: { color: gridColor }
          },
          y: {
            ticks: { color: textColor },
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
            labels: { color: textColor }
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
          'rgba(59, 130, 246, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 1
      }
    ]
  };

  const incomeData = {
    labels: finances?.income ? Object.keys(finances.income) : [],
    datasets: [
      {
        data: finances?.income ? Object.values(finances.income) : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 1
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
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
          'rgb(6, 182, 212)',
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 1
      }
    ]
  };

  const investmentsData = {
    labels: finances?.investments ? Object.keys(finances.investments) : [],
    datasets: [
      {
        data: finances?.investments ? Object.values(finances.investments) : [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(6, 182, 212, 0.7)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(245, 158, 11)',
          'rgb(236, 72, 153)',
          'rgb(6, 182, 212)'
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!finances) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Welcome to your Financial Dashboard
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            You haven't added your financial information yet. Please add your details to see your dashboard.
          </p>
          <div className="mt-8">
            <Link
              to="/finance-input"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Financial Information
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Financial Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your financial health and metrics
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/finance-input"
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Update Finances
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Savings Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Monthly Savings
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.monthlySavings)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Debt-to-Income Ratio Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Debt-to-Income Ratio
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {summaryData.debtToIncomeRatio.toFixed(1)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Investments Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Investments
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalInvestments)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Net Worth Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Estimated Net Worth
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.netWorth)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
          Financial Tools
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/scenarios" className="block group">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-all p-6">
              <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Run "What-If" Scenarios</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Simulate career changes, investment strategies, or major purchases
              </p>
            </div>
          </Link>
          <Link to="/analytics" className="block group">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-all p-6">
              <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Spending Analytics</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Analyze your spending habits and find opportunities to save
              </p>
            </div>
          </Link>
          <Link to="/advisor" className="block group">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-500 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-all p-6">
              <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 group-hover:underline">Get More Financial Advice</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Ask our AI advisor for personalized financial guidance
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-950/40 px-5 py-6 transition-colors">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Cash Flow</h3>
          <div className="h-64">
            <Bar
              data={monthlyCashFlow}
              options={chartOptions.bar}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-950/40 px-5 py-6 transition-colors">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Income Distribution</h3>
          <div className="h-64">
            <Pie 
              data={incomeData} 
              options={chartOptions.pie}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-950/40 px-5 py-6 transition-colors">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
          <div className="h-64">
            <Pie 
              data={expensesData} 
              options={chartOptions.pie}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-950/40 px-5 py-6 transition-colors">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Investment Allocation</h3>
          <div className="h-64">
            <Pie 
              data={investmentsData} 
              options={chartOptions.pie}
            />
          </div>
        </div>
      </div>

      {/* AI Advice Section */}
      <div className="mt-12">
        <FinancialAnalysis 
          analysis={aiAdvice} 
          loading={aiLoading} 
          onRefresh={handleRefreshAdvice}
          isRefreshing={isRefreshing}
          cacheInfo={cacheInfo}
        />
      </div>
    </div>
  );
}

export default Dashboard;
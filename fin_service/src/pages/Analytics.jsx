import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFinances } from "../hooks/useFinances";
import { formatCurrency, aggregateFinancials } from "../utils/financialUtils";
import SubscriptionRadar from "../components/analytics/SubscriptionRadar";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Analytics() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { finances, transactions, loading } = useFinances();

  const [spendingAnalysis, setSpendingAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Synchronously compute analytics metrics from finances (100% DRY)
  const financeAnalytics = useMemo(() => {
    return aggregateFinancials(finances);
  }, [finances]);

  // Get AI spending analysis
  useEffect(() => {
    async function getAnalysis() {
      if (!finances) return;
      
      setAiLoading(true);
      try {
        let analysis = "";
        
        if (financeAnalytics.income > 0) {
          analysis += `Based on your reported finances, you have a monthly income of ${formatCurrency(financeAnalytics.income)} and expenses of ${formatCurrency(financeAnalytics.expenses)}.\n\n`;
          
          if (financeAnalytics.savings > 0) {
            analysis += `You're saving ${formatCurrency(financeAnalytics.savings)} per month (${financeAnalytics.savingsRate.toFixed(1)}% of income), which is excellent.\n\n`;
          } else {
            analysis += `Your expenses exceed your income by ${formatCurrency(Math.abs(financeAnalytics.savings))} per month. Consider reducing expenses in discretionary categories.\n\n`;
          }
          
          if (financeAnalytics.investmentsTotal > 0) {
            const investmentPercentage = (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100;
            analysis += `You're investing ${formatCurrency(financeAnalytics.investmentsTotal)} monthly (${investmentPercentage.toFixed(1)}% of income).\n\n`;
          }
          
          if (financeAnalytics.loansTotal > 0) {
            const debtToIncomeRatio = (financeAnalytics.loansTotal / financeAnalytics.income) * 100;
            analysis += `Your debt payments amount to ${formatCurrency(financeAnalytics.loansTotal)} monthly, which is ${debtToIncomeRatio.toFixed(1)}% of your income.\n\n`;
            
            if (debtToIncomeRatio > 36) {
              analysis += `This debt-to-income ratio is higher than the recommended 36%. Consider strategies to reduce debt.\n\n`;
            } else {
              analysis += `Your debt-to-income ratio is within healthy limits.\n\n`;
            }
          }
          
          if (Object.keys(financeAnalytics.expenseCategories).length > 0) {
            const sortedExpenses = Object.entries(financeAnalytics.expenseCategories)
              .sort((a, b) => b[1] - a[1]);
            
            if (sortedExpenses.length > 0) {
              const topExpense = sortedExpenses[0];
              analysis += `Your largest expense category is ${topExpense[0]} at ${formatCurrency(topExpense[1])} per month.\n\n`;
            }
          }
          
          analysis += "Recommendations:\n";
          if (financeAnalytics.savings < 0) {
            analysis += "- Find ways to increase income or reduce expenses to achieve a positive cash flow\n";
          } else if ((financeAnalytics.savings / financeAnalytics.income) < 0.2) {
            analysis += "- Try to increase your savings rate to at least 20% of income for long-term financial security\n";
          }
          
          if (financeAnalytics.investmentsTotal < (financeAnalytics.income * 0.15)) {
            analysis += "- Consider increasing your monthly investments to build wealth faster\n";
          }
          
          if (Object.keys(finances.investments || {}).length < 3) {
            analysis += "- Diversify your investment portfolio across more asset classes\n";
          }
        } else {
          analysis = "Please complete your financial profile to receive personalized insights.";
        }
        
        setSpendingAnalysis(analysis);
      } catch (error) {
        console.error("Error generating finance analysis:", error);
        setSpendingAnalysis("Unable to generate finance analysis at this time. Please try again later.");
      } finally {
        setAiLoading(false);
      }
    }
    
    getAnalysis();
  }, [finances, financeAnalytics]);

  // Chart configuration with dark mode colors
  const chartPieOptions = useMemo(() => {
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    };
  }, [isDark]);

  // Handle no financial data
  const handleNoFinancialData = () => {
    if (!finances && !loading) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 my-8 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                No financial data found. Please complete your financial profile to see analytics.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const incomeData = {
    labels: Object.keys(financeAnalytics.incomeSources).filter(source => financeAnalytics.incomeSources[source] > 0),
    datasets: [
      {
        label: 'Income Sources',
        data: Object.entries(financeAnalytics.incomeSources)
          .filter(([, amount]) => amount > 0)
          .map(([, amount]) => amount),
        backgroundColor: [
          '#0f172a',
          '#334155',
          '#475569',
          '#64748b',
          '#94a3b8'
        ],
        borderColor: isDark ? '#090d14' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const expenseCategoryData = {
    labels: Object.keys(financeAnalytics.expenseCategories),
    datasets: [
      {
        label: 'Expense Categories',
        data: Object.values(financeAnalytics.expenseCategories),
        backgroundColor: [
          '#1e293b',
          '#334155',
          '#475569',
          '#64748b',
          '#94a3b8',
          '#0f766e',
          '#b45309',
          '#9f1239',
          '#475569'
        ],
        borderColor: isDark ? '#090d14' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const expenseBreakdownData = {
    labels: Object.keys(financeAnalytics.expenseBreakdown).filter(key => financeAnalytics.expenseBreakdown[key] > 0),
    datasets: [
      {
        label: 'Expense Breakdown',
        data: Object.entries(financeAnalytics.expenseBreakdown)
          .filter(([, amount]) => amount > 0)
          .map(([, amount]) => amount),
        backgroundColor: [
          '#334155',
          '#64748b',
          '#94a3b8',
        ],
        borderColor: isDark ? '#090d14' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const investmentBreakdown = useMemo(() => {
    if (!finances || !finances.investments) return [];
    return Object.entries(finances.investments)
      .filter(([, amount]) => parseFloat(amount) > 0)
      .map(([type, amount]) => ({
        type,
        amount: parseFloat(amount)
      }));
  }, [finances]);
  
  const investmentData = {
    labels: investmentBreakdown.map(item => item.type),
    datasets: [
      {
        label: 'Investment Allocation',
        data: investmentBreakdown.map(item => item.amount),
        backgroundColor: [
          '#0f766e',
          '#1e293b',
          '#334155',
          '#475569',
          '#64748b',
          '#94a3b8',
        ],
        borderColor: isDark ? '#090d14' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            Financial Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Analyze your financial profile and find ways to optimize
          </p>
        </div>
      </div>

      {handleNoFinancialData()}

      {finances && (
        <>
          {/* Financial Overview Cards */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs rounded-2xl p-5 transition-colors">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Monthly Income</dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(financeAnalytics.income)}
              </dd>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs rounded-2xl p-5 transition-colors">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Monthly Expenses</dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(financeAnalytics.expenses)}
              </dd>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs rounded-2xl p-5 transition-colors">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Monthly Savings</dt>
              <dd className={`mt-1 text-2xl sm:text-3xl font-bold ${financeAnalytics.savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(financeAnalytics.savings)}
              </dd>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs rounded-2xl p-5 transition-colors">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Savings Rate</dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {financeAnalytics.savingsRate.toFixed(1)}%
              </dd>
            </div>
          </div>

          {/* Financial Health Indicators */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Financial Health Indicators</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Savings Rate Indicator */}
              <div className="bg-white dark:bg-slate-900 overflow-hidden shadow-2xs rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-xl p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                        Savings Rate
                      </dt>
                      <dd>
                        <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                          {financeAnalytics.savingsRate.toFixed(1)}%
                        </div>
                      </dd>
                      <dd className="mt-1 text-2xs font-semibold">
                        <span className={`inline-block px-2 py-0.5 rounded-full border ${
                          financeAnalytics.savingsRate >= 20 
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                            : financeAnalytics.savingsRate >= 10 
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
                              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                        }`}>
                          {financeAnalytics.savingsRate >= 20 ? 'Optimal' : 
                           financeAnalytics.savingsRate >= 10 ? 'Moderate' : 
                           financeAnalytics.savingsRate >= 0 ? 'Needs Improvement' : 'Deficit'}
                        </span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Debt-to-Income Ratio */}
              {financeAnalytics.totalIncome > 0 && (
                <div className="bg-white dark:bg-slate-900 overflow-hidden shadow-2xs rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-xl p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                          Debt-to-Income Ratio
                        </dt>
                        <dd>
                          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            {((financeAnalytics.totalLoans / financeAnalytics.totalIncome) * 100).toFixed(1)}%
                          </div>
                        </dd>
                        <dd className="mt-1 text-2xs font-semibold">
                          <span className={`inline-block px-2 py-0.5 rounded-full border ${
                            (financeAnalytics.totalLoans / financeAnalytics.totalIncome) * 100 <= 20 
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                              : (financeAnalytics.totalLoans / financeAnalytics.totalIncome) * 100 <= 36 
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                          }`}>
                            {(financeAnalytics.totalLoans / financeAnalytics.totalIncome) * 100 <= 20 ? 'Optimal' : 
                             (financeAnalytics.totalLoans / financeAnalytics.totalIncome) * 100 <= 36 ? 'Acceptable' : 'High Leverage'}
                          </span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              )}

              {/* Investment Rate */}
              {financeAnalytics.totalIncome > 0 && (
                <div className="bg-white dark:bg-slate-900 overflow-hidden shadow-2xs rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-xl p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                          Investment Rate
                        </dt>
                        <dd>
                          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            {((financeAnalytics.totalInvestments / financeAnalytics.totalIncome) * 100).toFixed(1)}%
                          </div>
                        </dd>
                        <dd className="mt-1 text-2xs font-semibold">
                          <span className={`inline-block px-2 py-0.5 rounded-full border ${
                            (financeAnalytics.totalInvestments / financeAnalytics.totalIncome) * 100 >= 15 
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                              : (financeAnalytics.totalInvestments / financeAnalytics.totalIncome) * 100 >= 5 
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                          }`}>
                            {(financeAnalytics.totalInvestments / financeAnalytics.totalIncome) * 100 >= 15 ? 'Optimal' : 
                             (financeAnalytics.totalInvestments / financeAnalytics.totalIncome) * 100 >= 5 ? 'Moderate' : 'Needs Attention'}
                          </span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Income Sources */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs p-5 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Income Sources</h3>
              <div className="h-64">
                <Pie 
                  data={incomeData}
                  options={chartPieOptions}
                />
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs p-5 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Expense Distribution</h3>
              <div className="h-64">
                <Pie 
                  data={expenseBreakdownData}
                  options={chartPieOptions}
                />
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs p-5 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Expense Categories</h3>
              <div className="h-64">
                <Pie 
                  data={expenseCategoryData}
                  options={chartPieOptions}
                />
              </div>
            </div>

            {/* Investment Allocation */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs p-5 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Investment Allocation</h3>
              <div className="h-64">
                {investmentBreakdown.length > 0 ? (
                  <Pie 
                    data={investmentData}
                    options={chartPieOptions}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-slate-400 text-xs">No investment data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Subscription & Recurring Leakage Radar */}
          <SubscriptionRadar 
            transactions={transactions} 
            fixedExpenses={finances?.fixedExpenses} 
            className="mt-8" 
          />

          {/* Financial Details */}
          <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden rounded-2xl transition-colors">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Financial Details Summary
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Detailed breakdown of recorded cash flows and asset distributions
              </p>
            </div>

            <div>
              <dl className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="bg-slate-50/50 dark:bg-slate-800/40 px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Income</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.totalIncome)}
                  </dd>
                </div>
                <div className="bg-white dark:bg-slate-900 px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Fixed Expenses</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.expenseBreakdown['Fixed Expenses'] || 0)}
                  </dd>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-800/40 px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Variable Expenses</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.expenseBreakdown['Variable Expenses'] || 0)}
                  </dd>
                </div>
                <div className="bg-white dark:bg-slate-900 px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Loan Payments</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.totalLoans || 0)}
                  </dd>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-800/40 px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Investments</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.totalInvestments || 0)}
                  </dd>
                </div>
                <div className="bg-white dark:bg-slate-900 px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Monthly Savings</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.monthlySavings || 0)}
                  </dd>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-800/40 px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Savings Rate</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {financeAnalytics.savingsRate.toFixed(1)}%
                  </dd>
                </div>
                <div className="bg-white dark:bg-slate-900 px-5 py-3.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Updated</dt>
                  <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:mt-0 sm:col-span-2">
                    {finances.updatedAt ? formatDate(finances.updatedAt) : 'Recent Session'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden rounded-2xl transition-colors">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Strategic Assessment
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Personalized insights about your financial profile
              </p>
            </div>
            <div className="px-5 py-5">
              {aiLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-white"></div>
                </div>
              ) : (
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs whitespace-pre-line">
                  {spendingAnalysis}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
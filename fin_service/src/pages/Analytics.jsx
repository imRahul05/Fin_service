import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/financialUtils";
import { analyzeSpendingBehavior } from "../services/AIService";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Analytics() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [spendingAnalysis, setSpendingAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState({});
  const [timeRange, setTimeRange] = useState("month"); // "month", "quarter", or "year"
  const [financeAnalytics, setFinanceAnalytics] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
    savingsRate: 0,
    expenseBreakdown: {},
    investmentsTotal: 0,
    loansTotal: 0,
    incomeSources: {},
    expenseCategories: {}
  });

  // Load user's financial data and transactions
  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load financial data from Firebase
        const docRef = doc(db, "userFinances", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const financeData = docSnap.data().finances;
          setFinances(financeData);
          
          // Process finance data to create analytics
          if (financeData) {
            // Calculate totals
            const totalIncome = financeData.income ? 
              Object.values(financeData.income).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0;
            
            const totalFixedExpenses = financeData.fixedExpenses ? 
              Object.values(financeData.fixedExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0;
            
            const totalVariableExpenses = financeData.variableExpenses ? 
              Object.values(financeData.variableExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0;
            
            const totalInvestments = financeData.investments ? 
              Object.values(financeData.investments).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0;
            
            const totalLoans = financeData.loans ? 
              Object.values(financeData.loans).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0;
            
            const totalExpenses = totalFixedExpenses + totalVariableExpenses;
            const savings = totalIncome - totalExpenses;
            const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
            
            // Create income breakdown
            const incomeSources = financeData.income || {};
            
            // Create expense categories by combining fixed and variable expenses
            const expenseCategories = {};
            
            if (financeData.fixedExpenses) {
              Object.entries(financeData.fixedExpenses).forEach(([category, amount]) => {
                if (parseFloat(amount) > 0) {
                  expenseCategories[`Fixed: ${category}`] = parseFloat(amount);
                }
              });
            }
            
            if (financeData.variableExpenses) {
              Object.entries(financeData.variableExpenses).forEach(([category, amount]) => {
                if (parseFloat(amount) > 0) {
                  expenseCategories[`Variable: ${category}`] = parseFloat(amount);
                }
              });
            }
            
            // Create expense breakdown
            const expenseBreakdown = {
              'Fixed Expenses': totalFixedExpenses,
              'Variable Expenses': totalVariableExpenses,
              'Loan Payments': totalLoans
            };
            
            setFinanceAnalytics({
              income: totalIncome,
              expenses: totalExpenses,
              savings,
              savingsRate,
              expenseBreakdown,
              investmentsTotal: totalInvestments,
              loansTotal: totalLoans,
              incomeSources,
              expenseCategories
            });
          }
        }
        
        // Load real transactions from Firebase
        const transactionsRef = collection(db, "transactions");
        
        // Create a filter based on selected time range
        const now = new Date();
        let startDate;
        
        if (timeRange === "month") {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        } else if (timeRange === "quarter") {
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        } else { // year
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }
        
        const startDateString = startDate.toISOString().split('T')[0];
        
        let q = query(
          transactionsRef, 
          where("userId", "==", currentUser.uid),
          where("date", ">=", startDateString),
          orderBy("date", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const transactionsData = [];
        
        querySnapshot.forEach((doc) => {
          transactionsData.push({ id: doc.id, ...doc.data() });
        });
        
        setTransactions(transactionsData);
        
        // Process transactions to calculate category totals
        const categories = {};
        const methods = {};
        const monthly = Array(12).fill(0);
        
        transactionsData.forEach(transaction => {
          // Category totals
          if (categories[transaction.category]) {
            categories[transaction.category] += transaction.amount;
          } else {
            categories[transaction.category] = transaction.amount;
          }
          
          // Payment method breakdown
          if (methods[transaction.paymentMethod]) {
            methods[transaction.paymentMethod] += transaction.amount;
          } else {
            methods[transaction.paymentMethod] = transaction.amount;
          }
          
          // Monthly spending
          const month = new Date(transaction.date).getMonth();
          monthly[month] += transaction.amount;
        });
        
        setCategoryTotals(categories);
        setPaymentMethodBreakdown(methods);
        setMonthlySpending(monthly);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [currentUser, timeRange]); // Add timeRange as dependency to reload data when it changes

  // Get AI spending analysis when transactions are loaded
  useEffect(() => {
    async function getAnalysis() {
      if (!finances) return;
      
      setAiLoading(true);
      try {
        // You can modify the AIService to analyze finance data instead of transactions
        // For now, we'll create a simple analysis
        let analysis = "";
        
        if (financeAnalytics.income > 0) {
          analysis += `Based on your reported finances, you have a monthly income of ${formatCurrency(financeAnalytics.income)} and expenses of ${formatCurrency(financeAnalytics.expenses)}.\n\n`;
          
          if (financeAnalytics.savings > 0) {
            analysis += `You're saving ${formatCurrency(financeAnalytics.savings)} per month (${financeAnalytics.savingsRate.toFixed(1)}% of income), which is excellent.\n\n`;
          } else {
            analysis += `Your expenses exceed your income by ${formatCurrency(Math.abs(financeAnalytics.savings))} per month. Consider reducing expenses in discretionary categories.\n\n`;
          }
          
          // Investment Analysis
          if (financeAnalytics.investmentsTotal > 0) {
            const investmentPercentage = (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100;
            analysis += `You're investing ${formatCurrency(financeAnalytics.investmentsTotal)} monthly (${investmentPercentage.toFixed(1)}% of income).\n\n`;
          }
          
          // Loan Analysis
          if (financeAnalytics.loansTotal > 0) {
            const debtToIncomeRatio = (financeAnalytics.loansTotal / financeAnalytics.income) * 100;
            analysis += `Your debt payments amount to ${formatCurrency(financeAnalytics.loansTotal)} monthly, which is ${debtToIncomeRatio.toFixed(1)}% of your income.\n\n`;
            
            if (debtToIncomeRatio > 36) {
              analysis += `This debt-to-income ratio is higher than the recommended 36%. Consider strategies to reduce debt.\n\n`;
            } else {
              analysis += `Your debt-to-income ratio is within healthy limits.\n\n`;
            }
          }
          
          // Expense category analysis
          if (Object.keys(financeAnalytics.expenseCategories).length > 0) {
            const sortedExpenses = Object.entries(financeAnalytics.expenseCategories)
              .sort((a, b) => b[1] - a[1]);
            
            if (sortedExpenses.length > 0) {
              const topExpense = sortedExpenses[0];
              analysis += `Your largest expense category is ${topExpense[0]} at ${formatCurrency(topExpense[1])} per month.\n\n`;
            }
          }
          
          // Final recommendations
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

  // Handle no financial data
  const handleNoFinancialData = () => {
    if (!finances && !loading) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No financial data found. Please complete your financial profile to see analytics.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare chart data from financial data
  const incomeData = {
    labels: Object.keys(financeAnalytics.incomeSources).filter(source => financeAnalytics.incomeSources[source] > 0),
    datasets: [
      {
        label: 'Income Sources',
        data: Object.entries(financeAnalytics.incomeSources)
          .filter(([source, amount]) => amount > 0)
          .map(([source, amount]) => amount),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderWidth: 1,
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
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(40, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const expenseBreakdownData = {
    labels: Object.keys(financeAnalytics.expenseBreakdown).filter(key => financeAnalytics.expenseBreakdown[key] > 0),
    datasets: [
      {
        label: 'Expense Breakdown',
        data: Object.entries(financeAnalytics.expenseBreakdown)
          .filter(([category, amount]) => amount > 0)
          .map(([category, amount]) => amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Investment breakdown if available
  const getInvestmentBreakdown = () => {
    if (!finances || !finances.investments) return [];
    
    return Object.entries(finances.investments)
      .filter(([type, amount]) => parseFloat(amount) > 0)
      .map(([type, amount]) => ({
        type,
        amount: parseFloat(amount)
      }));
  };

  const investmentBreakdown = getInvestmentBreakdown();
  
  const investmentData = {
    labels: investmentBreakdown.map(item => item.type),
    datasets: [
      {
        label: 'Investment Allocation',
        data: investmentBreakdown.map(item => item.amount),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Financial Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyze your financial profile and find ways to improve
          </p>
        </div>
      </div>

      {handleNoFinancialData()}

      {finances && (
        <>
          {/* Financial Overview Cards */}
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(financeAnalytics.income)}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Monthly Expenses</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(financeAnalytics.expenses)}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Monthly Savings</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(financeAnalytics.savings)}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Savings Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {financeAnalytics.savingsRate.toFixed(1)}%
                </dd>
              </div>
            </div>
          </div>
    

        {/* Financial Health Indicators */}
        <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Financial Health Indicators</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Savings Rate Indicator */}
              <div className={`bg-white overflow-hidden shadow rounded-lg border ${
                financeAnalytics.savingsRate >= 20 ? 'border-green-200' : 
                financeAnalytics.savingsRate >= 10 ? 'border-yellow-200' : 'border-red-200'
              }`}>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${
                      financeAnalytics.savingsRate >= 20 ? 'bg-green-100' : 
                      financeAnalytics.savingsRate >= 10 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <svg className={`h-6 w-6 ${
                        financeAnalytics.savingsRate >= 20 ? 'text-green-600' : 
                        financeAnalytics.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Savings Rate
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {financeAnalytics.savingsRate.toFixed(1)}%
                          </div>
                        </dd>
                        <dd className="mt-1 text-sm text-gray-500">
                          {financeAnalytics.savingsRate >= 20 ? 'Excellent' : 
                           financeAnalytics.savingsRate >= 10 ? 'Good' : 
                           financeAnalytics.savingsRate >= 0 ? 'Needs improvement' : 'Critical'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Debt-to-Income Ratio */}
              {financeAnalytics.income > 0 && (
                <div className={`bg-white overflow-hidden shadow rounded-lg border ${
                  (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 20 ? 'border-green-200' : 
                  (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 36 ? 'border-yellow-200' : 'border-red-200'
                }`}>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-md p-3 ${
                        (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 20 ? 'bg-green-100' : 
                        (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 36 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <svg className={`h-6 w-6 ${
                          (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 20 ? 'text-green-600' : 
                          (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 36 ? 'text-yellow-600' : 'text-red-600'
                        }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Debt-to-Income Ratio
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {((financeAnalytics.loansTotal / financeAnalytics.income) * 100).toFixed(1)}%
                            </div>
                          </dd>
                          <dd className="mt-1 text-sm text-gray-500">
                            {(financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 20 ? 'Excellent' : 
                             (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 36 ? 'Good' : 'High'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Investment Rate */}
              {financeAnalytics.income > 0 && (
                <div className={`bg-white overflow-hidden shadow rounded-lg border ${
                  (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 15 ? 'border-green-200' : 
                  (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 5 ? 'border-yellow-200' : 'border-red-200'
                }`}>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-md p-3 ${
                        (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 15 ? 'bg-green-100' : 
                        (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 5 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <svg className={`h-6 w-6 ${
                          (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 15 ? 'text-green-600' : 
                          (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Investment Rate
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {((financeAnalytics.investmentsTotal / financeAnalytics.income) * 100).toFixed(1)}%
                            </div>
                          </dd>
                          <dd className="mt-1 text-sm text-gray-500">
                            {(financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 15 ? 'Excellent' : 
                             (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 5 ? 'Good' : 'Needs improvement'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Chart Section */}
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Income Sources */}
            <div className="bg-white rounded-lg shadow px-5 py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Income Sources</h3>
              <div className="h-64">
                <Pie 
                  data={incomeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-lg shadow px-5 py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Distribution</h3>
              <div className="h-64">
                <Pie 
                  data={expenseBreakdownData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white rounded-lg shadow px-5 py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Categories</h3>
              <div className="h-64">
                <Pie 
                  data={expenseCategoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Investment Allocation */}
            <div className="bg-white rounded-lg shadow px-5 py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Allocation</h3>
              <div className="h-64">
                {investmentBreakdown.length > 0 ? (
                  <Pie 
                    data={investmentData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">No investment data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Financial Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Summary of your financial information
              </p>
            </div>

            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Monthly Income</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.income)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fixed Expenses</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.expenseBreakdown['Fixed Expenses'] || 0)}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Variable Expenses</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.expenseBreakdown['Variable Expenses'] || 0)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Loan Payments</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.loansTotal || 0)}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Monthly Investments</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.investmentsTotal || 0)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Net Monthly Savings</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(financeAnalytics.savings || 0)}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Savings Rate</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {financeAnalytics.savingsRate.toFixed(1)}%
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {finances.updatedAt ? formatDate(finances.updatedAt) : 'Unknown'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-blue-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Financial Analysis
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personalized insights about your financial profile
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {aiLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line">
                    {spendingAnalysis}
                  </div>
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
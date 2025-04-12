import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
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
import ReactMarkdown from 'react-markdown';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Dashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState(null);
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
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
          const totalIncome = Object.values(userFinances.income).reduce((sum, val) => sum + val, 0);
          const totalFixedExpenses = Object.values(userFinances.fixedExpenses).reduce((sum, val) => sum + val, 0);
          const totalVariableExpenses = Object.values(userFinances.variableExpenses).reduce((sum, val) => sum + val, 0);
          const totalExpenses = totalFixedExpenses + totalVariableExpenses;
          const totalInvestments = Object.values(userFinances.investments).reduce((sum, val) => sum + val, 0);
          const totalLoans = Object.values(userFinances.loans).reduce((sum, val) => sum + val, 0);
          
          const monthlySavings = calculateMonthlySavings(totalIncome, totalExpenses);
          const debtToIncomeRatio = calculateDebtToIncomeRatio(totalLoans, totalIncome);
          
          // For net worth calculation, we need assets and liabilities
          const assets = {
            investments: totalInvestments,
            savings: monthlySavings * 6 // Simplified: 6 months of savings as cash
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

  // Get AI advice when finances data is loaded
  useEffect(() => {
    async function getAdvice() {
      if (!finances) return;
      
      setAiLoading(true);
      try {
        const financialData = {
          income: summaryData.totalIncome,
          fixedExpenses: Object.values(finances.fixedExpenses).reduce((sum, val) => sum + val, 0),
          variableExpenses: Object.values(finances.variableExpenses).reduce((sum, val) => sum + val, 0),
          investments: finances.investments,
          loans: finances.loans,
          goals: "" // Could be set by user in a future feature
        };
        
        const advice = await getFinancialAdvice(financialData);
        setAiAdvice(advice);
      } catch (error) {
        console.error("Error getting AI advice:", error);
        setAiAdvice("Unable to generate AI advice at this time. Please try again later.");
      } finally {
        setAiLoading(false);
      }
    }
    
    getAdvice();
  }, [finances, summaryData]);

  // Prepare chart data
  const incomeData = finances && {
    labels: Object.keys(finances.income).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [
      {
        label: 'Income Sources',
        data: Object.values(finances.income),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const expensesData = finances && {
    labels: ['Fixed Expenses', 'Variable Expenses'],
    datasets: [
      {
        label: 'Expenses',
        data: [
          Object.values(finances.fixedExpenses).reduce((sum, val) => sum + val, 0),
          Object.values(finances.variableExpenses).reduce((sum, val) => sum + val, 0)
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const investmentsData = finances && {
    labels: Object.keys(finances.investments).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
    datasets: [
      {
        label: 'Investment Allocation',
        data: Object.values(finances.investments),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(231, 233, 237, 0.6)',
          'rgba(155, 89, 182, 0.6)',
          'rgba(46, 204, 113, 0.6)',
          'rgba(52, 152, 219, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyCashFlow = {
    labels: ['Income', 'Expenses', 'Savings'],
    datasets: [
      {
        label: 'Monthly Cash Flow',
        data: [
          summaryData.totalIncome,
          summaryData.totalExpenses,
          summaryData.monthlySavings
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
      },
    ],
  };

  // Status card component
  const StatusCard = ({ title, value, description, colorClass }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className={`mt-1 text-3xl font-semibold ${colorClass}`}>{value}</dd>
        <dd className="mt-2 text-sm text-gray-500">{description}</dd>
      </div>
    </div>
  );

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
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            No financial data found
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            You haven't added your financial information yet. Please add your details to see your dashboard.
          </p>
          <div className="mt-8">
            <Link
              to="/finance-input"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Financial Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/finance-input"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Financial Info
          </Link>
        </div>
      </div>

      {/* Financial Summary Section */}
      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard 
            title="Monthly Savings" 
            value={formatCurrency(summaryData.monthlySavings)}
            description="Your monthly cash surplus after expenses"
            colorClass={summaryData.monthlySavings > 0 ? "text-green-600" : "text-red-600"}
          />
          <StatusCard 
            title="Debt-to-Income Ratio" 
            value={`${summaryData.debtToIncomeRatio.toFixed(2)}%`}
            description={`${summaryData.debtToIncomeRatio > 36 ? 'High' : summaryData.debtToIncomeRatio > 20 ? 'Moderate' : 'Low'} (Recommended: below 36%)`}
            colorClass={summaryData.debtToIncomeRatio > 36 ? "text-red-600" : summaryData.debtToIncomeRatio > 20 ? "text-yellow-600" : "text-green-600"}
          />
          <StatusCard 
            title="Net Worth" 
            value={formatCurrency(summaryData.netWorth)}
            description="Total assets minus liabilities"
            colorClass={summaryData.netWorth > 0 ? "text-green-600" : "text-red-600"}
          />
          <StatusCard 
            title="Total Monthly Income" 
            value={formatCurrency(summaryData.totalIncome)}
            description="Combined income from all sources"
            colorClass="text-blue-600"
          />
        </div>
      </div>
   {/* Quick Actions */}
   <div className="mt-12">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/scenarios" className="block hover:bg-gray-50">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-blue-600">Run "What-If" Scenarios</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Simulate career changes, investment strategies, or major purchases
                </p>
              </div>
            </div>
          </Link>
          <Link to="/analytics" className="block hover:bg-gray-50">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-blue-600">Spending Analytics</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Analyze your spending habits and find opportunities to save
                </p>
              </div>
            </div>
          </Link>
          <Link to="/advisor" className="block hover:bg-gray-50">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-blue-600">Get More Financial Advice</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Ask our AI advisor for personalized financial guidance
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      {/* Charts Section */}
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Cash Flow</h3>
          <div className="h-64">
            <Bar
              data={monthlyCashFlow}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Monthly Cash Flow (₹)'
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow px-5 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Income Distribution</h3>
          <div className="h-64">
            <Pie 
              data={incomeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow px-5 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Breakdown</h3>
          <div className="h-64">
            <Pie 
              data={expensesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow px-5 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Allocation</h3>
          <div className="h-64">
            <Pie 
              data={investmentsData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Advice Section */}
      <div className="mt-12 bg-white rounded-lg shadow">
        <div className="px-5 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Financial Advisor</h3>
          {aiLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="prose max-w-none p-4 bg-white rounded-lg">
              <ReactMarkdown>{aiAdvice}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;